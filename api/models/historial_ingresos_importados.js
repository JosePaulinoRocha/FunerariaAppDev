const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('historial_ingresos_importados', {
    ImportacionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    FechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaCierre: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaImportacion: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    NumeroRegistrosImportados: {
      type: DataTypes.INTEGER,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'historial_ingresos_importados',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "ImportacionID" },
        ]
      },
    ]
  });
};
