import express from "express";
import { getReminders, createReminder, updateReminder, toggleReminder, deleteReminder } from "../controllers/reminderController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/",           getReminders);
router.post("/",          createReminder);
router.put("/:id",        updateReminder);
router.patch("/:id/toggle", toggleReminder);
router.delete("/:id",     deleteReminder);

export default router;
