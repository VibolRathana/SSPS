import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import {
  getRecommendation, getLastRecommendation,
  getScores, generateSchedule, addScheduleSessions, chatWithAI,
} from "../controllers/recommendationController.js";

const router = express.Router();
router.use(protect);

router.get("/",                   getLastRecommendation);
router.post("/ask",               getRecommendation);
router.post("/scores",            getScores);
router.post("/generate-schedule", generateSchedule);
router.post("/add-schedule",      addScheduleSessions);
router.post("/chat",              chatWithAI);

export default router;
