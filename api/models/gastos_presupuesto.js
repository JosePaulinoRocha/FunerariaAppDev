const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gastos_presupuesto', {
    GastoID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    FechaPreautorizada: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Concepto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Monto: {
      type: DataTypes.DECIMAL(18,2),
      allowNull: true
    },
    ProveedorID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'ProveedorID'
      }
    },
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'segmentos',
        key: 'SegmentoID'
      }
    },
    EstatusPresupuestoID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'estatuspresupuesto',
        key: 'EstatusPresupuestoID'
      }
    },
    CuentaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
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
    Aprobado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'gastos_presupuesto',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "GastoID" },
        ]
      },
      {
        name: "ProveedorID",
        using: "BTREE",
        fields: [
          { name: "ProveedorID" },
        ]
      },
      {
        name: "SegmentoID",
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
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
        name: "CategoriaID",
        using: "BTREE",
        fields: [
          { name: "CategoriaID" },
        ]
      },
      {
        name: "SubcategoriaID",
        using: "BTREE",
        fields: [
          { name: "SubcategoriaID" },
        ]
      },
      {
        name: "ConceptoID",
        using: "BTREE",
        fields: [
          { name: "ConceptoID" },
        ]
      },
      {
        name: "EstatusPresupuestoID",
        using: "BTREE",
        fields: [
          { name: "EstatusPresupuestoID" },
        ]
      },
    ]
  });
};
