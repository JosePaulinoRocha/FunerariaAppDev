'use strict';
/**
 * Auto-generated seeder for table: rol_permisos
 * Generated at 2025-09-30T19:41:12.050Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("rol_permisos", [
      { "RolID": 3, "PermisoID": 1 },
      { "RolID": 3, "PermisoID": 2 },
      { "RolID": 3, "PermisoID": 3 },
      { "RolID": 3, "PermisoID": 4 }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("rol_permisos", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
