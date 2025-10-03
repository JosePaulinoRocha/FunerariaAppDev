const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('temp_egresos_import', {
    bill_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Segmento: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Categoria: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Subcategoria: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Concepto: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    Descripcion: {
      type: DataTypes.STRING(500),
      allowNull: true
    },
    Monto: {
      type: DataTypes.DECIMAL(12,2),
      allowNull: true
    },
    Cuenta: {
      type: DataTypes.STRING(255),
      allowNull: true
    },
    reconcile_id: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    FechaConciliacion: {
      type: DataTypes.DATEONLY,
      allowNull: true
    },
    Saldo: {
      type: DataTypes.DECIMAL(15,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'temp_egresos_import',
    timestamps: false
  });
};
