
import express from "express";
import { register, login, updateProfile, getStats } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/profile", protect, updateProfile);
router.get("/stats", protect, getStats);

export default router;