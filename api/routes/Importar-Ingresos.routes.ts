import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ImportarIngresos } from '../controllers/Importar-Ingresos.controller';

const router = Router();

router.post('/importarIngresos/', authenticateJWT, ImportarIngresos);


export default router;