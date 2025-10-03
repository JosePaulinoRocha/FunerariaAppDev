const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('historialegresosproveedores', {
    EgresoID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ProveedorID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'proveedores',
        key: 'ProveedorID'
      }
    },
    CategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'categorias',
        key: 'CategoriaID'
      }
    },
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subcategorias',
        key: 'SubcategoriaID'
      }
    },
    NumeroPiezas: {
      type: DataTypes.INTEGER,
      allowNull: true
    },
    MontoTotal: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    },
    FechaEgreso: {
      type: DataTypes.DATE,
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'historialegresosproveedores',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "EgresoID" },
        ]
      },
      {
        name: "ProveedorID",
        using: "BTREE",
        fields: [
          { name: "ProveedorID" },
        ]
      },
      {
        name: "CategoriaID",
        using: "BTREE",
        fields: [
          { name: "CategoriaID" },
        ]
      },
      {
        name: "SubcategoriaID",
        using: "BTREE",
        fields: [
          { name: "SubcategoriaID" },
        ]
      },
    ]
  });
};
