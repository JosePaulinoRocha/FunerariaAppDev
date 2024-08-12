"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
const express_1 = require("express");
const Reconciliaciones_controller_1 = require("../controllers/Reconciliaciones.controller");
const router = (0, express_1.Router)();
//modulo reconciliaciones
router.get('/GetIngresos', Reconciliaciones_controller_1.ObtenerIngresos);
router.post('/GetIngresosParaConciliacion', Reconciliaciones_controller_1.ObtenerIngresosParaConciliacion);
router.get('/GetUltimaReconciliacion/:cuentaID', Reconciliaciones_controller_1.ObtenerUltimaReconciliacion);
router.post('/CreateReconciliacion', Reconciliaciones_controller_1.CrearReconciliacion);
router.put('/UpdateIngresos', Reconciliaciones_controller_1.ActualizarIngresos);
router.get('/GetReconciliaciones', Reconciliaciones_controller_1.ObtenerReconciliaciones);
router.delete('/DeleteReconciliacion/:reconciliacionID', Reconciliaciones_controller_1.EliminarReconciliacion);
router.put('/UpdateObservacion/:ingresoID', Reconciliaciones_controller_1.ActualizarObservacion);
exports.default = router;
