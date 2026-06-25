
import express from "express";
import { register, login, updateProfile, changePassword, toggleNotifications, getStats } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.post("/register", register);
router.post("/login", login);
router.put("/profile",        protect, updateProfile);
router.put("/password",       protect, changePassword);
router.patch("/notifications", protect, toggleNotifications);
router.get("/stats",          protect, getStats);

export default router;