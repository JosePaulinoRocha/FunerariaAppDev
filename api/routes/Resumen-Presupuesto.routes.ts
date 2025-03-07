// routes/usuarios.routes.ts
import { Router } from 'express';
import {ObtenerEgresosMensualesCategoria, ObtenerPresupuestoFrecuenciaCategoria, ObtenerGastoExtraordinarioCategoria, ObtenerPresupuestoSemanalCategoria, ObtenerResumenSegmentos, ObtenerEgresoMensualSegmentos, ObtenerPresupuestoMensualExtraordinarioAprobado, ObtenerPresupuestoSemanal, ObtenerPresupuestoFrecuenciaAprobadosMesActual } from '../controllers/Resumen-Presupuesto.controller';
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.get('/GetResumenSegmentos', authenticateJWT, ObtenerResumenSegmentos);

router.get('/GetPresupuestoMensualExtraordinarioAprobado/:segmentoID', authenticateJWT, ObtenerPresupuestoMensualExtraordinarioAprobado);

router.get('/GetPresupuestoSemanal/:segmentoID', authenticateJWT, ObtenerPresupuestoSemanal);

router.get('/GetPresupuestoMensualFrecuenciaAprobadosMesActual/:segmentoID', authenticateJWT, ObtenerPresupuestoFrecuenciaAprobadosMesActual);

router.get('/GetEgresosMensualSegmentos/:segmentoID', authenticateJWT, ObtenerEgresoMensualSegmentos);


router.get('/gasto-extraordinario/:segmentoID/:categoriaID', authenticateJWT, ObtenerGastoExtraordinarioCategoria);
router.get('/presupuesto-semanal/:segmentoID/:categoriaID', authenticateJWT, ObtenerPresupuestoSemanalCategoria);
router.get('/presupuesto-frecuencia/:segmentoID/:categoriaID', authenticateJWT, ObtenerPresupuestoFrecuenciaCategoria);
router.get('/egresos-mensuales/:segmentoID/:categoriaID', authenticateJWT, ObtenerEgresosMensualesCategoria);


export default router;
