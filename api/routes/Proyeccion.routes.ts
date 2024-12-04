import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerEgresoActual, ObtenerIngresoActual, ObtenerIngresosMensuales, ObtenerEgresosPorCategoriaMensuales, ObtenerEgresoPasado, ObtenerIngresoPasado } from '../controllers/Proyeccion.controller';

const router = Router();

router.get('/GetEgresoActual', authenticateJWT, ObtenerEgresoActual);

router.get('/GetEgresoPasado', authenticateJWT, ObtenerEgresoPasado);

router.get('/GetIngresoActual', authenticateJWT, ObtenerIngresoActual);

router.get('/GetIngresoPasado', authenticateJWT, ObtenerIngresoPasado);

router.get('/GetIngresosActuales', authenticateJWT, ObtenerIngresosMensuales);

router.get('/GetEgresosPorCategoriaMensuales', authenticateJWT, ObtenerEgresosPorCategoriaMensuales);

export default router;