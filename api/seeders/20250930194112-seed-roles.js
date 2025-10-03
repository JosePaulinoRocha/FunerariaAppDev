'use strict';
/**
 * Auto-generated seeder for table: roles
 * Generated at 2025-09-30T19:41:12.048Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("roles", [
      { "RolID": 1, "NombreRol": "Usuario" },
      { "RolID": 2, "NombreRol": "Supervisor De Tesoreros" },
      { "RolID": 3, "NombreRol": "Encargada de Finanzas" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("roles", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
