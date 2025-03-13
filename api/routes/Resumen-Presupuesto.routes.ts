// routes/usuarios.routes.ts
import { Router } from 'express';
import {ObtenerEgresosMensualesCategoriaCategoriaUnificada, ObtenerPresupuestoFrecuenciaCategoriaCategoriaUnificada, ObtenerPresupuestoSemanalCategoriaCategoriaUnificada, ObtenerGastoExtraordinarioCategoriaCategoriaUnificada, ObtenerEgresoMensualSegmentosCategoriaUnificada, ObtenerPresupuestoFrecuenciaAprobadosMesActualCategoriaUnificada, ObtenerPresupuestoSemanalCategoriaUnificada, ObtenerPresupuestoMensualExtraordinarioAprobadoCategoriaUnificada, ObtenerEgresosMensualesConcepto, ObtenerGastoExtraordinarioSubcategoria, ObtenerPresupuestoSemanalSubcategoria,ObtenerPresupuestoFrecuenciaSubcategoria,ObtenerEgresosMensualesSubcategoria, ObtenerEgresosMensualesCategoria, ObtenerPresupuestoFrecuenciaCategoria, ObtenerGastoExtraordinarioCategoria, ObtenerPresupuestoSemanalCategoria, ObtenerResumenSegmentos, ObtenerEgresoMensualSegmentos, ObtenerPresupuestoMensualExtraordinarioAprobado, ObtenerPresupuestoSemanal, ObtenerPresupuestoFrecuenciaAprobadosMesActual } from '../controllers/Resumen-Presupuesto.controller';
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


router.get('/gasto-extraordinario-categoriaUnificada/:categoriaID', authenticateJWT, ObtenerGastoExtraordinarioCategoriaCategoriaUnificada);
router.get('/presupuesto-semanal-categoriaUnificada/:categoriaID', authenticateJWT, ObtenerPresupuestoSemanalCategoriaCategoriaUnificada);
router.get('/presupuesto-frecuencia-categoriaUnificada/:categoriaID', authenticateJWT, ObtenerPresupuestoFrecuenciaCategoriaCategoriaUnificada);
router.get('/egresos-mensuales-categoriaUnificada/:categoriaID', authenticateJWT, ObtenerEgresosMensualesCategoriaCategoriaUnificada);


router.get('/gasto-extraordinario-subcategoria/:segmentoID/:categoriaID/:subcategoriaID', authenticateJWT, ObtenerGastoExtraordinarioSubcategoria);
router.get('/presupuesto-semanal-subcategoria/:segmentoID/:categoriaID/:subcategoriaID', authenticateJWT, ObtenerPresupuestoSemanalSubcategoria);
router.get('/presupuesto-frecuencia-subcategoria/:segmentoID/:categoriaID/:subcategoriaID', authenticateJWT, ObtenerPresupuestoFrecuenciaSubcategoria);
router.get('/egresos-mensuales-subcategoria/:segmentoID/:categoriaID/:subcategoriaID', authenticateJWT, ObtenerEgresosMensualesSubcategoria);


router.get('/egresos-mensuales-concepto/:segmentoID/:categoriaID/:subcategoriaID/:conceptoID', authenticateJWT, ObtenerEgresosMensualesConcepto);



router.get('/GetPresupuestoMensualExtraordinarioAprobado', authenticateJWT, ObtenerPresupuestoMensualExtraordinarioAprobadoCategoriaUnificada);
router.get('/GetPresupuestoSemanal', authenticateJWT, ObtenerPresupuestoSemanalCategoriaUnificada);
router.get('/GetPresupuestoMensualFrecuenciaAprobadosMesActual', authenticateJWT, ObtenerPresupuestoFrecuenciaAprobadosMesActualCategoriaUnificada);
router.get('/GetEgresosMensualSegmentos', authenticateJWT, ObtenerEgresoMensualSegmentosCategoriaUnificada);


export default router;
