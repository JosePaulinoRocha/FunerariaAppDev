import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';


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
            const { tipoIngreso, collection, service_ref, agent, date_affect, date_ref, total_amount } = registro;

            let SegmentoID: number, CategoriaID: number, Descripcion: string, Fecha: string;
            if (tipoIngreso === 'afectaciones') {
                Descripcion = collection;
                Fecha = date_affect;
                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Cobranza');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Cuentas Establecidas');
            } else if (tipoIngreso === 'funeraria') {
                Descripcion = service_ref || 'Sin referencia de servicio';
                Fecha = date_ref;
                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Funeraria Anahuac');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Ingreso Funeraria');
            } else if (tipoIngreso === 'pagos-iniciales') {
                Descripcion = agent;
                Fecha = date_ref;
                SegmentoID = await getOrCreateId('segmentos', 'Nombre', 'Ventas');
                CategoriaID = await getOrCreateId('categorias', 'Nombre', 'Inversiones Iniciales');
            } else {
                throw new Error(`Tipo de ingreso no válido: ${tipoIngreso}`);
            }

            let insertedInExternos = false;
            try {
                await con.query(
                    `INSERT INTO ingresos_externos (SegmentoID, CategoriaID, Descripcion, Fecha, Monto)
                     VALUES (?, ?, ?, ?, ?)`,
                    [SegmentoID, CategoriaID, Descripcion.trim(), Fecha, total_amount]
                );
                insertedInExternos = true;
                console.log(`Registrado en ingresos_externos: ${Descripcion} ${Fecha} ${total_amount}`);
            } catch (err) {
                console.log(`Duplicado en ingresos_externos detectado: ${Descripcion} ${Fecha} ${total_amount}`);
            }

            if (insertedInExternos) {
                await con.query(
                    `INSERT INTO ingresos (Fecha, SegmentoID, CategoriaID, Descripcion, Monto)
                     VALUES (?, ?, ?, ?, ?)`,
                    [Fecha, SegmentoID, CategoriaID, Descripcion.trim(), total_amount]
                );
                console.log(`Ingreso insertado: ${Descripcion} en la fecha ${Fecha}`);
            }
        }

        // Limpieza de registros viejos en auxiliar
        await con.query(
            `DELETE FROM ingresos_externos WHERE Fecha < CURDATE() - INTERVAL 1 MONTH`
        );

        await con.commit();
        res.status(201).json({ message: 'Ingresos importados exitosamente, sin duplicados (comparando solo con auxiliar)' });
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
