import { Router } from "express";
import {
  getIssues,
  getIssueById,
  createCitizenReport,
  triageIssue,
  verifyIssue,
} from "../controllers/issueController";
import { optionalAuth, requireAuth } from "../middleware/authMiddleware";

const router = Router();

router.get("/", getIssues);
router.post("/", createCitizenReport);
router.get("/:id", getIssueById);
router.post("/:id/triage", optionalAuth, triageIssue);
router.post("/:id/verify", optionalAuth, verifyIssue);

export default router;
