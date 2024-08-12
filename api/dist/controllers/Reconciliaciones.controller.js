"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ActualizarObservacion = exports.EliminarReconciliacion = exports.ObtenerReconciliaciones = exports.ActualizarIngresos = exports.CrearReconciliacion = exports.ObtenerUltimaReconciliacion = exports.ObtenerIngresosParaConciliacion = exports.ObtenerIngresos = void 0;
const Accesos_BD_1 = require("../BD/Accesos_BD");
const ObtenerIngresos = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM vistaingresos';
        const ingresos = (await con.query(query))[0];
        result = ingresos;
    }
    catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerIngresos = ObtenerIngresos;
const ObtenerIngresosParaConciliacion = async (req, res) => {
    let con;
    let result;
    const { fechaFinal, cuentaID } = req.body; // Usar req.body para POST
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = `
            SELECT * FROM vistaingresos
            WHERE CuentaID = ? AND Fecha <= ? AND Reconciliado = 0
        `;
        const [ingresos] = await con.query(query, [cuentaID, fechaFinal]);
        result = ingresos;
    }
    catch (error) {
        console.log('Error en ObtenerIngresosParaConciliacion');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerIngresosParaConciliacion = ObtenerIngresosParaConciliacion;
const ObtenerUltimaReconciliacion = async (req, res) => {
    let con;
    let result;
    const { cuentaID } = req.params; // Usar params para GET
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = `
            SELECT * FROM Reconciliaciones
            WHERE CuentaID = ?
            ORDER BY Fecha DESC
            LIMIT 1
        `;
        const [rows] = await con.query(query, [cuentaID]);
        result = rows.length ? rows[0] : null;
    }
    catch (error) {
        console.log('Error en ObtenerUltimaReconciliacion');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerUltimaReconciliacion = ObtenerUltimaReconciliacion;
const CrearReconciliacion = async (req, res) => {
    const { Fecha, Saldo, CuentaID } = req.body;
    let con;
    try {
        con = await (0, Accesos_BD_1.connect)();
        const [result] = await con.query('INSERT INTO Reconciliaciones (Fecha, Saldo, CuentaID) VALUES (?, ?, ?)', [Fecha, Saldo, CuentaID]);
        const newReconciliationID = result.insertId;
        res.json(newReconciliationID);
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
    finally {
        if (con)
            con.end();
    }
};
exports.CrearReconciliacion = CrearReconciliacion;
const ActualizarIngresos = async (req, res) => {
    const reconciliacionUpdates = req.body;
    let con;
    try {
        con = await (0, Accesos_BD_1.connect)();
        for (const update of reconciliacionUpdates) {
            const { IngresoID, ReconciliacionID, Saldo } = update;
            await con.query('UPDATE Ingresos SET ReconciliacionID = ?, Reconciliado = 1, Saldo = ? WHERE IngresoID = ?', [ReconciliacionID, Saldo, IngresoID]);
        }
        res.json({ message: 'Ingresos actualizados exitosamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
    finally {
        if (con)
            con.end();
    }
};
exports.ActualizarIngresos = ActualizarIngresos;
const ObtenerReconciliaciones = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM vistareconciliaciones';
        const ingresos = (await con.query(query))[0];
        result = ingresos;
    }
    catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerReconciliaciones = ObtenerReconciliaciones;
const EliminarReconciliacion = async (req, res) => {
    const { reconciliacionID } = req.params;
    console.log('ID de Reconciliación a eliminar:', reconciliacionID); // Log adicional
    let con;
    try {
        con = await (0, Accesos_BD_1.connect)();
        console.log('Conexión a la base de datos establecida'); // Log adicional
        // Iniciar una transacción
        await con.beginTransaction();
        console.log('Transacción iniciada'); // Log adicional
        // Actualizar los ingresos relacionados
        const updateQuery = 'UPDATE Ingresos SET ReconciliacionID = NULL, Reconciliado = 0 WHERE ReconciliacionID = ?';
        const [updateResult] = await con.query(updateQuery, [reconciliacionID]);
        console.log('Resultado de actualizar ingresos:', updateResult); // Log adicional
        // Eliminar la reconciliación
        const deleteQuery = 'DELETE FROM Reconciliaciones WHERE ReconciliacionID = ?';
        const [deleteResult] = await con.query(deleteQuery, [reconciliacionID]);
        console.log('Resultado de eliminar reconciliación:', deleteResult); // Log adicional
        // Confirmar la transacción
        await con.commit();
        console.log('Transacción confirmada'); // Log adicional
        res.json({ message: 'Reconciliación eliminada y registros actualizados exitosamente' });
    }
    catch (error) {
        if (error instanceof Error) {
            console.error('Error en EliminarReconciliacion:', error.message);
            res.status(500).json({ message: error.message });
            // Deshacer la transacción en caso de error
            if (con)
                await con.rollback();
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
    finally {
        if (con)
            await con.end();
        console.log('Conexión a la base de datos cerrada'); // Log adicional
    }
};
exports.EliminarReconciliacion = EliminarReconciliacion;
const ActualizarObservacion = async (req, res) => {
    const { ingresoID } = req.params;
    const { observacion } = req.body;
    let con;
    try {
        con = await (0, Accesos_BD_1.connect)();
        const query = 'UPDATE Ingresos SET ObservacionesDifConciliacion = ? WHERE IngresoID = ?';
        const [result] = await con.query(query, [observacion, ingresoID]);
        res.json({ message: 'Observación actualizada exitosamente', affectedRows: result.affectedRows });
    }
    catch (error) {
        if (error instanceof Error) {
            res.status(500).json({ message: error.message });
        }
        else {
            res.status(500).json({ message: 'Unknown error occurred' });
        }
    }
    finally {
        if (con)
            con.end();
    }
};
exports.ActualizarObservacion = ActualizarObservacion;
