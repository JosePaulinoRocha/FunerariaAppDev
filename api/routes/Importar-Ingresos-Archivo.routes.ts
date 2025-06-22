import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ImportarIngresosArchivo, ImportarEgresosArchivo, ImportarEgresosArchivoImportacion, ImportarIngresosArchivoImportado, ImportarEgresosSistemaViejo, ImportarIngresosSistemaViejo } from '../controllers/Importar-Ingresos-Archivo.controller';

const router = Router();

router.post('/importarIngresosArchivo/', authenticateJWT, ImportarIngresosArchivo);

router.post('/importarEgresosArchivo/', authenticateJWT, ImportarEgresosArchivo);

router.post('/importarEgresosArchivoImportacion/', authenticateJWT, ImportarEgresosArchivoImportacion);

router.post('/importarEgresosSistemaViejo/', authenticateJWT, ImportarEgresosSistemaViejo);

router.post('/importarIngresosSistemaViejo/', authenticateJWT, ImportarIngresosSistemaViejo);

router.post('/importarIngresosArchivoImportado/', authenticateJWT, ImportarIngresosArchivoImportado);

export default router;