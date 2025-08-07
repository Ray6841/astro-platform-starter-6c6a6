import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { listAuditHandler } from "../../controllers/audit.controller";

const router = Router();
router.use(requireAuth);
router.get("/", requireRole("ADMIN"), listAuditHandler);
export default router;