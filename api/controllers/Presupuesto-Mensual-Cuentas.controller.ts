import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ObtenerPresupuestoFrecuencia = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM gastos_mensuales_por_frecuencia_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos frecuencia');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const ActualizarCuentaDeGastos = async (req: Request, res: Response) => {
    let con;
    const { gastosSeleccionados, cuentaID } = req.body;

    if (!Array.isArray(gastosSeleccionados) || gastosSeleccionados.length === 0 || !cuentaID) {
        return res.status(400).json({ message: 'Datos inválidos para la actualización' });
    }

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada para guardar la nueva cuenta de los registros extraordinarios');
        
        // Creamos una consulta para actualizar la cuenta de cada gasto seleccionado
        const gastoIDs = gastosSeleccionados.map(gasto => gasto.GastoID).join(', ');
        const query = `UPDATE gastos_presupuesto SET CuentaID = ? WHERE GastoID IN (${gastoIDs})`;

        const [result] = await con.query(query, [cuentaID]);

        if ((result as any).affectedRows > 0) {
            res.json({ message: 'Cuenta actualizada para los gastos seleccionados correctamente' });
        } else {
            res.status(404).json({ message: 'No se encontraron registros para actualizar' });
        }

        await con.commit();
        console.log('Transacción confirmada.');
        
    } catch (error) {
        console.error('Error al actualizar los CuentaID en gastos:', error);
        res.status(500).json({ message: 'Error al actualizar los CuentaID' });
    } finally {
        await con?.end();
    }
};

