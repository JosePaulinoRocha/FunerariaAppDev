import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerCombinaciones, ObtenerIngresosParaConciliacion, ObtenerUltimaReconciliacion, CrearReconciliacion, ActualizarIngresos, ObtenerReconciliaciones, EliminarReconciliacion, ActualizarObservacion } from '../controllers/Combinaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetCombinaciones', authenticateJWT, ObtenerCombinaciones);
router.post('/GetIngresosParaConciliacion', authenticateJWT, ObtenerIngresosParaConciliacion);
router.get('/GetUltimaReconciliacion/:cuentaID', authenticateJWT, ObtenerUltimaReconciliacion);

router.post('/CreateReconciliacion', authenticateJWT, CrearReconciliacion);

router.put('/UpdateIngresos', authenticateJWT, ActualizarIngresos);

router.get('/GetReconciliaciones', authenticateJWT, ObtenerReconciliaciones);

router.delete('/DeleteReconciliacion/:reconciliacionID', authenticateJWT, EliminarReconciliacion);

router.put('/UpdateObservacion/:ingresoID', authenticateJWT, ActualizarObservacion);


export default router;