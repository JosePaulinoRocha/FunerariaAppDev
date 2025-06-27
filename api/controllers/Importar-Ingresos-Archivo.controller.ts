import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import { RowDataPacket, ResultSetHeader  } from 'mysql2/promise';

export const ImportarIngresosArchivo = async (req: Request, res: Response) => {
    const con = await connect();
    await con.beginTransaction();

    try {
        const ingresosData = req.body; // Suponemos que es un array de ingresos
        console.log("Datos recibidos para importación:", ingresosData);

        for (const ingreso of ingresosData) {
            console.log("Procesando ingreso:", ingreso);

            // 1. Verificar o crear SegmentoID, CategoriaID, SubcategoriaID y ConceptoID, si no están vacíos
            const SegmentoID = ingreso.Segmento ? await getOrCreateId(con, 'segmentos', ingreso.Segmento) : null;
            console.log("SegmentoID:", SegmentoID);

            const CategoriaID = ingreso.Categoria ? await getOrCreateId(con, 'categorias', ingreso.Categoria) : null;
            console.log("CategoriaID:", CategoriaID);

            const SubcategoriaID = ingreso.Subcategoria ? await getOrCreateId(con, 'subcategorias', ingreso.Subcategoria) : null;
            console.log("SubcategoriaID:", SubcategoriaID);

            const ConceptoID = ingreso.Concepto ? await getOrCreateId(con, 'conceptos', ingreso.Concepto) : null;
            console.log("ConceptoID:", ConceptoID);

            // 2. Verificar o crear CuentaID, si no está vacía
            const TipoCuentaID = ingreso.RFC === '' ? 1 : 2; // Caja Chica si RFC es vacío
            console.log("TipoCuentaID determinado:", TipoCuentaID);

            const CuentaID = ingreso.Cuenta ? await getOrCreateCuenta(con, ingreso.Cuenta, ingreso.RFC, TipoCuentaID) : null;
            console.log("CuentaID:", CuentaID);

            // 3. Insertar registro en ingresos con CuentaContable (siempre se envía) y valores predeterminados de Monto y TipoIngreso
            const insertIngresoQuery = `
                INSERT INTO ingresos (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, Monto, TipoIngreso, CuentaContable, Fecha)
                VALUES (?, ?, ?, ?, ?, 0, 0, ?, NOW())
            `;
            console.log("Ejecutando query de inserción de ingreso:", insertIngresoQuery);

            await con.query(insertIngresoQuery, [
                SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, ingreso.CuentaContpaq || 0
            ]);
            console.log("Ingreso insertado correctamente");
        }

        await con.commit();
        console.log("Transacción completada exitosamente");
        res.status(200).json({ message: 'Ingresos importados exitosamente' });
    } catch (error) {
        await con.rollback();
        const err = error as Error; // Casting a Error
        console.error("Error durante la importación:", err.message); // Log del mensaje de error
        res.status(500).json({ error: 'Error al procesar la importación', detalle: err.message });
    } finally {
        con.end();
        console.log("Conexión cerrada");
    }
};

// Función para verificar o crear registros en segmentos, categorías, subcategorías y conceptos
const getOrCreateId = async (con: any, table: string, value: string) => {
    try {
        const normalizedValue = value.trim().toLowerCase();
        console.log(`Verificando existencia de ${value} (normalizado: ${normalizedValue}) en la tabla ${table}`);

        const query = `SELECT ${table.slice(0, -1)}ID FROM ${table} WHERE LOWER(TRIM(Nombre)) = ? LIMIT 1`;
        const [result] = await con.query(query, [normalizedValue]);

        if (result.length > 0) {
            console.log(`${value} encontrado en la tabla ${table}`);
            return result[0][`${table.slice(0, -1)}ID`];
        } else {
            console.log(`${value} no encontrado, insertando nuevo registro en la tabla ${table}`);
            const insertQuery = `INSERT INTO ${table} (Nombre) VALUES (?)`;
            const [insertResult] = await con.query(insertQuery, [normalizedValue]);
            console.log(`${value} insertado en la tabla ${table} con ID: ${insertResult.insertId}`);
            return insertResult.insertId;
        }
    } catch (error) {
        console.error(`Error en getOrCreateId para la tabla ${table}:`, error);
        throw error;
    }
};

// Función para verificar o crear registros en la tabla de cuentas
const getOrCreateCuenta = async (con: any, cuenta: string, rfc: string, tipoCuentaID: number) => {
    try {
        const normalizedCuenta = cuenta.trim().toLowerCase();
        console.log(`Verificando existencia de la cuenta ${cuenta} (normalizado: ${normalizedCuenta})`);

        const query = `SELECT CuentaID FROM cuentas WHERE LOWER(TRIM(NombreCuenta)) = ? LIMIT 1`;
        const [result] = await con.query(query, [normalizedCuenta]);

        if (result.length > 0) {
            console.log(`Cuenta ${cuenta} encontrada con ID: ${result[0].CuentaID}`);
            return result[0].CuentaID;
        } else {
            console.log(`Cuenta ${cuenta} no encontrada, insertando nuevo registro en la tabla cuentas`);
            const insertQuery = `INSERT INTO cuentas (NombreCuenta, RFC, TipoCuentaID) VALUES (?, ?, ?)`;
            const [insertResult] = await con.query(insertQuery, [normalizedCuenta, rfc, tipoCuentaID]);
            console.log(`Cuenta ${cuenta} insertada con ID: ${insertResult.insertId}`);
            return insertResult.insertId;
        }
    } catch (error) {
        console.error(`Error en getOrCreateCuenta para la cuenta ${cuenta}:`, error);
        throw error;
    }
};


export const ImportarEgresosArchivo = async (req: Request, res: Response) => {
    const con = await connect();
    await con.beginTransaction();

    try {
        const egresosData = req.body; // Suponemos que es un array de egresos
        console.log("Datos recibidos para importación:", egresosData);

        for (const egreso of egresosData) {
            console.log("Procesando egreso:", egreso);

            // 1. Verificar o crear SegmentoID, CategoriaID, SubcategoriaID y ConceptoID
            const SegmentoID = egreso.Segmento ? await getOrCreateId(con, 'segmentos', egreso.Segmento) : null;
            const CategoriaID = egreso.Categoria ? await getOrCreateId(con, 'categorias', egreso.Categoria) : null;
            const SubcategoriaID = egreso.Subcategoria ? await getOrCreateId(con, 'subcategorias', egreso.Subcategoria) : null;
            const ConceptoID = egreso.Concepto ? await getOrCreateId(con, 'conceptos', egreso.Concepto) : null;

            // 2. Verificar o crear CuentaID sin RFC
            const TipoCuentaID = egreso.Cuenta.toLowerCase().includes('caja chica') ? 1 : 2;
            const CuentaID = egreso.Cuenta ? await getOrCreateCuentaEgreso(con, egreso.Cuenta, TipoCuentaID) : null;

            // 3. Calcular el saldo nuevo basado en los ingresos y egresos no reconciliados
            const nuevoMonto = egreso.Monto;

            const saldoFinal = await calcularSaldoCuenta(con, CuentaID, nuevoMonto, false); // Es egreso
            console.log(`Nuevo saldo calculado: ${saldoFinal}`);

            // 4. Insertar el registro en la tabla ingresos (TipoIngreso = 1 para egreso)
            const insertEgresoQuery = `
                INSERT INTO ingresos (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, Monto, TipoIngreso, Descripcion, Fecha, Saldo)
                VALUES (?, ?, ?, ?, ?, ?, 1, ?, ?, ?)
            `;

            // 5. Ejecutar la inserción del egreso con el saldo actualizado
            await con.query(insertEgresoQuery, [
                SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, CuentaID, nuevoMonto, egreso.Descripcion, egreso.Fecha, saldoFinal
            ]);
            console.log("Egreso insertado correctamente");
        }

        await con.commit();
        res.status(200).json({ message: 'Egresos importados exitosamente' });
    } catch (error) {
        await con.rollback();
        const err = error as Error;
        res.status(500).json({ error: 'Error al procesar la importación', detalle: err.message });
    } finally {
        con.end();
    }
};

// Función para calcular el saldo, utilizando la lógica del endpoint de alta de ingresos
const calcularSaldoCuenta = async (con: any, CuentaID: number, nuevoMonto: number, esIngreso: boolean) => {
    const saldoReconciliadoQuery = `
        SELECT Saldo FROM reconciliaciones 
        WHERE CuentaID = ? 
        ORDER BY ReconciliacionID DESC LIMIT 1
    `;
    const [saldoReconciliado]: any = await con.query(saldoReconciliadoQuery, [CuentaID]);
    let saldoInicial = saldoReconciliado.length > 0 ? parseFloat(saldoReconciliado[0].Saldo) : 0;

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
        if (!isNaN(monto)) {
            const tipoIngreso = registro.TipoIngreso[0]; // 0 es ingreso, 1 es egreso
            if (tipoIngreso === 1) { // Egresos
                totalEgresos += monto;
            } else { // Ingresos
                totalIngresos += monto;
            }
        }
    });

    // Incluir el monto del nuevo registro en el cálculo del saldo
    const saldoFinal = saldoInicial + totalIngresos - totalEgresos + (esIngreso ? nuevoMonto : -nuevoMonto);
    return isNaN(saldoFinal) ? 0 : saldoFinal;
};



// Función para verificar o crear registros en la tabla de cuentas
const getOrCreateCuentaEgreso = async (con: any, cuenta: string, tipoCuentaID: number) => {
    const normalizedCuenta = cuenta.trim().toLowerCase();
    console.log(`Verificando existencia de la cuenta ${cuenta} (normalizado: ${normalizedCuenta})`);

    const query = `SELECT CuentaID FROM cuentas WHERE LOWER(TRIM(NombreCuenta)) = ? LIMIT 1`;
    const [result] = await con.query(query, [normalizedCuenta]);

    if (result.length > 0) {
        console.log(`Cuenta encontrada con ID: ${result[0].CuentaID}`);
        return result[0].CuentaID;
    } else {
        console.log(`Cuenta no encontrada, insertando nuevo registro`);
        const insertQuery = `INSERT INTO cuentas (NombreCuenta, TipoCuentaID) VALUES (?, ?)`;
        const [insertResult] = await con.query(insertQuery, [normalizedCuenta, tipoCuentaID]);
        console.log(`Cuenta insertada con ID: ${insertResult.insertId}`);
        return insertResult.insertId;
    }
};

export const ImportarEgresosArchivoImportacion = async (req: Request, res: Response) => {
    const con = await connect();
    await con.beginTransaction();

    try {
        const egresosData = req.body;
        console.log("Datos recibidos para importación:", egresosData);

        for (const egreso of egresosData) {
            console.log("Procesando egreso:", egreso);

            // Normalizar campos
            const segmento = egreso.Segmento ? egreso.Segmento.trim() : null;
            const categoria = egreso.Categoria ? egreso.Categoria.trim() : null;
            const subcategoria = egreso.Subcategoria ? egreso.Subcategoria.trim() : null;
            const concepto = egreso.Concepto ? egreso.Concepto.trim() : null;
            const proveedor = egreso.Proveedor ? egreso.Proveedor.trim() : null;
            const cuenta = egreso.Cuenta ? egreso.Cuenta.trim() : null;

            // 1. Verificar o crear IDs de catálogos
            const SegmentoID = segmento ? await getOrCreateId(con, 'segmentos', segmento) : null;
            const CategoriaID = categoria ? await getOrCreateId(con, 'categorias', categoria) : null;
            const SubcategoriaID = subcategoria ? await getOrCreateId(con, 'subcategorias', subcategoria) : null;
            const ConceptoID = concepto ? await getOrCreateId(con, 'conceptos', concepto) : null;
            const ProveedorID = proveedor ? await getOrCreateProveedorId(con, proveedor) : null;

            // 2. Verificar o crear CuentaID
            const TipoCuentaID = cuenta && cuenta.toLowerCase().includes('caja chica') ? 1 : 2;
            const CuentaID = cuenta ? await getOrCreateCuentaEgreso(con, cuenta, TipoCuentaID) : null;

            // 3. Monto
            const nuevoMonto = egreso.Monto;

            // 4. Calcular saldo
            const saldoFinal = await calcularSaldoCuenta(con, CuentaID, nuevoMonto, false);
            console.log(`Nuevo saldo calculado: ${saldoFinal}`);

            // 5. Insertar egreso
            const insertEgresoQuery = `
                INSERT INTO ingresos (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, ProveedorID, CuentaID, Monto, TipoIngreso, Descripcion, Fecha, Saldo, Piezas)
                VALUES (?, ?, ?, ?, ?, ?, ?, 1, ?, ?, ?, ?)
            `;
            await con.query(insertEgresoQuery, [
                SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, ProveedorID,
                CuentaID, nuevoMonto, egreso.Descripcion, egreso.Fecha, saldoFinal, egreso.Piezas
            ]);
            console.log("Egreso insertado correctamente");
        }

        await con.commit();
        res.status(200).json({ message: 'Egresos importados exitosamente' });
    } catch (error) {
        await con.rollback();
        const err = error as Error;
        console.error("Error durante la importación de egresos:", err.message);
        res.status(500).json({ error: 'Error al procesar la importación', detalle: err.message });
    } finally {
        con.end();
    }
};


function sumarUnDia(fechaStr: string | null | undefined): string | null {
  if (!fechaStr || fechaStr.trim() === '') return null;
  const fecha = new Date(fechaStr);
  fecha.setTime(fecha.getTime() + 86400000); // sumar 1 día (milisegundos)
  const yyyy = fecha.getFullYear();
  const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
  const dd = fecha.getDate().toString().padStart(2, '0');
  return `${yyyy}-${mm}-${dd}`;
}

export const ImportarEgresosSistemaViejo = async (req: Request, res: Response) => {
  const con = await connect();

  try {
    const egresosData = req.body;
    console.log("Datos recibidos para importación (sistema viejo):", egresosData.length, "registros");

    await con.beginTransaction();

    for (const [index, egreso] of egresosData.entries()) {
      console.log(`Procesando egreso ${index + 1}/${egresosData.length}:`, egreso);

      // Obtener IDs o crearlos si no existen
      const SegmentoID = egreso.Segmento ? await getOrCreateId(con, 'segmentos', egreso.Segmento) : null;
      console.log(`SegmentoID para "${egreso.Segmento}":`, SegmentoID);

      const CategoriaID = egreso.Categoria ? await getOrCreateId(con, 'categorias', egreso.Categoria) : null;
      console.log(`CategoriaID para "${egreso.Categoria}":`, CategoriaID);

      const SubcategoriaID = egreso.Subcategoria ? await getOrCreateId(con, 'subcategorias', egreso.Subcategoria) : null;
      console.log(`SubcategoriaID para "${egreso.Subcategoria}":`, SubcategoriaID);

      const TipoCuentaID = egreso.Cuenta?.toLowerCase().includes('caja') ? 1 : 2;
      console.log(`TipoCuentaID para "${egreso.Cuenta}":`, TipoCuentaID);

      const CuentaID = egreso.Cuenta ? await getOrCreateCuentaEgreso(con, egreso.Cuenta, TipoCuentaID) : null;
      console.log(`CuentaID para "${egreso.Cuenta}":`, CuentaID);

      // Validar monto
      const montoValido = parseFloat(egreso.Monto);
      if (isNaN(montoValido)) {
        throw new Error(`Monto inválido en egreso ${index + 1}: "${egreso.Monto}"`);
      }

      // Validar saldo
      let saldoValido = 0;
      if (egreso.Saldo && egreso.Saldo !== 'NULL') {
        saldoValido = parseFloat(egreso.Saldo);
        if (isNaN(saldoValido)) {
          throw new Error(`Saldo inválido en egreso ${index + 1}: "${egreso.Saldo}"`);
        }
      }

      // Sumar un día a las fechas
      const fechaInsert = sumarUnDia(egreso.Fecha);
      const fechaConciliacionInsert = sumarUnDia(egreso.FechaConciliacion);

      const observaciones = `Concepto original: ${egreso.Concepto || 'N/A'}`;

      await con.query(
        `
        INSERT INTO ingresos 
        (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, ProveedorID, CuentaID, 
         Monto, TipoIngreso, Descripcion, Fecha, Saldo, Piezas, ObservacionesDifConciliacion, FechaConciliacion, Reconciliado)
        VALUES (?, ?, ?, NULL, NULL, ?, ?, 1, ?, ?, ?, 0, ?, ?, 1)
        `,
        [
          SegmentoID,
          CategoriaID,
          SubcategoriaID,
          CuentaID,
          montoValido,
          egreso.Descripcion || '',
          fechaInsert,
          saldoValido,
          observaciones,
          fechaConciliacionInsert
        ]
      );

      console.log(`Egreso ${index + 1} insertado correctamente`);
    }

    await con.commit();
    res.status(200).json({ message: 'Egresos del sistema viejo importados exitosamente' });

  } catch (error) {
    console.error('Error al procesar la importación (sistema viejo):', error);
    await con.rollback();
    const err = error as Error;
    res.status(500).json({
      error: 'Error al procesar la importación (sistema viejo)',
      detalle: err.message
    });
  } finally {
    con.end();
  }
};


export const ImportarIngresosSistemaViejo = async (req: Request, res: Response) => {
  const con = await connect();

  function sumarUnDia(fechaStr: string | null | undefined): string | null {
    if (!fechaStr || fechaStr.trim() === '') return null;
    const fecha = new Date(fechaStr);
    fecha.setTime(fecha.getTime() + 86400000);
    const yyyy = fecha.getFullYear();
    const mm = (fecha.getMonth() + 1).toString().padStart(2, '0');
    const dd = fecha.getDate().toString().padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }

  try {
    const ingresosData = req.body;
    console.log("Datos recibidos para importación (ingresos viejo):", ingresosData.length, "registros");

    await con.beginTransaction();

    for (const [index, ingreso] of ingresosData.entries()) {
      console.log(`Procesando ingreso ${index + 1}/${ingresosData.length}:`, ingreso);

      const SegmentoID = ingreso.Segmento ? await getOrCreateId(con, 'segmentos', ingreso.Segmento) : null;
      const CategoriaID = ingreso.Categoria ? await getOrCreateId(con, 'categorias', ingreso.Categoria) : null;
      const TipoCuentaID = ingreso.Cuenta?.toLowerCase().includes('caja') ? 1 : 2;
      const CuentaID = ingreso.Cuenta ? await getOrCreateCuentaEgreso(con, ingreso.Cuenta, TipoCuentaID) : null;

      const montoValido = parseFloat(ingreso.Monto);
      if (isNaN(montoValido)) {
        throw new Error(`Monto inválido en ingreso ${index + 1}: "${ingreso.Monto}"`);
      }

      let saldoValido = 0;
      if (ingreso.Saldo && ingreso.Saldo !== 'NULL') {
        saldoValido = parseFloat(ingreso.Saldo);
        if (isNaN(saldoValido)) {
          throw new Error(`Saldo inválido en ingreso ${index + 1}: "${ingreso.Saldo}"`);
        }
      }

      const fechaInsert = sumarUnDia(ingreso.Fecha);
      const fechaConciliacionInsert = sumarUnDia(ingreso.FechaConciliacion);

      await con.query(
        `
        INSERT INTO ingresos 
        (SegmentoID, CategoriaID, SubcategoriaID, ConceptoID, ProveedorID, CuentaID, 
         Monto, TipoIngreso, Descripcion, Fecha, Saldo, Piezas, ObservacionesDifConciliacion, FechaConciliacion, Reconciliado)
        VALUES (?, ?, NULL, NULL, NULL, ?, ?, 0, ?, ?, ?, 0, NULL, ?, 1)
        `,
        [
          SegmentoID,
          CategoriaID,
          CuentaID,
          montoValido,
          ingreso.Descripcion || '',
          fechaInsert,
          saldoValido,
          fechaConciliacionInsert
        ]
      );

      console.log(`Ingreso ${index + 1} insertado correctamente`);
    }

    await con.commit();
    res.status(200).json({ message: 'Ingresos del sistema viejo importados exitosamente' });

  } catch (error) {
    console.error('Error al procesar la importación (ingresos viejo):', error);
    await con.rollback();
    res.status(500).json({
      error: 'Error al procesar la importación (ingresos viejo)',
      detalle: (error as Error).message
    });
  } finally {
    con.end();
  }
};


const getOrCreateProveedorId = async (con: any, proveedor: string) => {
    try {
        console.log(`Verificando existencia de proveedor: ${proveedor}`);
        const query = `SELECT ProveedorID FROM proveedores WHERE LOWER(Proveedor) = LOWER(?) LIMIT 1`;
        const [rows] = await con.query(query, [proveedor]);

        if (Array.isArray(rows) && rows.length > 0) {
            console.log(`Proveedor encontrado: ${proveedor}`);
            return rows[0].ProveedorID;
        } else {
            console.log(`Proveedor no encontrado, insertando: ${proveedor}`);
            const insertQuery = `INSERT INTO proveedores (Proveedor) VALUES (?)`;
            const [insertResult]: [ResultSetHeader] = await con.query(insertQuery, [proveedor]);
            console.log(`Proveedor insertado con ID: ${insertResult.insertId}`);
            return insertResult.insertId;
        }
    } catch (error) {
        console.error(`Error en getOrCreateProveedorId:`, error);
        throw error;
    }
};


// Nueva función para importar ingresos en el backend
export const ImportarIngresosArchivoImportado = async (req: Request, res: Response) => {
    const con = await connect();
    await con.beginTransaction();

    try {
        const ingresosData = req.body;
        console.log("Datos recibidos para importación de ingresos:", ingresosData);

        for (const ingreso of ingresosData) {
            console.log("Procesando ingreso:", ingreso);

            // Normalizar valores antes de pasar a las funciones
            const segmento = ingreso.Segmento ? ingreso.Segmento.trim() : null;
            const categoria = ingreso.Categoria ? ingreso.Categoria.trim() : null;
            const concepto = ingreso.Concepto ? ingreso.Concepto.trim() : null;
            const cuenta = ingreso.Cuenta ? ingreso.Cuenta.trim() : null;

            // 1. Verificar o crear IDs
            const SegmentoID = segmento ? await getOrCreateId(con, 'segmentos', segmento) : null;
            const CategoriaID = categoria ? await getOrCreateId(con, 'categorias', categoria) : null;
            const ConceptoID = concepto ? await getOrCreateId(con, 'conceptos', concepto) : null;

            // 2. Verificar o crear CuentaID
            const TipoCuentaID = cuenta && cuenta.toLowerCase().includes('caja chica') ? 1 : 2;
            const CuentaID = cuenta ? await getOrCreateCuentaEgreso(con, cuenta, TipoCuentaID) : null;

            // 3. Monto
            const nuevoMonto = ingreso.Monto;

            // 4. Calcular saldo
            const saldoFinal = await calcularSaldoCuenta(con, CuentaID, nuevoMonto, true);
            console.log(`Nuevo saldo calculado: ${saldoFinal}`);

            // 5. Insertar ingreso
            const insertIngresoQuery = `
                INSERT INTO ingresos (SegmentoID, CategoriaID, ConceptoID, CuentaID, Monto, TipoIngreso, Descripcion, Fecha, Saldo)
                VALUES (?, ?, ?, ?, ?, 0, ?, ?, ?)
            `;
            await con.query(insertIngresoQuery, [
                SegmentoID, CategoriaID, ConceptoID, CuentaID, nuevoMonto,
                ingreso.Descripcion, ingreso.Fecha, saldoFinal
            ]);
            console.log("Ingreso insertado correctamente");
        }

        await con.commit();
        res.status(200).json({ message: 'Ingresos importados exitosamente' });
    } catch (error) {
        await con.rollback();
        const err = error as Error;
        console.error("Error durante la importación de ingresos:", err.message);
        res.status(500).json({ error: 'Error al procesar la importación', detalle: err.message });
    } finally {
        con.end();
    }
};