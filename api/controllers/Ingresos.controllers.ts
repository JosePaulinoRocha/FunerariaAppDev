import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import fs from 'fs';
import path from 'path';
import zlib from 'zlib';
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vistaingresos ORDER BY Fecha DESC';
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


export const ObtenerIngresosParametros = async (req: Request, res: Response) => {
  let con;
  let result;
  try {
    con = await connect();

    const params = req.query;
    const filtro = params.filtro;
    const segmento = (params.segmento as string || 'todos').toLowerCase();
    delete params.filtro;
    delete params.segmento;

    let query = 'SELECT * FROM vistaingresos WHERE 1=1';

    // Aplica el filtro principal
    if (filtro === 'ingresos') {
      query += ' AND TipoIngreso = 0';
    } else if (filtro === 'egresos') {
      query += ' AND TipoIngreso = 1';
    } else if (filtro === 'ingresosSinCuenta') {
      query += ' AND TipoIngreso = 0 AND CuentaID IS NULL';
    } else if (filtro === 'ingresosConCuenta') {
      query += ' AND TipoIngreso = 0 AND CuentaID IS NOT NULL';
    } else if (filtro === 'cuentaContable') {
      query += ' AND CuentaContable IS NOT NULL AND CuentaContable > 0';
    } else if (filtro === 'sinCuentaContable') {
      query += ' AND (CuentaContable IS NULL OR CuentaContable <= 0)';
    } else if (filtro === 'reconciliados') {
      query += ' AND Reconciliado = 1';
    }

    // Aplicar segmento sólo si corresponde
    if ((filtro === 'ingresosSinCuenta' || filtro === 'ingresosConCuenta') && segmento !== 'todos') {
      if (segmento === 'cobranza') {
        query += ` AND NombreSegmento = 'Cobranza'`;
      } else if (segmento === 'funeraria') {
        query += ` AND NombreSegmento = 'Funeraria Anahuac'`;
      } else if (segmento === 'ventas') {
        query += ` AND NombreSegmento = 'Ventas'`;
      }
    }

    // Aplica los parámetros de búsqueda adicionales
    for (const [key, value] of Object.entries(params)) {
      if (value) {
        switch (key) {
          case 'FechaDesde':
            query += ` AND Fecha >= ${con.escape(value)}`;
            break;
          case 'FechaHasta':
            query += ` AND Fecha < ${con.escape(value)}`;
            break;
          case 'MontoDesde':
            query += ` AND Monto >= ${con.escape(value)}`;
            break;
          case 'MontoHasta':
            query += ` AND Monto <= ${con.escape(value)}`;
            break;
          default:
            query += ` AND ${key} LIKE ${con.escape(`%${value}%`)}`;
            break;
        }
      }
    }

    query += ' ORDER BY Fecha DESC';

    const ingresos = (await con.query(query))[0] as any[];
    result = ingresos;
  } catch (error) {
    console.error('Error en ObtenerIngresosParametros:', error);
    result = null;
  } finally {
    await con?.end();
    return res.json(result);
  }
};

  
export const ObtenerIngresosPorFiltro = async (req: Request, res: Response) => {
    let con;
    let result;
    let totalPages;
    const filtro = req.params.filtro; 
    const pagina = parseInt(req.query.pagina as string) || 1;
    const resultadosPorPagina = parseInt(req.query.resultadosPorPagina as string) || 10; 
    const fechaDesde = req.query.fechaDesde as string;
    const orden = (req.query.orden as string || 'DESC').toUpperCase(); 
    const segmento = (req.query.segmento as string || 'todos').toLowerCase();

    const offset = (pagina - 1) * resultadosPorPagina;

    try {
        con = await connect();
        
        let whereClause = 'WHERE 1=1';

        if (filtro === 'ingresos') {
            whereClause += ' AND TipoIngreso = 0';
        } else if (filtro === 'egresos') {
            whereClause += ' AND TipoIngreso = 1';
        } else if (filtro === 'ingresosSinCuenta') {
            whereClause += ' AND TipoIngreso = 0 AND CuentaID IS NULL';
        } else if (filtro === 'ingresosConCuenta') {
            whereClause += ' AND TipoIngreso = 0 AND CuentaID IS NOT NULL';
        } else if (filtro === 'cuentaContable') {
            whereClause += ' AND CuentaContable IS NOT NULL AND CuentaContable > 0';
        } else if (filtro === 'sinCuentaContable') {
            whereClause += ' AND (CuentaContable IS NULL OR CuentaContable <= 0)';
        } else if (filtro === 'reconciliados') {
            whereClause += ' AND Reconciliado = 1';
        }

        if ((filtro === 'ingresosSinCuenta' || filtro === 'ingresosConCuenta') && segmento !== 'todos') {
            if (segmento === 'cobranza') {
                whereClause += ` AND NombreSegmento = 'Cobranza'`;
            } else if (segmento === 'funeraria') {
                whereClause += ` AND NombreSegmento = 'Funeraria Anahuac'`;
            } else if (segmento === 'ventas') {
                whereClause += ` AND NombreSegmento = 'Ventas'`;
            }
        }

        if (fechaDesde) {
            if (orden === 'ASC') {
                whereClause += ` AND DATE(Fecha) >= '${fechaDesde}'`;
            } else {
                whereClause += ` AND DATE(Fecha) <= '${fechaDesde}'`;
            }
        }

        // Primero hacemos el count con el mismo WHERE
        let countQuery = `SELECT COUNT(*) as total FROM vistaingresos ${whereClause}`;
        let countResult : any = (await con.query(countQuery))[0];
        const totalRecords = countResult[0].total;
        totalPages = Math.ceil(totalRecords / resultadosPorPagina);

        // Luego hacemos la consulta de datos con el mismo WHERE
        let query = `SELECT * FROM vistaingresos ${whereClause} ORDER BY DATE(Fecha) ${orden}, IngresoID ${orden} LIMIT ${resultadosPorPagina} OFFSET ${offset}`;
        const ingresos = (await con.query(query))[0] as any[];
        result = ingresos;

    } catch (error) {
        console.log('Error en Ingresos', error);
        result = null;
    } finally {
        await con?.end();

        return res.json({
            ingresos: result,
            totalPages: totalPages, 
            currentPage: pagina,  
        });
    }
};


export const ObtenerIngresosNoReconciliados = async (req: any, res: Response) => {
    let con;
    let result;
    
    try {
        con = await connect();
        
        // Obtener los parámetros de paginación desde la query
        const page = parseInt(req.query.page) || 1;  // Página por defecto es 1
        const limit = parseInt(req.query.limit) || 10; // Límite por defecto es 10
        const offset = (page - 1) * limit;  // Desplazamiento según la página
        
        // Consulta SQL con LIMIT y OFFSET
        const query = 'SELECT * FROM vistaingresos WHERE Reconciliado = 0 ORDER BY ReconciliacionID DESC LIMIT ? OFFSET ?';
        
        // Ejecutar la consulta con los parámetros
        const ingresos = (await con.query(query, [limit, offset]))[0] as any[];
        
        // Obtener el total de registros para calcular el total de páginas
        const countQuery = 'SELECT COUNT(*) AS total FROM vistaingresos WHERE Reconciliado = 0';
        const totalResult :any= (await con.query(countQuery))[0];
        const totalRecords = totalResult[0].total;

        // Enviar los datos y la información de la paginación
        result = {
            data: ingresos,
            totalRecords: totalRecords,
            totalPages: Math.ceil(totalRecords / limit),
            currentPage: page,
            itemsPerPage: limit
        };
    } catch (error) {
        console.log('Error en ObtenerIngresosNoReconciliados');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};




export const ObtenerIngresosOptimizado = async (req: Request, res: Response) => {
    let con;
    let result: any = [];
    const { size = 10, offset = 0 } = req.query; // Parámetros de paginación, por defecto trae 10 registros
  
    try {
      con = await connect();
      
      // Consulta SQL con LIMIT y OFFSET para traer solo una parte de los registros
      const query = `
        SELECT * 
        FROM vistaingresos
        LIMIT ? OFFSET ?`;
      
      // Ejecutamos la consulta con los parámetros de tamaño (size) y desplazamiento (offset)
      const ingresos = (await con.query(query, [Number(size), Number(offset)]))[0];
      
      result = ingresos;
    } catch (error) {
      console.error('Error en ObtenerIngresos:', error);
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

        const getOrCreateId = async (table: string, value: number | string | null, tipoIngreso: number | null = null) => {
            if (value === null) {
                return null;
            }
        
            if (typeof value === 'string' || value === 0) {
                let columnName = 'Nombre';
                let insertQuery = '';
                let queryValues: any[] = [];
        
                if (table == 'categorias' && tipoIngreso !== null) {
                    // Asumimos que tipoIngreso: 0 = ingreso, 1 = egreso
                    const ingresosBit = tipoIngreso === 0 ? 1 : 0;
                    const egresosBit = tipoIngreso === 1 ? 1 : 0;
        
                    insertQuery = `INSERT INTO ${table} (${columnName}, IngresosBit, EgresoBit) VALUES (?, ?, ?)`;
                    queryValues = [value, ingresosBit, egresosBit];
                } else {
                    insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
                    queryValues = [value];
                }
        
                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
        
            return value;
        };

        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID, TipoIngreso);

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



        // Verificar y obtener el ProveedorID
        let newProveedorID: number | null = null;

        if (typeof ProveedorID === 'number') {
            // Si ProveedorID ya es un número, usarlo directamente
            newProveedorID = ProveedorID;
            console.log('ProveedorID es un número, se usará directamente:', newProveedorID);
        } else if (typeof ProveedorID === 'string' && ProveedorID.trim() !== '') {
            // Si ProveedorID es una cadena, buscar o crear el proveedor en la base de datos
            const [proveedorResult]: any = await con.query(
                `SELECT ProveedorID FROM proveedores WHERE Proveedor = ? AND CategoriaID = ? AND SubcategoriaID = ?`,
                [ProveedorID, newCategoriaID, newSubcategoriaID]
            );

            if (proveedorResult.length > 0) {
                newProveedorID = proveedorResult[0].ProveedorID;
                console.log('Proveedor encontrado:', newProveedorID);
            } else {
                const insertProveedorQuery = `
                    INSERT INTO proveedores (Proveedor, CategoriaID, SubcategoriaID, FechaRegistro) 
                    VALUES (?, ?, ?, NOW())
                `;
                const [insertProveedorResult]: any = await con.query(insertProveedorQuery, [ProveedorID, newCategoriaID, newSubcategoriaID]);
                newProveedorID = insertProveedorResult.insertId;
                console.log('Nuevo proveedor insertado:', newProveedorID);
            }
        } else {
            console.log('ProveedorID está vacío o no es válido, no se realizará ninguna acción para el proveedor.');
        }

        // Actualizar el Estatus del proveedor si newProveedorID no es nulo
        if (newProveedorID !== null) {
            const estatus = countResult[0].count >= 3 ? 0 : 0; // Asegúrate de que esta lógica sea correcta
            await con.query(`UPDATE proveedores SET Estatus = ? WHERE ProveedorID = ?`, [estatus, newProveedorID]);
        }




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


        const calcularSaldoCuenta = async (CuentaID: number | string, nuevoMonto: number, esIngreso: boolean) => {
            const saldoReconciliadoQuery = `
                SELECT Saldo FROM reconciliaciones 
                WHERE CuentaID = ?
                ORDER BY ReconciliacionID DESC LIMIT 1
            `;
            const [saldoReconciliado]: any = await con.query(saldoReconciliadoQuery, [CuentaID]);
            let saldoInicial = saldoReconciliado.length > 0 ? parseFloat(saldoReconciliado[0].Saldo) : 0;
        
            console.log(`Saldo inicial de la cuenta ${CuentaID}:`, saldoInicial);
        
            if (isNaN(saldoInicial)) saldoInicial = 0;
        
            // Obtener ingresos y egresos no reconciliados
            const ingresosEgresosQuery = `
                SELECT Monto, TipoIngreso FROM ingresos
                WHERE CuentaID = ? AND Reconciliado = 0
                ORDER BY IngresoID
            `;
            const [ingresosEgresos]: any = await con.query(ingresosEgresosQuery, [CuentaID]);
        
            let totalIngresos = 0;
            let totalEgresos = 0;
        
            ingresosEgresos.forEach((registro: any) => {
                const monto = parseFloat(registro.Monto);
                if (!isNaN(monto)) {
                    const tipoIngreso = registro.TipoIngreso[0]; // Aquí ya no es necesario compararlo con 1
                    if (tipoIngreso === 1) { // Si es egreso (1)
                        totalEgresos += monto; 
                    } else { // Si es ingreso (0)
                        totalIngresos += monto; 
                    }
                }
            });
        
            console.log(`Total ingresos no reconciliados para la cuenta ${CuentaID}:`, totalIngresos);
            console.log(`Total egresos no reconciliados para la cuenta ${CuentaID}:`, totalEgresos);
        
            // Incluir el monto del nuevo registro en el cálculo del saldo
            const saldoFinal = saldoInicial + totalIngresos - totalEgresos + (esIngreso ? nuevoMonto : -nuevoMonto);
        
            console.log(`Saldo final calculado para la cuenta ${CuentaID}:`, saldoFinal);
        
            return isNaN(saldoFinal) ? 0 : saldoFinal;
        };
        
        // Luego, al momento de llamar a esta función en tu lógica de alta de ingresos, hazlo así:
        const esIngreso = TipoIngreso === 0; // Ahora '0' es ingreso y '1' es egreso
        const saldoFinal = await calcularSaldoCuenta(newCuentaID, Monto, esIngreso);
        


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
            'TipoIngreso', 'Fecha', 'Saldo'
        ];
        
        const values = [
            newSegmentoID, newCategoriaID, newConceptoID, Descripcion,
            newProveedorID, Piezas, TipoCuentaIDNum, newCuentaID, Monto, 
            EstatusComprobacionID, FechaAutorizacion, UsuarioAutorizaID, 
            UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion, 
            TipoIngreso, Fecha, saldoFinal
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
    console.log('Archivo recibido:', req.file);
    const ingresoID = parseInt(req.params.id);
    const filePath = req.file?.path;

    if (!filePath) {
        return res.status(400).json({ message: 'No se recibió ningún archivo.' });
    }

    try {
        const connection = await connect();
        await connection.query(
            'UPDATE ingresos SET Comprobante = ? WHERE IngresoID = ?',
            [filePath, ingresoID]
        );
        connection.end();

        res.json({ message: 'Archivo guardado exitosamente.', path: filePath });
    } catch (error) {
        console.error('Error al actualizar la base de datos:', error);
        res.status(500).json({ message: 'Error al actualizar la base de datos.' });
    }
};


export const UpdateIngresos = async (req: Request, res: Response) => {
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
        console.log('Transacción iniciada para actualización');


        // Obtener el monto y saldo actuales del ingreso
        const currentIngresoQuery = `SELECT Monto, Saldo FROM ingresos WHERE IngresoID = ?`;
        const [currentIngreso] = await con.query(currentIngresoQuery, [IngresoID]) as any[];

        if (currentIngreso.length === 0) {
            throw new Error('Ingreso no encontrado');
        }

        const previousMonto = parseFloat(currentIngreso[0].Monto); // Asegúrate de que sea un número
        const previousSaldo = parseFloat(currentIngreso[0].Saldo); // Asegúrate de que sea un número

        console.log('Monto anterior:', previousMonto);
        console.log('Saldo anterior:', previousSaldo);

        // Calcular la diferencia en el monto
        const diferencia = Monto - previousMonto; // Esta operación ya debería dar un número
        console.log('Diferencia:', diferencia);

        // Actualizar el saldo según el tipo de ingreso
        let newSaldo = previousSaldo; // Aquí también asegúrate de que sea un número
        console.log('Saldo inicial para actualización:', newSaldo);

        if (TipoIngreso === 0) { // Ingreso
            newSaldo += diferencia; // Aumentar saldo
            console.log('Actualizando saldo como ingreso. Nuevo saldo:', newSaldo.toFixed(2)); // Asegúrate de formatear el número correctamente
        } else if (TipoIngreso === 1) { // Egreso
            newSaldo -= diferencia; // Disminuir saldo
            console.log('Actualizando saldo como egreso. Nuevo saldo:', newSaldo.toFixed(2)); // Asegúrate de formatear el número correctamente
        } else {
            console.error('TipoIngreso no válido:', TipoIngreso);
        }


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

        const getOrCreateId = async (table: string, value: number | string | null, tipoIngreso: number | null = null) => {
            if (value === null) {
                return null;
            }
        
            if (typeof value === 'string' || value === 0) {
                let columnName = 'Nombre';
                let insertQuery = '';
                let queryValues: any[] = [];
        
                if (table == 'categorias' && tipoIngreso !== null) {
                    // Asumimos que tipoIngreso: 0 = ingreso, 1 = egreso
                    const ingresosBit = tipoIngreso === 0 ? 1 : 0;
                    const egresosBit = tipoIngreso === 1 ? 1 : 0;
        
                    insertQuery = `INSERT INTO ${table} (${columnName}, IngresosBit, EgresoBit) VALUES (?, ?, ?)`;
                    queryValues = [value, ingresosBit, egresosBit];
                } else {
                    insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
                    queryValues = [value];
                }
        
                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
        
            return value;
        };

        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID, TipoIngreso);

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



        // Verificar y obtener el ProveedorID
        let newProveedorID: number | null = null;

        if (typeof ProveedorID === 'number') {
            // Si ProveedorID ya es un número, usarlo directamente
            newProveedorID = ProveedorID;
            console.log('ProveedorID es un número, se usará directamente:', newProveedorID);
        } else if (typeof ProveedorID === 'string' && ProveedorID.trim() !== '') {
            // Si ProveedorID es una cadena, buscar o crear el proveedor en la base de datos
            const [proveedorResult]: any = await con.query(
                `SELECT ProveedorID FROM proveedores WHERE Proveedor = ? AND CategoriaID = ? AND SubcategoriaID = ?`,
                [ProveedorID, newCategoriaID, newSubcategoriaID]
            );

            if (proveedorResult.length > 0) {
                newProveedorID = proveedorResult[0].ProveedorID;
                console.log('Proveedor encontrado:', newProveedorID);
            } else {
                const insertProveedorQuery = `
                    INSERT INTO proveedores (Proveedor, CategoriaID, SubcategoriaID, FechaRegistro) 
                    VALUES (?, ?, ?, NOW())
                `;
                const [insertProveedorResult]: any = await con.query(insertProveedorQuery, [ProveedorID, newCategoriaID, newSubcategoriaID]);
                newProveedorID = insertProveedorResult.insertId;
                console.log('Nuevo proveedor insertado:', newProveedorID);
            }
        } else {
            console.log('ProveedorID está vacío o no es válido, no se realizará ninguna acción para el proveedor.');
        }

        // Actualizar el Estatus del proveedor si newProveedorID no es nulo
        if (newProveedorID !== null) {
            const estatus = countResult[0].count >= 3 ? 0 : 0; // Asegúrate de que esta lógica sea correcta
            await con.query(`UPDATE proveedores SET Estatus = ? WHERE ProveedorID = ?`, [estatus, newProveedorID]);
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

        // Actualización en la tabla de ingresos
        console.log('Actualizando ingreso con ID:', IngresoID);

        const columns = [
            'SegmentoID', 'CategoriaID', 'ConceptoID', 'Descripcion',
            'ProveedorID', 'Piezas', 'TipoCuentaID', 'CuentaID', 'Monto', 
            'EstatusComprobacionID', 'FechaAutorizacion', 'UsuarioAutorizaID', 
            'UsuarioRecibeID', 'FechaConciliacion', 'ObservacionesDifConciliacion', 
            'TipoIngreso', 'Fecha', 'Saldo'
        ];

        const values = [
            newSegmentoID, newCategoriaID, newConceptoID, Descripcion,
            newProveedorID, Piezas, TipoCuentaIDNum, newCuentaID, Monto, 
            EstatusComprobacionID, FechaAutorizacion, UsuarioAutorizaID, 
            UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion, 
            TipoIngreso, Fecha, newSaldo 
        ];

        // Solo incluye SubcategoriaID si no es null
        if (newSubcategoriaID !== null) {
            columns.splice(3, 0, 'SubcategoriaID');
            values.splice(3, 0, newSubcategoriaID);
        }

        const updateIngresoQuery = `
            UPDATE ingresos 
            SET ${columns.map(col => `${col} = ?`).join(', ')}
            WHERE IngresoID = ?
        `;

        values.push(IngresoID);

        await con.query(updateIngresoQuery, values);
        console.log('Ingreso actualizado exitosamente');

        await con.commit();
        console.log('Transacción confirmada.');
        result = { message: 'Ingreso actualizado exitosamente' };
    } catch (error) {
        console.error('Error en la transacción:', error);
        await con.rollback();
        result = { error: 'Error al actualizar el ingreso: ' + error };
    } finally {
        if (con) {
            con.end();
        }
        res.json(result);
    }
};


export const ObtenerConceptos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM conceptos ORDER BY Nombre ASC';
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
        let query = 'SELECT * FROM proveedores_vw ORDER BY Proveedor ASC';
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
        let query = 'SELECT * FROM usuarios ORDER BY fullName ASC';
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
        let query = 'SELECT * FROM cuentas ORDER BY NombreCuenta ASC';
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


export const ObtenerCuentasContables = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT IngresoID, SegmentoID, NombreSegmento, CategoriaID, NombreCategoria, SubcategoriaID, NombreSubcategoria, ConceptoID, NombreConcepto, CuentaContable FROM vistaingresos where CuentaContable is not null';
        const usuarios = (await con.query(query))[0] as any[];
        result = usuarios;
    } catch (error) {
        console.log('Error en CuentasContables');
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
    const { IngresoID, ConceptoID, SegmentoID, CategoriaID, SubcategoriaID, TipoIngreso } = req.body;

    try {
        con = await connect();
        await con.beginTransaction(); 


        const getOrCreateId = async (table: string, value: number | string, tipoIngreso: number | null = null) => {
            if (typeof value === 'string') {
                const columnName = 'Nombre';
                let insertQuery = '';
                let queryValues: any[] = [];

                if (table === 'categorias' && tipoIngreso !== null) {
                    const ingresosBit = tipoIngreso === 0 ? 1 : 0;
                    const egresosBit = tipoIngreso === 1 ? 1 : 0;
                    insertQuery = `INSERT INTO ${table} (${columnName}, IngresosBit, EgresoBit) VALUES (?, ?, ?)`;
                    queryValues = [value, ingresosBit, egresosBit];
                } else {
                    insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
                    queryValues = [value];
                }

                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
            return value;
        };

        const tipoIngresoNum = Number(TipoIngreso) || 0;

        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID, tipoIngresoNum);
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





const calcularSaldoCuenta = async (CuentaID: number | string, nuevoMonto: number, esIngreso: boolean, con: any) => {
    const saldoReconciliadoQuery = `
        SELECT Saldo FROM reconciliaciones 
        WHERE CuentaID = ?
        ORDER BY ReconciliacionID DESC LIMIT 1
    `;
    const [saldoReconciliado]: any = await con.query(saldoReconciliadoQuery, [CuentaID]);
    let saldoInicial = saldoReconciliado.length > 0 ? parseFloat(saldoReconciliado[0].Saldo) : 0;

    console.log(`Saldo inicial de la cuenta ${CuentaID}:`, saldoInicial);

    if (isNaN(saldoInicial)) saldoInicial = 0;

    // Obtener ingresos y egresos no reconciliados
    const ingresosEgresosQuery = `
        SELECT Monto, TipoIngreso FROM ingresos
        WHERE CuentaID = ? AND Reconciliado = 0
        ORDER BY IngresoID
    `;
    const [ingresosEgresos]: any = await con.query(ingresosEgresosQuery, [CuentaID]);

    let totalIngresos = 0;
    let totalEgresos = 0;

    ingresosEgresos.forEach((registro: any) => {
        const monto = parseFloat(registro.Monto);
        if (!isNaN(monto)) {
            const tipoIngreso = registro.TipoIngreso[0]; // '0' es ingreso, '1' es egreso
            if (tipoIngreso === 1) { // Si es egreso
                totalEgresos += monto; 
            } else { // Si es ingreso
                totalIngresos += monto; 
            }
        }
    });

    console.log(`Total ingresos no reconciliados para la cuenta ${CuentaID}:`, totalIngresos);
    console.log(`Total egresos no reconciliados para la cuenta ${CuentaID}:`, totalEgresos);
    console.log(`Nuevo Monto: `, nuevoMonto);

    console.log(`Calculo de saldo: `, saldoInicial, ' + ', totalIngresos, ' - ', totalEgresos, ' + ', nuevoMonto);

    // Incluir el monto del nuevo registro en el cálculo del saldo
    const saldoFinal = saldoInicial + totalIngresos - totalEgresos;

    console.log(`Saldo final calculado para la cuenta ${CuentaID}:`, saldoFinal);

    return isNaN(saldoFinal) ? 0 : saldoFinal;
};


export const asignarCuenta = async (req: Request, res: Response) => {
  let con: any;
  let result: any;

  const {
    IngresoID, TipoCuentaID, CuentaID, TipoCuenta2ID, CuentaID2, RFC, RFC2,
    CategoriaID, SubcategoriaID, Monto, MontoParcial, EsMontoParcial,
    Fecha, Descripcion, SegmentoID, TipoIngreso
  } = req.body;

  try {
    con = await connect();
    await con.beginTransaction();
    console.log('Transacción iniciada');

    const getOrCreateId = async (
      table: string,
      value: number | string | null,
      tipoIngreso: number | null = null
    ) => {
      if (value === null) return null;

      if (typeof value === 'string' || value === 0) {
        const columnName = 'Nombre';
        let insertQuery = '';
        let queryValues: any[] = [];

        if (table === 'categorias' && tipoIngreso !== null) {
          const ingresosBit = tipoIngreso === 0 ? 1 : 0;
          const egresosBit = tipoIngreso === 1 ? 1 : 0;
          insertQuery = `INSERT INTO ${table} (${columnName}, IngresosBit, EgresoBit) VALUES (?, ?, ?)`;
          queryValues = [value, ingresosBit, egresosBit];
        } else {
          insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
          queryValues = [value];
        }

        const [insertResult]: any = await con.query(insertQuery, queryValues);
        return insertResult.insertId;
      }

      return value;
    };

    const tipoIngreso = Array.isArray(TipoIngreso) ? TipoIngreso[0] : 0;

    const newCategoriaID = await getOrCreateId('categorias', CategoriaID, tipoIngreso);
    const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);
    const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);

    if (TipoCuenta2ID && CuentaID2) {
      const montoSecundario = parseFloat(Monto);
      const montoPrincipal = (await con.query(
        `SELECT Monto FROM ingresos WHERE IngresoID = ?`,
        [IngresoID]
      ))[0][0].Monto - montoSecundario;

      if (montoPrincipal < 0) {
        throw new Error('El monto asignado excede el monto disponible en la cuenta principal.');
      }

      const updateIngresoQuery = `
        UPDATE ingresos
        SET Monto = ?, CuentaID = ?, TipoCuentaID = ?, CategoriaID = ?, SubcategoriaID = ?, SegmentoID = ?, Fecha = ?
        WHERE IngresoID = ?
      `;
      await con.query(updateIngresoQuery, [
        montoPrincipal, CuentaID, TipoCuentaID, newCategoriaID, newSubcategoriaID, newSegmentoID, Fecha, IngresoID
      ]);

      const insertIngresoQuery = `
        INSERT INTO ingresos (TipoCuentaID, CuentaID, CategoriaID, SubcategoriaID, Monto, Fecha, Descripcion, SegmentoID)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?)
      `;
      await con.query(insertIngresoQuery, [
        TipoCuenta2ID, CuentaID2, newCategoriaID, newSubcategoriaID, montoSecundario, Fecha, Descripcion, newSegmentoID
      ]);

      const saldoCuentaPrincipal = await calcularSaldoCuenta(CuentaID, montoPrincipal, true, con);
      const saldoCuentaSecundaria = await calcularSaldoCuenta(CuentaID2, montoSecundario, true, con);

      await con.query(`UPDATE ingresos SET Saldo = ? WHERE IngresoID = ?`, [saldoCuentaPrincipal, IngresoID]);

      const [newIngreso] = await con.query(`SELECT LAST_INSERT_ID() as NewIngresoID`);
      const newIngresoID = newIngreso[0].NewIngresoID;

      await con.query(`UPDATE ingresos SET Saldo = ? WHERE IngresoID = ?`, [saldoCuentaSecundaria, newIngresoID]);

    } else {
      const updateIngresoQuery = `
        UPDATE ingresos
        SET CuentaID = ?, TipoCuentaID = ?, CategoriaID = ?, SubcategoriaID = ?, SegmentoID = ?, Monto = ?, 
            MontoParcialBandera = ?, MontoParcial = ?, Fecha = ?
        WHERE IngresoID = ?
      `;
      await con.query(updateIngresoQuery, [
        CuentaID, TipoCuentaID, newCategoriaID, newSubcategoriaID, newSegmentoID, Monto,
        EsMontoParcial ? 1 : 0, EsMontoParcial ? MontoParcial : 0,
        Fecha, IngresoID
      ]);

      const saldoFinal = await calcularSaldoCuenta(CuentaID, parseFloat(Monto), true, con);
      await con.query(`UPDATE ingresos SET Saldo = ? WHERE IngresoID = ?`, [saldoFinal, IngresoID]);
    }

    await con.commit();
    console.log('Transacción confirmada.');
    result = { message: 'Cuenta(s) asignada(s) exitosamente', IngresoID };
  } catch (error) {
    console.error('Error en asignarCuenta:', error instanceof Error ? error.message : error);
    await con.rollback();
    console.log('Transacción revertida.');
    result = {
      message: `Error al asignar la cuenta: ${error instanceof Error ? error.message : 'desconocido'}`
    };
  } finally {
    if (con) {
      await con.end();
      console.log('Conexión a la base de datos cerrada.');
    }
    return res.json(result);
  }
};


export const asignarCuentaContable = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const { IngresoID, TipoCuentaID, CuentaID, RFC, CategoriaID, SubcategoriaID, SegmentoID, ConceptoID, CuentaContable } = req.body;

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


        // Función para obtener o crear una Categoría/Subcategoría
        const getOrCreateId = async (table: string, value: number | string) => {
            if (typeof value === 'string') {
                const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
                const [insertResult]: any = await con.query(insertQuery, [value]);
                return insertResult.insertId;
            }
            return value;
        };

        // Obtener o crear IDs de la categoría y subcategoría
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);
        const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);
        const newConceptoID = await getOrCreateId('conceptos', ConceptoID );


        // Actualizar la cuenta, categoría y subcategoría en el ingreso
        const updateIngresoQuery = `
            UPDATE ingresos 
            SET CuentaID = ?, TipoCuentaID = ?, CategoriaID = ?, SubcategoriaID = ?, SegmentoID = ?, ConceptoID = ?, CuentaContable = ?
            WHERE IngresoID = ?
        `;
        const updateValues = [newCuentaID, TipoCuentaIDNum, newCategoriaID, newSubcategoriaID, newSegmentoID, newConceptoID, CuentaContable, IngresoID];
        await con.query(updateIngresoQuery, updateValues);


        // Obtener el Monto antes de calcular el saldo
        const montoQuery = `SELECT Monto FROM ingresos WHERE IngresoID = ?`;
        const [montoResult]: any = await con.query(montoQuery, [IngresoID]);
        const nuevoMonto = montoResult.length > 0 ? parseFloat(montoResult[0].Monto) : 0;

        // Calcular el saldo después de la asignación
        const esIngreso = true; // Asumes que es un ingreso porque TipoIngreso es siempre 0 en este caso
        const saldoFinal = await calcularSaldoCuenta(CuentaID, nuevoMonto, esIngreso, con);

        // Actualizar el saldo en la tabla ingresos
        const updateSaldoQuery = `UPDATE ingresos SET Saldo = ? WHERE IngresoID = ?`;
        await con.query(updateSaldoQuery, [saldoFinal, IngresoID]);

        

        await con.commit();
        console.log('Transacción confirmada.');
        result = { message: 'Cuenta, categoría y subcategoría asignadas exitosamente', IngresoID };
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
  const { TipoCuentaID, CuentaID, RFC, CategoriaID, SubcategoriaID, SegmentoID, TipoIngreso, Fecha } = cuenta;

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

    // Lógica mejorada para insertar categoría, subcategoría y segmento
    const getOrCreateId = async (table: string, value: number | string, tipoIngreso: number | null = null) => {
      if (typeof value === 'string') {
        const columnName = 'Nombre';
        let insertQuery = '';
        let queryValues: any[] = [];

        if (table === 'categorias' && tipoIngreso !== null) {
          const ingresosBit = tipoIngreso === 0 ? 1 : 0;
          const egresosBit = tipoIngreso === 1 ? 1 : 0;
          insertQuery = `INSERT INTO ${table} (${columnName}, IngresosBit, EgresoBit) VALUES (?, ?, ?)`;
          queryValues = [value, ingresosBit, egresosBit];
        } else {
          insertQuery = `INSERT INTO ${table} (${columnName}) VALUES (?)`;
          queryValues = [value];
        }

        const [insertResult]: any = await con.query(insertQuery, queryValues);
        return insertResult.insertId;
      }
      return value;
    };

    const tipoIngresoNum = Number(TipoIngreso) || 0; // 0 = ingreso, 1 = egreso
    const newCuentaID = await getOrCreateCuentaId(CuentaID, TipoCuentaID === 2
      ? { RFC, TipoCuentaID: Number(TipoCuentaID) }
      : { TipoCuentaID: Number(TipoCuentaID) });

    const newCategoriaID = await getOrCreateId('categorias', CategoriaID, tipoIngresoNum);
    const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);
    const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);

    // Actualiza la cuenta en los ingresos seleccionados
    const updateIngresoQuery = `
      UPDATE ingresos 
      SET CuentaID = ?, TipoCuentaID = ?, CategoriaID = ?, SubcategoriaID = ?, SegmentoID = ?, Fecha = ?
      WHERE IngresoID IN (${ids.map(() => '?').join(', ')})
    `;
    console.log('Update query:', updateIngresoQuery);
    console.log('Update values:', [newCuentaID, TipoCuentaID, newCategoriaID, newSubcategoriaID, newSegmentoID, Fecha, ...ids]);

    await con.query(updateIngresoQuery, [
      newCuentaID, TipoCuentaID, newCategoriaID, newSubcategoriaID, newSegmentoID, Fecha, ...ids
    ]);

    // Obtener el monto total de los ingresos que se están actualizando
    const montosQuery = `SELECT IngresoID, Monto FROM ingresos WHERE IngresoID IN (${ids.map(() => '?').join(', ')})`;
    const [montosResult]: any = await con.query(montosQuery, ids);

    // Calcular el saldo final para la nueva cuenta
    let saldoFinal = 0;
    for (const registro of montosResult) {
      const nuevoMonto = parseFloat(registro.Monto);
      saldoFinal = await calcularSaldoCuenta(newCuentaID, nuevoMonto, true, con); // Asumiendo que siempre es ingreso
    }

    // Actualizar el saldo en todos los registros de ingresos que han sido modificados
    const updateSaldosQuery = `UPDATE ingresos SET Saldo = ? WHERE IngresoID IN (${ids.map(() => '?').join(', ')})`;
    await con.query(updateSaldosQuery, [saldoFinal, ...ids]);

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
  

  export const ActualizarDescripcion = async (req: Request, res: Response) => {
    const { ingresoID } = req.params;
    const { descripcion } = req.body;
    let con;
    try {
        con = await connect();
        const query = 'UPDATE ingresos SET Descripcion = ? WHERE IngresoID = ?';
        const [result] = await con.query<ResultSetHeader>(query, [descripcion, ingresoID]);
        res.json({ message: 'Observación actualizada exitosamente', affectedRows: result.affectedRows });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) con.end();
    }
};


