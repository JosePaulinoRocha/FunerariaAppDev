import { Router } from 'express';

import { ObtenerIngresos } from '../controllers/Reconciliaciones.controller';

const router = Router();

//modulo reconciliaciones
router.get('/GetIngresos', ObtenerIngresos);


export default router;