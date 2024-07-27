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

export const ObtenerIngresosParaConciliacion = async (req: Request, res: Response) => {
    let con;
    let result;
    const { fechaFinal, cuentaID } = req.body; // Usar req.body para POST

    try {
        con = await connect();
        let query = `
            SELECT * FROM vistaingresos
            WHERE CuentaID = ? AND Fecha <= ? AND Reconciliado = 0
        `;
        const [ingresos] = await con.query(query, [cuentaID, fechaFinal]);
        result = ingresos;
    } catch (error) {
        console.log('Error en ObtenerIngresosParaConciliacion');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerUltimaReconciliacion = async (req: Request, res: Response) => {
    let con;
    let result;
    const { cuentaID } = req.params; // Usar params para GET

    try {
        con = await connect();
        let query = `
            SELECT * FROM Reconciliaciones
            WHERE CuentaID = ?
            ORDER BY Fecha DESC
            LIMIT 1
        `;
        const [rows] = await con.query<RowDataPacket[]>(query, [cuentaID]);
        result = rows.length ? rows[0] : null;
    } catch (error) {
        console.log('Error en ObtenerUltimaReconciliacion');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};