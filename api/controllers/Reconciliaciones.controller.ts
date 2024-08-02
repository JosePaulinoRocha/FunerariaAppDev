import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vistaingresos';
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

export const ObtenerIngresosParaConciliacion = async (req: Request, res: Response) => {
    let con;
    let result;
    const { fechaFinal, cuentaID } = req.body; // Usar req.body para POST

    try {
        con = await connect();
        let query = `
            SELECT * FROM vistaingresos
            WHERE CuentaID = ? AND Fecha <= ? AND Reconciliado = 0
        `;
        const [ingresos] = await con.query(query, [cuentaID, fechaFinal]);
        result = ingresos;
    } catch (error) {
        console.log('Error en ObtenerIngresosParaConciliacion');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerUltimaReconciliacion = async (req: Request, res: Response) => {
    let con;
    let result;
    const { cuentaID } = req.params; // Usar params para GET

    try {
        con = await connect();
        let query = `
            SELECT * FROM Reconciliaciones
            WHERE CuentaID = ?
            ORDER BY Fecha DESC
            LIMIT 1
        `;
        const [rows] = await con.query<RowDataPacket[]>(query, [cuentaID]);
        result = rows.length ? rows[0] : null;
    } catch (error) {
        console.log('Error en ObtenerUltimaReconciliacion');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const CrearReconciliacion = async (req: Request, res: Response) => {
    const { Fecha, Saldo, CuentaID } = req.body;
    let con;
    try {
        con = await connect();
        const [result] = await con.query<ResultSetHeader>('INSERT INTO Reconciliaciones (Fecha, Saldo, CuentaID) VALUES (?, ?, ?)', [Fecha, Saldo, CuentaID]);
        const newReconciliationID = result.insertId;
        res.json(newReconciliationID);
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) con.end();
    }
};

export const ActualizarIngresos = async (req: Request, res: Response) => {
    const reconciliacionUpdates = req.body;
    let con;
    try {
        con = await connect();
        for (const update of reconciliacionUpdates) {
            const { IngresoID, ReconciliacionID, Saldo } = update;
            await con.query('UPDATE Ingresos SET ReconciliacionID = ?, Reconciliado = 1, Saldo = ? WHERE IngresoID = ?', [ReconciliacionID, Saldo, IngresoID]);
        }
        res.json({ message: 'Ingresos actualizados exitosamente' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) con.end();
    }
};


export const ObtenerReconciliaciones = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM vistareconciliaciones';
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

export const EliminarReconciliacion = async (req: Request, res: Response) => {
    const { reconciliacionID } = req.params;
    console.log('ID de Reconciliación a eliminar:', reconciliacionID); // Log adicional

    let con;
    try {
        con = await connect();
        console.log('Conexión a la base de datos establecida'); // Log adicional

        // Iniciar una transacción
        await con.beginTransaction();
        console.log('Transacción iniciada'); // Log adicional

        // Actualizar los ingresos relacionados
        const updateQuery = 'UPDATE Ingresos SET ReconciliacionID = NULL, Reconciliado = 0 WHERE ReconciliacionID = ?';
        const [updateResult] = await con.query<ResultSetHeader>(updateQuery, [reconciliacionID]);
        console.log('Resultado de actualizar ingresos:', updateResult); // Log adicional

        // Eliminar la reconciliación
        const deleteQuery = 'DELETE FROM Reconciliaciones WHERE ReconciliacionID = ?';
        const [deleteResult] = await con.query<ResultSetHeader>(deleteQuery, [reconciliacionID]);
        console.log('Resultado de eliminar reconciliación:', deleteResult); // Log adicional

        // Confirmar la transacción
        await con.commit();
        console.log('Transacción confirmada'); // Log adicional

        res.json({ message: 'Reconciliación eliminada y registros actualizados exitosamente' });
    } catch (error: unknown) {
        if (error instanceof Error) {
            console.error('Error en EliminarReconciliacion:', error.message);
            res.status(500).json({ message: error.message });

            // Deshacer la transacción en caso de error
            if (con) await con.rollback();
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) await con.end();
        console.log('Conexión a la base de datos cerrada'); // Log adicional
    }
};

export const ActualizarObservacion = async (req: Request, res: Response) => {
    const { ingresoID } = req.params;
    const { observacion } = req.body;
    let con;
    try {
        con = await connect();
        const query = 'UPDATE Ingresos SET ObservacionesDifConciliacion = ? WHERE IngresoID = ?';
        const [result] = await con.query<ResultSetHeader>(query, [observacion, ingresoID]);
        res.json({ message: 'Observación actualizada exitosamente', affectedRows: result.affectedRows });
    } catch (error: unknown) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        } else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    } finally {
        if (con) con.end();
    }
};