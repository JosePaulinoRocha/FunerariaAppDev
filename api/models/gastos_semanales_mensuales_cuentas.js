const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gastos_semanales_mensuales_cuentas', {
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ConceptoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CuentaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    },
    PeriodoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'periodos_congelados',
        key: 'PeriodoID'
      }
    },
    CajaChica: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    }
  }, {
    sequelize,
    tableName: 'gastos_semanales_mensuales_cuentas',
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
          { name: "PeriodoID" },
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
        name: "PeriodoID",
        using: "BTREE",
        fields: [
          { name: "PeriodoID" },
        ]
      },
    ]
  });
};
