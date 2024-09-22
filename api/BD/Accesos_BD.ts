import mysql from 'mysql2/promise';

// Cambia la función connect para usar createConnection
// export async function connect() {
//     return mysql.createConnection({
//         host: 'localhost',
//         user: 'systemab_funeraria_user',
//         password: 'zTSda1Mi8lKI',
//         database: 'systemab_funeraria_db',
//         timezone: 'local',
//     });
// }


export async function connect() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'funeraria_db',
        timezone: 'local',
    });
}
