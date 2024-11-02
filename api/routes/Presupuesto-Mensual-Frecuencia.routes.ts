import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuestoFrecuencia, PostGastosFrecuencia, ObtenerPresupuestoFrecuenciaGuardados } from '../controllers/Presupuesto-Mensual-Frecuencia.controller';

const router = Router();

router.get('/GetPresupuestoMensualFrecuencia', authenticateJWT, ObtenerPresupuestoFrecuencia);

router.post('/PostGastosFrecuencia', authenticateJWT, PostGastosFrecuencia);

router.get('/GetPresupuestoMensualFrecuenciaGuardados', authenticateJWT, ObtenerPresupuestoFrecuenciaGuardados);


export default router;