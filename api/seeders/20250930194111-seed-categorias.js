'use strict';
/**
 * Auto-generated seeder for table: categorias
 * Generated at 2025-09-30T19:41:11.863Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("categorias", [
      { "CategoriaID": 1, "Nombre": "Gasto Operativo", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 2, "Nombre": "Operativo Extraordinario", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 3, "Nombre": "Costo de la Venta", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 4, "Nombre": "Oficina", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 5, "Nombre": "Operativo Coordinacion", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 30, "Nombre": "Nueva Categoria Prueba", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 90, "Nombre": "Cuentas Establecidas", "IngresosBit": 1, "EgresoBit": 1 },
      { "CategoriaID": 91, "Nombre": "Ingreso Funeraria", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 92, "Nombre": "Inversiones Iniciales", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 93, "Nombre": "Insumo", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 98, "Nombre": "paracetamol", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 99, "Nombre": "Tienda", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 100, "Nombre": "Transferencia", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 101, "Nombre": "Costo De Venta", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 102, "Nombre": "Gasto Oficina", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 103, "Nombre": "Operativo Cordinacion", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 104, "Nombre": "Costo de Venta Cobranza", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 105, "Nombre": "Inversiones", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 106, "Nombre": "Operativo Gerencia", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 107, "Nombre": "Operativo Extra Ordinario", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 108, "Nombre": "Fondeo ", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 109, "Nombre": "B a E", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 110, "Nombre": "E a B", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 111, "Nombre": "Prueba", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 112, "Nombre": "egreso catorsenal", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 113, "Nombre": "Bebidas", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 114, "Nombre": "prueba de reportes", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 118, "Nombre": "Servicios", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 119, "Nombre": "Materiales", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 120, "Nombre": "Publicidad", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 121, "Nombre": "Consultoría", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 122, "Nombre": "Tecnología", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 123, "Nombre": "Nueva prueba ingresos", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 124, "Nombre": "ingresos 2", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 125, "Nombre": "categoria ingreso prueba 3", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 126, "Nombre": "egreso prueba", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 127, "Nombre": "egreso prueba 2", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 128, "Nombre": "nueva categoria ingreso pruba cuenta", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 129, "Nombre": "egresos prueba cuenta ", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 130, "Nombre": "asignar cuentas ingresos masivo", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 131, "Nombre": "nueva categoria combinacion ingreso", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 132, "Nombre": "Corte", "IngresosBit": 1, "EgresoBit": 0 },
      { "CategoriaID": 133, "Nombre": "Cuentas Establecidas OXXO", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 134, "Nombre": "Inversiones Cobranza", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 135, "Nombre": "Prestamos Hechos", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 136, "Nombre": "NULL", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 137, "Nombre": "Ingreso Inversion Inicial", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 138, "Nombre": "Prestamo Interno", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 139, "Nombre": "Venta de Equipo", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 140, "Nombre": "Prestamo Interdepartamental", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 141, "Nombre": "Prestamo Foraneo", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 142, "Nombre": "Perstamo Interno", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 143, "Nombre": "Costo De Venta", "IngresosBit": 0, "EgresoBit": 1 },
      { "CategoriaID": 146, "Nombre": "Social Media", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 147, "Nombre": "Capacitación", "IngresosBit": 0, "EgresoBit": 0 },
      { "CategoriaID": 148, "Nombre": "Mantenimiento", "IngresosBit": 0, "EgresoBit": 0 }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("categorias", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
