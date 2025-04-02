import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ImportarIngresosArchivo, ImportarEgresosArchivo, ImportarEgresosArchivoImportacion } from '../controllers/Importar-Ingresos-Archivo.controller';

const router = Router();

router.post('/importarIngresosArchivo/', authenticateJWT, ImportarIngresosArchivo);

router.post('/importarEgresosArchivo/', authenticateJWT, ImportarEgresosArchivo);

router.post('/importarEgresosArchivoImportacion/', authenticateJWT, ImportarEgresosArchivoImportacion);

export default router;