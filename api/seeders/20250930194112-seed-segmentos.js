'use strict';
/**
 * Auto-generated seeder for table: segmentos
 * Generated at 2025-09-30T19:41:12.052Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("segmentos", [
      { "SegmentoID": 1, "Nombre": "Cobranza" },
      { "SegmentoID": 2, "Nombre": "Funeraria Anahuac" },
      { "SegmentoID": 3, "Nombre": "Sala Aguilas" },
      { "SegmentoID": 4, "Nombre": "RRHH" },
      { "SegmentoID": 5, "Nombre": "Administracion" },
      { "SegmentoID": 35, "Nombre": "Nuevo Segmento Prueba" },
      { "SegmentoID": 36, "Nombre": "Inversiones" },
      { "SegmentoID": 37, "Nombre": "Cuentas Establecidas" },
      { "SegmentoID": 38, "Nombre": "Sala ventas" },
      { "SegmentoID": 39, "Nombre": "Inversiones Iniciales" },
      { "SegmentoID": 40, "Nombre": "Ingreso Funeraria" },
      { "SegmentoID": 41, "Nombre": "Reembolso" },
      { "SegmentoID": 42, "Nombre": "Prestamo Foraneo" },
      { "SegmentoID": 47, "Nombre": "Farmacia" },
      { "SegmentoID": 48, "Nombre": "Transferencia" },
      { "SegmentoID": 49, "Nombre": "Ventas" },
      { "SegmentoID": 50, "Nombre": "Funeraria" },
      { "SegmentoID": 51, "Nombre": "Cobranza 2" },
      { "SegmentoID": 52, "Nombre": "Funeraria 2" },
      { "SegmentoID": 53, "Nombre": "Funeraria SLRC" },
      { "SegmentoID": 54, "Nombre": "Aguilas SLRC" },
      { "SegmentoID": 55, "Nombre": "Sala 3" },
      { "SegmentoID": 56, "Nombre": "Soles" },
      { "SegmentoID": 57, "Nombre": "Consultorio" },
      { "SegmentoID": 58, "Nombre": "EAR" },
      { "SegmentoID": 59, "Nombre": "Guerreros" },
      { "SegmentoID": 60, "Nombre": "Sala Espartanos" },
      { "SegmentoID": 61, "Nombre": "Sala Lobos" },
      { "SegmentoID": 62, "Nombre": "Sala Funeraria" },
      { "SegmentoID": 63, "Nombre": "Sala San Luis" },
      { "SegmentoID": 64, "Nombre": "Soles SLRC" },
      { "SegmentoID": 65, "Nombre": "Funeraria Plaza Cachanilla" },
      { "SegmentoID": 66, "Nombre": "Cobranza SLRC" },
      { "SegmentoID": 67, "Nombre": "Transfer" },
      { "SegmentoID": 68, "Nombre": "Legionarios" },
      { "SegmentoID": 69, "Nombre": "Nuevo segmento prueba" },
      { "SegmentoID": 70, "Nombre": "egresos catorcenal" },
      { "SegmentoID": 71, "Nombre": "prueba de reportes" },
      { "SegmentoID": 72, "Nombre": "Marketing" },
      { "SegmentoID": 73, "Nombre": "Finanzas" },
      { "SegmentoID": 74, "Nombre": "IT" },
      { "SegmentoID": 75, "Nombre": "Operaciones" },
      { "SegmentoID": 76, "Nombre": "nuevo segmento X" },
      { "SegmentoID": 79, "Nombre": "Ask accountant" },
      { "SegmentoID": 80, "Nombre": "Sala 2" },
      { "SegmentoID": 81, "Nombre": "Initial" },
      { "SegmentoID": 82, "Nombre": "Funeraria Plaza Cach" },
      { "SegmentoID": 83, "Nombre": "alfas slrc" },
      { "SegmentoID": 84, "Nombre": "espartanos slrc" },
      { "SegmentoID": 85, "Nombre": "innova" },
      { "SegmentoID": 86, "Nombre": "funeraria mxl" },
      { "SegmentoID": 87, "Nombre": "administracion mxl" },
      { "SegmentoID": 88, "Nombre": "cobranza mxl" },
      { "SegmentoID": 89, "Nombre": "rh mxl" },
      { "SegmentoID": 90, "Nombre": "rh slrc" },
      { "SegmentoID": 91, "Nombre": "sala alfas mxl" },
      { "SegmentoID": 92, "Nombre": "sala alfas slrc" },
      { "SegmentoID": 93, "Nombre": "sala espartanos mxl" },
      { "SegmentoID": 94, "Nombre": "sala espartanos slrc" },
      { "SegmentoID": 95, "Nombre": "sala innova" },
      { "SegmentoID": 96, "Nombre": "sala elite" },
      { "SegmentoID": 97, "Nombre": "Sala prueba" },
      { "SegmentoID": 98, "Nombre": "Ventas Nacionales" },
      { "SegmentoID": 99, "Nombre": "Marketing Digital" },
      { "SegmentoID": 100, "Nombre": "Producción" }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("segmentos", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
