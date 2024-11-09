import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuestoFrecuencia, ActualizarCuentaDeGastos } from '../controllers/Presupuesto-Mensual-Cuentas.controller';

const router = Router();

router.get('/GetPresupuestoMensualFrecuencia', authenticateJWT, ObtenerPresupuestoFrecuencia);

router.put('/ActualizarCuentaDeGastos', authenticateJWT, ActualizarCuentaDeGastos);


export default router;