'use strict';
/**
 * Auto-generated seeder for table: tipos_cuenta
 * Generated at 2025-09-30T19:41:12.059Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("tipos_cuenta", [
      { "TipoCuentaID": 1, "NombreTipoCuenta": "Caja chica" },
      { "TipoCuentaID": 2, "NombreTipoCuenta": "Cuenta bancaria" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("tipos_cuenta", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
