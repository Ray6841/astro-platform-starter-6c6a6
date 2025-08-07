import { Router } from "express";
import multer from "multer";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createPartHandler, deletePartHandler, getPartHandler, listPartsHandler, searchByBarcodeHandler, updatePartHandler, uploadCsvHandler } from "../../controllers/parts.controller";

const upload = multer({ storage: multer.memoryStorage() });
const router = Router();

router.use(requireAuth);

router.get("/", listPartsHandler);
router.get("/barcode/:code", searchByBarcodeHandler);
router.get("/:id", getPartHandler);
router.post("/", requireRole("ADMIN", "MANAGER"), createPartHandler);
router.put("/:id", requireRole("ADMIN", "MANAGER"), updatePartHandler);
router.delete("/:id", requireRole("ADMIN"), deletePartHandler);
router.post("/upload/csv", requireRole("ADMIN", "MANAGER"), upload.single("file"), uploadCsvHandler);

export default router;