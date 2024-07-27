import { Router } from 'express';

import { ObtenerIngresos, ObtenerIngresosParaConciliacion, ObtenerUltimaReconciliacion } from '../controllers/Reconciliaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetIngresos', ObtenerIngresos);
router.post('/GetIngresosParaConciliacion', ObtenerIngresosParaConciliacion);
router.get('/GetUltimaReconciliacion/:cuentaID', ObtenerUltimaReconciliacion);

export default router;