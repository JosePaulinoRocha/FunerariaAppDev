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
    const { CuentaEnviaID, CuentaRecibeID, Descripcion, Monto, Fecha } = req.body;

    try {
        con = await connect();
        // Iniciar la transacción
        await con.beginTransaction();

        // Verificar si existe el segmento "Transferencia" en la tabla segmentos
        const getSegmentoQuery = `SELECT SegmentoID FROM segmentos WHERE Nombre = 'Transferencia'`;
        const [segmento]: any = await con.query(getSegmentoQuery);
        let SegmentoID;
        if (segmento.length === 0) {
            const insertSegmentoQuery = `INSERT INTO segmentos (Nombre) VALUES ('Transferencia')`;
            const [segmentoResult]: ResultSetHeader[] = await con.query(insertSegmentoQuery);
            SegmentoID = segmentoResult.insertId;
        } else {
            SegmentoID = segmento[0].SegmentoID;
        }

        // Verificar si existe la categoría "Transferencia" en la tabla categorias
        const getCategoriaQuery = `SELECT CategoriaID FROM categorias WHERE Nombre = 'Transferencia'`;
        const [categoria]: any = await con.query(getCategoriaQuery);
        let CategoriaID;
        if (categoria.length === 0) {
            const insertCategoriaQuery = `INSERT INTO categorias (Nombre) VALUES ('Transferencia')`;
            const [categoriaResult]: ResultSetHeader[] = await con.query(insertCategoriaQuery);
            CategoriaID = categoriaResult.insertId;
        } else {
            CategoriaID = categoria[0].CategoriaID;
        }

        // Insertar en la tabla transferencias
        const insertTransferenciaQuery = `
            INSERT INTO transferencias (CuentaEnviaID, CuentaRecibeID, Descripcion, Monto, Fecha)
            VALUES (?, ?, ?, ?, ?)
        `;
        const [transferenciaResult]: ResultSetHeader[] = await con.query(insertTransferenciaQuery, [CuentaEnviaID, CuentaRecibeID, Descripcion, Monto, Fecha]);

        const transferenciaID = transferenciaResult.insertId;

        // Función para calcular el saldo de una cuenta
        const calcularSaldoCuenta = async (CuentaID: number) => {
            // Obtener el saldo más reciente de los registros reconciliados
            const saldoReconciliadoQuery = `
                SELECT Saldo FROM reconciliaciones 
                WHERE CuentaID = ?
                ORDER BY ReconciliacionID DESC LIMIT 1
            `;
            const [saldoReconciliado]: any = await con.query(saldoReconciliadoQuery, [CuentaID]);
            let saldoInicial = saldoReconciliado.length > 0 ? parseFloat(saldoReconciliado[0].Saldo) : 0;

            // Log de saldo inicial
            console.log(`Saldo inicial de la cuenta ${CuentaID}:`, saldoInicial);

            // Validar que saldoInicial sea un número válido
            if (isNaN(saldoInicial)) saldoInicial = 0;

            // Obtener ingresos y egresos no reconciliados
            const ingresosEgresosQuery = `
                SELECT Monto, TipoIngreso FROM ingresos
                WHERE CuentaID = ? AND Reconciliado = 0
                ORDER BY IngresoID
            `;
            const [ingresosEgresos]: any = await con.query(ingresosEgresosQuery, [CuentaID]);

            let totalIngresos = 0;
            let totalEgresos = 0;

            ingresosEgresos.forEach((registro: any) => {
                const monto = parseFloat(registro.Monto);
            
                // Asegurarse de que Monto sea un número válido
                if (!isNaN(monto)) {
                    const tipoIngreso = registro.TipoIngreso[0] === 1; // Extraer el valor correcto de BIT(1)
                    if (tipoIngreso === false) {
                        totalIngresos += monto; // TipoIngreso 0 -> ingreso
                    } else {
                        totalEgresos += monto; // TipoIngreso 1 -> egreso
                    }
                }
            });

            // Log de ingresos y egresos no reconciliados
            console.log(`Total ingresos no reconciliados para la cuenta ${CuentaID}:`, totalIngresos);
            console.log(`Total egresos no reconciliados para la cuenta ${CuentaID}:`, totalEgresos);

            // Calcular el saldo final
            const saldoFinal = saldoInicial + totalIngresos - totalEgresos;

            // Log del saldo final antes de devolverlo
            console.log(`Saldo final calculado para la cuenta ${CuentaID}:`, saldoFinal);

            return isNaN(saldoFinal) ? 0 : saldoFinal;
        };

        // Calcular el saldo de la cuenta que envía (egreso)
        let saldoCuentaEnvia = await calcularSaldoCuenta(CuentaEnviaID);
        saldoCuentaEnvia -= Monto; // Resta el monto porque es un egreso

        // Log del saldo de la cuenta que envía después del egreso
        console.log(`Saldo de la cuenta que envía (${CuentaEnviaID}) después del egreso:`, saldoCuentaEnvia);

        // Calcular el saldo de la cuenta que recibe (ingreso)
        let saldoCuentaRecibe = await calcularSaldoCuenta(CuentaRecibeID);
        saldoCuentaRecibe += Monto; // Suma el monto porque es un ingreso

        // Log del saldo de la cuenta que recibe después del ingreso
        console.log(`Saldo de la cuenta que recibe (${CuentaRecibeID}) después del ingreso:`, saldoCuentaRecibe);

        // Insertar en la tabla ingresos (egreso de la cuenta que envía)
        const insertIngresoEgresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso, SegmentoID, CategoriaID, Saldo)
            VALUES (?, ?, ?, ?, 1, ?, ?, ?)
        `;
        await con.query(insertIngresoEgresoQuery, [Fecha, Descripcion, CuentaEnviaID, Monto, SegmentoID, CategoriaID, saldoCuentaEnvia]);

        // Insertar en la tabla ingresos (ingreso a la cuenta que recibe)
        const insertIngresoIngresoQuery = `
            INSERT INTO ingresos (Fecha, Descripcion, CuentaID, Monto, TipoIngreso, SegmentoID, CategoriaID, Saldo)
            VALUES (?, ?, ?, ?, 0, ?, ?, ?)
        `;
        await con.query(insertIngresoIngresoQuery, [Fecha, Descripcion, CuentaRecibeID, Monto, SegmentoID, CategoriaID, saldoCuentaRecibe]);

        // Confirmar la transacción
        await con.commit();

        return res.json({ message: 'Transferencia realizada con éxito', transferenciaID });

    } catch (error) {
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


