import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerCombinaciones, updateValidado, EliminarCombinacion } from '../controllers/Combinaciones.controller';

const router = Router();

//modulo combinaciones
router.get('/GetCombinaciones', authenticateJWT, ObtenerCombinaciones);

router.put('/UpdateValidado/:id', authenticateJWT, updateValidado);

router.delete('/DeleteCombinaciones/:combinacionID', authenticateJWT, EliminarCombinacion);

export default router;