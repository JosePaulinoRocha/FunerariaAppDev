import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuestoFrecuencia, PostGastosFrecuencia, ObtenerPresupuestoFrecuenciaGuardados, ObtenerPresupuestoFrecuenciaAprobados, ObtenerPresupuestoFrecuenciaAprobadosMesActual, ObtenerIngresosMensualesCuentas } from '../controllers/Presupuesto-Mensual-Frecuencia.controller';

const router = Router();

router.get('/GetPresupuestoMensualFrecuencia', authenticateJWT, ObtenerPresupuestoFrecuencia);

router.get('/GetPresupuestoMensualFrecuenciaAprobados', authenticateJWT, ObtenerPresupuestoFrecuenciaAprobados);

router.get('/GetPresupuestoMensualFrecuenciaAprobadosMesActual', authenticateJWT, ObtenerPresupuestoFrecuenciaAprobadosMesActual);

router.post('/PostGastosFrecuencia', authenticateJWT, PostGastosFrecuencia);

router.get('/GetPresupuestoMensualFrecuenciaGuardados', authenticateJWT, ObtenerPresupuestoFrecuenciaGuardados);

router.get('/GetIngresosMensualesCuentas', authenticateJWT, ObtenerIngresosMensualesCuentas);


export default router;