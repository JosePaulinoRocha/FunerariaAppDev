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
    const { segmento, categoria, subcategoria, concepto, fechaInicial, fechaFinal, reconciliado } = req.body;
    console.log(segmento, fechaInicial, fechaFinal)
    try {
        con = await connect(); // Conectar a la base de datos

        // Llamar al procedimiento almacenado con los filtros recibidos
        const query = 'CALL Get_Ingresos_Por_Filtros(?, ?, ?, ?, ?, ?, ?)';

        const [rows] = await con.query(query, [
          segmento || null,
          categoria || null,
          subcategoria || null,
          concepto || null,
          fechaInicial || null,
          fechaFinal || null,
          reconciliado !== null ? reconciliado : null
        ]);
        
        
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
  
    const { segmento, categoria, subcategoria, concepto, fechaInicial, fechaFinal, reconciliado } = req.body;
  
    try {
      con = await connect(); // Conectar a la base de datos
  
      // Llamar al procedimiento almacenado con los filtros recibidos
      const query = 'CALL Get_Egresos_Por_Filtros(?, ?, ?, ?, ?, ?, ?)';
  
      const [rows] = await con.query(query, [
        segmento ? segmento : null,
        categoria ? categoria : null ,
        subcategoria ? subcategoria  : null ,
        concepto ? concepto  : null ,
        fechaInicial ? fechaInicial : null ,
        fechaFinal ? fechaFinal : null ,
        reconciliado !== null ? reconciliado : null // Filtrar por reconciliado
      ]);
      
      result = rows;
    } catch (error) {
      console.error('Error ejecutando el procedimiento almacenado Get_Egresos_Por_Filtros');
      console.error(error);
      result = null;
    } finally {
      await con?.end(); // Cerrar la conexión
      return res.json(result); // Devolver el resultado como JSON
    }
  };
  

export const ObtenerUtilidadesPorFiltros = async (req:any, res:any) => {
    let con;
    let result : any = [];

    // Obtener los filtros del cuerpo de la solicitud
    const { segmento, categoria, subcategoria, concepto, fechaInicial, fechaFinal } = req.body;

    try {
        con = await connect(); // Conectar a la base de datos

        // Llamar al procedimiento almacenado con los filtros recibidos
        const query = 'CALL Get_Utilidades_Por_Filtros(?, ?, ?, ?, ?, ?)';

        const [rows] = await con.query(query, [
            segmento ? segmento : null,
            categoria ? categoria : null ,
            subcategoria ?subcategoria  : null ,
            concepto ? concepto  : null ,
            fechaInicial ? fechaInicial : null ,
            fechaFinal ? fechaFinal : null 

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
    const estado = req.query.estado;
    try {
        con = await connect();

        let query = `
            SELECT SUM(Monto) AS EgresoActual
            FROM ingresos
            WHERE TipoIngreso = 1
              AND Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
              AND Fecha <= LAST_DAY(CURDATE())
        `;

        if (estado === '1') {
            query += ' AND Reconciliado = 1';
        } else if (estado === '0') {
            query += ' AND Reconciliado = 0';
        }

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
    const estado = req.query.estado; // '1', '0', '-1'
    try {
        con = await connect();

        let query = `
            SELECT SUM(Monto) AS IngresoActual
            FROM ingresos
            WHERE TipoIngreso = 0
              AND Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
              AND Fecha <= LAST_DAY(CURDATE())
        `;

        if (estado === '1') {
            query += ' AND Reconciliado = 1';
        } else if (estado === '0') {
            query += ' AND Reconciliado = 0';
        }

        const ingresos = (await con.query(query))[0] as any[];
        result = ingresos;
    } catch (error) {
        console.log('Error en ingreso actual');
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
  const estado = req.params.estado; // "1", "0" o "todos"

  try {
    con = await connect();

    let whereClause = '';
    if (estado === '1') {
      whereClause = 'AND i.Reconciliado = 1';
    } else if (estado === '0') {
      whereClause = 'AND i.Reconciliado = 0';
    }

    const query = `
      SELECT 
        m.Anio,
        m.MesNumero,
        IFNULL(SUM(i.Monto), 0) AS EgresoTotal
      FROM (
        SELECT 
          YEAR(DATE_SUB(CURDATE(), INTERVAL n MONTH)) AS Anio,
          MONTH(DATE_SUB(CURDATE(), INTERVAL n MONTH)) AS MesNumero
        FROM (
          SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
          UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
          UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
          UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
        ) AS nums
      ) AS m
      LEFT JOIN ingresos i 
        ON YEAR(i.Fecha) = m.Anio 
        AND MONTH(i.Fecha) = m.MesNumero 
        AND i.TipoIngreso = 1
        ${whereClause}
      GROUP BY m.Anio, m.MesNumero
      ORDER BY m.Anio DESC, m.MesNumero DESC
    `;

    const egresos = (await con.query(query))[0] as any[];
    result = egresos;
  } catch (error) {
    console.error('Error al obtener egresos mensuales:', error);
    result = [];
  } finally {
    await con?.end();
    return res.json(result);
  }
};

  

  export const ObtenerEgresosMensualSemanales = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
      const filtro = parseInt(req.params.filtro); // ← aquí capturamos el filtro
      con = await connect();
  
      let whereClause = '';
      if (filtro === 0 || filtro === 1) {
        whereClause = `AND i.Reconciliado = ${filtro}`;
      }
  
      const query = `
        SELECT 
            sm.inicio_semana,
            sm.fin_semana,
            COALESCE(SUM(er.Monto), 0) AS total_monto
        FROM (
            SELECT 
                fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK AS inicio_semana,
                LEAST(fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK + INTERVAL 6 DAY, fm.fin_mes) AS fin_semana
            FROM (
                SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS inicio_mes, LAST_DAY(CURDATE()) AS fin_mes
            ) fm
            JOIN (SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5) n
            WHERE fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK <= fm.fin_mes
  
            UNION ALL
  
            SELECT 
                fm.inicio_mes AS inicio_semana,
                fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 - 1 DAY AS fin_semana
            FROM (
                SELECT DATE_FORMAT(CURDATE(), '%Y-%m-01') AS inicio_mes, LAST_DAY(CURDATE()) AS fin_mes
            ) fm
            WHERE WEEKDAY(fm.inicio_mes) <> 0
        ) sm
        LEFT JOIN (
            SELECT i.Monto, i.Fecha
            FROM ingresos i
            WHERE i.TipoIngreso = 1
              AND i.Fecha BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND LAST_DAY(CURDATE())
              ${whereClause}
        ) er ON er.Fecha BETWEEN sm.inicio_semana AND sm.fin_semana
        GROUP BY sm.inicio_semana, sm.fin_semana
        ORDER BY sm.inicio_semana;
      `;
  
      const gastos = (await con.query(query))[0] as any[];
      result = gastos;
    } catch (error) {
      console.log('Error en egreso semanal');
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
      const filtro = parseInt(req.params.filtro); // 0, 1, o -1
      con = await connect();
  
      let whereClause = `
        i.TipoIngreso = 0
        AND i.Fecha BETWEEN DATE_FORMAT(CURDATE(), '%Y-%m-01') AND LAST_DAY(CURDATE())
      `;
  
      if (filtro === 0 || filtro === 1) {
        whereClause += ` AND i.Reconciliado = ${filtro}`;
      }
  
      const query = `
        SELECT 
            sm.inicio_semana,
            sm.fin_semana,
            COALESCE(SUM(er.Monto), 0) AS total_monto
        FROM (
            SELECT 
                fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK AS inicio_semana,
                LEAST(fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK + INTERVAL 6 DAY, fm.fin_mes) AS fin_semana
            FROM (
                SELECT 
                    DATE_FORMAT(CURDATE(), '%Y-%m-01') AS inicio_mes,
                    LAST_DAY(CURDATE()) AS fin_mes
            ) fm
            JOIN (
                SELECT 0 AS n UNION ALL SELECT 1 UNION ALL SELECT 2 UNION ALL SELECT 3 UNION ALL SELECT 4 UNION ALL SELECT 5
            ) n
            WHERE fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 DAY + INTERVAL n.n WEEK <= fm.fin_mes
            
            UNION ALL
            
            SELECT 
                fm.inicio_mes AS inicio_semana,
                fm.inicio_mes + INTERVAL (7 - WEEKDAY(fm.inicio_mes)) MOD 7 - 1 DAY AS fin_semana
            FROM (
                SELECT 
                    DATE_FORMAT(CURDATE(), '%Y-%m-01') AS inicio_mes,
                    LAST_DAY(CURDATE()) AS fin_mes
            ) fm
            WHERE WEEKDAY(fm.inicio_mes) <> 0
        ) sm
        LEFT JOIN (
            SELECT i.Monto, i.Fecha
            FROM ingresos i
            WHERE ${whereClause}
        ) er ON er.Fecha BETWEEN sm.inicio_semana AND sm.fin_semana
        GROUP BY sm.inicio_semana, sm.fin_semana
        ORDER BY sm.inicio_semana;
      `;
  
      const data = (await con.query(query))[0] as any[];
      result = data;
    } catch (error) {
      console.log('Error en ingresos semanales:', error);
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
      const filtro = parseInt(req.params.filtro); // 0, 1 o -1
      con = await connect();
  
      let whereClause = `
        vi.TipoIngreso = 1
        AND vi.Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
        AND vi.Fecha <= LAST_DAY(CURDATE())
      `;
  
      if (filtro === 0 || filtro === 1) {
        whereClause += ` AND vi.Reconciliado = ${filtro}`;
      }
  
      const query = `
        SELECT 
          vi.SegmentoID,
          vi.NombreSegmento,
          SUM(vi.Monto) AS EgresoActual
        FROM vistaingresos vi
        WHERE ${whereClause}
        GROUP BY vi.SegmentoID, vi.NombreSegmento
      `;
  
      const gastos = (await con.query(query))[0] as any[];
      result = gastos;
    } catch (error) {
      console.log('Error en egreso actual por segmento');
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
    const filtro = parseInt(req.params.filtroReconciliado); // 1, 0 o -1
  
    try {
      con = await connect();
      let query = `
        SELECT 
            vi.SegmentoID,
            vi.NombreSegmento,
            SUM(vi.Monto) AS IngresoActual
        FROM vistaingresos vi
        WHERE vi.TipoIngreso = 0
          AND vi.Fecha >= DATE_FORMAT(CURDATE(), '%Y-%m-01')
          AND vi.Fecha <= LAST_DAY(CURDATE())
          ${filtro !== -1 ? `AND vi.Reconciliado = ${filtro}` : ''}
        GROUP BY vi.SegmentoID, vi.NombreSegmento
      `;
  
      const gastos = (await con.query(query))[0] as any[];
      result = gastos;
    } catch (error) {
      console.log('Error en ingreso mensual por segmento');
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
    const filtro = req.params.filtro; // "1", "0" o "todos"

    try {
        con = await connect();

        let whereClause = '';
        if (filtro === '1') {
            whereClause = 'AND i.Reconciliado = 1';
        } else if (filtro === '0') {
            whereClause = 'AND i.Reconciliado = 0';
        } // si es "todos", no agregamos cláusula

        const query = `
            SELECT 
                m.Anio,
                m.MesNumero,
                IFNULL(SUM(i.Monto), 0) AS IngresoTotal
            FROM (
                SELECT 
                    YEAR(DATE_SUB(CURDATE(), INTERVAL n MONTH)) AS Anio,
                    MONTH(DATE_SUB(CURDATE(), INTERVAL n MONTH)) AS MesNumero
                FROM (
                    SELECT 0 AS n UNION SELECT 1 UNION SELECT 2 UNION SELECT 3 UNION SELECT 4
                    UNION SELECT 5 UNION SELECT 6 UNION SELECT 7 UNION SELECT 8 UNION SELECT 9
                    UNION SELECT 10 UNION SELECT 11 UNION SELECT 12 UNION SELECT 13 UNION SELECT 14
                    UNION SELECT 15 UNION SELECT 16 UNION SELECT 17 UNION SELECT 18 UNION SELECT 19
                ) AS nums
            ) AS m
            LEFT JOIN ingresos i 
                ON YEAR(i.Fecha) = m.Anio 
                AND MONTH(i.Fecha) = m.MesNumero 
                AND i.TipoIngreso = 0 
                ${whereClause}
            GROUP BY m.Anio, m.MesNumero
            ORDER BY m.Anio DESC, m.MesNumero DESC
        `;

        const ingresos = (await con.query(query))[0] as any[];
        result = ingresos;
    } catch (error) {
        console.log('Error al obtener ingresos mensuales:', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ObtenerEgresosPorCategoriaMensuales = async (req: Request, res: Response) => {
    let con;
    let result;
    const filtro = req.params.filtro;
  
    try {
      con = await connect();
      let condicion = '';
  
      if (filtro === '1') condicion = 'AND Reconciliado = 1';
      else if (filtro === '0') condicion = 'AND Reconciliado = 0';
  
      const query = `
        SELECT CategoriaID, NombreCategoria, SUM(Monto) AS TotalEgresos
        FROM vistaingresos
        WHERE TipoIngreso = 1
          AND MONTH(Fecha) = MONTH(CURDATE())
          AND YEAR(Fecha) = YEAR(CURDATE())
          ${condicion}
        GROUP BY CategoriaID, NombreCategoria
      `;
  
      const gastos = (await con.query(query))[0] as any[];
      result = gastos;
    } catch (error) {
      console.log('Error en egreso mensual por categoría');
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
    const filtro = req.params.filtro;
  
    try {
      con = await connect();
  
      let whereCondition = "TipoIngreso = 0 AND MONTH(Fecha) = MONTH(CURDATE()) AND YEAR(Fecha) = YEAR(CURDATE())";
      if (filtro === "1") whereCondition += " AND Reconciliado = 1";
      else if (filtro === "0") whereCondition += " AND Reconciliado = 0";
  
      const query = `
        SELECT 
          CategoriaID, NombreCategoria, SUM(Monto) AS TotalIngresos
        FROM vistaingresos
        WHERE ${whereCondition}
        GROUP BY CategoriaID, NombreCategoria
      `;
  
      const ingresos = (await con.query(query))[0] as any[];
      result = ingresos;
    } catch (error) {
      console.error('Error en ingreso por categoría:', error);
      result = null;
    } finally {
      await con?.end();
      return res.json(result);
    }
  };
  