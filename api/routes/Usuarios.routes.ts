// routes/usuarios.routes.ts
import { Router } from 'express';
import { ObtenerUsuarios, PostUsers, UpdateUser, Login, ObtenerRoles } from '../controllers/Usuarios.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post('/login', Login);

router.get('/GetUsuarios', authenticateJWT, ObtenerUsuarios);
router.post('/PostUsers', authenticateJWT, PostUsers);
router.put('/UpdateUser', authenticateJWT, UpdateUser);

router.get('/GetRoles', authenticateJWT, ObtenerRoles);

export default router;
