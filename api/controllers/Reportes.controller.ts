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



export const ActualizarObservacion = async (req: Request, res: Response) => {
    // Log para ver qué datos recibimos en los parámetros y cuerpo
    console.log('Parametros:', req.params);
    console.log('Cuerpo:', req.body);

    const { segmentoID, categoriaID, subcategoriaID, conceptoID, observacion } = req.body; // Se obtienen todos del cuerpo

    if (!observacion) {
        return res.status(400).json({ error: 'La observación es obligatoria' });
    }

    let con;
    try {
        // Log para verificar si la conexión a la base de datos se establece correctamente
        console.log('Intentando conectar a la base de datos...');
        con = await connect();
        console.log('Conexión exitosa');

        const query = `
            UPDATE presupuesto_manual
            SET Observaciones = ?  -- Aquí se cambia "Observacion" por "Observaciones"
            WHERE SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ? AND ConceptoID = ?
        `;
        console.log('Consulta SQL:', query);
        console.log('Datos para la consulta:', [observacion, segmentoID, categoriaID, subcategoriaID, conceptoID]);

        const [result] = await con.query<ResultSetHeader>(query, [observacion, segmentoID, categoriaID, subcategoriaID, conceptoID]);

        console.log('Resultado de la consulta:', result);

        // Verificar si hubo filas afectadas
        if (result.affectedRows > 0) {
            res.json({ message: 'Observación actualizada exitosamente', affectedRows: result.affectedRows });
        } else {
            res.status(404).json({ message: 'No se encontró el registro a actualizar' });
        }
    } catch (error: unknown) {
        console.error('Error durante la ejecución:', error);
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) con.end();
    }
};


