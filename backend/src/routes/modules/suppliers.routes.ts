import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createSupplierHandler, deleteSupplierHandler, listSuppliersHandler, updateSupplierHandler } from "../../controllers/suppliers.controller";

const router = Router();
router.use(requireAuth);

router.get("/", listSuppliersHandler);
router.post("/", requireRole("ADMIN", "MANAGER"), createSupplierHandler);
router.put("/:id", requireRole("ADMIN", "MANAGER"), updateSupplierHandler);
router.delete("/:id", requireRole("ADMIN"), deleteSupplierHandler);

export default router;