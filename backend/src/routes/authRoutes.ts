import { Router } from "express";
import { login, getCurrentUser, logout } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.get("/me", requireAuth, getCurrentUser);
router.post("/logout", logout);

export default router;
