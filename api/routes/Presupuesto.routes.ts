import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuesto, updatePresupuesto, updatePresupuestoCuenta, ObtenerPresupuestoMensual, PostGastos, PutGastos, ObtenerEstatusGasto, updateGastoEstatus } from '../controllers/Presupuesto.controller';

const router = Router();

router.get('/GetPresupuesto', authenticateJWT, ObtenerPresupuesto);

router.get('/GetPresupuestoMensual', authenticateJWT, ObtenerPresupuestoMensual);

router.post('/PostGastos', authenticateJWT, PostGastos);

router.put('/UpdateGastos', authenticateJWT, PutGastos);

router.put('/UpdatePresupuesto', authenticateJWT, updatePresupuesto);

router.put('/UpdatePresupuestoCuenta', authenticateJWT, updatePresupuestoCuenta);

router.put('/UpdateGastoEstatus', authenticateJWT, updateGastoEstatus);


router.get('/GetEstatus', authenticateJWT, ObtenerEstatusGasto);


export default router;