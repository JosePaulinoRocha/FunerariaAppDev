"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
// routes/usuarios.routes.ts
const express_1 = require("express");
const Usuarios_controller_1 = require("../controllers/Usuarios.controller");
const authMiddleware_1 = require("../middlewares/authMiddleware");
const router = (0, express_1.Router)();
router.post('/login', Usuarios_controller_1.Login);
router.get('/GetUsuarios', authMiddleware_1.authenticateJWT, Usuarios_controller_1.ObtenerUsuarios);
router.post('/PostUsers', authMiddleware_1.authenticateJWT, Usuarios_controller_1.PostUsers);
router.put('/UpdateUser', authMiddleware_1.authenticateJWT, Usuarios_controller_1.UpdateUser);
exports.default = router;
