import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuesto, updatePresupuesto } from '../controllers/Presupuesto.controller';

const router = Router();

router.get('/GetPresupuesto', authenticateJWT, ObtenerPresupuesto);


router.put('/UpdatePresupuesto', authenticateJWT, updatePresupuesto);


export default router;