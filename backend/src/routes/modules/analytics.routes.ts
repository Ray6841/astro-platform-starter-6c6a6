import { Router } from "express";
import { AnalyticsController } from "../../controllers/analytics.controller";

const router = Router();

router.get("/spend/real-time", AnalyticsController.realTimeSpend);
router.get("/process", AnalyticsController.processMetrics);
router.get("/roi", AnalyticsController.roi);

export default router;