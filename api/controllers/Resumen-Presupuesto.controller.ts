// controllers/Usuarios.controller.ts
import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";


export const ObtenerResumenSegmentos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM resumen_presupuesto_segmentos_vw';
        const Users = (await con.query(query))[0] as any[];
        result = Users;
    } catch (error) {
        console.log('Error en resumen segmentos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerPresupuestoMensualExtraordinarioAprobado = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        if (isNaN(segmentoID)) {
            return res.status(400).json({ error: "SegmentoID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_presupuesto_vw 
            WHERE EstatusPresupuestoID = 1 
            AND SegmentoID = ? 
            AND Fecha >= DATE_FORMAT(CURDATE(), "%Y-%m-01") 
            AND Fecha <= LAST_DAY(CURDATE())
        `;
        const gastos = (await con.query(query, [segmentoID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos_presupuesto_vw', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerPresupuestoSemanal = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID); // Obtener el segmentoID de los parámetros
        if (isNaN(segmentoID)) {
            return res.status(400).json({ error: "SegmentoID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_mensuales_semanales_vw
            WHERE SegmentoID = ?
        `;
        const gastos = (await con.query(query, [segmentoID]))[0] as any[];
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



export const ObtenerPresupuestoFrecuenciaAprobadosMesActual = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID); // Obtener el segmentoID de los parámetros
        if (isNaN(segmentoID)) {
            return res.status(400).json({ error: "SegmentoID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_mensuales_por_frecuencia_vw
            WHERE Guardado = 1 
            AND FechaSiguienteGasto >= DATE_FORMAT(CURDATE(), "%Y-%m-01") 
            AND FechaSiguienteGasto <= LAST_DAY(CURDATE())
            AND SegmentoID = ?
        `;
        const gastos = (await con.query(query, [segmentoID]))[0] as any[];
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




export const ObtenerEgresoMensualSegmentos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID); // Obtener el segmentoID de los parámetros
        if (isNaN(segmentoID)) {
            return res.status(400).json({ error: "SegmentoID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM egreso_actual_por_segmento_y_categoria_vw
            WHERE SegmentoID = ?
        `;
        const gastos = (await con.query(query, [segmentoID]))[0] as any[];
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




// -----------------------------------------------------------------------------




export const ObtenerGastoExtraordinarioCategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_presupuesto_vw 
            WHERE EstatusPresupuestoID = 1 
            AND SegmentoID = ? 
            AND CategoriaID = ?
            AND Fecha BETWEEN DATE_FORMAT(CURDATE(), "%Y-%m-01") AND LAST_DAY(CURDATE())
        `;
        const gastos = (await con.query(query, [segmentoID, categoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gasto extraordinario por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerPresupuestoSemanalCategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `SELECT * FROM gastos_mensuales_semanales_vw WHERE SegmentoID = ? AND CategoriaID = ?`;
        const gastos = (await con.query(query, [segmentoID, categoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en presupuesto semanal por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerPresupuestoFrecuenciaCategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_mensuales_por_frecuencia_vw
            WHERE Guardado = 1 
            AND FechaSiguienteGasto BETWEEN DATE_FORMAT(CURDATE(), "%Y-%m-01") AND LAST_DAY(CURDATE())
            AND SegmentoID = ?
            AND CategoriaID = ?
        `;
        const gastos = (await con.query(query, [segmentoID, categoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en presupuesto frecuencia por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerEgresosMensualesCategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `SELECT * FROM egreso_actual_por_segmento_categoria_subcategoria_vw WHERE SegmentoID = ? AND CategoriaID = ?`;
        const gastos = (await con.query(query, [segmentoID, categoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egresos mensuales por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};




// -------------------------------------filtro por subcategorias-----------------------------------------------



export const ObtenerGastoExtraordinarioSubcategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);
        const subcategoriaID = parseInt(req.params.subcategoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID) || isNaN(subcategoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_presupuesto_vw 
            WHERE EstatusPresupuestoID = 1 
            AND SegmentoID = ? 
            AND CategoriaID = ?
            AND SubcategoriaID = ?
            AND Fecha BETWEEN DATE_FORMAT(CURDATE(), "%Y-%m-01") AND LAST_DAY(CURDATE())
        `;
        const gastos = (await con.query(query, [segmentoID, categoriaID, subcategoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gasto extraordinario por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerPresupuestoSemanalSubcategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);
        const subcategoriaID = parseInt(req.params.subcategoriaID);


        if (isNaN(segmentoID) || isNaN(categoriaID) || isNaN(subcategoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `SELECT * FROM gastos_mensuales_semanales_vw WHERE SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ?`;
        const gastos = (await con.query(query, [segmentoID, categoriaID, subcategoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en presupuesto semanal por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerPresupuestoFrecuenciaSubcategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);
        const subcategoriaID = parseInt(req.params.subcategoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID) || isNaN(subcategoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `
            SELECT * FROM gastos_mensuales_por_frecuencia_vw
            WHERE Guardado = 1 
            AND FechaSiguienteGasto BETWEEN DATE_FORMAT(CURDATE(), "%Y-%m-01") AND LAST_DAY(CURDATE())
            AND SegmentoID = ?
            AND CategoriaID = ?
            AND SubcategoriaID = ?
        `;
        const gastos = (await con.query(query, [segmentoID, categoriaID, subcategoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en presupuesto frecuencia por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerEgresosMensualesSubcategoria = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        const segmentoID = parseInt(req.params.segmentoID);
        const categoriaID = parseInt(req.params.categoriaID);
        const subcategoriaID = parseInt(req.params.subcategoriaID);

        if (isNaN(segmentoID) || isNaN(categoriaID) || isNaN(subcategoriaID)) {
            return res.status(400).json({ error: "SegmentoID o CategoriaID inválido" });
        }

        con = await connect();
        let query = `SELECT * FROM egreso_actual_por_segmento_categoria_subcategoria_concepto_vw WHERE SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ?`;
        const gastos = (await con.query(query, [segmentoID, categoriaID, subcategoriaID]))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en egresos mensuales por categoría:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};