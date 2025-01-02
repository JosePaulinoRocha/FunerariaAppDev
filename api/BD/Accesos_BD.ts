import mysql from 'mysql2/promise';

// export async function connect() {
//     return mysql.createConnection({
//         host: 'systemabmxli.com',
//         user: 'systemab_funeraria_user',
//         password: 'zTSda1Mi8lKI',
//         database: 'systemab_funeraria_db',
//         timezone: 'local',
//     });
// }


// export async function connect() {
//     return mysql.createConnection({
//         host: 'localhost',
//         user: 'root',
//         password: '',
//         database: 'systemab_funeraria_db',
//         timezone: 'local',
//     });
// }


export async function connect() {
    return mysql.createConnection({
        host: '66.179.189.37',
        user: 'root',
        password: 'wWi8aiDa',
        database: 'systemab_funeraria_db',
        timezone: 'local',
    });
}