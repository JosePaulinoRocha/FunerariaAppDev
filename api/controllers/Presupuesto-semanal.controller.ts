import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';


export const PostPresupuesto = async (req: Request, res: Response) => {
  const { SegmentoID, CategoriaID, FechaInicio, FechaFin, Monto } = req.body;
  let con;

  if (!SegmentoID || !CategoriaID || !FechaInicio || !FechaFin || !Monto) {
    return res.status(400).json({ success: false, message: "Todos los campos son obligatorios." });
  }

  try {
    con = await connect();
    await con.beginTransaction();

    const query = `
      INSERT INTO presupuesto_semanal (SegmentoID, CategoriaID, FechaInicio, FechaFin, Monto)
      VALUES (?, ?, ?, ?, ?)
    `;
    const values = [SegmentoID, CategoriaID, FechaInicio, FechaFin, Monto];

    await con.query(query, values);

    await con.commit();

    return res.json({ success: true, message: "Presupuesto semanal creado correctamente." });
  } catch (error: unknown) {
    let mensajeError = "Error desconocido";
    if (error instanceof Error) {
      mensajeError = error.message;
    }
    if (con) {
      await con.rollback();
    }
    return res.status(500).json({ success: false, message: "Error al crear el presupuesto semanal.", error: mensajeError });
  } finally {
    if (con) {
      await con.end();
    }
  }
};


export const GetPresupuesto = async (req: Request, res: Response) => {
  const { fechaInicio, fechaFin } = req.query; // vienen como strings YYYY-MM-DD
  let con;
  try {
    con = await connect();
    let query = `
      SELECT *
      FROM presupuesto_semanal_vw
      WHERE 1=1
    `;
    const params: any[] = [];

    if (fechaInicio && fechaFin) {
      query += ` AND FechaInicio >= ? AND FechaFin <= ?`;
      params.push(fechaInicio, fechaFin);
    }

    query += ` ORDER BY FechaInicio DESC, PresupuestoPlaneado DESC, SegmentoNombre ASC, CategoriaNombre ASC`;

    const [rows] = await con.query(query, params);
    return res.json(rows);
  } catch (error: unknown) {
    let mensajeError = 'Error desconocido';
    if (error instanceof Error) mensajeError = error.message;
    return res.status(500).json({ success: false, message: mensajeError });
  } finally {
    if (con) await con.end();
  }
};


export const ImportarPresupuesto = async (req: Request, res: Response) => {
  const presupuestos = req.body;
  let con;

  if (!Array.isArray(presupuestos) || !presupuestos.length) {
    return res.status(400).json({ success: false, message: "No hay datos para importar." });
  }

  try {
    con = await connect();
    await con.beginTransaction();

    for (const p of presupuestos) {
      const segmento = p.SegmentoNombre?.trim();
      const categoria = p.CategoriaNombre?.trim();

      if (!segmento || !categoria || !p.FechaInicio || !p.FechaFin || p.PresupuestoPlaneado == null) {
        continue; // ignoramos filas incompletas
      }

      // 1. Obtener o crear IDs de Segmento y Categoría
      const [segmentoRows] = await con.query<RowDataPacket[]>('SELECT SegmentoID FROM segmentos WHERE Nombre = ?', [segmento]);
      const segmentoIdFinal = segmentoRows.length ? segmentoRows[0].SegmentoID : await crearSegmento(con, segmento);

      const [categoriaRows] = await con.query<RowDataPacket[]>('SELECT CategoriaID FROM categorias WHERE Nombre = ?', [categoria]);
      const categoriaIdFinal = categoriaRows.length ? categoriaRows[0].CategoriaID : await crearCategoria(con, categoria);

      // 2. Insertar presupuesto
      await con.query<ResultSetHeader>(
        `INSERT INTO presupuesto_semanal (SegmentoID, CategoriaID, FechaInicio, FechaFin, Monto)
         VALUES (?, ?, ?, ?, ?)`,
        [segmentoIdFinal, categoriaIdFinal, p.FechaInicio, p.FechaFin, p.PresupuestoPlaneado]
      );
    }

    await con.commit();
    return res.json({ success: true, message: 'Presupuestos importados correctamente' });
  } catch (error: unknown) {
    if (con) await con.rollback();
    return res.status(500).json({ success: false, message: error instanceof Error ? error.message : 'Error desconocido' });
  } finally {
    if (con) await con.end();
  }
};

async function crearSegmento(con: any, nombre: string): Promise<number> {
  const [result] = await con.query('INSERT INTO segmentos (Nombre) VALUES (?)', [nombre]);
  return (result as any).insertId;
}

async function crearCategoria(con: any, nombre: string): Promise<number> {
  const [result] = await con.query('INSERT INTO categorias (Nombre) VALUES (?)', [nombre]);
  return (result as any).insertId;
}


export const DeletePresupuesto = async (req: Request, res: Response) => {
  let con;
  const { id } = req.params;
  try {
    con = await connect();
    await con.query('DELETE FROM presupuesto_semanal WHERE PresupuestoID = ?', [id]);
    return res.json({ success: true, message: 'Registro eliminado correctamente' });
  } catch (error: unknown) {
    let mensajeError = 'Error desconocido';
    if (error instanceof Error) mensajeError = error.message;
    return res.status(500).json({ success: false, message: mensajeError });
  } finally {
    if (con) await con.end();
  }
};

export const GetUltimaFecha = async (req: Request, res: Response) => {
  let con;
  try {
    con = await connect();
    const query = `
      SELECT 
        DATE_FORMAT(FechaInicio, '%Y-%m-%d') AS FechaInicio,
        DATE_FORMAT(FechaFin, '%Y-%m-%d') AS FechaFin
      FROM presupuesto_semanal
      ORDER BY FechaFin DESC
      LIMIT 1
    `;
    const [rows]: any = await con.query(query);
    return res.json(rows.length ? rows[0] : null);
  } catch (error: unknown) {
    let mensajeError = 'Error desconocido';
    if (error instanceof Error) mensajeError = error.message;
    return res.status(500).json({ success: false, message: mensajeError });
  } finally {
    if (con) await con.end();
  }
};

