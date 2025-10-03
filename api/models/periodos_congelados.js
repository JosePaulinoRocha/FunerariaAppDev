const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('periodos_congelados', {
    PeriodoID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    FechaInicio: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaFin: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    FechaCongelacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'periodos_congelados',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "PeriodoID" },
        ]
      },
    ]
  });
};
