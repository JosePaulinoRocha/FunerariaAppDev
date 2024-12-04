import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerEgresoActual = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM egreso_actual_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egreso actual');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerEgresoPasado = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM egreso_mes_pasado_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egreso pasado');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerIngresoPasado = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM ingreso_mes_pasado_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en ingreso pasado');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerIngresoActual = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM ingreso_actual_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egreso actual');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerIngresosMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM ingresos_totales_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egreso mensual');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerEgresosPorCategoriaMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vista_egresos_por_categoria';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egreso mensual por categoria');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};