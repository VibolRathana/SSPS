import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { getUsers, getAdminStats } from "../controllers/adminController.js";

const router = express.Router();

// Every route below requires BOTH a valid token AND an Admin role
router.use(protect, adminOnly);

router.get("/users", getUsers);
router.get("/stats", getAdminStats);

export default router;