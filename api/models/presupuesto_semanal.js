const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('presupuesto_semanal', {
    PresupuestoID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    SegmentoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'segmentos',
        key: 'SegmentoID'
      }
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'categorias',
        key: 'CategoriaID'
      }
    },
    FechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'presupuesto_semanal',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PresupuestoID" },
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
        name: "CategoriaID",
        using: "BTREE",
        fields: [
          { name: "CategoriaID" },
        ]
      },
    ]
  });
};
