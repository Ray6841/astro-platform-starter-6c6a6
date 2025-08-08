import { Router } from "express";
import { WorkflowsController } from "../../controllers/workflows.controller";

const router = Router();

router.post("/", WorkflowsController.createDefinition);
router.get("/:id", WorkflowsController.getDefinition);
router.post("/:id/deploy", WorkflowsController.deployDefinition);
router.post("/:id/start", WorkflowsController.startInstance);
router.get("/instances/:instanceId", WorkflowsController.getInstance);

export default router;