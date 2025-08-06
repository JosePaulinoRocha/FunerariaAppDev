import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { GetResumenIngresosEgresos, GetUltimaFechaConDatos, GetResumenIngresosReconciliados, GetResumenEgresosReconciliados, GetUltimaFechaConciliacion } from '../controllers/Compilaciones.controller';

const router = Router();

router.get('/GetResumenIngresosEgresos', authenticateJWT, GetResumenIngresosEgresos);
router.get('/GetUltimaFechaConDatos', authenticateJWT, GetUltimaFechaConDatos);

router.get('/GetUltimaFechaConciliacion', authenticateJWT, GetUltimaFechaConciliacion);
router.get('/GetResumenIngresosReconciliados', authenticateJWT, GetResumenIngresosReconciliados);
router.get('/GetResumenEgresosReconciliados', authenticateJWT, GetResumenEgresosReconciliados);

export default router;