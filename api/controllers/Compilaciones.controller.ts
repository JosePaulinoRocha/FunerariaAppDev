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
    const { fecha, fechaFin, segmentoId, categoriaId, subcategoriaId, modoFiltro } = req.query;

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

    if (segmentoId) {
      condiciones.push('i.SegmentoID = ?');
      valores.push(segmentoId);
    }
    if (categoriaId) {
      condiciones.push('i.CategoriaID = ?');
      valores.push(categoriaId);
    }
    if (subcategoriaId) {
      condiciones.push('i.SubcategoriaID = ?');
      valores.push(subcategoriaId);
    }

    let selectFields = `
      CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
      SUM(i.Monto) AS TotalMonto,
      MAX(i.FechaConciliacion) AS UltimaFecha,
      COUNT(*) AS TotalRegistros
    `;
    let groupByFields = `i.TipoIngreso`;
    const joins: string[] = [];

    if (modoFiltro === 'segmento') {
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');

      if (segmentoId) {
        selectFields += `, i.CategoriaID, cat.Nombre AS NombreCategoria`;
        groupByFields += `, i.CategoriaID, cat.Nombre`;
        joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID');
      }

      if (categoriaId) {
        selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`;
        groupByFields += `, i.SubcategoriaID, subcat.Nombre`;
        joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID');
      }

      if (subcategoriaId) {
        selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`;
        groupByFields += `, i.ConceptoID, conc.Nombre`;
        joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID');
      }

    } else if (modoFiltro === 'categoria') {
      selectFields = `i.CategoriaID, cat.Nombre AS NombreCategoria, ` + selectFields;
      groupByFields = `i.CategoriaID, cat.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID');

      if (categoriaId) {
        selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`;
        groupByFields += `, i.SubcategoriaID, subcat.Nombre`;
        joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID');
      }

      if (subcategoriaId) {
        selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`;
        groupByFields += `, i.ConceptoID, conc.Nombre`;
        joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID');
      }

    } else {
      // Por defecto asumimos modo segmento
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');
    }

    console.log('[INGRESOS] Query construido:\n', `
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `);

    const [rows] = await con.query(`
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `, valores);

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
    const { fecha, fechaFin, segmentoId, categoriaId, subcategoriaId, modoFiltro } = req.query;

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

    if (segmentoId) {
      condiciones.push('i.SegmentoID = ?');
      valores.push(segmentoId);
    }
    if (categoriaId) {
      condiciones.push('i.CategoriaID = ?');
      valores.push(categoriaId);
    }
    if (subcategoriaId) {
      condiciones.push('i.SubcategoriaID = ?');
      valores.push(subcategoriaId);
    }

    let selectFields = `
      CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
      SUM(i.Monto) AS TotalMonto,
      MAX(i.FechaConciliacion) AS UltimaFecha,
      COUNT(*) AS TotalRegistros
    `;
    let groupByFields = `i.TipoIngreso`;
    const joins: string[] = [];

    if (modoFiltro === 'segmento') {
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');

      if (segmentoId) {
        selectFields += `, i.CategoriaID, cat.Nombre AS NombreCategoria`;
        groupByFields += `, i.CategoriaID, cat.Nombre`;
        joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID');
      }

      if (categoriaId) {
        selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`;
        groupByFields += `, i.SubcategoriaID, subcat.Nombre`;
        joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID');
      }

      if (subcategoriaId) {
        selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`;
        groupByFields += `, i.ConceptoID, conc.Nombre`;
        joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID');
      }

    } else if (modoFiltro === 'categoria') {
      selectFields = `i.CategoriaID, cat.Nombre AS NombreCategoria, ` + selectFields;
      groupByFields = `i.CategoriaID, cat.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID');

      if (categoriaId) {
        selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`;
        groupByFields += `, i.SubcategoriaID, subcat.Nombre`;
        joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID');
      }

      if (subcategoriaId) {
        selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`;
        groupByFields += `, i.ConceptoID, conc.Nombre`;
        joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID');
      }

    } else {
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');
    }

    console.log('[EGRESOS] Query construido:\n', `
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `);

    const [rows] = await con.query(`
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `, valores);

    res.json(rows);

  } catch (error) {
    console.error('Error al obtener egresos reconciliados:', error);
    res.status(500).json({ message: 'Error al obtener egresos', error });
  } finally {
    if (con) await con.end();
  }
};

