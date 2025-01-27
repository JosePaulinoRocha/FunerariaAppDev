import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerReporteEgresos, ObtenerReporteIngresos, ObtenerReportePorFecha  } from '../controllers/Reportes.controller';

const router = Router();

router.get('/GetReporteEgresos', authenticateJWT, ObtenerReporteEgresos);

router.get('/GetReporteIngresos', authenticateJWT, ObtenerReporteIngresos);

router.get('/GetReportePorFecha', authenticateJWT, ObtenerReportePorFecha);

export default router;