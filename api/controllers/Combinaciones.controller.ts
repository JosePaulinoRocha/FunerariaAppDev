import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerCombinaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM combinaciones_vw';
        const ingresos = (await con.query(query))[0] as any[];
        result = ingresos;
    } catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export async function updateValidado(req: Request, res: Response): Promise<void> {
    const combinacionID = req.params.id;
    const { validado } = req.body;
  
    try {
        const conn = await connect();
        const [result] = await conn.query<ResultSetHeader>(
            'UPDATE Combinaciones SET validado = ?, FechaModificacion = NOW() WHERE CombinacionID = ?', 
            [validado, combinacionID]
        );
  
        if (result.affectedRows > 0) {
            res.json({ message: "Combinación actualizada correctamente" });
        } else {
            res.status(404).json({ message: "Combinación no encontrada" });
        }
    } catch (error) {
        res.status(500).json({ message: "Error al actualizar la combinación", error });
    }
}


export const EliminarCombinacion = async (req: Request, res: Response) => {
    const { combinacionID } = req.params;
    console.log('ID de Combinacion a eliminar:', combinacionID);

    let con;
    try {
        con = await connect();
        console.log('Conexión a la base de datos establecida'); 

        await con.beginTransaction();
        console.log('Transacción iniciada');

        // Eliminar la combinacion
        const deleteQuery = 'DELETE FROM Combinaciones WHERE CombinacionID = ?';
        const [deleteResult] = await con.query<ResultSetHeader>(deleteQuery, [combinacionID]);
        console.log('Resultado de eliminar combinacion:', deleteResult); 

        await con.commit();
        console.log('Transacción confirmada'); 

        res.json({ message: 'Combinacion eliminada exitosamente' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error en EliminarCombinacion:', error.message);
            res.status(500).json({ message: error.message });

            if (con) await con.rollback();
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) await con.end();
        console.log('Conexión a la base de datos cerrada');
    }
};
