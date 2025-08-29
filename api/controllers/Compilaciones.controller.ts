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
    const { fecha, fechaFin, segmentoId, categoriaId, subcategoriaId, modoFiltro, filtroSegmento } = req.query;
    const filtroSegmentoStr = typeof filtroSegmento === 'string' ? filtroSegmento : undefined;

    con = await connect();

    const condiciones: string[] = [
      'i.CuentaID IS NOT NULL',
      'i.TipoIngreso = 0', // ingresos
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

    if (segmentoId) { condiciones.push('i.SegmentoID = ?'); valores.push(segmentoId); }
    if (categoriaId) { condiciones.push('i.CategoriaID = ?'); valores.push(categoriaId); }
    if (subcategoriaId) { condiciones.push('i.SubcategoriaID = ?'); valores.push(subcategoriaId); }

    const joins: string[] = [];
    let selectFields = `
      CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
      SUM(i.Monto) AS TotalMonto,
      MAX(i.FechaConciliacion) AS UltimaFecha,
      COUNT(*) AS TotalRegistros
    `;
    let groupByFields = `i.TipoIngreso`;

    if (modoFiltro === 'segmento') {
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;

      if (filtroSegmentoStr && filtroSegmentoStr.toLowerCase() !== 'todos') {
        let keyword = '';
        const filtro = filtroSegmentoStr.toLowerCase();
        if (filtro === 'cobranza') keyword = '%cobranza%';
        if (filtro === 'funeraria') keyword = '%funeraria%';
        if (filtro === 'ventas') keyword = '%sala%';
        if (keyword) { condiciones.push('LOWER(seg.Nombre) LIKE ?'); valores.push(keyword); }
      }

      if (segmentoId) { joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID'); selectFields += `, i.CategoriaID, cat.Nombre AS NombreCategoria`; groupByFields += `, i.CategoriaID, cat.Nombre`; }
      if (categoriaId) { joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID'); selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`; groupByFields += `, i.SubcategoriaID, subcat.Nombre`; }
      if (subcategoriaId) { joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID'); selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`; groupByFields += `, i.ConceptoID, conc.Nombre`; }
    }

    const query = `
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `;

    const [rows] = await con.query<any[]>(query, valores);
    let ingresos = rows || [];

    if (filtroSegmentoStr && filtroSegmentoStr.toLowerCase() !== 'todos') {
      const [reasignaciones] = await con.query<any[]>(`
        SELECT ReasignacionID, SegmentoID, Monto, VarianteDestino, FechaInicio, FechaFin, TipoMovimiento
        FROM reasignaciones
        WHERE TipoMovimiento = 0
          AND DATE(FechaInicio) = ? AND DATE(FechaFin) = ?
      `, [fecha, fechaFin || fecha]);

      for (const r of reasignaciones) {
        const monto = parseFloat(r.Monto);
        const origen = ingresos.find(e => e.SegmentoID === r.SegmentoID && !e.VarianteDestino);
        if (origen) {
          origen.TotalMonto -= monto;
          if (origen.TotalMonto < 0) origen.TotalMonto = 0;
        }

        if (r.VarianteDestino.toLowerCase() === filtroSegmentoStr.toLowerCase()) {
          const [[seg]] = await con.query<any[]>(`SELECT Nombre FROM segmentos WHERE SegmentoID = ?`, [r.SegmentoID]);
          ingresos.push({
            SegmentoID: r.SegmentoID,
            NombreSegmento: seg ? seg.Nombre : '',
            TipoIngreso: 0,
            TotalMonto: monto,
            TotalRegistros: 1,
            UltimaFecha: r.FechaFin,
            VarianteDestino: r.VarianteDestino
          });
        }
      }
    }

    res.json(ingresos);

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
    const { fecha, fechaFin, segmentoId, categoriaId, subcategoriaId, modoFiltro, filtroSegmento } = req.query;
    const filtroSegmentoStr = typeof filtroSegmento === 'string' ? filtroSegmento : undefined;

    con = await connect();

    const condiciones: string[] = [
      'i.CuentaID IS NOT NULL',
      'i.TipoIngreso = 1', // egresos
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

    if (segmentoId) { condiciones.push('i.SegmentoID = ?'); valores.push(segmentoId); }
    if (categoriaId) { condiciones.push('i.CategoriaID = ?'); valores.push(categoriaId); }
    if (subcategoriaId) { condiciones.push('i.SubcategoriaID = ?'); valores.push(subcategoriaId); }

    const joins: string[] = [];
    let selectFields = `
      CAST(i.TipoIngreso AS UNSIGNED) AS TipoIngreso,
      SUM(i.Monto) AS TotalMonto,
      MAX(i.FechaConciliacion) AS UltimaFecha,
      COUNT(*) AS TotalRegistros
    `;
    let groupByFields = `i.TipoIngreso`;

    if (modoFiltro === 'segmento') {
      joins.push('LEFT JOIN segmentos seg ON i.SegmentoID = seg.SegmentoID');
      selectFields = `i.SegmentoID, seg.Nombre AS NombreSegmento, ` + selectFields;
      groupByFields = `i.SegmentoID, seg.Nombre, ` + groupByFields;

      if (filtroSegmentoStr && filtroSegmentoStr.toLowerCase() !== 'todos') {
        let keyword = '';
        const filtro = filtroSegmentoStr.toLowerCase();
        if (filtro === 'cobranza') keyword = '%cobranza%';
        if (filtro === 'funeraria') keyword = '%funeraria%';
        if (filtro === 'ventas') keyword = '%sala%';
        if (keyword) { condiciones.push('LOWER(seg.Nombre) LIKE ?'); valores.push(keyword); }
      }

      if (segmentoId) { joins.push('LEFT JOIN categorias cat ON i.CategoriaID = cat.CategoriaID'); selectFields += `, i.CategoriaID, cat.Nombre AS NombreCategoria`; groupByFields += `, i.CategoriaID, cat.Nombre`; }
      if (categoriaId) { joins.push('LEFT JOIN subcategorias subcat ON i.SubcategoriaID = subcat.SubcategoriaID'); selectFields += `, i.SubcategoriaID, subcat.Nombre AS NombreSubcategoria`; groupByFields += `, i.SubcategoriaID, subcat.Nombre`; }
      if (subcategoriaId) { joins.push('LEFT JOIN conceptos conc ON i.ConceptoID = conc.ConceptoID'); selectFields += `, i.ConceptoID, conc.Nombre AS NombreConcepto`; groupByFields += `, i.ConceptoID, conc.Nombre`; }
    }

    const query = `
      SELECT ${selectFields}
      FROM vistaingresos i
      ${joins.join(' ')}
      WHERE ${condiciones.join(' AND ')}
      GROUP BY ${groupByFields}
      ORDER BY TotalMonto DESC;
    `;

    const [rows] = await con.query<any[]>(query, valores);
    let egresos = rows || [];

    if (filtroSegmentoStr && filtroSegmentoStr.toLowerCase() !== 'todos') {
      const [reasignaciones] = await con.query<any[]>(`
        SELECT ReasignacionID, SegmentoID, Monto, VarianteDestino, FechaInicio, FechaFin, TipoMovimiento
        FROM reasignaciones
        WHERE TipoMovimiento = 1
          AND DATE(FechaInicio) = ? AND DATE(FechaFin) = ?
      `, [fecha, fechaFin || fecha]);

      const acumulado: Record<string, any> = {};

      for (const r of reasignaciones) {
        const monto = parseFloat(r.Monto);

        // restar al origen
        const origen = egresos.find(e => e.SegmentoID === r.SegmentoID && !e.VarianteDestino);
        if (origen) {
          origen.TotalMonto -= monto;
          if (origen.TotalMonto < 0) origen.TotalMonto = 0;
        }

        // sumar al destino si coincide con el filtro
        if (r.VarianteDestino.toLowerCase() === filtroSegmentoStr.toLowerCase()) {
          const [[seg]] = await con.query<any[]>(`SELECT Nombre FROM segmentos WHERE SegmentoID = ?`, [r.SegmentoID]);
          const clave = `${r.SegmentoID}_${r.VarianteDestino}_${r.TipoMovimiento}`;

          if (!acumulado[clave]) {
            acumulado[clave] = {
              SegmentoID: r.SegmentoID,
              NombreSegmento: seg ? seg.Nombre : '',
              TipoIngreso: 1,
              TotalMonto: 0,
              TotalRegistros: 0,
              UltimaFecha: r.FechaFin,
              VarianteDestino: r.VarianteDestino
            };
          }

          acumulado[clave].TotalMonto += monto;
          acumulado[clave].TotalRegistros += 1;
          if (new Date(r.FechaFin) > new Date(acumulado[clave].UltimaFecha)) {
            acumulado[clave].UltimaFecha = r.FechaFin;
          }
        }
      }

      egresos.push(...Object.values(acumulado));
    }

    res.json(egresos);

  } catch (error) {
    console.error('Error al obtener egresos reconciliados:', error);
    res.status(500).json({ message: 'Error al obtener egresos', error });
  } finally {
    if (con) await con.end();
  }
};


export const CrearReasignacion = async (req: Request, res: Response) => {
  let con;
  try {
    const { 
      segmentoIdOriginal, 
      varianteDestino, 
      montoReasignado, 
      fechaInicio, 
      fechaFin, 
      tipoMovimiento, 
      originKey // variante de origen real del segmento
    } = req.body;

    if (!segmentoIdOriginal || !varianteDestino || !montoReasignado || !fechaInicio || tipoMovimiento === undefined || !originKey) {
      return res.status(400).json({ message: "Faltan parámetros requeridos" });
    }

    con = await connect();

    // 🔹 Caso especial: si el destino es la misma que el origen real
    if (varianteDestino === originKey) {
      // Solo restar del registro de la variante desde donde se abrió el modal
      const [fromRows] = await con.query<any[]>(`
        SELECT * FROM reasignaciones
        WHERE SegmentoID = ? AND VarianteDestino = ? AND TipoMovimiento = ? AND FechaInicio = ? AND FechaFin = ?
      `, [segmentoIdOriginal, req.body.filtroSegmento, tipoMovimiento, fechaInicio, fechaFin || fechaInicio]);

      if (fromRows.length > 0) {
        const nuevoMonto = fromRows[0].Monto - montoReasignado;

        if (nuevoMonto > 0) {
          await con.query(`
            UPDATE reasignaciones SET Monto = ? WHERE ReasignacionID = ?
          `, [nuevoMonto, fromRows[0].ReasignacionID]);
        } else {
          await con.query(`
            DELETE FROM reasignaciones WHERE ReasignacionID = ?
          `, [fromRows[0].ReasignacionID]);
        }
      }

      // No crear registro nuevo para el origen
      return res.json({ message: "Reasignación revertida al origen correctamente" });
    }

    // 1️⃣ Restar del registro de origen (si no es un retorno al origen)
    if (req.body.filtroSegmento.toLowerCase() !== 'todos') {
      await con.query(`
        UPDATE reasignaciones
        SET Monto = Monto - ?
        WHERE SegmentoID = ? AND VarianteDestino = ? AND TipoMovimiento = ? AND FechaInicio = ? AND FechaFin = ?
      `, [montoReasignado, segmentoIdOriginal, req.body.filtroSegmento, tipoMovimiento, fechaInicio, fechaFin || fechaInicio]);
    }

    // 2️⃣ Sumar al registro existente de la variante destino
    const [destinoRows] = await con.query<any[]>(`
      SELECT * FROM reasignaciones
      WHERE SegmentoID = ? AND VarianteDestino = ? AND TipoMovimiento = ? AND FechaInicio = ? AND FechaFin = ?
    `, [segmentoIdOriginal, varianteDestino, tipoMovimiento, fechaInicio, fechaFin || fechaInicio]);

    if (destinoRows.length > 0) {
      await con.query(`
        UPDATE reasignaciones SET Monto = Monto + ? WHERE ReasignacionID = ?
      `, [montoReasignado, destinoRows[0].ReasignacionID]);
    } else {
      await con.query(`
        INSERT INTO reasignaciones
          (SegmentoID, Monto, VarianteDestino, FechaInicio, FechaFin, TipoMovimiento)
        VALUES (?, ?, ?, ?, ?, ?)
      `, [segmentoIdOriginal, montoReasignado, varianteDestino, fechaInicio, fechaFin || fechaInicio, tipoMovimiento]);
    }

    res.json({ message: "Reasignación procesada correctamente" });
  } catch (error) {
    console.error("❌ Error al crear reasignación:", error);
    res.status(500).json({ message: "Error al crear reasignación", error });
  } finally {
    if (con) await con.end();
  }
};


export const GetReasignaciones = async (req: Request, res: Response) => {
  let con;
  try {
    const { fechaInicio, fechaFin } = req.query;

    if (!fechaInicio) return res.status(400).json({ message: "fechaInicio requerida" });

    con = await connect();
    const query = `
      SELECT * FROM Reasignaciones
      WHERE FechaInicio >= ? 
      ${fechaFin ? 'AND FechaFin <= ?' : ''}
      ORDER BY FechaInicio DESC
    `;
    const valores = fechaFin ? [fechaInicio, fechaFin] : [fechaInicio];

    const [rows] = await con.query(query, valores);
    res.json(rows);
  } catch (error) {
    console.error("❌ Error al obtener reasignaciones:", error);
    res.status(500).json({ message: "Error al obtener reasignaciones", error });
  } finally {
    if (con) await con.end();
  }
};
