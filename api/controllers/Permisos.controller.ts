// controllers/Permisos.controller.ts
import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';

export const ObtenerRoles = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        const query = 'SELECT * FROM roles';
        const [roles] = await con.query<RowDataPacket[]>(query);
        result = roles;
    } catch (error) {
        console.error('Error en ObtenerRoles', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const ObtenerSecciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        const query = 'SELECT * FROM permisos'; 
        const [secciones] = await con.query<RowDataPacket[]>(query);
        result = secciones;
    } catch (error) {
        console.error('Error en ObtenerSecciones', error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

// Crear nueva sección
export const CrearSeccion = async (req: Request, res: Response) => {
    const { NombrePermiso, Ruta } = req.body;
    let con;
    try {
        con = await connect();
        const query = 'INSERT INTO permisos (NombrePermiso, Ruta) VALUES (?, ?)';
        const [result] = await con.query<ResultSetHeader>(query, [NombrePermiso, Ruta]);
        res.json({ PermisoID: result.insertId, NombrePermiso, Ruta });
    } catch (error: unknown) {
        console.error('Error en CrearSeccion', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
        await con?.end();
    }
};

// Actualizar sección existente
export const UpdateSeccion = async (req: Request, res: Response) => {
    const { PermisoID, NombrePermiso, Ruta } = req.body;
    let con;
    try {
        con = await connect();
        const query = 'UPDATE permisos SET NombrePermiso = ?, Ruta = ? WHERE PermisoID = ?';
        await con.query(query, [NombrePermiso, Ruta, PermisoID]);
        res.json({ PermisoID, NombrePermiso, Ruta });
    } catch (error: unknown) {
        console.error('Error en UpdateSeccion', error);
        res.status(500).json({ message: error instanceof Error ? error.message : 'Unknown error' });
    } finally {
        await con?.end();
    }
};

// Crear Rol
export const CrearRol = async (req: Request, res: Response) => {
  const { NombreRol } = req.body;
  let con;
  try {
    con = await connect();
    const query = 'INSERT INTO roles (NombreRol) VALUES (?)';
    const [result] = await con.query<ResultSetHeader>(query, [NombreRol]);
    res.json({ RolID: result.insertId, NombreRol });
  } catch (error) {
    console.error('Error en CrearRol', error);
    res.status(500).json({ message: 'Error al crear rol' });
  } finally {
    await con?.end();
  }
};

// Actualizar Rol
export const UpdateRol = async (req: Request, res: Response) => {
  const { RolID, NombreRol } = req.body;
  let con;
  try {
    con = await connect();
    const query = 'UPDATE roles SET NombreRol = ? WHERE RolID = ?';
    await con.query(query, [NombreRol, RolID]);
    res.json({ RolID, NombreRol });
  } catch (error) {
    console.error('Error en UpdateRol', error);
    res.status(500).json({ message: 'Error al actualizar rol' });
  } finally {
    await con?.end();
  }
};


// Obtener permisos de un rol
export const ObtenerPermisosPorRol = async (req: Request, res: Response) => {
  const { rolId } = req.params;
  let con;
  try {
    con = await connect();
    const query = 'SELECT PermisoID FROM rol_permisos WHERE RolID = ?';
    const [rows] = await con.query<RowDataPacket[]>(query, [rolId]);
    res.json(rows.map(r => r.PermisoID));
  } catch (error) {
    console.error('Error en ObtenerPermisosPorRol', error);
    res.status(500).json({ message: 'Error al obtener permisos por rol' });
  } finally {
    await con?.end();
  }
};

// Asignar permiso a un rol
export const AsignarPermisoRol = async (req: Request, res: Response) => {
  const { RolID, PermisoID } = req.body;
  let con;
  try {
    con = await connect();
    const query = 'INSERT INTO rol_permisos (RolID, PermisoID) VALUES (?, ?)';
    await con.query<ResultSetHeader>(query, [RolID, PermisoID]);
    res.json({ RolID, PermisoID });
  } catch (error) {
    console.error('Error en AsignarPermisoRol', error);
    res.status(500).json({ message: 'Error al asignar permiso' });
  } finally {
    await con?.end();
  }
};

// Quitar permiso de un rol
export const RemoverPermisoRol = async (req: Request, res: Response) => {
  const { rolId, permisoId } = req.params;
  let con;
  try {
    con = await connect();
    const query = 'DELETE FROM rol_permisos WHERE RolID = ? AND PermisoID = ?';
    await con.query<ResultSetHeader>(query, [rolId, permisoId]);
    res.json({ RolID: rolId, PermisoID: permisoId });
  } catch (error) {
    console.error('Error en RemoverPermisoRol', error);
    res.status(500).json({ message: 'Error al remover permiso' });
  } finally {
    await con?.end();
  }
};

