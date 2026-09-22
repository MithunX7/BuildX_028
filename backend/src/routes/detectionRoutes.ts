import { Router } from "express";
import { analyzeFrame, getDetections } from "../controllers/detectionController";

const router = Router();

router.post("/analyze-frame", analyzeFrame);
router.get("/", getDetections);

export default router;
