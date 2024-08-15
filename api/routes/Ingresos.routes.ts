import { Router } from 'express';
import { authenticateJWT } from '../middlewares/authMiddleware';
import { ObtenerIngresos, PostIngresos , UpdateIngresos , ObtenerConceptos, ObtenerSegmentos, ObtenerCategorias, ObtenerSubcategorias, ObtenerUsuarios, ObtenerCombinaciones, ObtenerEstatus, updateCombination } from '../controllers/Ingresos.controllers';

const router = Router();

//modulo ingresos
router.get('/GetIngresos', authenticateJWT, ObtenerIngresos);
router.post('/PostIngresos', authenticateJWT, PostIngresos);
router.put('/UpdateIngresos', authenticateJWT, UpdateIngresos);

//Conceptos
router.get('/GetConceptos', authenticateJWT, ObtenerConceptos);

// Segmentos
router.get('/GetSegmentos', authenticateJWT, ObtenerSegmentos);

// Categorias
router.get('/GetCategorias', authenticateJWT, ObtenerCategorias);

// Subcategorias
router.get('/GetSubcategorias', authenticateJWT, ObtenerSubcategorias);

// Usuarios
router.get('/GetUsuarios', authenticateJWT, ObtenerUsuarios);

// Combinaciones
router.get('/GetCombinaciones', authenticateJWT, ObtenerCombinaciones);

// Estatus
router.get('/GetEstatus', authenticateJWT, ObtenerEstatus);

// actualizar combinacion
router.put('/UpdateCombination', authenticateJWT, updateCombination);

export default router;