'use strict';
/**
 * Auto-generated seeder for table: estatuscomprobacion
 * Generated at 2025-09-30T19:41:11.876Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("estatuscomprobacion", [
      { "EstatusID": 1, "Descripcion": "Validado" },
      { "EstatusID": 2, "Descripcion": "Manual" },
      { "EstatusID": 3, "Descripcion": "No requiere comprobante" },
      { "EstatusID": 4, "Descripcion": "Pendiente de importar" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("estatuscomprobacion", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
