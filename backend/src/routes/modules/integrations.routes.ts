import { Router } from "express";
import { IntegrationsController } from "../../controllers/integrations.controller";

const router = Router();

router.post("/connectors", IntegrationsController.registerConnector);
router.post("/webhooks/subscriptions", IntegrationsController.createWebhookSub);
router.post("/webhooks/:provider", IntegrationsController.inboundWebhook);

export default router;