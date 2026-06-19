import express from "express";
import { getTasks, createTask } from "../controllers/taskController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);          // must be logged in
router.get("/", getTasks);
router.post("/", createTask);

export default router;