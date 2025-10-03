const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('ingresos_externos', {
    IngresoExternoID: {
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
    Descripcion: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Fecha: {
      type: DataTypes.DATEONLY,
      allowNull: false
    },
    Monto: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: false
    },
    FechaImportacion: {
      type: DataTypes.DATE,
      allowNull: false,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    }
  }, {
    sequelize,
    tableName: 'ingresos_externos',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "IngresoExternoID" },
        ]
      },
      {
        name: "uk_ingresoexterno",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
          { name: "CategoriaID" },
          { name: "Descripcion" },
          { name: "Fecha" },
          { name: "Monto" },
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
