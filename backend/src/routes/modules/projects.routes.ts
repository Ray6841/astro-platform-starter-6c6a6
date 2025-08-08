import { Router } from "express";
import { ProjectsController } from "../../controllers/projects.controller";

const router = Router();

router.post("/", ProjectsController.createProject);
router.get("/:id", ProjectsController.getProject);
router.post("/:id/tasks", ProjectsController.addTask);
router.post("/:id/documents", ProjectsController.addDocument);

export default router;