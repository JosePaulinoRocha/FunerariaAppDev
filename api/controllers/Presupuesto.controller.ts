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

export const ObtenerEstatusGasto = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM estatuspresupuesto';
        const proveedores = (await con.query(query))[0] as any[];
        result = proveedores;
    } catch (error) {
        console.log('Error en estatuspresupuesto');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerPresupuestoMensual = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM gastos_presupuesto_vw';
        const gastos = (await con.query(query))[0] as any[];
        result = gastos;
    } catch (error) {
        console.log('Error en gastos_presupuesto_vw');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const PostGastos = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const {
        FechaPreautorizada,
        Concepto,
        Monto,
        ProveedorID,
        SegmentoID
    } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada');

        // Función para verificar o crear un ProveedorID
        const getOrCreateProveedorID = async (proveedorID: number | string | null) => {
            if (typeof proveedorID === 'number') {
                // Si el ProveedorID ya es un número, usarlo directamente
                return proveedorID;
            } else if (typeof proveedorID === 'string' && proveedorID.trim() !== '') {
                // Si ProveedorID es una cadena, buscar o crear el proveedor en la base de datos
                const [proveedorResult]: any = await con.query(
                    `SELECT ProveedorID FROM proveedores WHERE Proveedor = ?`,
                    [proveedorID]
                );

                if (proveedorResult.length > 0) {
                    console.log('Proveedor encontrado:', proveedorResult[0].ProveedorID);
                    return proveedorResult[0].ProveedorID;
                } else {
                    const insertProveedorQuery = `INSERT INTO proveedores (Proveedor) VALUES (?)`;
                    const [insertProveedorResult]: any = await con.query(insertProveedorQuery, [proveedorID]);
                    console.log('Nuevo proveedor insertado:', insertProveedorResult.insertId);
                    return insertProveedorResult.insertId;
                }
            }
            return null; // Si ProveedorID está vacío o no es válido
        };

        // Función para verificar o crear un SegmentoID
        const getOrCreateSegmentoID = async (segmentoID: number | string | null) => {
            if (typeof segmentoID === 'number') {
                // Si el SegmentoID ya es un número, usarlo directamente
                return segmentoID;
            } else if (typeof segmentoID === 'string' && segmentoID.trim() !== '') {
                // Si SegmentoID es una cadena, buscar o crear el segmento en la base de datos
                const [segmentoResult]: any = await con.query(
                    `SELECT SegmentoID FROM segmentos WHERE Nombre = ?`,
                    [segmentoID]
                );

                if (segmentoResult.length > 0) {
                    console.log('Segmento encontrado:', segmentoResult[0].SegmentoID);
                    return segmentoResult[0].SegmentoID;
                } else {
                    const insertSegmentoQuery = `INSERT INTO segmentos (Nombre) VALUES (?)`;
                    const [insertSegmentoResult]: any = await con.query(insertSegmentoQuery, [segmentoID]);
                    console.log('Nuevo segmento insertado:', insertSegmentoResult.insertId);
                    return insertSegmentoResult.insertId;
                }
            }
            return null; // Si SegmentoID está vacío o no es válido
        };

        // Obtener o crear los IDs para Proveedor y Segmento
        const newProveedorID = await getOrCreateProveedorID(ProveedorID);
        const newSegmentoID = await getOrCreateSegmentoID(SegmentoID);

        // Inserción del nuevo gasto en la tabla gastos_presupuesto
        const insertGastoQuery = `
            INSERT INTO gastos_presupuesto (
                FechaPreautorizada,
                Concepto,
                Monto,
                ProveedorID,
                SegmentoID
            ) VALUES (?, ?, ?, ?, ?)
        `;
        const gastoValues = [
            FechaPreautorizada,
            Concepto,
            Monto,
            newProveedorID,
            newSegmentoID
        ];

        const [insertResult]: any = await con.query(insertGastoQuery, gastoValues);
        const gastoID = insertResult.insertId;
        console.log('Gasto insertado exitosamente con ID:', gastoID);

        await con.commit();
        console.log('Transacción confirmada.');
        result = { message: 'Gasto creado exitosamente', GastoID: gastoID };
    } catch (error) {
        console.error('Error en la transacción:', error);
        await con.rollback();
        result = { error: 'Error al crear el gasto: ' + error };
    } finally {
        if (con) {
            con.end();
        }
        res.json(result);
    }
};



export const PutGastos = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const {
        GastoID,
        FechaPreautorizada,
        Concepto,
        Monto,
        ProveedorID,
        SegmentoID
    } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada');

        // Función para verificar o crear un ProveedorID
        const getOrCreateProveedorID = async (proveedorID: number | string | null) => {
            if (typeof proveedorID === 'number') {
                return proveedorID;
            } else if (typeof proveedorID === 'string' && proveedorID.trim() !== '') {
                const [proveedorResult]: any = await con.query(
                    `SELECT ProveedorID FROM proveedores WHERE Proveedor = ?`,
                    [proveedorID]
                );

                if (proveedorResult.length > 0) {
                    return proveedorResult[0].ProveedorID;
                } else {
                    const insertProveedorQuery = `INSERT INTO proveedores (Proveedor) VALUES (?)`;
                    const [insertProveedorResult]: any = await con.query(insertProveedorQuery, [proveedorID]);
                    return insertProveedorResult.insertId;
                }
            }
            return null;
        };

        // Función para verificar o crear un SegmentoID
        const getOrCreateSegmentoID = async (segmentoID: number | string | null) => {
            if (typeof segmentoID === 'number') {
                return segmentoID;
            } else if (typeof segmentoID === 'string' && segmentoID.trim() !== '') {
                const [segmentoResult]: any = await con.query(
                    `SELECT SegmentoID FROM segmentos WHERE Nombre = ?`,
                    [segmentoID]
                );

                if (segmentoResult.length > 0) {
                    return segmentoResult[0].SegmentoID;
                } else {
                    const insertSegmentoQuery = `INSERT INTO segmentos (Nombre) VALUES (?)`;
                    const [insertSegmentoResult]: any = await con.query(insertSegmentoQuery, [segmentoID]);
                    return insertSegmentoResult.insertId;
                }
            }
            return null;
        };

        // Obtener o crear los IDs para Proveedor y Segmento
        const newProveedorID = await getOrCreateProveedorID(ProveedorID);
        const newSegmentoID = await getOrCreateSegmentoID(SegmentoID);

        if (GastoID) {
            // Actualizar gasto existente
            const updateGastoQuery = `
                UPDATE gastos_presupuesto
                SET FechaPreautorizada = ?, Concepto = ?, Monto = ?, ProveedorID = ?, SegmentoID = ?
                WHERE GastoID = ?
            `;
            const gastoValues = [
                FechaPreautorizada,
                Concepto,
                Monto,
                newProveedorID,
                newSegmentoID,
                GastoID
            ];

            await con.query(updateGastoQuery, gastoValues);
            console.log('Gasto actualizado exitosamente con ID:', GastoID);
            result = { message: 'Gasto actualizado exitosamente', GastoID: GastoID };
        } else {
            // Crear nuevo gasto
            const insertGastoQuery = `
                INSERT INTO gastos_presupuesto (
                    FechaPreautorizada,
                    Concepto,
                    Monto,
                    ProveedorID,
                    SegmentoID
                ) VALUES (?, ?, ?, ?, ?)
            `;
            const gastoValues = [
                FechaPreautorizada,
                Concepto,
                Monto,
                newProveedorID,
                newSegmentoID
            ];

            const [insertResult]: any = await con.query(insertGastoQuery, gastoValues);
            const newGastoID = insertResult.insertId;
            console.log('Gasto insertado exitosamente con ID:', newGastoID);
            result = { message: 'Gasto creado exitosamente', GastoID: newGastoID };
        }

        await con.commit();
        console.log('Transacción confirmada.');
    } catch (error) {
        console.error('Error en la transacción:', error);
        await con.rollback();
        result = { error: 'Error al realizar la operación: ' + error };
    } finally {
        if (con) {
            con.end();
        }
        res.json(result);
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



export const updatePresupuestoCuenta = async (req: Request, res: Response) => {
    let con: any;
    const { SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, DiaLimite } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();

        // Determinar si se debe actualizar CajaChica
        let updateQuery = '';
        let updateValues: any[] = [];

        if (CuentaID === -1) {
            // Es caja chica, no se actualiza CuentaID, pero se establece CajaChica a 1
            updateQuery = `
                UPDATE presupuesto_manual
                SET CajaChica = 1,
                    DiaLimite = ?
                WHERE SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ? AND ConceptoID = ?
            `;
            updateValues = [DiaLimite === -1 ? null : DiaLimite, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID];
        } else {
            // No es caja chica, se actualiza CuentaID y CajaChica a 0
            updateQuery = `
                UPDATE presupuesto_manual
                SET CuentaID = ?,
                    CajaChica = 0,
                    DiaLimite = ?
                WHERE SegmentoID = ? AND CategoriaID = ? AND SubcategoriaID = ? AND ConceptoID = ?
            `;
            updateValues = [CuentaID, DiaLimite === -1 ? null : DiaLimite, SegmentoID, CategoriaID, SubcategoriaID, ConceptoID];
        }

        // Ejecutar la consulta de actualización
        const [result] = await con.query(updateQuery, updateValues);

        await con.commit();
        return res.json({ message: 'Presupuesto actualizado exitosamente' });

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


export const updateGastoEstatus = async (req: Request, res: Response) => {
    let con: any;
    let result: any;
    const {
        GastoID,
        EstatusPresupuestoID,
        Fecha,
        CuentaID,
        CategoriaID,
        SubcategoriaID,
        ConceptoID
    } = req.body;

    try {
        con = await connect();
        await con.beginTransaction();
        console.log('Transacción iniciada');

        // Función para verificar o crear un CategoriaID
        const getOrCreateCategoriaID = async (categoriaID: number | string | null) => {
            if (typeof categoriaID === 'number') {
                return categoriaID;
            } else if (typeof categoriaID === 'string' && categoriaID.trim() !== '') {
                const [categoriaResult]: any = await con.query(
                    `SELECT CategoriaID FROM categorias WHERE Nombre = ?`,
                    [categoriaID]
                );

                if (categoriaResult.length > 0) {
                    return categoriaResult[0].CategoriaID;
                } else {
                    const insertCategoriaQuery = `INSERT INTO categorias (Nombre) VALUES (?)`;
                    const [insertCategoriaResult]: any = await con.query(insertCategoriaQuery, [categoriaID]);
                    return insertCategoriaResult.insertId;
                }
            }
            return null;
        };

        // Función para verificar o crear un SubcategoriaID
        const getOrCreateSubcategoriaID = async (subcategoriaID: number | string | null) => {
            if (typeof subcategoriaID === 'number') {
                return subcategoriaID;
            } else if (typeof subcategoriaID === 'string' && subcategoriaID.trim() !== '') {
                const [subcategoriaResult]: any = await con.query(
                    `SELECT SubcategoriaID FROM subcategorias WHERE Nombre = ?`,
                    [subcategoriaID]
                );

                if (subcategoriaResult.length > 0) {
                    return subcategoriaResult[0].SubcategoriaID;
                } else {
                    const insertSubcategoriaQuery = `INSERT INTO subcategorias (Nombre) VALUES (?)`;
                    const [insertSubcategoriaResult]: any = await con.query(insertSubcategoriaQuery, [subcategoriaID]);
                    return insertSubcategoriaResult.insertId;
                }
            }
            return null;
        };

        // Función para verificar o crear un ConceptoID
        const getOrCreateConceptoID = async (conceptoID: number | string | null) => {
            if (typeof conceptoID === 'number') {
                return conceptoID;
            } else if (typeof conceptoID === 'string' && conceptoID.trim() !== '') {
                const [conceptoResult]: any = await con.query(
                    `SELECT ConceptoID FROM conceptos WHERE Nombre = ?`,
                    [conceptoID]
                );

                if (conceptoResult.length > 0) {
                    return conceptoResult[0].ConceptoID;
                } else {
                    const insertConceptoQuery = `INSERT INTO conceptos (Nombre) VALUES (?)`;
                    const [insertConceptoResult]: any = await con.query(insertConceptoQuery, [conceptoID]);
                    return insertConceptoResult.insertId;
                }
            }
            return null;
        };

        // Obtener o crear los IDs para Categoria, Subcategoria y Concepto
        const newCategoriaID = await getOrCreateCategoriaID(CategoriaID);
        const newSubcategoriaID = await getOrCreateSubcategoriaID(SubcategoriaID);
        const newConceptoID = await getOrCreateConceptoID(ConceptoID);

        if (GastoID) {
            // Actualizar gasto existente
            const updateGastoQuery = `
                UPDATE gastos_presupuesto
                SET EstatusPresupuestoID = ?, Fecha = ?, CuentaID = ?, CategoriaID = ?, SubcategoriaID = ?, ConceptoID = ?
                WHERE GastoID = ?
            `;
            const gastoValues = [
                EstatusPresupuestoID,
                Fecha,
                CuentaID,
                newCategoriaID,
                newSubcategoriaID,
                newConceptoID,
                GastoID
            ];

            await con.query(updateGastoQuery, gastoValues);
            console.log('Gasto actualizado exitosamente con ID:', GastoID);
            result = { message: 'Gasto actualizado exitosamente', GastoID };
        } else {
            result = { error: 'GastoID no proporcionado para la actualización' };
        }

        await con.commit();
        console.log('Transacción confirmada.');
    } catch (error) {
        console.error('Error en la transacción:', error);
        await con.rollback();
        result = { error: 'Error al realizar la operación: ' + error };
    } finally {
        if (con) {
            con.end();
        }
        res.json(result);
    }
};

