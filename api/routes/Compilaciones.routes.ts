import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { GetResumenIngresosEgresos, GetUltimaFechaConDatos } from '../controllers/Compilaciones.controller';

const router = Router();

router.get('/GetResumenIngresosEgresos', authenticateJWT, GetResumenIngresosEgresos);
router.get('/GetUltimaFechaConDatos', authenticateJWT, GetUltimaFechaConDatos);

export default router;