'use strict';
/**
 * Auto-generated seeder for table: usuarios
 * Generated at 2025-09-30T19:41:12.070Z
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert("usuarios", [
      { "userId": 1, "fullName": "Juan Pérez", "phone": "555-1234", "email": "juan.perez@example.com", "isAdmin": 1, "password": "$2a$10$3cGS230UVfpZOOmPFN6vfeQzym9n4JopydYatUSG/2fBkwKbHgE4G", "RolID": 1, "CambioContra": Buffer.from("AQ==", 'base64') },
      { "userId": 2, "fullName": "Ana Gómez", "phone": "555-5678", "email": "ana.gomez@example.com", "isAdmin": 0, "password": "$2a$10$1Eq17ophLX/lK.XG8jq.K.DeehrMV1Rq38s0IlQpC7KGpkK92TjCm", "RolID": 1, "CambioContra": Buffer.from("AQ==", 'base64') },
      { "userId": 3, "fullName": "Carlos Díaz", "phone": "555-9101", "email": "carlos.diaz@example.com", "isAdmin": 1, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 4, "fullName": "María Rodríguez", "phone": "555-2468", "email": "maria.rodriguez@example.com", "isAdmin": 0, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 5, "fullName": "Pedro López", "phone": "555-3698", "email": "pedro.lopez@example.com", "isAdmin": 1, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 6, "fullName": "Laura Martínez", "phone": "555-7531", "email": "laura.martinez@example.com", "isAdmin": 0, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 7, "fullName": "Javier Sánchez", "phone": "555-8024", "email": "javier.sanchez@example.com", "isAdmin": 1, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 8, "fullName": "Sofía Ramírez", "phone": "555-9753", "email": "sofia.ramirez@example.com", "isAdmin": 0, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 9, "fullName": "Diego Herrera", "phone": "555-6412", "email": "diego.herrera@example.com", "isAdmin": 1, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 10, "fullName": "Elena Castro", "phone": "555-8874", "email": "elena.castro@example.com", "isAdmin": 0, "password": "123456", "RolID": 1, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 11, "fullName": "Jose Paulino Rocha Martinez", "phone": "8713830872", "email": "josepaulinorocha890@gmail.com", "isAdmin": 1, "password": "$2a$10$sgrMMNzs/9R7HVDwEVm7nOCauYywvXokkc5YZAA2l3kYVA35h9f2G", "RolID": 2, "CambioContra": Buffer.from("AQ==", 'base64') },
      { "userId": 12, "fullName": "Victor Cañas", "phone": "1234567890", "email": "SupervidorDeTesoreros@gmail.com", "isAdmin": 0, "password": "123456", "RolID": 2, "CambioContra": Buffer.from("AA==", 'base64') },
      { "userId": 13, "fullName": "Monserrat Caballero", "phone": "", "email": "monserratcaballero.pabs.mxl@gmail.com", "isAdmin": 0, "password": "$2a$10$yi/b6jnre9wEsaZluBQMfOSV.BTKnjrTJp8urP4N/j7kGzGSQ.o7a", "RolID": 3, "CambioContra": Buffer.from("AQ==", 'base64') }
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete("usuarios", null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
