import { Router } from "express";
import {
  getIssues,
  getMyReports,
  getIssueById,
  createCitizenReport,
  triageIssue,
  verifyIssue,
} from "../controllers/issueController";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getIssues);
router.get("/my", requireAuth, getMyReports);
router.get("/my-reports", requireAuth, getMyReports);
router.post("/", optionalAuth, createCitizenReport);
router.get("/:id", getIssueById);
router.post("/:id/triage", requireAuth, triageIssue);
router.post("/:id/verify", requireAuth, verifyIssue);

export default router;
