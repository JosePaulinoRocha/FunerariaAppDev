const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('transferencias', {
    TransferenciaID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    CuentaEnviaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    },
    CuentaRecibeID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'cuentas',
        key: 'CuentaID'
      }
    },
    Descripcion: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    Fecha: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'transferencias',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "TransferenciaID" },
        ]
      },
      {
        name: "CuentaEnviaID",
        using: "BTREE",
        fields: [
          { name: "CuentaEnviaID" },
        ]
      },
      {
        name: "CuentaRecibeID",
        using: "BTREE",
        fields: [
          { name: "CuentaRecibeID" },
        ]
      },
    ]
  });
};
