import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerProveedores = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM proveedores_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en Proveedores');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const addProveedor = async (req: Request, res: Response) => {
    let con: any;
    const { Proveedor, CategoriaID, SubcategoriaID, CostoPorPieza } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();

        const getOrCreateId = async (table: string, value: number | string) => {
            if (typeof value === 'string') {
                const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
                const [insertResult]: any = await con.query(insertQuery, [value]);
                return insertResult.insertId;
            }
            return value;
        };

        const newCategoriaID = await getOrCreateId('categorias', CategoriaID);
        const newSubcategoriaID = await getOrCreateId('subcategorias', SubcategoriaID);

        // Verificar si ya existe un proveedor con el mismo nombre, CategoriaID y SubcategoriaID
        const checkProveedorDuplicadoQuery = `
            SELECT COUNT(*) as count 
            FROM proveedores 
            WHERE Proveedor = ? AND CategoriaID = ? AND SubcategoriaID = ?
        `;
        const [duplicadoCountResult] = await con.query(checkProveedorDuplicadoQuery, [Proveedor, newCategoriaID, newSubcategoriaID]) as any[];
        const { count: duplicadoCount } = duplicadoCountResult[0];

        if (duplicadoCount > 0) {
            // Ya existe un proveedor con el mismo nombre y combinación de categorías, devolver error 400
            return res.status(400).json({ message: 'Ya existe un proveedor con el mismo nombre, categoría y subcategoría' });
        } else {
            // Verificar cuántos proveedores existen con esa combinación de CategoriaID y SubcategoriaID
            const checkProveedorQuery = `
                SELECT COUNT(*) as count 
                FROM proveedores 
                WHERE CategoriaID = ? AND SubcategoriaID = ?
            `;
            const [proveedorCountResult] = await con.query(checkProveedorQuery, [newCategoriaID, newSubcategoriaID]) as any[];
            const { count } = proveedorCountResult[0];

            let estatus = 1; // Por defecto, el estatus es 1 (activo)

            // Si ya hay 3 o más proveedores con esta combinación, el estatus será 0 (inactivo)
            if (count >= 3) {
                estatus = 0;
            }

            // Insertar el nuevo proveedor
            const insertProveedorQuery = `
                INSERT INTO proveedores (Proveedor, CategoriaID, SubcategoriaID, Estatus, FechaRegistro, CostoPorPieza)
                VALUES (?, ?, ?, ?, NOW(), ?)
            `;
            const insertValues = [Proveedor, newCategoriaID, newSubcategoriaID, estatus, CostoPorPieza];
            await con.query(insertProveedorQuery, insertValues);

            await con.commit();
            return res.json({ message: 'Proveedor creado exitosamente', estatus });
        }
    } catch (error) {
        console.error('Error al crear el proveedor:', error);
        await con.rollback();
        return res.status(500).json({ message: 'Error al crear el proveedor' });
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
    }
};



export const updateProveedorStatus = async (req: Request, res: Response) => {
    let con;
    let result;
    const { ProveedorID, Estatus } = req.body;

    // Verifica si los datos están presentes
    if (ProveedorID === undefined || Estatus === undefined) {
        return res.status(400).json({ message: 'Faltan parámetros en la solicitud' });
    }

    try {
        con = await connect();
        const sql = 'UPDATE proveedores SET Estatus = ? WHERE ProveedorID = ?';
        await con.query(sql, [Estatus, ProveedorID]);
        result = { message: 'Proveedor actualizado correctamente' };
    } catch (error) {
        console.error('Error actualizando el estado del proveedor:', error);
        result = { message: 'Error actualizando el estado del proveedor' };
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
        return res.json(result);
    }
};