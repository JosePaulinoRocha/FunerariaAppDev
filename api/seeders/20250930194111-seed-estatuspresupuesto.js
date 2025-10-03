'use strict';
/**
 * Auto-generated seeder for table: estatuspresupuesto
 * Generated at 2025-09-30T19:41:11.886Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("estatuspresupuesto", [
      { "EstatusPresupuestoID": 1, "Nombre": "Aprobado" },
      { "EstatusPresupuestoID": 2, "Nombre": "Denegado" },
      { "EstatusPresupuestoID": 3, "Nombre": "Pendiente" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("estatuspresupuesto", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
