// scripts/generate-seeders-from-db.js
'use strict';
const mysql = require('mysql2/promise');
const fs = require('fs');
const path = require('path');

const config = {
  host: 'localhost',
  user: 'root',
  password: '',
  database: 'systemab_funeraria_db',
  port: 3306,
};

const seederDir = path.resolve(__dirname, '../seeders');
if (!fs.existsSync(seederDir)) fs.mkdirSync(seederDir, { recursive: true });

function ts() {
  const d = new Date();
  return d.toISOString().replace(/[-:T.]/g,'').slice(0,14); // YYYYMMDDHHMMSS
}
function safeFilename(table) {
  return `${ts()}-seed-${table.replace(/\W+/g,'_')}.js`;
}

function valueToCode(v) {
  if (v === null || v === undefined) return 'null';
  if (Buffer.isBuffer(v)) return `Buffer.from(${JSON.stringify(v.toString('base64'))}, 'base64')`;
  if (v instanceof Date) return `new Date(${JSON.stringify(v.toISOString())})`;
  if (typeof v === 'number' || typeof v === 'boolean') return String(v);
  if (typeof v === 'object') return JSON.stringify(v);
  if (typeof v === 'string') {
    if (/^\d{4}-\d{2}-\d{2} \d{2}:\d{2}:\d{2}$/.test(v)) {
      return `new Date(${JSON.stringify(v.replace(' ', 'T'))})`;
    }
    return JSON.stringify(v);
  }
  return JSON.stringify(String(v));
}

(async function main() {
  const conn = await mysql.createConnection(config);
  const [tables] = await conn.query(
    "SELECT table_name FROM information_schema.tables WHERE table_schema = ? AND table_type = 'BASE TABLE'",
    [config.database]
  );
  const exclude = new Set(['migrations','sequelize_meta','SequelizeMeta']);
  for (const row of tables) {
    const table = row.TABLE_NAME || row.table_name;
    if (exclude.has(table)) continue;
    const [rows] = await conn.query(`SELECT * FROM \`${table}\``);
    const rowsCode = rows.map(r => {
      const entries = Object.entries(r).map(([k,v]) => `${JSON.stringify(k)}: ${valueToCode(v)}`);
      return `{ ${entries.join(', ')} }`;
    }).join(',\n      ');

    const content = `'use strict';
/**
 * Auto-generated seeder for table: ${table}
 * Generated at ${new Date().toISOString()}
 */
module.exports = {
  async up (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkInsert(${JSON.stringify(table)}, [
      ${rowsCode}
    ], {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  },

  async down (queryInterface, Sequelize) {
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 0;');
    await queryInterface.bulkDelete(${JSON.stringify(table)}, null, {});
    await queryInterface.sequelize.query('SET FOREIGN_KEY_CHECKS = 1;');
  }
};
`;
    const filename = safeFilename(table);
    fs.writeFileSync(path.join(seederDir, filename), content, 'utf8');
    console.log('Wrote', filename, `(${rows.length} rows)`);
  }
  await conn.end();
  console.log('Done — revisa la carpeta "seeders" y ejecuta: npx sequelize-cli db:seed:all (env: development)');
})().catch(err => { console.error(err); process.exit(1); });
