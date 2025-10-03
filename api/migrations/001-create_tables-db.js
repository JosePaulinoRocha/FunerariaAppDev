'use strict';

module.exports = {
  async up(queryInterface, Sequelize) {
    // segmentos
    await queryInterface.sequelize.query(`
      CREATE TABLE segmentos (
        SegmentoID int(11) NOT NULL AUTO_INCREMENT,
        Nombre varchar(100) NOT NULL,
        PRIMARY KEY (SegmentoID)
      ) ENGINE=InnoDB AUTO_INCREMENT=101 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // categorias
    await queryInterface.sequelize.query(`
      CREATE TABLE categorias (
        CategoriaID int(11) NOT NULL AUTO_INCREMENT,
        Nombre varchar(100) NOT NULL,
        IngresosBit tinyint(1) DEFAULT 0,
        EgresoBit tinyint(1) DEFAULT 0,
        PRIMARY KEY (CategoriaID)
      ) ENGINE=InnoDB AUTO_INCREMENT=149 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // subcategorias
    await queryInterface.sequelize.query(`
      CREATE TABLE subcategorias (
        SubcategoriaID int(11) NOT NULL AUTO_INCREMENT,
        Nombre varchar(100) NOT NULL,
        PRIMARY KEY (SubcategoriaID)
      ) ENGINE=InnoDB AUTO_INCREMENT=155 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // conceptos
    await queryInterface.sequelize.query(`
      CREATE TABLE conceptos (
        ConceptoID int(11) NOT NULL AUTO_INCREMENT,
        Nombre varchar(255) NOT NULL,
        PRIMARY KEY (ConceptoID)
      ) ENGINE=InnoDB AUTO_INCREMENT=80050 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // combinaciones
    await queryInterface.sequelize.query(`
      CREATE TABLE combinaciones (
        CombinacionID int(11) NOT NULL AUTO_INCREMENT,
        ConceptoID int(11) NOT NULL,
        SegmentoID int(11) NOT NULL,
        CategoriaID int(11) NOT NULL,
        SubcategoriaID int(11) DEFAULT NULL,
        FechaModificacion datetime NOT NULL,
        validado tinyint(1) DEFAULT 0,
        PRIMARY KEY (CombinacionID),
        KEY ConceptoID (ConceptoID),
        KEY SegmentoID (SegmentoID),
        KEY CategoriaID (CategoriaID),
        KEY SubcategoriaID (SubcategoriaID),
        CONSTRAINT combinaciones_ibfk_1 FOREIGN KEY (ConceptoID) REFERENCES conceptos (ConceptoID),
        CONSTRAINT combinaciones_ibfk_2 FOREIGN KEY (SegmentoID) REFERENCES segmentos (SegmentoID),
        CONSTRAINT combinaciones_ibfk_3 FOREIGN KEY (CategoriaID) REFERENCES categorias (CategoriaID),
        CONSTRAINT combinaciones_ibfk_4 FOREIGN KEY (SubcategoriaID) REFERENCES subcategorias (SubcategoriaID)
      ) ENGINE=InnoDB AUTO_INCREMENT=113 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    await queryInterface.createTable('tipos_cuenta', {
      TipoCuentaID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      NombreTipoCuenta: { type: Sequelize.STRING(50), allowNull: false }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    });

    await queryInterface.createTable('cuentas', {
      CuentaID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      TipoCuentaID: { type: Sequelize.INTEGER, allowNull: false },
      NombreCuenta: { type: Sequelize.STRING(255), allowNull: false },
      RFC: { type: Sequelize.STRING(13), allowNull: true }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    });

    // FK
    await queryInterface.addConstraint('cuentas', {
      fields: ['TipoCuentaID'],
      type: 'foreign key',
      name: 'cuentas_ibfk_1',
      references: {
        table: 'tipos_cuenta',
        field: 'TipoCuentaID'
      }
    });

    await queryInterface.createTable('estatuscomprobacion', {
      EstatusID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      Descripcion: { type: Sequelize.STRING(50), allowNull: false }
    }, {
      engine: 'InnoDB',
      charset: 'utf8mb4',
      collate: 'utf8mb4_general_ci'
    });

    await queryInterface.createTable('estatuspresupuesto', {
      EstatusPresupuestoID: { type: Sequelize.INTEGER, primaryKey: true, autoIncrement: true },
      Nombre: { type: Sequelize.STRING(255), allowNull: false }
    }, {
      engine: 'InnoDB',
      charset: 'utf8',
      collate: 'utf8_unicode_ci'
    });

        await queryInterface.sequelize.query(`
      CREATE TABLE \`roles\` (
        \`RolID\` int(11) NOT NULL AUTO_INCREMENT,
        \`NombreRol\` varchar(100) NOT NULL,
        PRIMARY KEY (\`RolID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // permisos
    await queryInterface.sequelize.query(`
      CREATE TABLE \`permisos\` (
        \`PermisoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`NombrePermiso\` varchar(100) NOT NULL,
        \`Ruta\` varchar(100) NOT NULL,
        PRIMARY KEY (\`PermisoID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=25 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // rol_permisos
    await queryInterface.sequelize.query(`
      CREATE TABLE \`rol_permisos\` (
        \`RolID\` int(11) NOT NULL,
        \`PermisoID\` int(11) NOT NULL,
        PRIMARY KEY (\`RolID\`,\`PermisoID\`),
        KEY \`PermisoID\` (\`PermisoID\`),
        CONSTRAINT \`rol_permisos_ibfk_1\` FOREIGN KEY (\`RolID\`) REFERENCES \`roles\` (\`RolID\`) ON DELETE CASCADE,
        CONSTRAINT \`rol_permisos_ibfk_2\` FOREIGN KEY (\`PermisoID\`) REFERENCES \`permisos\` (\`PermisoID\`) ON DELETE CASCADE
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // usuarios
    await queryInterface.sequelize.query(`
      CREATE TABLE \`usuarios\` (
        \`userId\` int(11) NOT NULL AUTO_INCREMENT,
        \`fullName\` varchar(100) NOT NULL,
        \`phone\` varchar(20) DEFAULT NULL,
        \`email\` varchar(100) NOT NULL,
        \`isAdmin\` tinyint(1) NOT NULL,
        \`password\` varchar(100) NOT NULL,
        \`RolID\` int(11) DEFAULT NULL,
        \`CambioContra\` bit(1) DEFAULT b'0',
        PRIMARY KEY (\`userId\`),
        KEY \`FK_RolID\` (\`RolID\`),
        CONSTRAINT \`FK_RolID\` FOREIGN KEY (\`RolID\`) REFERENCES \`roles\` (\`RolID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=14 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

        await queryInterface.sequelize.query(`
      CREATE TABLE \`proveedores\` (
        \`ProveedorID\` int(11) NOT NULL AUTO_INCREMENT,
        \`Proveedor\` varchar(255) NOT NULL,
        \`Estatus\` bit(1) DEFAULT b'0',
        \`CostoPorPieza\` decimal(10,2) DEFAULT NULL,
        \`CategoriaID\` int(11) DEFAULT NULL,
        \`SubcategoriaID\` int(11) DEFAULT NULL,
        \`FechaRegistro\` datetime DEFAULT current_timestamp(),
        \`Rentabilidad\` varchar(20) DEFAULT 'pendiente',
        \`RentabilidadCostoPeriodo\` decimal(10,2) DEFAULT NULL,
        PRIMARY KEY (\`ProveedorID\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        KEY \`SubcategoriaID\` (\`SubcategoriaID\`),
        CONSTRAINT \`proveedores_ibfk_1\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`),
        CONSTRAINT \`proveedores_ibfk_2\` FOREIGN KEY (\`SubcategoriaID\`) REFERENCES \`subcategorias\` (\`SubcategoriaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=75 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // transferencias
    await queryInterface.sequelize.query(`
      CREATE TABLE \`transferencias\` (
        \`TransferenciaID\` int(11) NOT NULL AUTO_INCREMENT,
        \`CuentaEnviaID\` int(11) DEFAULT NULL,
        \`CuentaRecibeID\` int(11) DEFAULT NULL,
        \`Descripcion\` varchar(255) DEFAULT NULL,
        \`Monto\` decimal(10,2) DEFAULT NULL,
        \`Fecha\` datetime DEFAULT NULL,
        PRIMARY KEY (\`TransferenciaID\`),
        KEY \`CuentaEnviaID\` (\`CuentaEnviaID\`),
        KEY \`CuentaRecibeID\` (\`CuentaRecibeID\`),
        CONSTRAINT \`transferencias_ibfk_1\` FOREIGN KEY (\`CuentaEnviaID\`) REFERENCES \`cuentas\` (\`CuentaID\`),
        CONSTRAINT \`transferencias_ibfk_2\` FOREIGN KEY (\`CuentaRecibeID\`) REFERENCES \`cuentas\` (\`CuentaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=13 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // reasignaciones
    await queryInterface.sequelize.query(`
      CREATE TABLE \`reasignaciones\` (
        \`ReasignacionID\` int(11) NOT NULL AUTO_INCREMENT,
        \`SegmentoID\` int(11) NOT NULL,
        \`Monto\` decimal(12,2) NOT NULL,
        \`VarianteDestino\` varchar(100) NOT NULL,
        \`FechaInicio\` date NOT NULL,
        \`FechaFin\` date DEFAULT NULL,
        \`TipoMovimiento\` bit(1) NOT NULL,
        PRIMARY KEY (\`ReasignacionID\`),
        KEY \`SegmentoID\` (\`SegmentoID\`),
        CONSTRAINT \`reasignaciones_ibfk_1\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=4 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // historialegresosproveedores
    await queryInterface.sequelize.query(`
      CREATE TABLE \`historialegresosproveedores\` (
        \`EgresoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`ProveedorID\` int(11) DEFAULT NULL,
        \`CategoriaID\` int(11) DEFAULT NULL,
        \`SubcategoriaID\` int(11) DEFAULT NULL,
        \`NumeroPiezas\` int(11) DEFAULT NULL,
        \`MontoTotal\` decimal(10,2) DEFAULT NULL,
        \`FechaEgreso\` datetime DEFAULT NULL,
        PRIMARY KEY (\`EgresoID\`),
        KEY \`ProveedorID\` (\`ProveedorID\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        KEY \`SubcategoriaID\` (\`SubcategoriaID\`),
        CONSTRAINT \`historialegresosproveedores_ibfk_1\` FOREIGN KEY (\`ProveedorID\`) REFERENCES \`proveedores\` (\`ProveedorID\`),
        CONSTRAINT \`historialegresosproveedores_ibfk_2\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`),
        CONSTRAINT \`historialegresosproveedores_ibfk_3\` FOREIGN KEY (\`SubcategoriaID\`) REFERENCES \`subcategorias\` (\`SubcategoriaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=134 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

        await queryInterface.sequelize.query(`
      CREATE TABLE \`ingresos_externos\` (
        \`IngresoExternoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`Descripcion\` varchar(255) NOT NULL,
        \`Fecha\` date NOT NULL,
        \`Monto\` decimal(10,2) NOT NULL,
        \`FechaImportacion\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`IngresoExternoID\`),
        UNIQUE KEY \`uk_ingresoexterno\` (\`SegmentoID\`,\`CategoriaID\`,\`Descripcion\`,\`Fecha\`,\`Monto\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        CONSTRAINT \`ingresos_externos_ibfk_1\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`),
        CONSTRAINT \`ingresos_externos_ibfk_2\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=19426 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // historial_ingresos_importados
    await queryInterface.sequelize.query(`
      CREATE TABLE \`historial_ingresos_importados\` (
        \`ImportacionID\` int(11) NOT NULL AUTO_INCREMENT,
        \`FechaInicio\` date NOT NULL,
        \`FechaCierre\` date NOT NULL,
        \`FechaImportacion\` datetime DEFAULT current_timestamp(),
        \`NumeroRegistrosImportados\` int(11) DEFAULT 0,
        PRIMARY KEY (\`ImportacionID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=185 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // reconciliaciones
    await queryInterface.sequelize.query(`
      CREATE TABLE \`reconciliaciones\` (
        \`ReconciliacionID\` int(11) NOT NULL AUTO_INCREMENT,
        \`Fecha\` date NOT NULL,
        \`Saldo\` decimal(10,2) NOT NULL,
        \`CuentaID\` int(11) NOT NULL,
        PRIMARY KEY (\`ReconciliacionID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        CONSTRAINT \`reconciliaciones_ibfk_1\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=35 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

    // ingresos
    await queryInterface.sequelize.query(`
      CREATE TABLE \`ingresos\` (
        \`IngresoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`Fecha\` datetime NOT NULL,
        \`SegmentoID\` int(11) DEFAULT NULL,
        \`CategoriaID\` int(11) DEFAULT NULL,
        \`SubcategoriaID\` int(11) DEFAULT NULL,
        \`ConceptoID\` int(11) DEFAULT NULL,
        \`Descripcion\` varchar(255) DEFAULT NULL,
        \`Piezas\` int(11) DEFAULT NULL,
        \`Monto\` decimal(18,2) NOT NULL,
        \`Saldo\` decimal(18,2) DEFAULT NULL,
        \`Comprobante\` varchar(255) DEFAULT NULL,
        \`EstatusComprobacionID\` int(11) DEFAULT NULL,
        \`FechaAutorizacion\` datetime DEFAULT NULL,
        \`UsuarioAutorizaID\` int(11) DEFAULT NULL,
        \`UsuarioRecibeID\` int(11) DEFAULT NULL,
        \`FechaConciliacion\` datetime DEFAULT NULL,
        \`ObservacionesDifConciliacion\` text DEFAULT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`TipoCuentaID\` int(11) DEFAULT NULL,
        \`Reconciliado\` tinyint(1) DEFAULT 0,
        \`TipoIngreso\` bit(1) NOT NULL DEFAULT b'0',
        \`ReconciliacionID\` int(11) DEFAULT NULL,
        \`ProveedorID\` int(11) DEFAULT NULL,
        \`CuentaContable\` bigint(20) DEFAULT NULL,
        \`MontoParcialBandera\` tinyint(1) DEFAULT 0,
        \`MontoParcial\` decimal(10,2) DEFAULT 0.00,
        PRIMARY KEY (\`IngresoID\`),
        KEY \`fk_estatus_comprobacion\` (\`EstatusComprobacionID\`),
        KEY \`fk_usuario_autoriza\` (\`UsuarioAutorizaID\`),
        KEY \`fk_usuario_recibe\` (\`UsuarioRecibeID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        KEY \`TipoCuentaID\` (\`TipoCuentaID\`),
        KEY \`ReconciliacionID\` (\`ReconciliacionID\`),
        KEY \`ingresos_ibfk_3\` (\`SubcategoriaID\`),
        KEY \`ingresos_ibfk_4\` (\`ConceptoID\`),
        KEY \`ingresos_ibfk_2\` (\`CategoriaID\`),
        KEY \`ingresos_ibfk_1\` (\`SegmentoID\`),
        KEY \`fk_proveedor\` (\`ProveedorID\`),
        KEY \`idx_fecha\` (\`Fecha\`),
        CONSTRAINT \`fk_estatus_comprobacion\` FOREIGN KEY (\`EstatusComprobacionID\`) REFERENCES \`estatuscomprobacion\` (\`EstatusID\`),
        CONSTRAINT \`fk_proveedor\` FOREIGN KEY (\`ProveedorID\`) REFERENCES \`proveedores\` (\`ProveedorID\`),
        CONSTRAINT \`fk_usuario_autoriza\` FOREIGN KEY (\`UsuarioAutorizaID\`) REFERENCES \`usuarios\` (\`userId\`),
        CONSTRAINT \`fk_usuario_recibe\` FOREIGN KEY (\`UsuarioRecibeID\`) REFERENCES \`usuarios\` (\`userId\`),
        CONSTRAINT \`ingresos_ibfk_1\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`),
        CONSTRAINT \`ingresos_ibfk_2\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`),
        CONSTRAINT \`ingresos_ibfk_3\` FOREIGN KEY (\`SubcategoriaID\`) REFERENCES \`subcategorias\` (\`SubcategoriaID\`),
        CONSTRAINT \`ingresos_ibfk_4\` FOREIGN KEY (\`ConceptoID\`) REFERENCES \`conceptos\` (\`ConceptoID\`),
        CONSTRAINT \`ingresos_ibfk_5\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`),
        CONSTRAINT \`ingresos_ibfk_6\` FOREIGN KEY (\`TipoCuentaID\`) REFERENCES \`tipos_cuenta\` (\`TipoCuentaID\`),
        CONSTRAINT \`ingresos_ibfk_7\` FOREIGN KEY (\`ReconciliacionID\`) REFERENCES \`reconciliaciones\` (\`ReconciliacionID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=330105 DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_general_ci;
    `);

        await queryInterface.sequelize.query(`
      CREATE TABLE \`gastos_presupuesto\` (
        \`GastoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`FechaPreautorizada\` date DEFAULT NULL,
        \`Concepto\` varchar(255) DEFAULT NULL,
        \`Monto\` decimal(18,2) DEFAULT NULL,
        \`ProveedorID\` int(11) DEFAULT NULL,
        \`SegmentoID\` int(11) DEFAULT NULL,
        \`EstatusPresupuestoID\` int(11) DEFAULT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`Fecha\` date DEFAULT NULL,
        \`CategoriaID\` int(11) DEFAULT NULL,
        \`SubcategoriaID\` int(11) DEFAULT NULL,
        \`ConceptoID\` int(11) DEFAULT NULL,
        \`Aprobado\` bit(1) DEFAULT b'0',
        PRIMARY KEY (\`GastoID\`),
        KEY \`ProveedorID\` (\`ProveedorID\`),
        KEY \`SegmentoID\` (\`SegmentoID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        KEY \`SubcategoriaID\` (\`SubcategoriaID\`),
        KEY \`ConceptoID\` (\`ConceptoID\`),
        KEY \`EstatusPresupuestoID\` (\`EstatusPresupuestoID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_1\` FOREIGN KEY (\`ProveedorID\`) REFERENCES \`proveedores\` (\`ProveedorID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_2\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_3\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_4\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_5\` FOREIGN KEY (\`SubcategoriaID\`) REFERENCES \`subcategorias\` (\`SubcategoriaID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_6\` FOREIGN KEY (\`ConceptoID\`) REFERENCES \`conceptos\` (\`ConceptoID\`),
        CONSTRAINT \`gastos_presupuesto_ibfk_7\` FOREIGN KEY (\`EstatusPresupuestoID\`) REFERENCES \`estatuspresupuesto\` (\`EstatusPresupuestoID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=9 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // paso_usuario_presupuesto
    await queryInterface.sequelize.query(`
      CREATE TABLE \`paso_usuario_presupuesto\` (
        \`UserID\` int(11) NOT NULL,
        \`NumeroPaso\` int(11) NOT NULL,
        PRIMARY KEY (\`UserID\`),
        CONSTRAINT \`paso_usuario_presupuesto_ibfk_1\` FOREIGN KEY (\`UserID\`) REFERENCES \`usuarios\` (\`userId\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // presupuesto_semanal
    await queryInterface.sequelize.query(`
      CREATE TABLE \`presupuesto_semanal\` (
        \`PresupuestoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`FechaInicio\` date NOT NULL,
        \`FechaFin\` date NOT NULL,
        \`Monto\` decimal(12,2) NOT NULL,
        PRIMARY KEY (\`PresupuestoID\`),
        KEY \`SegmentoID\` (\`SegmentoID\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        CONSTRAINT \`presupuesto_semanal_ibfk_1\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`),
        CONSTRAINT \`presupuesto_semanal_ibfk_2\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=43 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // presupuesto_manual
    await queryInterface.sequelize.query(`
      CREATE TABLE \`presupuesto_manual\` (
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`SubcategoriaID\` int(11) NOT NULL,
        \`ConceptoID\` int(11) NOT NULL,
        \`MontoDictaminado\` decimal(10,2) DEFAULT NULL,
        \`FrecuenciaDictaminada\` decimal(10,2) DEFAULT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`CajaChica\` bit(1) DEFAULT b'0',
        \`DiaLimite\` int(11) DEFAULT NULL,
        \`Observaciones\` varchar(255) DEFAULT NULL,
        PRIMARY KEY (\`SegmentoID\`,\`CategoriaID\`,\`SubcategoriaID\`,\`ConceptoID\`),
        KEY \`CategoriaID\` (\`CategoriaID\`),
        KEY \`SubcategoriaID\` (\`SubcategoriaID\`),
        KEY \`ConceptoID\` (\`ConceptoID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        CONSTRAINT \`presupuesto_manual_ibfk_1\` FOREIGN KEY (\`SegmentoID\`) REFERENCES \`segmentos\` (\`SegmentoID\`),
        CONSTRAINT \`presupuesto_manual_ibfk_2\` FOREIGN KEY (\`CategoriaID\`) REFERENCES \`categorias\` (\`CategoriaID\`),
        CONSTRAINT \`presupuesto_manual_ibfk_3\` FOREIGN KEY (\`SubcategoriaID\`) REFERENCES \`subcategorias\` (\`SubcategoriaID\`),
        CONSTRAINT \`presupuesto_manual_ibfk_4\` FOREIGN KEY (\`ConceptoID\`) REFERENCES \`conceptos\` (\`ConceptoID\`),
        CONSTRAINT \`presupuesto_manual_ibfk_5\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

        await queryInterface.sequelize.query(`
      CREATE TABLE \`periodos_congelados\` (
        \`PeriodoID\` int(11) NOT NULL AUTO_INCREMENT,
        \`FechaInicio\` date NOT NULL,
        \`FechaFin\` date NOT NULL,
        \`FechaCongelacion\` timestamp NOT NULL DEFAULT current_timestamp(),
        PRIMARY KEY (\`PeriodoID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=74 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // gastos_semanales_mensuales_cuentas
    await queryInterface.sequelize.query(`
      CREATE TABLE \`gastos_semanales_mensuales_cuentas\` (
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`SubcategoriaID\` int(11) NOT NULL,
        \`ConceptoID\` int(11) NOT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`PeriodoID\` int(11) NOT NULL,
        \`CajaChica\` bit(1) DEFAULT b'0',
        PRIMARY KEY (\`SegmentoID\`,\`CategoriaID\`,\`SubcategoriaID\`,\`ConceptoID\`,\`PeriodoID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        KEY \`PeriodoID\` (\`PeriodoID\`),
        CONSTRAINT \`gastos_semanales_mensuales_cuentas_ibfk_1\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`),
        CONSTRAINT \`gastos_semanales_mensuales_cuentas_ibfk_2\` FOREIGN KEY (\`PeriodoID\`) REFERENCES \`periodos_congelados\` (\`PeriodoID\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // gastos_presupuesto_frecuencia
    await queryInterface.sequelize.query(`
      CREATE TABLE \`gastos_presupuesto_frecuencia\` (
        \`GastoFrecuenciaID\` int(11) NOT NULL AUTO_INCREMENT,
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`SubcategoriaID\` int(11) NOT NULL,
        \`ConceptoID\` int(11) NOT NULL,
        \`PromedioMonto\` decimal(10,2) DEFAULT NULL,
        \`FrecuenciaPromedio\` decimal(10,2) DEFAULT NULL,
        \`FrecuenciaDictaminada\` decimal(10,2) NOT NULL,
        \`MontoDictaminado\` decimal(10,2) NOT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`CajaChica\` bit(1) DEFAULT b'0',
        \`UltimaFecha\` date DEFAULT NULL,
        \`DiaLimite\` int(11) DEFAULT NULL,
        \`DiasPendientes\` int(11) DEFAULT NULL,
        \`PeriodoID\` int(11) DEFAULT NULL,
        PRIMARY KEY (\`GastoFrecuenciaID\`)
      ) ENGINE=InnoDB AUTO_INCREMENT=21 DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

    // gastos_frecuencia_mensuales_cuentas
    await queryInterface.sequelize.query(`
      CREATE TABLE \`gastos_frecuencia_mensuales_cuentas\` (
        \`SegmentoID\` int(11) NOT NULL,
        \`CategoriaID\` int(11) NOT NULL,
        \`SubcategoriaID\` int(11) NOT NULL,
        \`ConceptoID\` int(11) NOT NULL,
        \`CuentaID\` int(11) DEFAULT NULL,
        \`PeriodoID\` int(11) NOT NULL,
        \`CajaChica\` bit(1) DEFAULT b'0',
        PRIMARY KEY (\`SegmentoID\`,\`CategoriaID\`,\`SubcategoriaID\`,\`ConceptoID\`,\`PeriodoID\`),
        KEY \`CuentaID\` (\`CuentaID\`),
        KEY \`PeriodoID\` (\`PeriodoID\`),
        CONSTRAINT \`gastos_frecuencia_mensuales_cuentas_ibfk_1\` FOREIGN KEY (\`CuentaID\`) REFERENCES \`cuentas\` (\`CuentaID\`),
        CONSTRAINT \`gastos_frecuencia_mensuales_cuentas_ibfk_2\` FOREIGN KEY (\`PeriodoID\`) REFERENCES \`periodos_congelados\` (\`PeriodoID\`)
      ) ENGINE=InnoDB DEFAULT CHARSET=utf8 COLLATE=utf8_unicode_ci;
    `);

  },

  

  async down(queryInterface, Sequelize) {
    // ⚠️ orden inverso por dependencias
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `gastos_frecuencia_mensuales_cuentas`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `gastos_presupuesto_frecuencia`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `gastos_semanales_mensuales_cuentas`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `periodos_congelados`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `presupuesto_manual`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `presupuesto_semanal`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `paso_usuario_presupuesto`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `gastos_presupuesto`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `ingresos`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `reconciliaciones`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `historial_ingresos_importados`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `ingresos_externos`;');  
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `historialegresosproveedores`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `reasignaciones`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `transferencias`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `proveedores`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `usuarios`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `rol_permisos`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `permisos`;');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS `roles`;');
    await queryInterface.dropTable('estatuspresupuesto');
    await queryInterface.dropTable('estatuscomprobacion');

    // Primero quitar FK antes de drop cuentas
    await queryInterface.removeConstraint('cuentas', 'cuentas_ibfk_1');
    await queryInterface.dropTable('cuentas');

    await queryInterface.dropTable('tipos_cuenta');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS combinaciones');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS conceptos');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS subcategorias');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS categorias');
    await queryInterface.sequelize.query('DROP TABLE IF EXISTS segmentos');
  }
};
