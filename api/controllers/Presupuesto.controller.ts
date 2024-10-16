import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerPresupuesto = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM presupuesto_vw';
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



export const updatePresupuesto = async (req: Request, res: Response) => {
    let con: any;
    const { SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, MontoDictaminado, FrecuenciaDictaminada } = req.body;
  
    try {
        con = await connect();
        await con.beginTransaction();

        // Insertar o actualizar el presupuesto
        const upsertQuery = `
            INSERT INTO presupuesto_manual (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, MontoDictaminado, FrecuenciaDictaminada)
            VALUES (?, ?, ?, ?, ?, ?)
            ON DUPLICATE KEY UPDATE
                MontoDictaminado = VALUES(MontoDictaminado),
                FrecuenciaDictaminada = VALUES(FrecuenciaDictaminada)
        `;
        const values = [SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, MontoDictaminado, FrecuenciaDictaminada];
        await con.query(upsertQuery, values);

        await con.commit();
        return res.json({ message: 'Presupuesto creado o actualizado exitosamente' });
  
    } catch (error) {
        console.error('Error al actualizar el presupuesto:', error);
        await con.rollback();
        return res.status(500).json({ message: 'Error al actualizar el presupuesto' });
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
    }
};

