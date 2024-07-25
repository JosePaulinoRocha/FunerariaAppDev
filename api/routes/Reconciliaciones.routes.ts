import { Router } from 'express';

import { ObtenerIngresos, ObtenerIngresosParaConciliacion } from '../controllers/Reconciliaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetIngresos', ObtenerIngresos);
router.post('/GetIngresosParaConciliacion', ObtenerIngresosParaConciliacion);

export default router;