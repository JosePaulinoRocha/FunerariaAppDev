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

router.get('/GetEgresosMensuales', authenticateJWT, ObtenerEgresosMensuales);

router.get('/GetEgresosMensualSemanales', authenticateJWT, ObtenerEgresosMensualSemanales);

router.get('/GetIngresosMensualSemanales', authenticateJWT, ObtenerIngresosMensualSemanales);

router.get('/GetEgresosMensualSegmentos', authenticateJWT, ObtenerEgresoMensualSegmentos);

router.get('/GetIngresosMensualSegmentos', authenticateJWT, ObtenerIngresoMensualSegmentos);

router.get('/GetUtilidadesNetasMensuales', authenticateJWT, ObtenerUtilidadesNetasMensuales);

router.get('/GetIngresoPasado', authenticateJWT, ObtenerIngresoPasado);

router.get('/GetIngresosActuales', authenticateJWT, ObtenerIngresosMensuales);

router.get('/GetEgresosPorCategoriaMensuales', authenticateJWT, ObtenerEgresosPorCategoriaMensuales);

router.get('/GetIngresosPorCategoriaMensuales', authenticateJWT, ObtenerIngresosPorCategoriaMensuales);

export default router;