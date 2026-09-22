import { Router } from "express";
import { requireAuth, requireAdmin } from "../middleware/authMiddleware";
import {
  getAdminDashboardSummary,
  getAdminIssues,
  getAdminIssueById,
  triageAdminIssue,
  updateAdminIssueStatus,
  getAdminWorkOrders,
  createAdminWorkOrder,
  verifyAdminWorkOrder,
  getAdminUsers,
  updateAdminUserStatus,
  getAdminAuditLogs,
} from "../controllers/adminController";

const router = Router();

// Apply requireAuth and requireAdmin to all /api/admin routes
router.use(requireAuth);
router.use(requireAdmin);

// Dashboard
router.get("/dashboard/summary", getAdminDashboardSummary);

// Issues
router.get("/issues", getAdminIssues);
router.get("/issues/:id", getAdminIssueById);
router.patch("/issues/:id/triage", triageAdminIssue);
router.patch("/issues/:id/status", updateAdminIssueStatus);

// Work Orders
router.get("/work-orders", getAdminWorkOrders);
router.post("/work-orders", createAdminWorkOrder);
router.post("/work-orders/:id/verify", verifyAdminWorkOrder);

// Users Management
router.get("/users", getAdminUsers);
router.patch("/users/:id/status", updateAdminUserStatus);

// Audit Logs
router.get("/audit-logs", getAdminAuditLogs);

export default router;
