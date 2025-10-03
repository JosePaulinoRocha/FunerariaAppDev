const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reasignaciones', {
    ReasignacionID: {
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
    Monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: false
    },
    VarianteDestino: {
      type: DataTypes.STRING(100),
      allowNull: false
    },
    FechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    TipoMovimiento: {
      type: DataTypes.BOOLEAN,
      allowNull: false
    }
  }, {
    sequelize,
    tableName: 'reasignaciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ReasignacionID" },
        ]
      },
      {
        name: "SegmentoID",
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
        ]
      },
    ]
  });
};
