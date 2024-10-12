import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ImportarIngresosArchivo = async (req: Request, res: Response) => {
    const con = await connect();
    await con.beginTransaction();

    try {
        const ingresosData = req.body; // Suponemos que es un array de ingresos
        console.log("Datos recibidos para importación:", ingresosData);

        for (const ingreso of ingresosData) {
            console.log("Procesando ingreso:", ingreso);

            // 1. Verificar o crear SegmentoID, CategoriaID, SubcategoriaID y ConceptoID, si no están vacíos
            const SegmentoID = ingreso.Segmento ? await getOrCreateId(con, 'segmentos', ingreso.Segmento) : null;
            console.log("SegmentoID:", SegmentoID);

            const CategoriaID = ingreso.Categoria ? await getOrCreateId(con, 'categorias', ingreso.Categoria) : null;
            console.log("CategoriaID:", CategoriaID);

            const SubcategoriaID = ingreso.Subcategoria ? await getOrCreateId(con, 'subcategorias', ingreso.Subcategoria) : null;
            console.log("SubcategoriaID:", SubcategoriaID);

            const ConceptoID = ingreso.Concepto ? await getOrCreateId(con, 'conceptos', ingreso.Concepto) : null;
            console.log("ConceptoID:", ConceptoID);

            // 2. Verificar o crear CuentaID, si no está vacía
            const TipoCuentaID = ingreso.RFC === '' ? 1 : 2; // Caja Chica si RFC es vacío
            console.log("TipoCuentaID determinado:", TipoCuentaID);

            const CuentaID = ingreso.Cuenta ? await getOrCreateCuenta(con, ingreso.Cuenta, ingreso.RFC, TipoCuentaID) : null;
            console.log("CuentaID:", CuentaID);

            // 3. Insertar registro en ingresos con CuentaContable (siempre se envía) y valores predeterminados de Monto y TipoIngreso
            const insertIngresoQuery = `
                INSERT INTO ingresos (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, Monto, TipoIngreso, CuentaContable, Fecha)
                VALUES (?, ?, ?, ?, ?, 0, 0, ?, NOW())
            `;
            console.log("Ejecutando query de inserción de ingreso:", insertIngresoQuery);

            await con.query(insertIngresoQuery, [
                SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, ingreso.CuentaContpaq || 0
            ]);
            console.log("Ingreso insertado correctamente");
        }

        await con.commit();
        console.log("Transacción completada exitosamente");
        res.status(200).json({ message: 'Ingresos importados exitosamente' });
    } catch (error) {
        await con.rollback();
        const err = error as Error; // Casting a Error
        console.error("Error durante la importación:", err.message); // Log del mensaje de error
        res.status(500).json({ error: 'Error al procesar la importación', detalle: err.message });
    } finally {
        con.end();
        console.log("Conexión cerrada");
    }
};

// Función para verificar o crear registros en segmentos, categorías, subcategorías y conceptos
const getOrCreateId = async (con: any, table: string, value: string) => {
    try {
        console.log(`Verificando existencia de ${value} en la tabla ${table}`);
        const query = `SELECT ${table.slice(0, -1)}ID FROM ${table} WHERE LOWER(Nombre) = LOWER(?) LIMIT 1`;
        const [result] = await con.query(query, [value]);

        if (result.length > 0) {
            console.log(`${value} encontrado en la tabla ${table}`);
            return result[0][`${table.slice(0, -1)}ID`];
        } else {
            console.log(`${value} no encontrado, insertando nuevo registro en la tabla ${table}`);
            const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
            const [insertResult] = await con.query(insertQuery, [value]);
            console.log(`${value} insertado en la tabla ${table} con ID: ${insertResult.insertId}`);
            return insertResult.insertId;
        }
    } catch (error) {
        console.error(`Error en getOrCreateId para la tabla ${table}:`, error);
        throw error; // Lanza el error para que se maneje en el bloque try/catch principal
    }
};

// Función para verificar o crear registros en la tabla de cuentas
const getOrCreateCuenta = async (con: any, cuenta: string, rfc: string, tipoCuentaID: number) => {
    try {
        console.log(`Verificando existencia de la cuenta ${cuenta} con RFC ${rfc}`);
        const query = `SELECT CuentaID FROM cuentas WHERE LOWER(NombreCuenta) = LOWER(?) LIMIT 1`;
        const [result] = await con.query(query, [cuenta]);

        if (result.length > 0) {
            console.log(`Cuenta ${cuenta} encontrada con ID: ${result[0].CuentaID}`);
            return result[0].CuentaID;
        } else {
            console.log(`Cuenta ${cuenta} no encontrada, insertando nuevo registro en la tabla cuentas`);
            const insertQuery = `INSERT INTO cuentas (NombreCuenta, RFC, TipoCuentaID) VALUES (?, ?, ?)`;
            const [insertResult] = await con.query(insertQuery, [cuenta, rfc, tipoCuentaID]);
            console.log(`Cuenta ${cuenta} insertada con ID: ${insertResult.insertId}`);
            return insertResult.insertId;
        }
    } catch (error) {
        console.error(`Error en getOrCreateCuenta para la cuenta ${cuenta}:`, error);
        throw error; // Lanza el error para que se maneje en el bloque try/catch principal
    }
};
