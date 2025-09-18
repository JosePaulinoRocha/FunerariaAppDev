import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader } from 'mysql2/promise';


export async function ImportarIngresos(req: Request, res: Response): Promise<void> {
    const registros = req.body;
    let con: any;
    const idCache: { [key: string]: number } = {};

    try {
        con = await connect();
        await con.beginTransaction();

        const getOrCreateId = async (table: string, column: string, value: string): Promise<number> => {
            const cacheKey = `${table}-${value}`;
            if (idCache[cacheKey]) return idCache[cacheKey];

            if (!isNaN(Number(value))) return Number(value);

            const [rows]: RowDataPacket[] = await con.query(
                `SELECT ${table.slice(0, -1)}ID FROM ${table} WHERE ${column} = ?`,
                [value]
            );

            if (rows.length > 0) {
                idCache[cacheKey] = rows[0][`${table.slice(0, -1)}ID`];
                return idCache[cacheKey];
            } else {
                const [insertResult]: ResultSetHeader[] = await con.query(
                    `INSERT INTO ${table} (${column}) VALUES (?)`,
                    [value]
                );
                idCache[cacheKey] = insertResult.insertId;
                console.log(`Nuevo ${table}: ${value} (ID: ${insertResult.insertId})`);
                return idCache[cacheKey];
            }
        };

        for (const registro of registros) {
            const { tipoIngreso, collection, service_ref, agent, date_affect, date_ref, total_amount, reference, method_payment, paid_type, amount } = registro;

            let SegmentoID: number, CategoriaID: number;
            let Descripcion: string;
            let Fecha: string;
            let Monto: number;
            let Observaciones: string = '';

            if (tipoIngreso === 'afectaciones') {
                // 📌 CASO COBRANZA
                Descripcion = collection;
                Fecha = date_affect;
                Monto = total_amount;
                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Cobranza');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Cuentas Establecidas');

                const [existentes]: RowDataPacket[] = await con.query(
                    `SELECT * FROM ingresos_externos 
                     WHERE SegmentoID = ? AND CategoriaID = ? AND Descripcion = ? AND Fecha = ?`,
                    [SegmentoID, CategoriaID, Descripcion.trim(), Fecha]
                );

                if (existentes.length > 0) {
                    const registroExistente = existentes[0];

                    if (Number(registroExistente.Monto) !== Number(Monto)) {
                        // Verificar que no exista ya un registro con el nuevo monto
                        const [dupCheck]: RowDataPacket[] = await con.query(
                            `SELECT * FROM ingresos_externos
                             WHERE SegmentoID = ? AND CategoriaID = ? AND Descripcion = ? 
                               AND Fecha = ? AND Monto = ?`,
                            [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, Monto]
                        );

                        if (dupCheck.length > 0) {
                            console.log(`Ya existe un registro en auxiliar con el monto actualizado (${Monto}), se ignora UPDATE`);
                        } else {
                            const [ingresoExistente]: RowDataPacket[] = await con.query(
                                `SELECT * FROM ingresos 
                                 WHERE SegmentoID = ? AND CategoriaID = ? AND Descripcion = ? 
                                   AND DATE(Fecha) = ? AND Monto = ? AND Reconciliado = 0`,
                                [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, registroExistente.Monto]
                            );

                            if (ingresoExistente.length > 0) {
                                // ✅ Actualizar en ingresos
                                await con.query(
                                    `UPDATE ingresos SET Monto = ? WHERE IngresoID = ?`,
                                    [Monto, ingresoExistente[0].IngresoID]
                                );

                                // ✅ Actualizar en auxiliar
                                await con.query(
                                    `UPDATE ingresos_externos SET Monto = ? WHERE IngresoExternoID = ?`,
                                    [Monto, registroExistente.IngresoExternoID]
                                );

                                console.log(`Monto actualizado a ${Monto} en ingresos e ingresos_externos`);
                            } else {
                                // Insertar como nuevo si no se puede actualizar
                                await con.query(
                                    `INSERT INTO ingresos_externos (SegmentoID, CategoriaID, Descripcion, Fecha, Monto)
                                     VALUES (?, ?, ?, ?, ?)`,
                                    [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, Monto]
                                );
                                await con.query(
                                    `INSERT INTO ingresos (Fecha, SegmentoID, CategoriaID, Descripcion, Monto)
                                     VALUES (?, ?, ?, ?, ?)`,
                                    [Fecha, SegmentoID, CategoriaID, Descripcion.trim(), Monto]
                                );
                                console.log(`Nuevo ingreso insertado porque el anterior ya estaba reconciliado o cambiado`);
                            }
                        }
                    } else {
                        console.log(`Registro duplicado exacto en cobranza, se ignora`);
                    }
                } else {
                    // Insertar como nuevo
                    await con.query(
                        `INSERT INTO ingresos_externos (SegmentoID, CategoriaID, Descripcion, Fecha, Monto)
                         VALUES (?, ?, ?, ?, ?)`,
                        [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, Monto]
                    );
                    await con.query(
                        `INSERT INTO ingresos (Fecha, SegmentoID, CategoriaID, Descripcion, Monto)
                         VALUES (?, ?, ?, ?, ?)`,
                        [Fecha, SegmentoID, CategoriaID, Descripcion.trim(), Monto]
                    );
                    console.log(`Nuevo ingreso insertado en ingresos e ingresos_externos`);
                }

            } else if (tipoIngreso === 'funeraria') {
                // 📌 CASO FUNERARIA
                Descripcion = service_ref || (reference ? `${reference} (Sin referencia de servicio)` : 'Sin referencia');
                Fecha = date_ref;
                Monto = amount;

                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Funeraria Anahuac');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Ingreso Funeraria');

                Observaciones = `Referencia: ${reference || 'N/A'} | Método: ${method_payment || 'N/A'} | TipoPago: ${paid_type || 'N/A'}`;

                let insertedInExternos = false;
                try {
                    await con.query(
                        `INSERT INTO ingresos_externos (SegmentoID, CategoriaID, Descripcion, Fecha, Monto)
                         VALUES (?, ?, ?, ?, ?)`,
                        [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, Monto]
                    );
                    insertedInExternos = true;
                    console.log(`Registrado en ingresos_externos: ${Descripcion} ${Fecha} ${Monto}`);
                } catch {
                    console.log(`Duplicado en ingresos_externos detectado: ${Descripcion} ${Fecha} ${Monto}`);
                }

                if (insertedInExternos) {
                    await con.query(
                        `INSERT INTO ingresos (Fecha, SegmentoID, CategoriaID, Descripcion, Monto, ObservacionesDifConciliacion)
                         VALUES (?, ?, ?, ?, ?, ?)`,
                        [Fecha, SegmentoID, CategoriaID, Descripcion.trim(), Monto, Observaciones]
                    );
                    console.log(`Ingreso insertado: ${Descripcion} en la fecha ${Fecha}`);
                }

            } else if (tipoIngreso === 'pagos-iniciales') {
                // 📌 CASO PAGOS INICIALES
                Descripcion = agent;
                Fecha = date_ref;
                Monto = total_amount;

                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Ventas');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Inversiones Iniciales');

                let insertedInExternos = false;
                try {
                    await con.query(
                        `INSERT INTO ingresos_externos (SegmentoID, CategoriaID, Descripcion, Fecha, Monto)
                         VALUES (?, ?, ?, ?, ?)`,
                        [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, Monto]
                    );
                    insertedInExternos = true;
                    console.log(`Registrado en ingresos_externos: ${Descripcion} ${Fecha} ${Monto}`);
                } catch {
                    console.log(`Duplicado en ingresos_externos detectado: ${Descripcion} ${Fecha} ${Monto}`);
                }

                if (insertedInExternos) {
                    await con.query(
                        `INSERT INTO ingresos (Fecha, SegmentoID, CategoriaID, Descripcion, Monto)
                         VALUES (?, ?, ?, ?, ?)`,
                        [Fecha, SegmentoID, CategoriaID, Descripcion.trim(), Monto]
                    );
                    console.log(`Ingreso insertado: ${Descripcion} en la fecha ${Fecha}`);
                }

            } else {
                throw new Error(`Tipo de ingreso no válido: ${tipoIngreso}`);
            }
        }

        // Limpieza de registros viejos
        await con.query(
            `DELETE FROM ingresos_externos WHERE Fecha < CURDATE() - INTERVAL 1 MONTH`
        );

        await con.commit();
        res.status(201).json({ message: 'Ingresos importados exitosamente con control de duplicados y actualizaciones en cobranza' });
    } catch (error) {
        if (con) await con.rollback();
        console.error('Error en ImportarIngresos:', error);
        res.status(500).json({
            message: 'Error al importar ingresos',
            error: error instanceof Error ? error.message : 'Error desconocido'
        });
    } finally {
        if (con) await con.end();
    }
}



export const ObtenerHistorialIngresos = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = `
                SELECT * FROM historial_ingresos_importados 
                ORDER BY ImportacionID DESC LIMIT 1
                `;
        const Users = (await con.query(query))[0] as any[];
        result = Users;
    } catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};



export const CrearHistorialIngresos = async (req: Request, res: Response) => {
    let con;
    const { FechaInicio, FechaCierre, NumeroRegistrosImportados } = req.body;

    try {
        con = await connect();

        // Insertar el nuevo registro en la tabla historial_ingresos_importados
        const query = `
            INSERT INTO historial_ingresos_importados (FechaInicio, FechaCierre, NumeroRegistrosImportados)
            VALUES (?, ?, ?)`;
        
        await con.query(query, [FechaInicio, FechaCierre, NumeroRegistrosImportados]);

        return res.status(201).json({ message: 'Registro creado exitosamente.' });
    } catch (error) {
        console.error('Error al crear el historial de ingresos:', error);
        return res.status(500).json({ error: 'Error al crear el historial de ingresos' });
    } finally {
        await con?.end();
    }
};
