import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerCombinaciones, updateValidado } from '../controllers/Combinaciones.controller';

const router = Router();

//modulo combinaciones
router.get('/GetCombinaciones', authenticateJWT, ObtenerCombinaciones);

router.put('/UpdateValidado/:id', updateValidado);

export default router;