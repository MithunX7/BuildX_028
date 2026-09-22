import { Router } from "express";
import {
  getWorkOrders,
  getWorkOrderById,
  updateProgress,
  uploadEvidence,
  verifyWorkOrder,
} from "../controllers/workOrderController";
import { optionalAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getWorkOrders);
router.get("/:id", getWorkOrderById);
router.post("/:id/progress", optionalAuth, updateProgress);
router.post("/:id/evidence", optionalAuth, uploadEvidence);
router.post("/:id/verify", optionalAuth, verifyWorkOrder);

export default router;
