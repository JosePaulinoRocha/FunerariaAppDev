import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerTransferencias, addTransferencia } from '../controllers/Transferencias.controller';

const router = Router();

router.get('/GetTransferencias', authenticateJWT, ObtenerTransferencias);

router.post('/RealizarTransferencia', authenticateJWT, addTransferencia);

export default router;