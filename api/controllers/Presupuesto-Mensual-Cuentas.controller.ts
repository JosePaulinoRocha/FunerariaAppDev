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



export const ActualizarCuentaDeGastosSemanales = async (req: Request, res: Response) => {
    let con;
    const { gastosSeleccionados, cuentaID } = req.body;

    if (!Array.isArray(gastosSeleccionados) || gastosSeleccionados.length === 0 || cuentaID === undefined) {
        return res.status(400).json({ message: 'Datos inválidos para la actualización' });
    }

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada para actualizar la cuenta de los gastos semanales');

        // Si el CuentaID recibido es 0, asignamos NULL y CajaChica a 1
        const cuentaIDToUpdate = cuentaID === 0 ? null : cuentaID;
        const cajaChicaValue = cuentaID === 0 ? 1 : 0;

        // Insertar los nuevos registros o actualizar `CuentaID` y `CajaChica` si ya existen
        const query = `
            INSERT INTO gastos_semanales_mensuales_cuentas (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, PeriodoID, CuentaID, CajaChica)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                CuentaID = VALUES(CuentaID),
                CajaChica = VALUES(CajaChica)
        `;

        const values = gastosSeleccionados.map(gasto => [
            gasto.SegmentoID,
            gasto.CategoriaID,
            gasto.SubcategoriaID,
            gasto.ConceptoID,
            gasto.PeriodoID,
            cuentaIDToUpdate,  // Cambiamos el CuentaID a null si es 0
            cajaChicaValue     // Actualizamos CajaChica a 1 si CuentaID es 0, sino 0
        ]);

        const [result] = await con.query(query, [values]);

        if ((result as ResultSetHeader).affectedRows > 0) {
            res.json({ message: 'Cuenta actualizada correctamente para los gastos semanales' });
        } else {
            res.status(404).json({ message: 'No se encontraron registros para actualizar' });
        }

        await con.commit();
        console.log('Transacción confirmada.');
    } catch (error) {
        console.error('Error al actualizar CajaChica en gastos semanales:', error);
        res.status(500).json({ message: 'Error al actualizar CajaChica' });
    } finally {
        await con?.end();
    }
};




export const ActualizarCuentaDeGastosFrecuencia = async (req: Request, res: Response) => {
    let con;
    const { gastosSeleccionados, cuentaID } = req.body;

    if (!Array.isArray(gastosSeleccionados) || gastosSeleccionados.length === 0 || cuentaID === undefined) {
        return res.status(400).json({ message: 'Datos inválidos para la actualización' });
    }

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada para actualizar la cuenta de los gastos con frecuencia mensual');

        // Si el CuentaID recibido es 0, asignamos NULL y CajaChica a 1
        const cuentaIDToUpdate = cuentaID === 0 ? null : cuentaID;
        const cajaChicaValue = cuentaID === 0 ? 1 : 0;

        // Insertar los nuevos registros o actualizar `CuentaID` y `CajaChica` si ya existen
        const query = `
            INSERT INTO gastos_frecuencia_mensuales_cuentas (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, PeriodoID, CuentaID, CajaChica)
            VALUES ?
            ON DUPLICATE KEY UPDATE 
                CuentaID = VALUES(CuentaID),
                CajaChica = VALUES(CajaChica)
        `;

        const values = gastosSeleccionados.map(gasto => [
            gasto.SegmentoID,
            gasto.CategoriaID,
            gasto.SubcategoriaID,
            gasto.ConceptoID,
            gasto.PeriodoID,
            cuentaIDToUpdate,  // Cambiamos el CuentaID a null si es 0
            cajaChicaValue     // Actualizamos CajaChica a 1 si CuentaID es 0, sino 0
        ]);

        const [result] = await con.query(query, [values]);

        if ((result as ResultSetHeader).affectedRows > 0) {
            res.json({ message: 'Cuenta actualizada correctamente para los gastos con frecuencia mensual' });
        } else {
            res.status(404).json({ message: 'No se encontraron registros para actualizar' });
        }

        await con.commit();
        console.log('Transacción confirmada.');
    } catch (error) {
        console.error('Error al actualizar CuentaID y CajaChica en gastos con frecuencia mensual:', error);
        res.status(500).json({ message: 'Error al actualizar CuentaID y CajaChica' });
    } finally {
        await con?.end();
    }
};



