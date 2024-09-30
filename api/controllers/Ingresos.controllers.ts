import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket } from 'mysql2/promise';
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';

export const ObtenerIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vistaingresos';
        const ingresos = (await con.query(query))[0] as any[];
        result = ingresos;
    } catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const PostIngresos = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const {
        IngresoID, TipoIngreso, ConceptoID, SegmentoID, CategoriaID, SubcategoriaID, 
        ProveedorID, TipoCuentaID, CuentaID, RFC, Fecha, 
        FechaAutorizacion, FechaConciliacion, Descripcion, Piezas, Monto, 
        EstatusComprobacionID, UsuarioAutorizaID, UsuarioRecibeID, 
        ObservacionesDifConciliacion
    } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada');

        const getOrCreateCuentaId = async (cuentaId: number | string | null, additionalFields: { [key: string]: any } = {}) => {
            if (typeof cuentaId === 'string' || cuentaId === 0 || cuentaId === null) {
                const columnName = 'NombreCuenta';
                if (!additionalFields[columnName]) {
                    additionalFields[columnName] = cuentaId;
                }
                let insertQuery = `INSERT INTO cuentas (${Object.keys(additionalFields).join(', ')})`;
                let queryValues = Object.values(additionalFields);
                insertQuery += ` VALUES (${queryValues.map(() => '?').join(', ')})`;
                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
            return cuentaId;
        };

        const getOrCreateId = async (table: string, value: number | string | null) => {
            if (value === null) {
                return null;
            }
            if (typeof value === 'string' || value === 0) {
                const columnName = 'Nombre';
                const insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
                const [insertResult]: any = await con.query(insertQuery, [value]);
                return insertResult.insertId;
            }
            return value;
        };

        // Verificar y obtener el ProveedorID
        let newProveedorID: number | null = null;
        if (typeof ProveedorID === 'string') {
            const [proveedorResult]: any = await con.query(`SELECT ProveedorID FROM proveedores WHERE Proveedor = ?`, [ProveedorID]);
            if (proveedorResult.length > 0) {
                newProveedorID = proveedorResult[0].ProveedorID;
                console.log('Proveedor encontrado:', newProveedorID);
            } else {
                const insertProveedorQuery = `
                    INSERT INTO proveedores (Proveedor, CategoriaID, SubcategoriaID, FechaRegistro) 
                    VALUES (?, ?, ?, NOW())
                `;
                const [insertProveedorResult]: any = await con.query(insertProveedorQuery, [ProveedorID, CategoriaID, SubcategoriaID]);
                newProveedorID = insertProveedorResult.insertId;
                console.log('Nuevo proveedor insertado:', newProveedorID);
            }
        } else {
            newProveedorID = ProveedorID;
        }

        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);

        let newSubcategoriaID = null;
        if (SubcategoriaID !== null) {
            newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);
        }

        // Comprobar cuántos registros existen con la misma combinación de categoría y subcategoría
        const checkCombinationCountQuery = `
            SELECT COUNT(*) AS count 
            FROM ingresos 
            WHERE CategoriaID = ? AND SubcategoriaID = ?
        `;
        const countParams = [newCategoriaID, newSubcategoriaID];
        const [countResult] = await con.query(checkCombinationCountQuery, countParams) as any[];

        // Actualizar el Estatus del proveedor
        const estatus = countResult[0].count >= 3 ? 0 : 0; // 0 si hay 3 o más registros, 1 si no
        await con.query(`UPDATE proveedores SET Estatus = ? WHERE ProveedorID = ?`, [estatus, newProveedorID]);

        const checkCombinationQuery = `
            SELECT * 
            FROM combinaciones 
            WHERE ConceptoID = ? AND SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID ${newSubcategoriaID ? '= ?' : 'IS NULL'}
        `;
        const combinationParams = [newConceptoID, newSegmentoID, newCategoriaID];
        if (newSubcategoriaID) {
            combinationParams.push(newSubcategoriaID);
        }
        const [combinationResult] = await con.query(checkCombinationQuery, combinationParams) as any[];

        if (combinationResult.length === 0) {
            const insertCombinationQuery = `
                INSERT INTO combinaciones (ConceptoID, SegmentoID, CategoriaID, SubcategoriaID, FechaModificacion)
                VALUES (?, ?, ?, ?, NOW())
            `;
            const combinationValues = [newConceptoID, newSegmentoID, newCategoriaID, newSubcategoriaID];
            await con.query(insertCombinationQuery, combinationValues);
            console.log('Nueva combinación insertada.');
        } else {
            console.log('La combinación ya existe.');
        }

        let newCuentaID: number | string = 0;
        const TipoCuentaIDNum = Number(TipoCuentaID);
        if (TipoCuentaIDNum === 1) {
            newCuentaID = await getOrCreateCuentaId(CuentaID, { TipoCuentaID: TipoCuentaIDNum });
        } else if (TipoCuentaIDNum === 2) {
            newCuentaID = await getOrCreateCuentaId(CuentaID, { RFC, TipoCuentaID: TipoCuentaIDNum });
        } else {
            throw new Error(`TipoCuentaID no válido: ${TipoCuentaIDNum}`);
        }

        // Imprimir valores que se usarán para el insert
        console.log('Valores a insertar en ingresos:', {
            Fecha,
            SegmentoID: newSegmentoID,
            CategoriaID: newCategoriaID,
            ConceptoID: newConceptoID,
            Descripcion,
            ProveedorID: newProveedorID,
            Piezas,
            TipoCuentaID: TipoCuentaIDNum,
            CuentaID: newCuentaID,
            Monto,
            EstatusComprobacionID,
            FechaAutorizacion,
            UsuarioAutorizaID,
            UsuarioRecibeID,
            FechaConciliacion,
            ObservacionesDifConciliacion,
            TipoIngreso,
            SubcategoriaID: newSubcategoriaID,
        });

        const columns = [
            'SegmentoID', 'CategoriaID', 'ConceptoID', 'Descripcion',
            'ProveedorID', 'Piezas', 'TipoCuentaID', 'CuentaID', 'Monto', 
            'EstatusComprobacionID', 'FechaAutorizacion', 'UsuarioAutorizaID', 
            'UsuarioRecibeID', 'FechaConciliacion', 'ObservacionesDifConciliacion', 
            'TipoIngreso', 'Fecha'  // Fecha ahora al final para insertar con NOW()
        ];
        
        const values = [
            newSegmentoID, newCategoriaID, newConceptoID, Descripcion,
            newProveedorID, Piezas, TipoCuentaIDNum, newCuentaID, Monto, 
            EstatusComprobacionID, FechaAutorizacion, UsuarioAutorizaID, 
            UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion, 
            TipoIngreso, Fecha
        ];

        // Solo incluye SubcategoriaID si no es null
        if (newSubcategoriaID !== null) {
            columns.splice(3, 0, 'SubcategoriaID');
            values.splice(3, 0, newSubcategoriaID);
        }

        const insertIngresoQuery = `
        INSERT INTO ingresos (${columns.join(', ')})
        VALUES (${values.map(() => '?').join(', ')})
        `;
    

        const [insertResult]: any = await con.query(insertIngresoQuery, values);
        const ingresoID = insertResult.insertId;
        console.log('Ingreso insertado exitosamente con ID:', ingresoID);

        // Inserción en HistorialEgresosProveedores
        const insertHistorialQuery = `
            INSERT INTO historialegresosproveedores (
                ProveedorID, CategoriaID, SubcategoriaID, NumeroPiezas, MontoTotal, FechaEgreso
            ) VALUES (?, ?, ?, ?, ?, NOW())
        `;
        const historialValues = [newProveedorID, newCategoriaID, newSubcategoriaID, Piezas, Monto];
        await con.query(insertHistorialQuery, historialValues);
        console.log('Historial de egresos del proveedor insertado.');

        await con.commit();
        console.log('Transacción confirmada.');
        result = { message: 'Ingreso creado exitosamente', IngresoID: ingresoID };
    } catch (error) {
        console.error('Error en la transacción:', error);
        await con.rollback();
        result = { error: 'Error al crear el ingreso: ' + error };
    } finally {
        if (con) {
            con.end();
        }
        res.json(result);
    }
};



export const PostIngresosComprobante = async (req: Request, res: Response) => {
    console.log('Archivos recibidos:', req.file);
    const ingresoID = parseInt(req.params.id);
    const filePath = req.file?.path;

    if (!filePath) {
        return res.status(400).json({ message: 'No se recibió ningún archivo.' });
    }

    const compressedFilePath = `${filePath}.gz`;

    // Comprimir el archivo
    const gzip = zlib.createGzip();
    const source = fs.createReadStream(filePath);
    const destination = fs.createWriteStream(compressedFilePath);

    source.pipe(gzip).pipe(destination).on('finish', async () => {
        // Eliminar el archivo original después de comprimirlo
        fs.unlinkSync(filePath);

        // Guardar la ruta del archivo comprimido en la base de datos
        try {
            const connection = await connect(); // Usa connect si no estás usando un pool
            await connection.query(
                'UPDATE ingresos SET Comprobante = ? WHERE IngresoID = ?',
                [compressedFilePath, ingresoID]
            );
            connection.end(); // Cierra la conexión

            // Responder al cliente con la ruta del archivo comprimido
            res.json({ message: 'Archivo comprimido y guardado exitosamente.', path: compressedFilePath });
        } catch (error) {
            console.error('Error al actualizar la base de datos:', error);
            res.status(500).json({ message: 'Error al actualizar la base de datos.' });
        }
    }).on('error', (err) => {
        console.error('Error al comprimir el archivo:', err);
        res.status(500).json({ message: 'Error al comprimir el archivo.' });
    });
};



export const UpdateIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    const {
        IngresoID, Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
        Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID,
        FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion
    } = req.body;

    try {
        con = await connect();
        const query = `
            UPDATE ingresos SET
                Fecha = ?, SegmentoID = ?, CategoriaID = ?, SubcategoriaID = ?, ConceptoID = ?, Descripcion = ?,
                Proveedor = ?, Piezas = ?, CajaChica = ?, Monto = ?, Saldo = ?, Comprobante = ?, EstatusComprobacionID = ?,
                FechaAutorizacion = ?, UsuarioAutorizaID = ?, UsuarioRecibeID = ?, FechaConciliacion = ?, ObservacionesDifConciliacion = ?
            WHERE IngresoID = ?
        `;
        const values = [
            Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
            Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID,
            FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion,
            IngresoID
        ];

        await con.query(query, values);
        result = { message: 'Ingreso actualizado exitosamente' };
    } catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = { message: 'Error al actualizar el ingreso' };
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerConceptos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM conceptos';
        const conceptos = (await con.query(query))[0] as any[];
        result = conceptos;
    } catch (error) {
        console.log('Error en Conceptos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerSegmentos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM segmentos';
        const segmentos = (await con.query(query))[0] as any[];
        result = segmentos;
    } catch (error) {
        console.log('Error en Segmentos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerCategorias = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM categorias';
        const categorias = (await con.query(query))[0] as any[];
        result = categorias;
    } catch (error) {
        console.log('Error en Categorias');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerSubcategorias = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM subcategorias';
        const subcategorias = (await con.query(query))[0] as any[];
        result = subcategorias;
    } catch (error) {
        console.log('Error en Subcategorias');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerProveedores = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM proveedores_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en Proveedores');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerUsuarios = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM usuarios';
        const usuarios = (await con.query(query))[0] as any[];
        result = usuarios;
    } catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerCuentas = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM cuentas';
        const usuarios = (await con.query(query))[0] as any[];
        result = usuarios;
    } catch (error) {
        console.log('Error en Cuentas');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerCombinaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM combinaciones_vw';
        const combinaciones = (await con.query(query))[0] as any[];
        result = combinaciones;
    } catch (error) {
        console.log('Error en Combinaciones');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerCombinacionesSegmento = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        const segmentoId = req.params.segmentoId;
        let query = 'SELECT * FROM combinaciones_vw WHERE SegmentoID = ? AND Validado = 1';
        const combinaciones = (await con.query(query, [segmentoId]))[0] as any[];
        result = combinaciones;
    } catch (error) {
        console.log('Error en Combinaciones');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerEstatus = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM estatuscomprobacion';
        const estatus = (await con.query(query))[0] as any[];
        result = estatus;
    } catch (error) {
        console.log('Error en Estatus');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


// actualizar combinacion

export const updateCombination = async (req: Request, res: Response) => {
    let con: any;
    let result;
    const { IngresoID, ConceptoID, SegmentoID, CategoriaID, SubcategoriaID } = req.body;

    try {
        con = await connect();
        await con.beginTransaction(); 
        const getOrCreateId = async (table: string, value: number | string) => {
            if (typeof value === 'string') {
                const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
                const [insertResult]: any = await con.query(insertQuery, [value]);
                return insertResult.insertId;
            }
            return value;
        };

        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);
        const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);

        const checkCombinationQuery = `
            SELECT * 
            FROM combinaciones 
            WHERE ConceptoID = ? AND SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ?
        `;
        const [combinationResult] = await con.query(checkCombinationQuery, [newConceptoID, newSegmentoID, newCategoriaID, newSubcategoriaID]) as any[];

        if (combinationResult.length === 0) {
            const insertCombinationQuery = `
                INSERT INTO combinaciones (ConceptoID, SegmentoID, CategoriaID, SubcategoriaID, FechaModificacion, validado)
                VALUES (?, ?, ?, ?, NOW(), 1)
            `;
            const combinationValues = [newConceptoID, newSegmentoID, newCategoriaID, newSubcategoriaID];
            await con.query(insertCombinationQuery, combinationValues);
            console.log('Nueva combinación insertada.');
        } else {
            console.log('La combinación ya existe.');
        }

        const updateQuery = `
            UPDATE ingresos SET
                ConceptoID = ?, SegmentoID = ?, CategoriaID = ?, SubcategoriaID = ?
            WHERE IngresoID = ?
        `;
        const values = [newConceptoID, newSegmentoID, newCategoriaID, newSubcategoriaID, IngresoID];

        await con.query(updateQuery, values);
        console.log('Ingreso actualizado exitosamente.');

        await con.commit();
        result = { message: 'Combinación actualizada y verificada exitosamente' };
    } catch (error) {
        console.error('Error al actualizar la combinación:', error);
        await con.rollback();
        result = { message: 'Error al actualizar la combinación' };
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
        return res.json(result);
    }
};

export const asignarCuenta = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const { IngresoID, TipoCuentaID, CuentaID, RFC } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada');

        // Función para obtener o crear una CuentaID
        const getOrCreateCuentaId = async (cuentaId: number | string | null, additionalFields: { [key: string]: any } = {}) => {
            if (typeof cuentaId === 'string' || cuentaId === 0 || cuentaId === null) {
                const columnName = 'NombreCuenta';

                if (!additionalFields[columnName]) {
                    additionalFields[columnName] = cuentaId;
                }

                let insertQuery = `INSERT INTO cuentas (${Object.keys(additionalFields).join(', ')})`;
                let queryValues = Object.values(additionalFields);

                insertQuery += ` VALUES (${queryValues.map(() => '?').join(', ')})`;
                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
            return cuentaId;
        };

        // Verifica o crea la CuentaID dependiendo del TipoCuentaID
        let newCuentaID: number | string = 0;
        const TipoCuentaIDNum = Number(TipoCuentaID);

        if (TipoCuentaIDNum === 1) {
            newCuentaID = await getOrCreateCuentaId(CuentaID, { TipoCuentaID: TipoCuentaIDNum });
        } else if (TipoCuentaIDNum === 2) {
            newCuentaID = await getOrCreateCuentaId(CuentaID, { RFC, TipoCuentaID: TipoCuentaIDNum });
        } else {
            throw new Error(`TipoCuentaID no válido: ${TipoCuentaIDNum}`);
        }

        // Actualiza la cuenta en el ingreso
        const updateIngresoQuery = `
            UPDATE ingresos 
            SET CuentaID = ?, TipoCuentaID = ?
            WHERE IngresoID = ?
        `;
        const updateValues = [newCuentaID, TipoCuentaIDNum, IngresoID];
        await con.query(updateIngresoQuery, updateValues);

        await con.commit();
        console.log('Transacción confirmada.');
        result = { message: 'Cuenta asignada exitosamente', IngresoID };
    } catch (error) {
        console.error('Error en asignarCuenta:', error instanceof Error ? error.message : error);
        await con.rollback();
        console.log('Transacción revertida.');
        result = { message: `Error al asignar la cuenta: ${error instanceof Error ? error.message : 'desconocido'}` };
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
        return res.json(result);
    }
};

export const asignarCuentasMasivas = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const { ids, cuenta } = req.body;
    const { TipoCuentaID, CuentaID, RFC } = cuenta;
  
    console.log('IDs recibidos:', ids); // Añadido para depuración
    console.log('Datos de cuenta:', cuenta); // Añadido para depuración
  
    if (!ids || ids.length === 0) {
      return res.status(400).json({ message: 'No se recibieron IDs para actualizar' });
    }
  
    try {
      con = await connect();
      await con.beginTransaction();
      console.log('Transacción iniciada');
  
      // Función para obtener o crear una CuentaID
      const getOrCreateCuentaId = async (cuentaId: number | string | null, additionalFields: { [key: string]: any } = {}) => {
        if (typeof cuentaId === 'string' || cuentaId === 0 || cuentaId === null) {
          const columnName = 'NombreCuenta';
  
          if (!additionalFields[columnName]) {
            additionalFields[columnName] = cuentaId;
          }
  
          let insertQuery = `INSERT INTO cuentas (${Object.keys(additionalFields).join(', ')})`;
          let queryValues = Object.values(additionalFields);
  
          insertQuery += ` VALUES (${queryValues.map(() => '?').join(', ')})`;
          const [insertResult]: any = await con.query(insertQuery, queryValues);
          return insertResult.insertId;
        }
        return cuentaId;
      };
  
      // Verifica o crea la CuentaID dependiendo del TipoCuentaID
      let newCuentaID: number | string = 0;
      const TipoCuentaIDNum = Number(TipoCuentaID);
  
      if (TipoCuentaIDNum === 1) {
        newCuentaID = await getOrCreateCuentaId(CuentaID, { TipoCuentaID: TipoCuentaIDNum });
      } else if (TipoCuentaIDNum === 2) {
        newCuentaID = await getOrCreateCuentaId(CuentaID, { RFC, TipoCuentaID: TipoCuentaIDNum });
      } else {
        throw new Error(`TipoCuentaID no válido: ${TipoCuentaIDNum}`);
      }
  
      // Actualiza la cuenta en los ingresos seleccionados
      const updateIngresoQuery = `
        UPDATE ingresos 
        SET CuentaID = ?, TipoCuentaID = ?
        WHERE IngresoID IN (${ids.map(() => '?').join(', ')})
      `;
      console.log('Update query:', updateIngresoQuery); // Añadido para depuración
      console.log('Update values:', [newCuentaID, TipoCuentaIDNum, ...ids]); // Añadido para depuración
      await con.query(updateIngresoQuery, [newCuentaID, TipoCuentaIDNum, ...ids]);
  
      await con.commit();
      console.log('Transacción confirmada.');
      result = { message: 'Cuentas asignadas exitosamente a los registros seleccionados' };
    } catch (error) {
      console.error('Error en asignarCuentasMasivas:', error instanceof Error ? error.message : error);
      await con.rollback();
      console.log('Transacción revertida.');
      result = { message: `Error al asignar las cuentas: ${error instanceof Error ? error.message : 'desconocido'}` };
    } finally {
      if (con) {
        await con.end();
        console.log('Conexión a la base de datos cerrada.');
      }
      return res.json(result);
    }
  };
  


