'use strict';
/**
 * Auto-generated seeder for table: permisos
 * Generated at 2025-09-30T19:41:12.025Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("permisos", [
      { "PermisoID": 1, "NombrePermiso": "Home", "Ruta": "/home" },
      { "PermisoID": 2, "NombrePermiso": "Login", "Ruta": "/login" },
      { "PermisoID": 3, "NombrePermiso": "Ingresos", "Ruta": "/ingresos" },
      { "PermisoID": 4, "NombrePermiso": "Ingresos-Egresos", "Ruta": "/ingresos-egresos" },
      { "PermisoID": 5, "NombrePermiso": "Gallery", "Ruta": "/gallery" },
      { "PermisoID": 6, "NombrePermiso": "Usuarios", "Ruta": "/usuarios" },
      { "PermisoID": 7, "NombrePermiso": "Reconciliaciones", "Ruta": "/reconciliaciones" },
      { "PermisoID": 8, "NombrePermiso": "Historial Reconciliaciones", "Ruta": "/reconciliaciones-historial" },
      { "PermisoID": 9, "NombrePermiso": "Combinaciones", "Ruta": "/combinaciones" },
      { "PermisoID": 10, "NombrePermiso": "Ingresos API", "Ruta": "/ingresos-api" },
      { "PermisoID": 11, "NombrePermiso": "Proveedores", "Ruta": "/proveedores" },
      { "PermisoID": 12, "NombrePermiso": "Transferencias", "Ruta": "/transferencias" },
      { "PermisoID": 13, "NombrePermiso": "Presupuesto", "Ruta": "/presupuesto" },
      { "PermisoID": 14, "NombrePermiso": "Presupuesto Mensual", "Ruta": "/presupuesto-mensual" },
      { "PermisoID": 15, "NombrePermiso": "Presupuesto Mensual Frecuencia", "Ruta": "/presupuesto-mensual-frecuencia" },
      { "PermisoID": 16, "NombrePermiso": "Presupuesto Mensual Cuentas", "Ruta": "/presupuesto-mensual-cuentas" },
      { "PermisoID": 17, "NombrePermiso": "Proyección", "Ruta": "/proyeccion" },
      { "PermisoID": 18, "NombrePermiso": "Reportes", "Ruta": "/reportes" },
      { "PermisoID": 19, "NombrePermiso": "Resumen Presupuesto", "Ruta": "/resumen-presupuesto" },
      { "PermisoID": 20, "NombrePermiso": "Resumen Presupuesto Segmentos", "Ruta": "/resumen-presupuesto-segmentos" },
      { "PermisoID": 21, "NombrePermiso": "Resumen Presupuesto Categorías", "Ruta": "/resumen-presupuesto-categorias" },
      { "PermisoID": 22, "NombrePermiso": "Compilaciones", "Ruta": "/compilaciones" },
      { "PermisoID": 23, "NombrePermiso": "Reportes Conciliados", "Ruta": "/reportes-conciliados" },
      { "PermisoID": 24, "NombrePermiso": "Presupuesto Semanal", "Ruta": "/presupuesto-semanal" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("permisos", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
