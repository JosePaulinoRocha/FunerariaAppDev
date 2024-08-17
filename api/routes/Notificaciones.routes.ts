import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerCombinacionesNotificaciones, ObtenerReconciliacionesNotificaciones, ObtenerIngresosNotificaciones } from '../controllers/Notificaciones.controller';

const router = Router();

//notificaciones de combinaciones
router.get('/GetCombinacionesNotificaciones', authenticateJWT, ObtenerCombinacionesNotificaciones);

router.get('/GetReconciliacionesNotificaciones', authenticateJWT, ObtenerReconciliacionesNotificaciones);

router.get('/GetIngresosNotificaciones', authenticateJWT, ObtenerIngresosNotificaciones);


export default router;