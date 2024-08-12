"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Ingresos_controllers_1 = require("../controllers/Ingresos.controllers");
const router = (0, express_1.Router)();
//modulo ingresos
router.get('/GetIngresos', Ingresos_controllers_1.ObtenerIngresos);
router.post('/PostIngresos', Ingresos_controllers_1.PostIngresos);
router.put('/UpdateIngresos', Ingresos_controllers_1.UpdateIngresos);
//Conceptos
router.get('/GetConceptos', Ingresos_controllers_1.ObtenerConceptos);
// Segmentos
router.get('/GetSegmentos', Ingresos_controllers_1.ObtenerSegmentos);
// Categorias
router.get('/GetCategorias', Ingresos_controllers_1.ObtenerCategorias);
// Subcategorias
router.get('/GetSubcategorias', Ingresos_controllers_1.ObtenerSubcategorias);
// Usuarios
router.get('/GetUsuarios', Ingresos_controllers_1.ObtenerUsuarios);
// Combinaciones
router.get('/GetCombinaciones', Ingresos_controllers_1.ObtenerCombinaciones);
// Estatus
router.get('/GetEstatus', Ingresos_controllers_1.ObtenerEstatus);
exports.default = router;
