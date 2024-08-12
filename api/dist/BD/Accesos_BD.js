"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.connect = connect;
const promise_1 = __importDefault(require("mysql2/promise"));
// Cambia la función connect para usar createConnection
async function connect() {
    return promise_1.default.createConnection({
        host: 'localhost',
        user: 'root',
        password: '',
        database: 'funeraria_db',
        timezone: 'local',
    });
}
