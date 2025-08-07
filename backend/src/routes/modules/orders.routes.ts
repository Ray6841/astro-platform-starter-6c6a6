import { Router } from "express";
import { requireAuth, requireRole } from "../../middleware/auth";
import { createOrderHandler, fulfillOrderHandler, getOrderHandler, listOrdersHandler, picklistHandler } from "../../controllers/orders.controller";

const router = Router();

router.use(requireAuth);

router.get("/", listOrdersHandler);
router.get("/:id", getOrderHandler);
router.post("/", requireRole("ADMIN", "MANAGER"), createOrderHandler);
router.get("/:id/picklist", picklistHandler);
router.post("/:id/fulfill", requireRole("ADMIN", "MANAGER", "STAFF"), fulfillOrderHandler);

export default router;