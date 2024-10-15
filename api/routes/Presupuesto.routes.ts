import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuesto, addProveedor, updateProveedorStatus, updateProveedor } from '../controllers/Presupuesto.controller';

const router = Router();

router.get('/GetPresupuesto', authenticateJWT, ObtenerPresupuesto);

router.post('/AddProveedor', authenticateJWT, addProveedor);

router.put('/UpdateProveedor', authenticateJWT, updateProveedor);

router.put('/UpdateProveedorStatus', authenticateJWT, updateProveedorStatus);

export default router;