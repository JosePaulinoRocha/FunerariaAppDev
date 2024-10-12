import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ImportarIngresosArchivo } from '../controllers/Importar-Ingresos-Archivo.controller';

const router = Router();

router.post('/importarIngresosArchivo/', authenticateJWT, ImportarIngresosArchivo);




export default router;