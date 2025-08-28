// controllers/Usuarios.controller.ts
import { Request, Response } from "express";
import { connect } from "../BD/Accesos_BD";
import jwt from 'jsonwebtoken';
import bcrypt from 'bcryptjs';
import { jwtSecret, jwtExpiresIn } from '../config/jwtConfig';

export const Login = async (req: Request, res: Response) => {
  const { email, password } = req.body;
  let con;
  try {
    con = await connect();
    const query = 'SELECT * FROM usuarios WHERE email = ?';
    const [users] = await con.query(query, [email]) as any[];

    if (users.length > 0) {
      const user = users[0];
      console.log('Usuario encontrado:', user);

      // Comparar la contraseña ingresada con la encriptada en la DB
      const match = await bcrypt.compare(password, user.password);
      if (!match) {
        console.log('Contraseña incorrecta');
        return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
      }

      const payload = {
        userId: user.userId,
        isAdmin: user.isAdmin,
      };
      const token = jwt.sign(payload, jwtSecret, { expiresIn: jwtExpiresIn });

      // Eliminar password y CambioContra antes de enviar
      const { password: _, ...safeUser } = user;

      return res.json({ success: true, token, user: safeUser });
    } else {
      console.log('Usuario no encontrado');
      return res.status(401).json({ success: false, message: 'Credenciales incorrectas' });
    }
  } catch (error) {
    console.log('Error en Login:', error);
    return res.status(500).json({ success: false, message: 'Error en el servidor' });
  } finally {
    await con?.end();
  }
};

export const ObtenerUsuarios = async (req: Request, res: Response) => {
    let con;
    let result;
    try {
        con = await connect();
        let query = 'SELECT * FROM usuarios_vw';
        const Users = (await con.query(query))[0] as any[];
        result = Users;
    } catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = null;
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const PostUsers = async (req: Request, res: Response) => {
  let con;
  let result;
  const { fullName, phone, email, RolID, isAdmin } = req.body;
  const plainPassword = '123456'; 

  try {
      con = await connect();

      let query = 'SELECT COUNT(*) AS count FROM usuarios WHERE email = ?';
      const [rows] = await con.query(query, [email]);

      if ((rows as any).length > 0 && (rows as any)[0].count > 0) {
          result = { message: 'Email already exists. User not created.' };
      } else {
          // Encriptar contraseña
          const saltRounds = 10;
          const hashedPassword = await bcrypt.hash(plainPassword, saltRounds);

          query = 'INSERT INTO usuarios (fullName, phone, email, RolID, isAdmin, password) VALUES (?, ?, ?, ?, ?, ?)';
          const values = [fullName, phone, email, RolID, isAdmin, hashedPassword];
          await con.query(query, values);

          result = { message: 'User created successfully' };
      }
  } catch (error) {
      console.log('Error en Usuarios', error);
      result = { message: 'Error creating user' };
  } finally {
      await con?.end();
      return res.json(result);
  }
};


export const UpdateUser = async (req: Request, res: Response) => {
    let con;
    let result;
    const { userId, fullName, phone, email, RolID, isAdmin } = req.body;
    try {
        con = await connect();
        let query = 'UPDATE usuarios SET fullName = ?, phone = ?, email = ?, RolID = ?, isAdmin = ? WHERE userId = ?';
        const values = [fullName, phone, email, RolID, isAdmin, userId];
        await con.query(query, values);
        result = { message: 'User updated successfully' };
    } catch (error) {
        console.log('Error en Usuarios');
        console.log(error);
        result = { message: 'Error updating user' };
    } finally {
        await con?.end();
        return res.json(result);
    }
};

export const ObtenerRoles = async (req: Request, res: Response) => {
  let con;
  let result;
  try {
      con = await connect();
      let query = 'SELECT * FROM roles';
      const roles = (await con.query(query))[0] as any[];
      result = roles;
  } catch (error) {
      console.log('Error en roles');
      console.log(error);
      result = null;
  } finally {
      await con?.end();
      return res.json(result);
  }
};

export const UpdatePassword = async (req: Request, res: Response) => {
  const { userId, newPassword } = req.body;
  let con;
  try {
    con = await connect();

    // Encriptar la nueva contraseña
    const saltRounds = 10;
    const hashedPassword = await bcrypt.hash(newPassword, saltRounds);

    // Actualizar contraseña y establecer CambioContra a 1
    const query = 'UPDATE usuarios SET password = ?, CambioContra = 1 WHERE userId = ?';
    await con.query(query, [hashedPassword, userId]);

    return res.json({ success: true, message: 'Contraseña actualizada correctamente y cambio registrado.' });
  } catch (error) {
    console.log('Error al actualizar contraseña:', error);
    return res.status(500).json({ success: false, message: 'Error al actualizar la contraseña.' });
  } finally {
    await con?.end();
  }
};
