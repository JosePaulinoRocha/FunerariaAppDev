import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';


export const ObtenerTransferencias = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM transferencias_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en Transferencias');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const addTransferencia = async (req: Request, res: Response) => {
    let con: any;
    const { CuentaEnviaID, CuentaRecibeID, Descripcion, Monto } = req.body;

    try {
        con = await connect();
        // Iniciar la transacción
        await con.beginTransaction();

        // Verificar si existe el segmento "Transferencia" en la tabla segmentos
        const getSegmentoQuery = `
            SELECT SegmentoID FROM segmentos WHERE Nombre = 'Transferencia'
        `;
        const [segmento]: any = await con.query(getSegmentoQuery);

        let SegmentoID;
        if (segmento.length === 0) {
            // Si no existe, insertarlo y obtener el SegmentoID
            const insertSegmentoQuery = `
                INSERT INTO segmentos (Nombre) VALUES ('Transferencia')
            `;
            const [segmentoResult]: ResultSetHeader[] = await con.query(insertSegmentoQuery);
            SegmentoID = segmentoResult.insertId;
        } else {
            // Si existe, obtener el SegmentoID
            SegmentoID = segmento[0].SegmentoID;
        }

        // Verificar si existe la categoría "Transferencia" en la tabla categorias
        const getCategoriaQuery = `
            SELECT CategoriaID FROM categorias WHERE Nombre = 'Transferencia'
        `;
        const [categoria]: any = await con.query(getCategoriaQuery);

        let CategoriaID;
        if (categoria.length === 0) {
            // Si no existe, insertarla y obtener el CategoriaID
            const insertCategoriaQuery = `
                INSERT INTO categorias (Nombre) VALUES ('Transferencia')
            `;
            const [categoriaResult]: ResultSetHeader[] = await con.query(insertCategoriaQuery);
            CategoriaID = categoriaResult.insertId;
        } else {
            // Si existe, obtener el CategoriaID
            CategoriaID = categoria[0].CategoriaID;
        }

        // Insertar en la tabla transferencias
        const insertTransferenciaQuery = `
            INSERT INTO transferencias (CuentaEnviaID, CuentaRecibeID, Descripcion, Monto, Fecha)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [transferenciaResult]: ResultSetHeader[] = await con.query(insertTransferenciaQuery, [CuentaEnviaID, CuentaRecibeID, Descripcion, Monto]);

        // Obtener el ID de la transferencia recién insertada
        const transferenciaID = transferenciaResult.insertId;

        // Insertar en la tabla ingresos (egreso de la cuenta que envía)
        const insertIngresoEgresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso, SegmentoID, CategoriaID)
            VALUES (NOW(), ?, ?, ?, 1, ?, ?)
        `;
        await con.query(insertIngresoEgresoQuery, [Descripcion, CuentaEnviaID, Monto, SegmentoID, CategoriaID]);

        // Insertar en la tabla ingresos (ingreso a la cuenta que recibe)
        const insertIngresoIngresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso, SegmentoID, CategoriaID)
            VALUES (NOW(), ?, ?, ?, 0, ?, ?)
        `;
        await con.query(insertIngresoIngresoQuery, [Descripcion, CuentaRecibeID, Monto, SegmentoID, CategoriaID]);

        // Confirmar la transacción
        await con.commit();

        // Devolver el ID de la transferencia insertada
        return res.json({ message: 'Transferencia realizada con éxito', transferenciaID });

    } catch (error) {
        // Si hay un error, revertir la transacción
        console.error('Error al realizar la transferencia:', error);
        await con.rollback();
        return res.status(500).json({ message: 'Error al realizar la transferencia' });
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
    }
};

