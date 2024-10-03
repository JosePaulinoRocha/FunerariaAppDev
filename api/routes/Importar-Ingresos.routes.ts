import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ImportarIngresos,ObtenerHistorialIngresos, CrearHistorialIngresos } from '../controllers/Importar-Ingresos.controller';

const router = Router();

router.post('/importarIngresos/', authenticateJWT, ImportarIngresos);

router.get('/historialIngresos/', authenticateJWT, ObtenerHistorialIngresos);

router.post('/historialIngresosAdd/', authenticateJWT, CrearHistorialIngresos);



export default router;