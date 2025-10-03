'use strict';
/**
 * Auto-generated seeder for table: cuentas
 * Generated at 2025-09-30T19:41:11.875Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("cuentas", [
      { "CuentaID": 1, "TipoCuentaID": 1, "NombreCuenta": "Recursos Humanos", "RFC": null },
      { "CuentaID": 2, "TipoCuentaID": 1, "NombreCuenta": "Cobranza", "RFC": null },
      { "CuentaID": 3, "TipoCuentaID": 1, "NombreCuenta": "Funeraria Anahuac", "RFC": null },
      { "CuentaID": 4, "TipoCuentaID": 1, "NombreCuenta": "Sala Aguilas", "RFC": null },
      { "CuentaID": 5, "TipoCuentaID": 1, "NombreCuenta": "Sala Espartanos", "RFC": null },
      { "CuentaID": 6, "TipoCuentaID": 2, "NombreCuenta": "Juan Pérez", "RFC": "RFC123456789" },
      { "CuentaID": 7, "TipoCuentaID": 2, "NombreCuenta": "María López", "RFC": "RFC987654321" },
      { "CuentaID": 8, "TipoCuentaID": 2, "NombreCuenta": "Carlos Sánchez", "RFC": "RFC567890123" },
      { "CuentaID": 9, "TipoCuentaID": 2, "NombreCuenta": "Ana Gómez", "RFC": "RFC345678901" },
      { "CuentaID": 10, "TipoCuentaID": 2, "NombreCuenta": "Luis Fernández", "RFC": "RFC234567890" },
      { "CuentaID": 11, "TipoCuentaID": 2, "NombreCuenta": "Marta Rodríguez", "RFC": "RFC678901234" },
      { "CuentaID": 13, "TipoCuentaID": 2, "NombreCuenta": "nueva cuent", "RFC": "rfcnuevo" },
      { "CuentaID": 14, "TipoCuentaID": 1, "NombreCuenta": "nueva cc", "RFC": null },
      { "CuentaID": 18, "TipoCuentaID": 2, "NombreCuenta": "Paulino", "RFC": "RFC123456" },
      { "CuentaID": 19, "TipoCuentaID": 2, "NombreCuenta": "Darien Molina", "RFC": "RFC123456" },
      { "CuentaID": 21, "TipoCuentaID": 2, "NombreCuenta": "Alonso Mora", "RFC": "RFC123456" },
      { "CuentaID": 22, "TipoCuentaID": 2, "NombreCuenta": "Nueva Cuenta Bancaria Prueba", "RFC": "RFC-PRUEBA" },
      { "CuentaID": 23, "TipoCuentaID": 2, "NombreCuenta": "Cuenta Asignada externa", "RFC": "RFC1234567" },
      { "CuentaID": 24, "TipoCuentaID": 1, "NombreCuenta": "Caja asignada externa", "RFC": null },
      { "CuentaID": 26, "TipoCuentaID": 1, "NombreCuenta": "Caja Chica Pruebas", "RFC": null },
      { "CuentaID": 27, "TipoCuentaID": 1, "NombreCuenta": "Prueba1", "RFC": null },
      { "CuentaID": 28, "TipoCuentaID": 1, "NombreCuenta": "Pruebaviernes", "RFC": null },
      { "CuentaID": 29, "TipoCuentaID": 1, "NombreCuenta": "Prueba 3", "RFC": null },
      { "CuentaID": 30, "TipoCuentaID": 1, "NombreCuenta": "Prueba de saldos", "RFC": null },
      { "CuentaID": 31, "TipoCuentaID": 1, "NombreCuenta": "Caja Sabado 5", "RFC": null },
      { "CuentaID": 32, "TipoCuentaID": 1, "NombreCuenta": "Caja Chica Prueba 4", "RFC": "" },
      { "CuentaID": 33, "TipoCuentaID": 2, "NombreCuenta": "Cuenta Banco Prueba 4", "RFC": "RFC-PRUEBA-3" },
      { "CuentaID": 34, "TipoCuentaID": 1, "NombreCuenta": "PABS Caja Chica", "RFC": null },
      { "CuentaID": 35, "TipoCuentaID": 2, "NombreCuenta": "FERNANDA MORALES", "RFC": null },
      { "CuentaID": 36, "TipoCuentaID": 2, "NombreCuenta": "Yuridia Amezquita", "RFC": null },
      { "CuentaID": 37, "TipoCuentaID": 2, "NombreCuenta": "Tiffany Covarrubias", "RFC": null },
      { "CuentaID": 38, "TipoCuentaID": 1, "NombreCuenta": "Pabs Caja chica SLRC", "RFC": null },
      { "CuentaID": 39, "TipoCuentaID": 2, "NombreCuenta": "Lourdes Sanchez", "RFC": null },
      { "CuentaID": 40, "TipoCuentaID": 2, "NombreCuenta": "Aaron Hidalgo", "RFC": null },
      { "CuentaID": 41, "TipoCuentaID": 2, "NombreCuenta": "Marlene Ruiz Barajas", "RFC": null },
      { "CuentaID": 42, "TipoCuentaID": 2, "NombreCuenta": "Monica Amezquita", "RFC": null },
      { "CuentaID": 43, "TipoCuentaID": 2, "NombreCuenta": "Alans Osuna", "RFC": null },
      { "CuentaID": 44, "TipoCuentaID": 2, "NombreCuenta": "Ana Karen Lopez", "RFC": null },
      { "CuentaID": 45, "TipoCuentaID": 2, "NombreCuenta": "Alans Osuna BBVA", "RFC": null },
      { "CuentaID": 46, "TipoCuentaID": 2, "NombreCuenta": "Cintia Barajas", "RFC": null },
      { "CuentaID": 47, "TipoCuentaID": 2, "NombreCuenta": "Josefina Cortez", "RFC": null },
      { "CuentaID": 48, "TipoCuentaID": 2, "NombreCuenta": "Martin Garcia", "RFC": null },
      { "CuentaID": 49, "TipoCuentaID": 2, "NombreCuenta": "Paulina Chavez", "RFC": null },
      { "CuentaID": 50, "TipoCuentaID": 2, "NombreCuenta": "Salvador Castañeda", "RFC": null },
      { "CuentaID": 51, "TipoCuentaID": 2, "NombreCuenta": "ANA CUEVAS", "RFC": null },
      { "CuentaID": 52, "TipoCuentaID": 2, "NombreCuenta": "ANDREA GONZALEZ", "RFC": null },
      { "CuentaID": 53, "TipoCuentaID": 2, "NombreCuenta": "Miguel Gaytan BBVA", "RFC": null },
      { "CuentaID": 54, "TipoCuentaID": 2, "NombreCuenta": "Mónica Amézquita BBVA", "RFC": null },
      { "CuentaID": 55, "TipoCuentaID": 2, "NombreCuenta": "Mayra Scotia Bank", "RFC": null },
      { "CuentaID": 56, "TipoCuentaID": 2, "NombreCuenta": "MARIO ANDRADE", "RFC": null },
      { "CuentaID": 57, "TipoCuentaID": 2, "NombreCuenta": "KAREN ANGUIANO", "RFC": null },
      { "CuentaID": 58, "TipoCuentaID": 2, "NombreCuenta": "Cuenta Corriente", "RFC": null },
      { "CuentaID": 59, "TipoCuentaID": 1, "NombreCuenta": "Caja Chica", "RFC": null },
      { "CuentaID": 60, "TipoCuentaID": 2, "NombreCuenta": "Cuenta Ahorro", "RFC": null },
      { "CuentaID": 61, "TipoCuentaID": 2, "NombreCuenta": "Banco Empresarial", "RFC": null },
      { "CuentaID": 62, "TipoCuentaID": 2, "NombreCuenta": "Fondo Fijo", "RFC": null },
      { "CuentaID": 63, "TipoCuentaID": 1, "NombreCuenta": "Perdida", "RFC": null },
      { "CuentaID": 64, "TipoCuentaID": 1, "NombreCuenta": "Caja Chica Funeraria", "RFC": null },
      { "CuentaID": 65, "TipoCuentaID": 2, "NombreCuenta": "Mayra Teresa Saldana Bancome 4730", "RFC": null },
      { "CuentaID": 66, "TipoCuentaID": 2, "NombreCuenta": "Cuenta de Banco Miguel Gaitan", "RFC": null },
      { "CuentaID": 67, "TipoCuentaID": 2, "NombreCuenta": "Cuenta de Banco Raul", "RFC": null },
      { "CuentaID": 68, "TipoCuentaID": 2, "NombreCuenta": "Caja ahorro Convencion", "RFC": null },
      { "CuentaID": 69, "TipoCuentaID": 2, "NombreCuenta": "Infonavit", "RFC": null },
      { "CuentaID": 70, "TipoCuentaID": 2, "NombreCuenta": "Nominas No Cobradas", "RFC": null },
      { "CuentaID": 71, "TipoCuentaID": 2, "NombreCuenta": "CECILIA GARDUÑO", "RFC": null },
      { "CuentaID": 72, "TipoCuentaID": 2, "NombreCuenta": "Gasto extraordinario", "RFC": null },
      { "CuentaID": 73, "TipoCuentaID": 2, "NombreCuenta": "Nominas no cobradas SLRC", "RFC": null },
      { "CuentaID": 74, "TipoCuentaID": 2, "NombreCuenta": "Resguardo caja Fraga", "RFC": null },
      { "CuentaID": 75, "TipoCuentaID": 2, "NombreCuenta": "Caja de Ahorro", "RFC": null },
      { "CuentaID": 76, "TipoCuentaID": 2, "NombreCuenta": "Beatriz Martinez", "RFC": null },
      { "CuentaID": 77, "TipoCuentaID": 2, "NombreCuenta": "Aguinaldo", "RFC": null },
      { "CuentaID": 78, "TipoCuentaID": 2, "NombreCuenta": "Blanca Edith Barajas Cortez", "RFC": null },
      { "CuentaID": 79, "TipoCuentaID": 2, "NombreCuenta": "NULL", "RFC": null }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("cuentas", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
