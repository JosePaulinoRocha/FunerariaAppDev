import { Router, Request, Response } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import multer, { FileFilterCallback } from 'multer';
import fs from 'fs'; // Importa el módulo fs
import path from 'path'; // Importa el módulo path
import zlib from 'zlib';
import { ActualizarDescripcion, ObtenerIngresos, ObtenerIngresosParametros, ObtenerIngresosNoReconciliados, ObtenerIngresosPorFiltro, ObtenerIngresosOptimizado, PostIngresos, UpdateIngresos, ObtenerConceptos, ObtenerSegmentos, ObtenerCategorias, ObtenerSubcategorias, ObtenerUsuarios, ObtenerCombinaciones, ObtenerEstatus, updateCombination, ObtenerCuentas, ObtenerCombinacionesSegmento, PostIngresosComprobante, asignarCuenta, asignarCuentasMasivas, ObtenerProveedores, asignarCuentaContable, ObtenerCuentasContables } from '../controllers/Ingresos.controllers';

const router = Router();

// Configuración de multer para manejar la carga de archivos
const storage = multer.diskStorage({
    destination: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, destination: string) => void) {
        // const uploadPath = 'uploads/';
        const uploadPath = path.join(__dirname, '../../uploads/');

        if (!fs.existsSync(uploadPath)) {
            fs.mkdirSync(uploadPath, { recursive: true });
        }

        cb(null, uploadPath);
    },
    filename: function (req: Request, file: Express.Multer.File, cb: (error: Error | null, filename: string) => void) {
        const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
        cb(null, file.fieldname + '-' + uniqueSuffix + '-' + file.originalname);
    }
});

const upload = multer({
    storage: storage,
    fileFilter: (req: Request, file: Express.Multer.File, cb: FileFilterCallback) => {
        const allowedTypes = ['image/jpeg', 'image/png', 'application/pdf'];
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error('Tipo de archivo no permitido'));
        }
    }
});


// Rutas
router.get('/GetIngresos', authenticateJWT, ObtenerIngresos);

router.get('/GetIngresosParametros', authenticateJWT, ObtenerIngresosParametros);

router.get('/GetIngresosPorFiltro/:filtro', authenticateJWT, ObtenerIngresosPorFiltro);

// Ruta para obtener ingresos no reconciliados
router.get('/GetIngresosNoReconciliados', authenticateJWT, ObtenerIngresosNoReconciliados);


router.get('/GetIngresosOptimizado', authenticateJWT, ObtenerIngresosOptimizado);

router.post('/PostIngresos', authenticateJWT, PostIngresos);
router.put('/UpdateIngresos', authenticateJWT, UpdateIngresos);

router.post('/PostIngresosComprobante/:id', authenticateJWT, upload.single('Comprobante'), PostIngresosComprobante);

// Conceptos
router.get('/GetConceptos', authenticateJWT, ObtenerConceptos);

// Segmentos
router.get('/GetSegmentos', authenticateJWT, ObtenerSegmentos);

// Categorías
router.get('/GetCategorias', authenticateJWT, ObtenerCategorias);

// Subcategorías
router.get('/GetSubcategorias', authenticateJWT, ObtenerSubcategorias);

// Proveedores
router.get('/GetProveedores', authenticateJWT, ObtenerProveedores);

// Usuarios
router.get('/GetUsuarios', authenticateJWT, ObtenerUsuarios);

// Combinaciones
router.get('/GetCombinaciones', authenticateJWT, ObtenerCombinaciones);

router.get('/GetCombinacionesSegmento/:segmentoId', authenticateJWT, ObtenerCombinacionesSegmento);

// Estatus
router.get('/GetEstatus', authenticateJWT, ObtenerEstatus);

// Cuentas
router.get('/GetCuentas', authenticateJWT, ObtenerCuentas);

router.get('/GetCuentasContables', authenticateJWT, ObtenerCuentasContables);

// Actualizar combinación
router.put('/UpdateCombination', authenticateJWT, updateCombination);

router.put('/AsignarCuenta', authenticateJWT, asignarCuenta);

router.put('/AsignarCuentaContable', authenticateJWT, asignarCuentaContable);

router.put('/AsignarCuentasMasivas', authenticateJWT, asignarCuentasMasivas);

router.put('/UpdateDescripcion/:ingresoID', authenticateJWT, ActualizarDescripcion);


export default router;