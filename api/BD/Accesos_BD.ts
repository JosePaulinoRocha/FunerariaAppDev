import mysql from 'mysql2/promise';

// export async function connect() {
//     return mysql.createConnection({
//         host: 'systemabmxlifuneraria.com',
//         port: 3306, 
//         user: 'root',  
//         password: 'doflamingo011018',
//         database: 'systemab_funeraria_db', 
//         timezone: 'local', 
//     });
// }



export async function connect() {
    return mysql.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'systemab_funeraria_db',
        timezone: 'local',
    });
}