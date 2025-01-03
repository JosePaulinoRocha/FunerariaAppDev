import mysql from 'mysql2/promise';

export async function connect() {
    return mysql.createConnection({
        host: 'systemabmxlifuneraria.com',  // Dirección del servidor MySQL
        port: 3309,  // Puerto predeterminado de MySQL
        user: 'root',  // Usuario de MySQL
        password: 'doflamingo011018',  // Contraseña del usuario
        database: 'systemab_funeraria_db',  // Nombre de la base de datos
        timezone: 'local',  // Configuración de zona horaria
    });
}
