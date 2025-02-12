import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';


export const ObtenerReporteEgresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_egresos_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en reportes');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerReporteIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_ingresos_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en reportes');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerReportePorFecha = async (req: Request, res: Response) => {
    const { mes, anio } = req.query;
    let con;
    let result;
    try {
        if (!mes || !anio) {
            return res.status(400).json({ error: 'Mes y año son requeridos.' });
        }

        con = await connect();

        // Llamada a los procedimientos almacenados
        const [totalEgresosResult] = await con.query('CALL ObtenerTotalEgresos(?, ?)', [anio, mes]) as RowDataPacket[][];
        const [totalIngresosResult] = await con.query('CALL ObtenerTotalIngresos(?, ?)', [anio, mes]) as RowDataPacket[][];
        const [reporteEgresosResult] = await con.query('CALL ObtenerReporteEgresos(?, ?)', [anio, mes]) as RowDataPacket[][];
        const [reporteIngresosResult] = await con.query('CALL ObtenerReporteIngresos(?, ?)', [anio, mes]) as RowDataPacket[][];

        // Acceso correcto a los datos retornados por los procedimientos almacenados
        const totalEgresos = totalEgresosResult[0]?.[0]?.TotalEgresos || 0;
        const totalIngresos = totalIngresosResult[0]?.[0]?.TotalIngresos || 0;

        result = {
            totalEgresos,
            totalIngresos,
            reporteEgresos: reporteEgresosResult[0] || [],
            reporteIngresos: reporteIngresosResult[0] || []
        };
    } catch (error) {
        console.error('Error en ObtenerReportePorFecha:', error);
        result = { error: 'Ocurrió un error al obtener el reporte.' };
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerReportePresupuestoSemanal = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_gastos_semanales_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerReportePresupuestoPeriodico = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_gastos_periodicos_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};




export const ObtenerReportePresupuestoExtraordinario = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_gastos_extraordinarios_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerReporteMesActual = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM reporte_mes_actual_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en reportes');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};