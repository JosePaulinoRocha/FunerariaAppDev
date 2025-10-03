const Sequelize = require('sequelize');
module.exports = function(sequelize, DataTypes) {
  return sequelize.define('rol_permisos', {
    RolID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'roles',
        key: 'RolID'
      }
    },
    PermisoID: {
      type: DataTypes.INTEGER,
      allowNull: false,
      primaryKey: true,
      references: {
        model: 'permisos',
        key: 'PermisoID'
      }
    }
  }, {
    sequelize,
    tableName: 'rol_permisos',
    timestamps: false,
    indexes: [
      {
        name: "PRIMARY",
        unique: true,
        using: "BTREE",
        fields: [
          { name: "RolID" },
          { name: "PermisoID" },
        ]
      },
      {
        name: "PermisoID",
        using: "BTREE",
        fields: [
          { name: "PermisoID" },
        ]
      },
    ]
  });
};
