import { Router } from "express";
import { PostPresupuesto, GetPresupuesto, ImportarPresupuesto, DeletePresupuesto, GetUltimaFecha } from "../controllers/Presupuesto-semanal.controller";
import { authenticateJWT } from '../middlewares/authMiddleware';

const router = Router();

router.post("/PostPresupuesto", authenticateJWT, PostPresupuesto);
router.get("/GetPresupuesto", authenticateJWT, GetPresupuesto);
router.post("/ImportarPresupuesto", authenticateJWT, ImportarPresupuesto);
router.delete("/DeletePresupuesto/:id", authenticateJWT, DeletePresupuesto);
router.get("/GetUltimaFecha", authenticateJWT, GetUltimaFecha);

export default router;
