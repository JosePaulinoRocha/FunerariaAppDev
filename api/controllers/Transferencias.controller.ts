import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';


export const ObtenerTransferencias = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM transferencias_vw';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en Transferencias');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};


export const addTransferencia = async (req: Request, res: Response) => {
    let con: any;
    const { CuentaEnviaID, CuentaRecibeID, Descripcion, Monto } = req.body;

    try {
        con = await connect();
        // Iniciar la transacción
        await con.beginTransaction();

        // Insertar en la tabla transferencias
        const insertTransferenciaQuery = `
            INSERT INTO transferencias (CuentaEnviaID, CuentaRecibeID, Descripcion, Monto, Fecha)
            VALUES (?, ?, ?, ?, NOW())
        `;
        const [transferenciaResult]: ResultSetHeader[] = await con.query(insertTransferenciaQuery, [CuentaEnviaID, CuentaRecibeID, Descripcion, Monto]);

        // Obtener el ID de la transferencia recién insertada
        const transferenciaID = transferenciaResult.insertId;

        // Insertar en la tabla ingresos (egreso de la cuenta que envía)
        const insertIngresoEgresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso)
            VALUES (NOW(), ?, ?, ?, 1)
        `;
        await con.query(insertIngresoEgresoQuery, [Descripcion, CuentaEnviaID, Monto]);

        // Insertar en la tabla ingresos (ingreso a la cuenta que recibe)
        const insertIngresoIngresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso)
            VALUES (NOW(), ?, ?, ?, 0)
        `;
        await con.query(insertIngresoIngresoQuery, [Descripcion, CuentaRecibeID, Monto]);

        // Confirmar la transacción
        await con.commit();

        // Devolver el ID de la transferencia insertada
        return res.json({ message: 'Transferencia realizada con éxito', transferenciaID });

    } catch (error) {
        // Si hay un error, revertir la transacción
        console.error('Error al realizar la transferencia:', error);
        await con.rollback();
        return res.status(500).json({ message: 'Error al realizar la transferencia' });
    } finally {
        if (con) {
            await con.end();
            console.log('Conexión a la base de datos cerrada.');
        }
    }
};
