import { Router } from "express";
import { getProjects, getConflicts } from "../controllers/constructionController";

const router = Router();

router.get("/", getProjects);
router.get("/conflicts", getConflicts);

export default router;
