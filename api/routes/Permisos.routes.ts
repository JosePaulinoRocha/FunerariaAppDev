import { Router } from "express";
import { ObtenerRoles, ObtenerSecciones, CrearSeccion, UpdateSeccion, CrearRol, UpdateRol, ObtenerPermisosPorRol,
    AsignarPermisoRol, RemoverPermisoRol
 } from "../controllers/Permisos.controller";
import { authenticateJWT } from "../middlewares/authMiddleware";

const router = Router();

router.get('/GetRoles', authenticateJWT, ObtenerRoles);
router.get('/GetSecciones', authenticateJWT, ObtenerSecciones);
router.post('/CrearSeccion', authenticateJWT, CrearSeccion);
router.put('/UpdateSeccion', authenticateJWT, UpdateSeccion);
router.post('/CrearRol', authenticateJWT, CrearRol);
router.put('/UpdateRol', authenticateJWT, UpdateRol);

router.get('/GetPermisosPorRol/:rolId', authenticateJWT, ObtenerPermisosPorRol);
router.post('/AsignarPermisoRol', authenticateJWT, AsignarPermisoRol);
router.delete('/RemoverPermisoRol/:rolId/:permisoId', authenticateJWT, RemoverPermisoRol);

export default router;
