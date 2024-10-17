import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuesto, updatePresupuesto, updatePresupuestoCuenta } from '../controllers/Presupuesto.controller';

const router = Router();

router.get('/GetPresupuesto', authenticateJWT, ObtenerPresupuesto);

router.put('/UpdatePresupuesto', authenticateJWT, updatePresupuesto);

router.put('/UpdatePresupuestoCuenta', authenticateJWT, updatePresupuestoCuenta);


export default router;