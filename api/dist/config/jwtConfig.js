"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.jwtExpiresIn = exports.jwtSecret = void 0;
// config/jwtConfig.ts
exports.jwtSecret = 'your_secret_key'; // Debe ser una cadena secreta segura
exports.jwtExpiresIn = '1h'; // Duración del token
