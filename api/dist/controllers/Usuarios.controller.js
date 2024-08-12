"use strict";
var __importDefault = (this && this.__importDefault) || function (mod) {
    return (mod && mod.__esModule) ? mod : { "default": mod };
};
Object.defineProperty(exports, "__esModule", { value: true });
exports.UpdateUser = exports.PostUsers = exports.ObtenerUsuarios = exports.Login = void 0;
const Accesos_BD_1 = require("../BD/Accesos_BD");
const jsonwebtoken_1 = __importDefault(require("jsonwebtoken"));
const bcryptjs_1 = __importDefault(require("bcryptjs"));
const jwtConfig_1 = require("../config/jwtConfig");
const Login = async (req, res) => {
    const { email, password } = req.body;
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        const query = 'SELECT * FROM usuarios WHERE email = ?';
        const users = (await con.query(query, [email]))[0];
        if (users.length > 0) {
            const user = users[0];
            const isMatch = await bcryptjs_1.default.compare(password, user.password);
            if (isMatch) {
                const payload = {
                    userId: user.userId,
                    isAdmin: user.isAdmin,
                };
                const token = jsonwebtoken_1.default.sign(payload, jwtConfig_1.jwtSecret, { expiresIn: jwtConfig_1.jwtExpiresIn });
                return res.json({ success: true, token });
            }
            else {
                return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
            }
        }
        else {
            return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
        }
    }
    catch (error) {
        console.log('Error en Login');
        console.log(error);
        return res.status(500).json({ success: false, message: 'Error en el servidor' });
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
    }
};
exports.Login = Login;
const ObtenerUsuarios = async (req, res) => {
    let con;
    let result;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'SELECT * FROM usuarios';
        const Users = (await con.query(query))[0];
        result = Users;
    }
    catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.ObtenerUsuarios = ObtenerUsuarios;
const PostUsers = async (req, res) => {
    let con;
    let result;
    const { fullName, phone, email, isAdmin } = req.body;
    try {
        con = await (0, Accesos_BD_1.connect)();
        // Verificar si ya existe un usuario con el mismo email
        let query = 'SELECT COUNT(*) AS count FROM usuarios WHERE email = ?';
        const [rows] = await con.query(query, [email]);
        // rows debería contener el resultado de la consulta
        if (rows.length > 0 && rows[0].count > 0) {
            result = { message: 'Email already exists. User not created.' };
        }
        else {
            // Si no existe, proceder con la inserción
            query = 'INSERT INTO usuarios (fullName, phone, email, isAdmin, password) VALUES (?, ?, ?, ?, ?)';
            const values = [fullName, phone, email, isAdmin, 123456];
            await con.query(query, values);
            result = { message: 'User created successfully' };
        }
    }
    catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = { message: 'Error creating user' };
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.PostUsers = PostUsers;
const UpdateUser = async (req, res) => {
    let con;
    let result;
    const { userId, fullName, phone, email, isAdmin } = req.body;
    try {
        con = await (0, Accesos_BD_1.connect)();
        let query = 'UPDATE usuarios SET fullName = ?, phone = ?, email = ?, isAdmin = ? WHERE userId = ?';
        const values = [fullName, phone, email, isAdmin, userId];
        await con.query(query, values);
        result = { message: 'User updated successfully' };
    }
    catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = { message: 'Error updating user' };
    }
    finally {
        await (con === null || con === void 0 ? void 0 : con.end());
        return res.json(result);
    }
};
exports.UpdateUser = UpdateUser;
