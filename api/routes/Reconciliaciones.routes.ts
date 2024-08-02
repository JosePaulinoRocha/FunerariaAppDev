import { Router } from 'express';

import { ObtenerIngresos, ObtenerIngresosParaConciliacion, ObtenerUltimaReconciliacion, CrearReconciliacion, ActualizarIngresos, ObtenerReconciliaciones, EliminarReconciliacion, ActualizarObservacion } from '../controllers/Reconciliaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetIngresos', ObtenerIngresos);
router.post('/GetIngresosParaConciliacion', ObtenerIngresosParaConciliacion);
router.get('/GetUltimaReconciliacion/:cuentaID', ObtenerUltimaReconciliacion);

router.post('/CreateReconciliacion', CrearReconciliacion);

router.put('/UpdateIngresos', ActualizarIngresos);

router.get('/GetReconciliaciones', ObtenerReconciliaciones);

router.delete('/DeleteReconciliacion/:reconciliacionID', EliminarReconciliacion);

router.put('/UpdateObservacion/:ingresoID', ActualizarObservacion);


export default router;