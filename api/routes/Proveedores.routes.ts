import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerProveedores, addProveedor, updateProveedorStatus, updateProveedor } from '../controllers/Proveedores.controller';

const router = Router();

router.get('/GetProveedores', authenticateJWT, ObtenerProveedores);

router.post('/AddProveedor', authenticateJWT, addProveedor);

router.put('/UpdateProveedor', authenticateJWT, updateProveedor);

router.put('/UpdateProveedorStatus', authenticateJWT, updateProveedorStatus);

export default router;