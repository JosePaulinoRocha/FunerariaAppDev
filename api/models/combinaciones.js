const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('combinaciones', {
    CombinacionID: {
      autoIncrement: true,
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true
    },
    ConceptoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      references: {
        model: 'conceptos',
        key: 'ConceptoID'
      }
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
    SubcategoriaID: {
      type: DataTypes.INTEGER,
      allowNull: true,
      references: {
        model: 'subcategorias',
        key: 'SubcategoriaID'
      }
    },
    FechaModificacion: {
      type: DataTypes.DATE,
      allowNull: false
    },
    validado: {
      type: DataTypes.BOOLEAN,
      allowNull: true,
      defaultValue: 0
    }
  }, {
    sequelize,
    tableName: 'combinaciones',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "CombinacionID" },
        ]
      },
      {
        name: "ConceptoID",
        using: "BTREE",
        fields: [
          { name: "ConceptoID" },
        ]
      },
      {
        name: "SegmentoID",
        using: "BTREE",
        fields: [
          { name: "SegmentoID" },
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
