import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerEgresoActual, ObtenerIngresosPorCategoriaMensuales, ObtenerIngresosMensualSemanales, ObtenerEgresosMensualSemanales, ObtenerIngresoMensualSegmentos, ObtenerIngresoActual, ObtenerIngresosMensuales, ObtenerEgresosPorCategoriaMensuales, ObtenerEgresoPasado, ObtenerIngresoPasado, ObtenerEgresosMensuales, ObtenerUtilidadesNetasMensuales, ObtenerEgresoMensualSegmentos, ObtenerFiltros, ObtenerIngresosPorFiltros, ObtenerEgresosPorFiltros, ObtenerUtilidadesPorFiltros } from '../controllers/Proyeccion.controller';

const router = Router();
router.get('/GetFiltros', authenticateJWT ,ObtenerFiltros);

router.post('/ObtenerIngresosPorFiltros', authenticateJWT ,ObtenerIngresosPorFiltros);

router.post('/ObtenerEgresosPorFiltros', authenticateJWT, ObtenerEgresosPorFiltros);

router.post('/ObtenerUtilidadesPorFiltros', authenticateJWT, ObtenerUtilidadesPorFiltros);

router.get('/GetEgresoActual', authenticateJWT, ObtenerEgresoActual);

router.get('/GetEgresoPasado', authenticateJWT, ObtenerEgresoPasado);

router.get('/GetIngresoActual', authenticateJWT, ObtenerIngresoActual);

router.get('/GetEgresosMensuales/:estado', authenticateJWT, ObtenerEgresosMensuales);

router.get('/GetEgresosMensualSemanales/:filtro', authenticateJWT, ObtenerEgresosMensualSemanales);

router.get('/GetIngresosMensualSemanales/:filtro', authenticateJWT, ObtenerIngresosMensualSemanales);

router.get('/GetEgresosMensualSegmentos/:filtro', authenticateJWT, ObtenerEgresoMensualSegmentos);

router.get('/GetIngresosMensualSegmentos/:filtroReconciliado', authenticateJWT, ObtenerIngresoMensualSegmentos);

router.get('/GetUtilidadesNetasMensuales', authenticateJWT, ObtenerUtilidadesNetasMensuales);

router.get('/GetIngresoPasado', authenticateJWT, ObtenerIngresoPasado);

router.get('/GetIngresosActuales/:filtro', authenticateJWT, ObtenerIngresosMensuales);

router.get('/GetEgresosPorCategoriaMensuales/:filtro', authenticateJWT, ObtenerEgresosPorCategoriaMensuales);

router.get('/GetIngresosPorCategoriaMensuales/:filtro', authenticateJWT, ObtenerIngresosPorCategoriaMensuales);


export default router;