import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerReporteEgresos, ObtenerReportePresupuestoExtraordinario, ObtenerReporteIngresos, ObtenerReportePorFecha, ObtenerReportePresupuestoSemanal, ObtenerReportePresupuestoPeriodico } from '../controllers/Reportes.controller';

const router = Router();

router.get('/GetReporteEgresos', authenticateJWT, ObtenerReporteEgresos);

router.get('/GetReporteIngresos', authenticateJWT, ObtenerReporteIngresos);

router.get('/GetReportePorFecha', authenticateJWT, ObtenerReportePorFecha);

router.get('/GetReportePresupuestoSemanal', authenticateJWT, ObtenerReportePresupuestoSemanal);

router.get('/GetReportePresupuestoPeriodico', authenticateJWT, ObtenerReportePresupuestoPeriodico);

router.get('/GetReportePresupuestoExtraordinario', authenticateJWT, ObtenerReportePresupuestoExtraordinario);


export default router;