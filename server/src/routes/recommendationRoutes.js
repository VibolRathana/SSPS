import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { createRateLimit } from "../middleware/rateLimitMiddleware.js";
import {
  getRecommendation, getLastRecommendation,
  getScores, generateSchedule, addScheduleSessions, chatWithAI,
} from "../controllers/recommendationController.js";

const router = express.Router();
router.use(protect);

const aiRateLimit = createRateLimit({ windowMs: 15 * 60 * 1000, max: 20 });

router.get("/",                   getLastRecommendation);
router.post("/ask",               aiRateLimit, getRecommendation);
router.post("/scores",            aiRateLimit, getScores);
router.post("/generate-schedule", aiRateLimit, generateSchedule);
router.post("/add-schedule",      aiRateLimit, addScheduleSessions);
router.post("/chat",              aiRateLimit, chatWithAI);

export default router;
