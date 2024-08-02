import mysql from 'mysql2/promise';

// Cambia la función connect para usar createConnection
export async function connect() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'funeraria_db',
        timezone: 'local',
    });
}
