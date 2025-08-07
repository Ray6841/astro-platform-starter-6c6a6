import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { dashboardHandler, reorderSuggestionsHandler } from "../../controllers/reports.controller";

const router = Router();
router.use(requireAuth);

router.get("/dashboard", requireRole("ADMIN", "MANAGER"), dashboardHandler);
router.get("/reorder", requireRole("ADMIN", "MANAGER"), reorderSuggestionsHandler);

export default router;