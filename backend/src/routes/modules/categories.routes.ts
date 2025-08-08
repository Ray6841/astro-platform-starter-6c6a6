import { Router } from "express";
import { CategoriesController } from "../../controllers/categories.controller";

const router = Router();

router.post("/", CategoriesController.createCategory);
router.get("/:id", CategoriesController.getCategory);
router.get("/:id/spend", CategoriesController.getCategorySpend);
router.post("/:id/kpis", CategoriesController.setKpis);

export default router;