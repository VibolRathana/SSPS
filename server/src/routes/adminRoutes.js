import express from "express";
import { protect } from "../middleware/authMiddleware.js";
import { adminOnly } from "../middleware/roleMiddleware.js";
import { getAdminStats, getUsers, updateUserRole, deleteUser, getSecurityInfo } from "../controllers/admincontroller.js";

const router = express.Router();
router.use(protect, adminOnly);

router.get("/stats",            getAdminStats);
router.get("/users",            getUsers);
router.put("/users/:id/role",   updateUserRole);
router.delete("/users/:id",     deleteUser);
router.get("/security",         getSecurityInfo);

export default router;
