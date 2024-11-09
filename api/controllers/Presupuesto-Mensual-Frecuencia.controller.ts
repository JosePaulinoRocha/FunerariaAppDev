import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerPresupuestoFrecuencia = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM gastos_mensuales_por_frecuencia_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos frecuencia');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerPresupuestoFrecuenciaAprobados = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM gastos_mensuales_por_frecuencia_vw WHERE Guardado = 1';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos frecuencia');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const PostGastosFrecuencia = async (req: Request, res: Response) => {
    let con: any;
    const {
        SegmentoID,
        CategoriaID,
        SubcategoriaID,
        ConceptoID,
        PromedioMonto,
        FrecuenciaPromedio,
        FrecuenciaDictaminada,
        MontoDictaminado,
        CuentaID,
        CajaChica,
        UltimaFecha,
        DiaLimite,
        DiasPendientes,
        PeriodoID
    } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada para guardar el gasto por frecuencia');

        // Inserción del nuevo gasto en la tabla gastos_presupuesto_frecuencia
        const insertGastoQuery = `
            INSERT INTO gastos_presupuesto_frecuencia (
                SegmentoID,
                CategoriaID,
                SubcategoriaID,
                ConceptoID,
                PromedioMonto,
                FrecuenciaPromedio,
                FrecuenciaDictaminada,
                MontoDictaminado,
                CuentaID,
                CajaChica,
                UltimaFecha,
                DiaLimite,
                DiasPendientes,
                PeriodoID
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;

        const gastoValues = [
            SegmentoID,
            CategoriaID,
            SubcategoriaID,
            ConceptoID,
            PromedioMonto,
            FrecuenciaPromedio,
            FrecuenciaDictaminada,
            MontoDictaminado,
            CuentaID,
            CajaChica,
            UltimaFecha,
            DiaLimite,
            DiasPendientes,
            PeriodoID
        ];

        const [insertResult]: any = await con.query(insertGastoQuery, gastoValues);
        const gastoID = insertResult.insertId;
        console.log('Gasto por frecuencia insertado exitosamente con ID:', gastoID);

        await con.commit();
        console.log('Transacción confirmada.');
        res.json({ message: 'Gasto creado exitosamente', GastoFrecuenciaID: gastoID });
    } catch (error: any) {
        console.error('Error en la transacción:', error);
        if (con) await con.rollback();
        res.status(500).json({ error: 'Error al crear el gasto: ' + error.message });
    } finally {
        if (con) con.end();
    }
};




export const ObtenerPresupuestoFrecuenciaGuardados = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM gastos_presupuesto_frecuencia';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos frecuencia');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

