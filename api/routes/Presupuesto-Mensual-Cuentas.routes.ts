import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerPresupuestoFrecuencia, ActualizarCuentaDeGastos, ActualizarCuentaDeGastosSemanales, ActualizarCuentaDeGastosFrecuencia } from '../controllers/Presupuesto-Mensual-Cuentas.controller';

const router = Router();

router.get('/GetPresupuestoMensualFrecuencia', authenticateJWT, ObtenerPresupuestoFrecuencia);

router.put('/ActualizarCuentaDeGastos', authenticateJWT, ActualizarCuentaDeGastos);

router.put('/ActualizarCuentaDeGastosSemanales', authenticateJWT, ActualizarCuentaDeGastosSemanales);

router.put('/ActualizarCuentaDeGastosFrecuencia', authenticateJWT, ActualizarCuentaDeGastosFrecuencia);


export default router;