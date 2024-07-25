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

