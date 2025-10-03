const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('proveedores', {
    ProveedorID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    Proveedor: {
      type: DataTypes.STRING(255),
      allowNull: false
    },
    Estatus: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: false
    },
    CostoPorPieza: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
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
    FechaRegistro: {
      type: DataTypes.DATE,
      allowNull: true,
      defaultValue: Sequelize.Sequelize.fn('current_timestamp')
    },
    Rentabilidad: {
      type: DataTypes.STRING(20),
      allowNull: true,
      defaultValue: "pendiente"
    },
    RentabilidadCostoPeriodo: {
      type: DataTypes.DECIMAL(10,2),
      allowNull: true
    }
  }, {
    sequelize,
    tableName: 'proveedores',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
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
