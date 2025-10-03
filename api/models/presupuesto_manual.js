const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('presupuesto_manual', {
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'segmentos',
        key: 'SegmentoID'
      }
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'categorias',
        key: 'CategoriaID'
      }
    },
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'subcategorias',
        key: 'SubcategoriaID'
      }
    },
    ConceptoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'conceptos',
        key: 'ConceptoID'
      }
    },
    MontoDictaminado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    FrecuenciaDictaminada: {
      type: DataTypes.DECIMAL(10,2),
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
    CajaChica: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    DiaLimite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Observaciones: {
      type: DataTypes.STRING(255),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'presupuesto_manual',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
          { name: "CategoriaID" },
          { name: "SubcategoriaID" },
          { name: "ConceptoID" },
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
        name: "CuentaID",
        using: "BTREE",
        fields: [
          { name: "CuentaID" },
        ]
      },
    ]
  });
};
