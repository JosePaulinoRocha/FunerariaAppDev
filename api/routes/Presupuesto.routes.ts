import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { EliminarPeriodoCongelado, ObtenerPresupuesto, updatePresupuesto, updatePresupuestoCuenta, ObtenerPresupuestoMensual, PostGastos, PutGastos, ObtenerEstatusGasto, updateGastoEstatus, ObtenerPasoUsuario, InsertPasoUsuario, InsertPeriodosCongelados, ObtenerPeriodosCongelados, ObtenerPresupuestoSemanal, ObtenerPresupuestoMensualExtraordinarioAprobado } from '../controllers/Presupuesto.controller';

const router = Router();

router.get('/GetPresupuesto', authenticateJWT, ObtenerPresupuesto);

router.get('/GetPresupuestoSemanal', authenticateJWT, ObtenerPresupuestoSemanal);

router.get('/GetPasoUsuario/:userId', authenticateJWT, ObtenerPasoUsuario);

router.post('/InsertPasoUsuario', authenticateJWT, InsertPasoUsuario);

router.get('/GetPresupuestoMensual', authenticateJWT, ObtenerPresupuestoMensual);

router.get('/GetPresupuestoMensualExtraordinarioAprobado', authenticateJWT, ObtenerPresupuestoMensualExtraordinarioAprobado);

router.post('/PostGastos', authenticateJWT, PostGastos);

router.put('/UpdateGastos', authenticateJWT, PutGastos);

router.put('/UpdatePresupuesto', authenticateJWT, updatePresupuesto);

router.put('/UpdatePresupuestoCuenta', authenticateJWT, updatePresupuestoCuenta);

router.put('/UpdateGastoEstatus', authenticateJWT, updateGastoEstatus);

router.get('/GetEstatus', authenticateJWT, ObtenerEstatusGasto);


// ----------------------------------cosas de presupuesto mensual--------------------------

router.get('/GetPeriodosCongelados', authenticateJWT, ObtenerPeriodosCongelados);

router.post('/InsertPeriodosCongelados', authenticateJWT, InsertPeriodosCongelados);

router.delete('/DeletePeriodoCongelado', authenticateJWT, EliminarPeriodoCongelado);


export default router;