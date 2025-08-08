import { Router } from "express";
import { IntakeController } from "../../controllers/intake.controller";

const router = Router();

router.post("/forms/ai-generate", IntakeController.aiGenerateForm);
router.get("/forms/:formId", IntakeController.getForm);
router.post("/requests", IntakeController.createRequest);
router.get("/requests/:id", IntakeController.getRequest);
router.get("/requests", IntakeController.listRequests);

export default router;