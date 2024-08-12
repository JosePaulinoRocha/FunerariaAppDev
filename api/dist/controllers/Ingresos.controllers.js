"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.ObtenerEstatus = exports.ObtenerCombinaciones = exports.ObtenerUsuarios = exports.ObtenerSubcategorias = exports.ObtenerCategorias = exports.ObtenerSegmentos = exports.ObtenerConceptos = exports.UpdateIngresos = exports.PostIngresos = exports.ObtenerIngresos = void 0;
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
const PostIngresos = async (req, res) => {
    let con;
    let result;
    const { Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion, Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID, FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion } = req.body;
    console.log("Estos datos recibo en PostIngresos:", req.body);
    try {
        con = await (0, Accesos_BD_1.connect)();
        // Verificar la última combinación
        const checkCombinationQuery = `
            SELECT SegmentoID, CategoriaID, SubcategoriaID 
            FROM combinaciones 
            WHERE ConceptoID = ? 
            ORDER BY CombinacionID DESC 
            LIMIT 1
        `;
        const [combinationResult] = await con.query(checkCombinationQuery, [ConceptoID]);
        if (combinationResult.length === 0 ||
            combinationResult[0].SegmentoID !== SegmentoID ||
            combinationResult[0].CategoriaID !== CategoriaID ||
            combinationResult[0].SubcategoriaID !== SubcategoriaID) {
            // Insertar nueva combinación si no es igual a la última
            const insertCombinationQuery = `
                INSERT INTO combinaciones (ConceptoID, SegmentoID, CategoriaID, SubcategoriaID, FechaModificacion)
                VALUES (?, ?, ?, ?, NOW())
            `;
            const combinationValues = [ConceptoID, SegmentoID, CategoriaID, SubcategoriaID];
            await con.query(insertCombinationQuery, combinationValues);
            console.log('Nueva combinación insertada.');
        }
        else {
            console.log('La combinación ya existe.');
        }
        // Insertar siempre en la tabla ingresos
        const insertIngresoQuery = `
            INSERT INTO ingresos (
                Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
                Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID,
                FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion
            ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
        `;
        const ingresoValues = [
            Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
            Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID,
            FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion
        ];
        console.log('Ejecutando query de ingreso:', insertIngresoQuery);
        console.log('Con valores:', ingresoValues);
        await con.query(insertIngresoQuery, ingresoValues);
        console.log('Ingreso insertado exitosamente.');
        result = { message: 'Ingreso creado exitosamente' };
    }
    catch (error) {
        console.log('Error en PostIngresos');
        console.log(error);
        result = { message: 'Error al crear el ingreso' };
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        console.log('Conexión a la base de datos cerrada.');
        return res.json(result); // Asegúrate de que siempre estás enviando una respuesta
    }
};
exports.PostIngresos = PostIngresos;
const UpdateIngresos = async (req, res) => {
    let con;
    let result;
    const { IngresoID, Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion, Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID, FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion } = req.body;
    try {
        con = await (0, Accesos_BD_1.connect)();
        const query = `
            UPDATE ingresos SET
                Fecha = ?, SegmentoID = ?, CategoriaID = ?, SubcategoriaID = ?, ConceptoID = ?, Descripcion = ?,
                Proveedor = ?, Piezas = ?, CajaChica = ?, Monto = ?, Saldo = ?, Comprobante = ?, EstatusComprobacionID = ?,
                FechaAutorizacion = ?, UsuarioAutorizaID = ?, UsuarioRecibeID = ?, FechaConciliacion = ?, ObservacionesDifConciliacion = ?
            WHERE IngresoID = ?
        `;
        const values = [
            Fecha, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, Descripcion,
            Proveedor, Piezas, CajaChica, Monto, Saldo, Comprobante, EstatusComprobacionID,
            FechaAutorizacion, UsuarioAutorizaID, UsuarioRecibeID, FechaConciliacion, ObservacionesDifConciliacion,
            IngresoID
        ];
        await con.query(query, values);
        result = { message: 'Ingreso actualizado exitosamente' };
    }
    catch (error) {
        console.log('Error en Ingresos');
        console.log(error);
        result = { message: 'Error al actualizar el ingreso' };
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.UpdateIngresos = UpdateIngresos;
const ObtenerConceptos = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Conceptos';
        const conceptos = (await con.query(query))[0];
        result = conceptos;
    }
    catch (error) {
        console.log('Error en Conceptos');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerConceptos = ObtenerConceptos;
const ObtenerSegmentos = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Segmentos';
        const segmentos = (await con.query(query))[0];
        result = segmentos;
    }
    catch (error) {
        console.log('Error en Segmentos');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerSegmentos = ObtenerSegmentos;
const ObtenerCategorias = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Categorias';
        const categorias = (await con.query(query))[0];
        result = categorias;
    }
    catch (error) {
        console.log('Error en Categorias');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerCategorias = ObtenerCategorias;
const ObtenerSubcategorias = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Subcategorias';
        const subcategorias = (await con.query(query))[0];
        result = subcategorias;
    }
    catch (error) {
        console.log('Error en Subcategorias');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerSubcategorias = ObtenerSubcategorias;
const ObtenerUsuarios = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Usuarios';
        const usuarios = (await con.query(query))[0];
        result = usuarios;
    }
    catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerUsuarios = ObtenerUsuarios;
const ObtenerCombinaciones = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM Combinaciones';
        const combinaciones = (await con.query(query))[0];
        result = combinaciones;
    }
    catch (error) {
        console.log('Error en Combinaciones');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerCombinaciones = ObtenerCombinaciones;
const ObtenerEstatus = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM EstatusComprobacion';
        const estatus = (await con.query(query))[0];
        result = estatus;
    }
    catch (error) {
        console.log('Error en Estatus');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerEstatus = ObtenerEstatus;
