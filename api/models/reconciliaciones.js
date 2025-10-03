const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('reconciliaciones', {
    ReconciliacionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Saldo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    CuentaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    }
  }, {
    sequelize,
    tableName: 'reconciliaciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ReconciliacionID" },
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
