import { Router } from "express";
import { login, register, getCurrentUser, updateProfile, logout } from "../controllers/authController";
import { requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.post("/login", login);
router.post("/register", register);
router.get("/me", requireAuth, getCurrentUser);
router.put("/profile", requireAuth, updateProfile);
router.post("/logout", logout);

export default router;
