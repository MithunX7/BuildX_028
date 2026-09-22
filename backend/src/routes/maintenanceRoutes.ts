import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";
import {
  getMaintenanceDashboard,
  calculateMaintenancePlan,
  updateMaintenanceBudget,
  getAllRoads,
  getRoadDetail,
  updateRoad,
} from "../controllers/maintenanceController";

const router = Router();

// Apply auth + admin to all maintenance routes
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard summary (budget + priority summary + all roads)
router.get("/dashboard", getMaintenanceDashboard);

// Trigger recalculation of the full maintenance plan
router.post("/calculate", calculateMaintenancePlan);

// Update budget settings
router.put("/budget", updateMaintenanceBudget);

// Road CRUD
router.get("/roads", getAllRoads);
router.get("/roads/:id", getRoadDetail);
router.patch("/roads/:id", updateRoad);

export default router;
