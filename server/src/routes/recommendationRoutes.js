import express from "express";
import { getRecommendation, getLastRecommendation } from "../controllers/recommendationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/",    getLastRecommendation);
router.post("/ask", getRecommendation);

export default router;
