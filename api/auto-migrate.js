const { Sequelize } = require('sequelize');
const autoMigrations = require('sequelize-auto-migrations');

const sequelize = new Sequelize('systemab_funeraria_db', 'root', '', {
  host: '127.0.0.1',
  dialect: 'mysql',
  logging: false
});

(async () => {
  try {
    await sequelize.authenticate();
    console.log('Conectado a la DB');

    const migrations = new autoMigrations.Migrator(sequelize, './migrations');

    // Este comando compara la DB con los modelos y crea migraciones automáticamente
    await migrations.create();

    console.log('Migraciones generadas automáticamente.');
    process.exit(0);
  } catch (err) {
    console.error(err);
    process.exit(1);
  }
})();
