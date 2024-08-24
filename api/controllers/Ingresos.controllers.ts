import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket } from 'mysql2/promise';

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
        Proveedor, TipoCuentaID, CuentaID, RFC, Fecha, 
        FechaAutorizacion, FechaConciliacion, Descripcion, Piezas, Monto, 
        EstatusComprobacionID, UsuarioAutorizaID, UsuarioRecibeID, 
        ObservacionesDifConciliacion
    } = req.body;

    // El archivo se encuentra en req.file después de la carga
    const Comprobante = req.file ? req.file.path : '';

    console.log("Estos datos recibo en PostIngresos:", req.body);
    console.log("Archivo recibido:", req.file);

    try {
        con = await connect();

        // Función para obtener o crear un ID
        const getOrCreateId = async (table: string, value: number | string, additionalFields: { [key: string]: any } = {}) => {
            if (typeof value === 'string') {
                // Verificar si la cadena es un número
                const parsedValue = Number(value);
                if (!isNaN(parsedValue)) {
                    return parsedValue; // Si es un número válido, retornar como número
                }

                // Si no es un número, asumir que es un nuevo valor y crear
                let columnName = table === 'cuentas' ? 'NombreCuenta' : 'Nombre';
                let insertQuery = `INSERT INTO ${table} (${columnName}`;
                let queryValues = [value];

                // Añadir campos adicionales al query
                for (const [field, fieldValue] of Object.entries(additionalFields)) {
                    insertQuery += `, ${field}`;
                    queryValues.push(fieldValue);
                }

                insertQuery += `) VALUES (${queryValues.map(() => '?').join(', ')})`;
                const [insertResult]: any = await con.query(insertQuery, queryValues);
                return insertResult.insertId;
            }
            return value;
        };

        // Obtener o crear los IDs correspondientes
        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);
        const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);

        // Manejar la creación de nuevas cuentas
        let newCuentaID: number | string = 0;  // Valor por defecto

        const TipoCuentaIDNum = Number(TipoCuentaID);
        if (TipoCuentaIDNum === 1) {
            // Si es Caja Chica, solo se requiere NombreCuenta
            newCuentaID = await getOrCreateId('cuentas', CuentaID, { TipoCuentaID: String(TipoCuentaIDNum) });
        } else if (TipoCuentaIDNum === 2) {
            // Si es Cuenta Bancaria, se requieren NombreCuenta, RFC y TipoCuentaID
            newCuentaID = await getOrCreateId('cuentas', CuentaID, { RFC, TipoCuentaID: String(TipoCuentaIDNum) });
        } else {
            throw new Error(`TipoCuentaID no válido: ${TipoCuentaIDNum}`);
        }

        // Verificar la última combinación
        const checkCombinationQuery = `
            SELECT SegmentoID, CategoriaID, SubcategoriaID 
            FROM combinaciones 
            WHERE ConceptoID = ? 
            ORDER BY CombinacionID DESC 
            LIMIT 1
        `;
        const [combinationResult] = await con.query(checkCombinationQuery, [newConceptoID]) as any[];

        if (combinationResult.length === 0 || 
            combinationResult[0].SegmentoID !== newSegmentoID ||
            combinationResult[0].CategoriaID !== newCategoriaID ||
            combinationResult[0].SubcategoriaID !== newSubcategoriaID) {

            // Insertar nueva combinación si no es igual a la última
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

        // Insertar en la tabla ingresos
        const insertIngresoQuery = `
            INSERT INTO ingresos (
                Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
                Proveedor, Piezas, TipoCuentaID, CuentaID, Monto, Comprobante, EstatusComprobacionID,
                FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion, TipoIngreso
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const ingresoValues = [
            Fecha, Number(SegmentoID), Number(CategoriaID), Number(SubcategoriaID), Number(newConceptoID), Descripcion,
            Proveedor, Number(Piezas), Number(TipoCuentaIDNum), Number(newCuentaID), Number(Monto), Comprobante, Number(EstatusComprobacionID),
            FechaAutorizacion, Number(UsuarioAutorizaID), Number(UsuarioRecibeID), FechaConciliacion, ObservacionesDifConciliacion, Number(TipoIngreso)
        ];

        console.log('Ejecutando query de ingreso:', insertIngresoQuery);
        console.log('Con valores:', ingresoValues);

        await con.query(insertIngresoQuery, ingresoValues);
        console.log('Ingreso insertado exitosamente.');
        result = { message: 'Ingreso creado exitosamente' };
    } catch (error) {
        if (error instanceof Error) {
            console.error('Error en PostIngresos:', error.message);
            result = { message: `Error al crear el ingreso: ${error.message}` };
        } else {
            console.error('Error en PostIngresos:', error);
            result = { message: 'Error desconocido al crear el ingreso' };
        }
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
        return res.json(result);
    }
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
        let query = 'SELECT * FROM Conceptos';
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
        let query = 'SELECT * FROM Segmentos';
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
        let query = 'SELECT * FROM Categorias';
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
        let query = 'SELECT * FROM Subcategorias';
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

export const ObtenerUsuarios = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM Usuarios';
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
        let query = 'SELECT * FROM Cuentas';
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
        let query = 'SELECT * FROM Combinaciones';
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

export const ObtenerEstatus = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM EstatusComprobacion';
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

        // Función para insertar y obtener el nuevo ID si el valor es un string
        const getOrCreateId = async (table: string, value: number | string) => {
            if (typeof value === 'string') {
                const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
                const [insertResult]: any = await con.query(insertQuery, [value]);
                return insertResult.insertId;
            }
            return value;
        };

        // Obtener o crear los IDs correspondientes
        const newConceptoID = await getOrCreateId('conceptos', ConceptoID);
        const newSegmentoID = await getOrCreateId('segmentos', SegmentoID);
        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);
        const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);

        // Actualizar la tabla ingresos con los nuevos o existentes IDs
        const updateQuery = `
            UPDATE ingresos SET
                ConceptoID = ?, SegmentoID = ?, CategoriaID = ?, SubcategoriaID = ?
            WHERE IngresoID = ?
        `;
        const values = [newConceptoID, newSegmentoID, newCategoriaID, newSubcategoriaID, IngresoID];

        await con.query(updateQuery, values);
        result = { message: 'Combinación actualizada exitosamente' };
    } catch (error) {
        console.error('Error al actualizar la combinación:', error);
        result = { message: 'Error al actualizar la combinación' };
    } finally {
        await con?.end();
        return res.json(result);
    }
};
