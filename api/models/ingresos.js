const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ingresos', {
    IngresoID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Fecha: {
      type: DataTypes.DATE,
      allowNull: false
    },
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'segmentos',
        key: 'SegmentoID'
      }
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categorias',
        key: 'CategoriaID'
      }
    },
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subcategorias',
        key: 'SubcategoriaID'
      }
    },
    ConceptoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'conceptos',
        key: 'ConceptoID'
      }
    },
    Descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Piezas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Monto: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: false
    },
    Saldo: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    Comprobante: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    EstatusComprobacionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estatuscomprobacion',
        key: 'EstatusID'
      }
    },
    FechaAutorizacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    UsuarioAutorizaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'userId'
      }
    },
    UsuarioRecibeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'usuarios',
        key: 'userId'
      }
    },
    FechaConciliacion: {
      type: DataTypes.DATE,
      allowNull: true
    },
    ObservacionesDifConciliacion: {
      type: DataTypes.TEXT,
      allowNull: true
    },
    CuentaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    },
    TipoCuentaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'tipos_cuenta',
        key: 'TipoCuentaID'
      }
    },
    Reconciliado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    TipoIngreso: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false
    },
    ReconciliacionID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'reconciliaciones',
        key: 'ReconciliacionID'
      }
    },
    ProveedorID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'ProveedorID'
      }
    },
    CuentaContable: {
      type: DataTypes.BIGINT,
      allowNull: true
    },
    MontoParcialBandera: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    },
    MontoParcial: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true,
      defaultValue: 0.00
    }
  }, {
    sequelize,
    tableName: 'ingresos',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IngresoID" },
        ]
      },
      {
        name: "fk_estatus_comprobacion",
        using: "BTREE",
        fields: [
          { name: "EstatusComprobacionID" },
        ]
      },
      {
        name: "fk_usuario_autoriza",
        using: "BTREE",
        fields: [
          { name: "UsuarioAutorizaID" },
        ]
      },
      {
        name: "fk_usuario_recibe",
        using: "BTREE",
        fields: [
          { name: "UsuarioRecibeID" },
        ]
      },
      {
        name: "CuentaID",
        using: "BTREE",
        fields: [
          { name: "CuentaID" },
        ]
      },
      {
        name: "TipoCuentaID",
        using: "BTREE",
        fields: [
          { name: "TipoCuentaID" },
        ]
      },
      {
        name: "ReconciliacionID",
        using: "BTREE",
        fields: [
          { name: "ReconciliacionID" },
        ]
      },
      {
        name: "ingresos_ibfk_3",
        using: "BTREE",
        fields: [
          { name: "SubcategoriaID" },
        ]
      },
      {
        name: "ingresos_ibfk_4",
        using: "BTREE",
        fields: [
          { name: "ConceptoID" },
        ]
      },
      {
        name: "ingresos_ibfk_2",
        using: "BTREE",
        fields: [
          { name: "CategoriaID" },
        ]
      },
      {
        name: "ingresos_ibfk_1",
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
        ]
      },
      {
        name: "fk_proveedor",
        using: "BTREE",
        fields: [
          { name: "ProveedorID" },
        ]
      },
      {
        name: "idx_fecha",
        using: "BTREE",
        fields: [
          { name: "Fecha" },
        ]
      },
    ]
  });
};
