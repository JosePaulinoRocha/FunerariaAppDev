import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const GetResumenIngresosEgresos = async (req: Request, res: Response) => {
  let con;
  try {
    const { fecha, fechaFin, tipo, reconciliado } = req.query;
    con = await connect();

    const condiciones: string[] = ['i.CuentaID IS NOT NULL'];
    const valores: any[] = [];

    if (fecha && fechaFin) {
      condiciones.push('DATE(i.Fecha) BETWEEN ? AND ?');
      valores.push(fecha, fechaFin);
    } else if (fecha) {
      condiciones.push('DATE(i.Fecha) = ?');
      valores.push(fecha);
    } else {
      return res.status(400).json({ message: 'Parámetro fecha obligatorio' });
    }

    if (tipo === 'ingresos') {
      condiciones.push('i.TipoIngreso = 0');
    } else if (tipo === 'egresos') {
      condiciones.push('i.TipoIngreso = 1');
    }

    if (reconciliado === 'reconciliado') {
      condiciones.push('i.Reconciliado = 1');
    } else if (reconciliado === 'noReconciliado') {
      condiciones.push('i.Reconciliado = 0');
    }

    const whereClause = condiciones.join(' AND ');

    const query = `
      SELECT 
          i.CategoriaID,
          cat.Nombre AS NombreCategoria,
          i.TipoIngreso,
          i.Reconciliado AS TodosReconciliados,
          SUM(i.Monto) AS TotalMonto,
          MAX(i.Fecha) AS UltimaFecha,
          COUNT(*) AS TotalRegistros
      FROM vistaingresos i
      LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
      WHERE ${whereClause}
      GROUP BY i.CategoriaID, cat.Nombre, i.TipoIngreso, i.Reconciliado
      ORDER BY TotalMonto DESC;
    `;

    const [rows] = await con.query<RowDataPacket[]>(query, valores);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener resumen:', error);
    res.status(500).json({ message: 'Error al obtener resumen', error });
  } finally {
    if (con) await con.end();
  }
};


export const GetUltimaFechaConDatos = async (req: Request, res: Response) => {
    let con;
    try {
        con = await connect();
        const query = `
            SELECT DATE(MAX(i.Fecha)) AS UltimaFecha
            FROM ingresos i
            WHERE i.CuentaID IS NOT NULL
        `;
        const [rows] = await con.query<RowDataPacket[]>(query);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener última fecha:', error);
        res.status(500).json({ message: 'Error al obtener última fecha', error });
    } finally {
        if (con) await con.end();
    }
};

export const GetUltimaFechaConciliacion = async (req: Request, res: Response) => {
    let con;
    try {
        con = await connect();
        const query = `
            SELECT DATE(MAX(FechaConciliacion)) AS UltimaFecha
            FROM ingresos
            WHERE Reconciliado = 1
              AND FechaConciliacion IS NOT NULL
        `;
        const [rows] = await con.query<RowDataPacket[]>(query);
        res.json(rows[0]);
    } catch (error) {
        console.error('Error al obtener última FechaConciliacion:', error);
        res.status(500).json({ message: 'Error al obtener última FechaConciliacion', error });
    } finally {
        if (con) await con.end();
    }
};

export const GetResumenIngresosReconciliados = async (req: Request, res: Response) => {
  let con;
  try {
    const { fecha, fechaFin } = req.query;
    con = await connect();

    const condiciones: string[] = [
      'i.CuentaID IS NOT NULL',
      'i.TipoIngreso = 0',
      'i.Reconciliado = 1',
      'i.FechaConciliacion IS NOT NULL'
    ];
    const valores: any[] = [];

    if (fecha && fechaFin) {
      condiciones.push('DATE(i.FechaConciliacion) BETWEEN ? AND ?');
      valores.push(fecha, fechaFin);
    } else if (fecha) {
      condiciones.push('DATE(i.FechaConciliacion) = ?');
      valores.push(fecha);
    }

    const query = `
      SELECT 
        i.CategoriaID,
        cat.Nombre AS NombreCategoria,
        CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
        i.Reconciliado AS TodosReconciliados,
        SUM(i.Monto) AS TotalMonto,
        MAX(i.Fecha) AS UltimaFecha,
        COUNT(*) AS TotalRegistros
      FROM vistaingresos i
      LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
      WHERE ${condiciones.join(' AND ')}
      GROUP BY i.CategoriaID, cat.Nombre, i.TipoIngreso, i.Reconciliado
      ORDER BY TotalMonto DESC;
    `;

    const [rows] = await con.query<RowDataPacket[]>(query, valores);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener ingresos reconciliados:', error);
    res.status(500).json({ message: 'Error al obtener ingresos', error });
  } finally {
    if (con) await con.end();
  }
};

export const GetResumenEgresosReconciliados = async (req: Request, res: Response) => {
  let con;
  try {
    const { fecha, fechaFin } = req.query;
    con = await connect();

    const condiciones: string[] = [
      'i.CuentaID IS NOT NULL',
      'i.TipoIngreso = 1',
      'i.Reconciliado = 1',
      'i.FechaConciliacion IS NOT NULL'
    ];
    const valores: any[] = [];

    if (fecha && fechaFin) {
      condiciones.push('DATE(i.FechaConciliacion) BETWEEN ? AND ?');
      valores.push(fecha, fechaFin);
    } else if (fecha) {
      condiciones.push('DATE(i.FechaConciliacion) = ?');
      valores.push(fecha);
    }

    const query = `
      SELECT 
        i.CategoriaID,
        cat.Nombre AS NombreCategoria,
        CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
        i.Reconciliado AS TodosReconciliados,
        SUM(i.Monto) AS TotalMonto,
        MAX(i.Fecha) AS UltimaFecha,
        COUNT(*) AS TotalRegistros
      FROM vistaingresos i
      LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID
      WHERE ${condiciones.join(' AND ')}
      GROUP BY i.CategoriaID, cat.Nombre, i.TipoIngreso, i.Reconciliado
      ORDER BY TotalMonto DESC;
    `;

    const [rows] = await con.query<RowDataPacket[]>(query, valores);
    res.json(rows);
  } catch (error) {
    console.error('Error al obtener egresos reconciliados:', error);
    res.status(500).json({ message: 'Error al obtener egresos', error });
  } finally {
    if (con) await con.end();
  }
};
