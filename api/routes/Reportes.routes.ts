import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerReporteEgresos, ActualizarObservacion, ObtenerReporteMesActual, ObtenerReportePresupuestoExtraordinario, ObtenerReporteIngresos, ObtenerReportePorFecha, ObtenerReportePresupuestoSemanal, ObtenerReportePresupuestoPeriodico } from '../controllers/Reportes.controller';

const router = Router();

router.get('/GetReporteEgresos', authenticateJWT, ObtenerReporteEgresos);

router.get('/GetReporteIngresos', authenticateJWT, ObtenerReporteIngresos);

router.get('/GetReportePorFecha', authenticateJWT, ObtenerReportePorFecha);

router.get('/GetReportePresupuestoSemanal', authenticateJWT, ObtenerReportePresupuestoSemanal);

router.get('/GetReportePresupuestoPeriodico', authenticateJWT, ObtenerReportePresupuestoPeriodico);

router.get('/GetReportePresupuestoExtraordinario', authenticateJWT, ObtenerReportePresupuestoExtraordinario);

router.get('/GetReporteMesActual', authenticateJWT, ObtenerReporteMesActual);

router.put('/UpdateObservacion', authenticateJWT, ActualizarObservacion);


export default router;