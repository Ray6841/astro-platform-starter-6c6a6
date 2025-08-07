import { Router } from "express";
import { loginHandler, registerHandler, profileHandler } from "../../controllers/auth.controller";
import { requireAuth } from "../../middleware/auth";

const router = Router();

router.post("/register", registerHandler);
router.post("/login", loginHandler);
router.get("/me", requireAuth, profileHandler);

export default router;