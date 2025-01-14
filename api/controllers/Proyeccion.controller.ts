import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';


export const ObtenerFiltros = async (req: Request, res: Response) => {
    let con;
    let result : any;
    try {
        con = await connect(); // Establece la conexión con la base de datos
        const query = 'CALL obtener_datos_json()'; // Procedimiento almacenado a ejecutar

        // Ejecuta el procedimiento almacenado y captura el resultado
        const [rows] : any = await con.query(query);

        // Suponiendo que el SP devuelve un conjunto de resultados
        result = rows[0]; // Tomamos el primer conjunto de resultados
    } catch (error) {
        console.log('Error ejecutando el procedimiento almacenado obtener_filtros');
        console.log(error);
        result = null;
    } finally {
        console.log('error')
        await con?.end(); // Cerramos la conexión
        return res.json(result); // Devolvemos el resultado como JSON
    }
};

export const ObtenerIngresosPorFiltros = async (req:any, res:any) => {
    let con;
    let result : any = [];

    // Obtener los filtros del cuerpo de la solicitud
    const { segmento, categoria, subcategoria, concepto } = req.body;

    try {
        con = await connect(); // Conectar a la base de datos

        // Llamar al procedimiento almacenado con los filtros recibidos
        const query = 'CALL Get_Ingresos_Por_Filtros(?, ?, ?, ?)';

        const [rows] = await con.query(query, [
            segmento,
            categoria ,
            subcategoria ,
            concepto
        ]);
        // console.log(rows)
        result = rows; // Almacenar el resultado de la consulta
    } catch (error) {
        console.error('Error ejecutando el procedimiento almacenado Get_Egresos_Por_Filtros');
        console.error(error);
        result = null;
    } finally {
        await con?.end(); // Cerrar la conexión
        return res.json(result); // Devolver el resultado como JSON
    }
};

export const ObtenerEgresosPorFiltros = async (req:any, res:any) => {
    let con;
    let result : any = [];

    // Obtener los filtros del cuerpo de la solicitud
    const { segmento, categoria, subcategoria, concepto } = req.body;

    try {
        con = await connect(); // Conectar a la base de datos

        // Llamar al procedimiento almacenado con los filtros recibidos
        const query = 'CALL Get_Egresos_Por_Filtros(?, ?, ?, ?)';

        const [rows] = await con.query(query, [
            segmento,
            categoria ,
            subcategoria ,
            concepto
        ]);
        // console.log(rows)
        result = rows; // Almacenar el resultado de la consulta
    } catch (error) {
        console.error('Error ejecutando el procedimiento almacenado Get_Egresos_Por_Filtros');
        console.error(error);
        result = null;
    } finally {
        await con?.end(); // Cerrar la conexión
        return res.json(result); // Devolver el resultado como JSON
    }
};

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


export const ObtenerEgresosMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM egresos_totales_vw';
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


export const ObtenerEgresosMensualSemanales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM egresos_mes_actual_semanales_vw';
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

export const ObtenerIngresosMensualSemanales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM ingresos_mes_actual_semanales_vw';
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

export const ObtenerEgresoMensualSegmentos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM egreso_actual_por_segmento_vw';
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


export const ObtenerIngresoMensualSegmentos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM ingreso_actual_por_segmento_vw';
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


export const ObtenerUtilidadesNetasMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM utilidades_netas_mensuales_vw';
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



export const ObtenerIngresosPorCategoriaMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vista_ingresos_por_categoria';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en ingreso mensual por categoria');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};