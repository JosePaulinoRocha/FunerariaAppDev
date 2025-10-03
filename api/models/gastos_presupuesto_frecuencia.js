const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('gastos_presupuesto_frecuencia', {
    GastoFrecuenciaID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    ConceptoID: {
      type: DataTypes.INTEGER,
      allowNull: false
    },
    PromedioMonto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    FrecuenciaPromedio: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    FrecuenciaDictaminada: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    MontoDictaminado: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    CuentaID: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    CajaChica: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    UltimaFecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    DiaLimite: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    DiasPendientes: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    PeriodoID: {
      type: DataTypes.INTEGER,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'gastos_presupuesto_frecuencia',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "GastoFrecuenciaID" },
        ]
      },
    ]
  });
};
