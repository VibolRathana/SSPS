import express from "express";
import { getAssignments, createAssignment } from "../controllers/assignmentController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);
router.get("/", getAssignments);
router.post("/", createAssignment);

export default router;