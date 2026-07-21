import express from "express";
import { getAvailability,createAvailability,updateAvailability } from "../controllers/StudyAvailability.js";
import { protect } from "../middleware/authMiddleware.js";

const router= express.Router();
router.use(protect);
router.get("/", getAvailability);
router.post("/", createAvailability);
router.put("/:id", updateAvailability);

export default router;
