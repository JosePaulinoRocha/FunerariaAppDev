import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerCuentasCajaChica, ObtenerCuentasBancarias ,ObtenerIngresos, ObtenerIngresosParaConciliacion, ObtenerUltimaReconciliacion, CrearReconciliacion, ActualizarIngresos, ObtenerReconciliaciones, EliminarReconciliacion, ActualizarObservacion, ReintegrarReconciliacion, ReintegrarMontoReconciliacion } from '../controllers/Reconciliaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetIngresos', authenticateJWT, ObtenerIngresos);
router.post('/GetIngresosParaConciliacion', authenticateJWT, ObtenerIngresosParaConciliacion);
router.get('/GetUltimaReconciliacion/:cuentaID', authenticateJWT, ObtenerUltimaReconciliacion);

router.post('/CreateReconciliacion', authenticateJWT, CrearReconciliacion);

router.put('/UpdateIngresos', authenticateJWT, ActualizarIngresos);

router.get('/GetReconciliaciones', authenticateJWT, ObtenerReconciliaciones);

router.delete('/DeleteReconciliacion/:reconciliacionID', authenticateJWT, EliminarReconciliacion);

router.put('/UpdateObservacion/:ingresoID', authenticateJWT, ActualizarObservacion);

router.get('/ReintegrarReconciliacion/:reconciliacionID', authenticateJWT, ReintegrarReconciliacion);

router.post('/ReintegrarMontoReconciliacion', authenticateJWT, ReintegrarMontoReconciliacion);

// Ruta para obtener cuentas de caja chica
router.get('/GetCuentasCajaChica', authenticateJWT, ObtenerCuentasCajaChica);

// Ruta para obtener cuentas bancarias
router.get('/GetCuentasBancarias', authenticateJWT, ObtenerCuentasBancarias);

export default router;