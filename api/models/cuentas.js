const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('cuentas', {
    CuentaID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    TipoCuentaID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'tipos_cuenta',
        key: 'TipoCuentaID'
      }
    },
    NombreCuenta: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    RFC: {
      type: DataTypes.STRING(13),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'cuentas',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
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
    ]
  });
};
