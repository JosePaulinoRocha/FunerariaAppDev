import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerCombinacionesNotificaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM combinaciones_vw where validado = 0';
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


export const ObtenerReconciliacionesNotificaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();

        // Consulta para obtener el último registro de cada CuentaID y filtrar los que tienen una diferencia de 2 días o más
        const query = `
            SELECT r.*
            FROM Reconciliaciones r
            INNER JOIN (
                SELECT CuentaID, MAX(ReconciliacionID) AS UltimaReconciliacionID
                FROM Reconciliaciones
                GROUP BY CuentaID
            ) ultimas
            ON r.ReconciliacionID = ultimas.UltimaReconciliacionID
            WHERE DATEDIFF(CURDATE(), r.Fecha) >= 2;
        `;

        const reconciliaciones = (await con.query(query))[0] as any[];
        result = reconciliaciones;
    } catch (error) {
        console.log('Error en ObtenerReconciliacionesNotificaciones');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerIngresosNotificaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vistaingresos WHERE EstatusComprobacionID != 1';
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