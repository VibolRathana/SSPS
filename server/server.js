import express from "express";
import cors from "cors";
import dotenv from "dotenv";

import { QueryTypes } from "sequelize";
import { sequelize } from "./src/config/db.js";
import { Reminder } from "./src/models/index.js";
import authRoutes from "./src/routes/authRoutes.js";
import adminRoutes from "./src/routes/adminRoutes.js";
import taskRoutes from "./src/routes/taskRoutes.js";
import assignmentRoutes from "./src/routes/assignmentRoutes.js";
import examRoutes from "./src/routes/examRoutes.js";
import courseRoutes from "./src/routes/courseRoutes.js";
import reminderRoutes from "./src/routes/reminderRoutes.js";
import recommendationRoutes from "./src/routes/recommendationRoutes.js";
import scheduleRoutes from "./src/routes/scheduleRoutes.js";
import dashboardRoutes from "./src/routes/dashboardRoutes.js";
import { sendReminderEmail } from "./src/services/emailService.js";

dotenv.config();

const app = express();

// Middleware
app.use(cors());
app.use(express.json());

// Health check
app.get("/api/health", async (req, res) => {
  try {
    const [rows] = await sequelize.query("SELECT 1 + 1 AS result");
    res.json({ status: "ok", db: "connected", test: rows[0].result });
  } catch (err) {
    res.status(500).json({ status: "error", message: err.message });
  }
});

// API routes
app.use("/api/auth", authRoutes);
app.use("/api/tasks", taskRoutes);
app.use("/api/assignments", assignmentRoutes);
app.use("/api/admin", adminRoutes);
app.use("/api/exams", examRoutes);
app.use("/api/courses", courseRoutes);
app.use("/api/reminders", reminderRoutes);
app.use("/api/recommendations", recommendationRoutes);
app.use("/api/schedule", scheduleRoutes);
app.use("/api/dashboard", dashboardRoutes);

// Start server
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => console.log(`Server running on http://localhost:${PORT}`));

// Reminder email cron — checks every 60 seconds
setInterval(async () => {
  try {
    const due = await sequelize.query(
      `SELECT r.reminder_id, r.reminder_type, r.description,
              r.remind_date, r.remind_time, r.notify_before,
              u.email, u.full_name AS fullName
       FROM reminders r
       JOIN users u ON r.user_id = u.user_id
       WHERE r.is_active = TRUE
         AND r.email_enabled = TRUE
         AND r.email_sent = FALSE
         AND u.notifications_enabled = TRUE
         AND TIMESTAMP(r.remind_date, r.remind_time) >= NOW() - INTERVAL 1 DAY
         AND CASE
           WHEN r.notify_before = '15 minutes' THEN TIMESTAMPADD(MINUTE, -15, TIMESTAMP(r.remind_date, r.remind_time)) <= NOW()
           WHEN r.notify_before = '1 hour'     THEN TIMESTAMPADD(HOUR,   -1, TIMESTAMP(r.remind_date, r.remind_time)) <= NOW()
           WHEN r.notify_before = '1 day'      THEN TIMESTAMPADD(DAY,    -1, TIMESTAMP(r.remind_date, r.remind_time)) <= NOW()
         END`,
      { type: QueryTypes.SELECT }
    );
    for (const r of due) {
      try {
        await sendReminderEmail({
          to:           r.email,
          name:         r.fullName,
          type:         r.reminder_type,
          date:         new Date(r.remind_date).toDateString(),
          time:         r.remind_time,
          notifyBefore: r.notify_before,
          description:  r.description,
        });
        await Reminder.update({ email_sent: true }, { where: { reminder_id: r.reminder_id } });
        console.log(`[reminder] Email sent → ${r.email} (${r.reminder_type})`);
      } catch (e) {
        console.error(`[reminder] Failed for id=${r.reminder_id}:`, e.message);
      }
    }
  } catch (e) {
    console.error("[reminder cron]", e.message);
  }
}, 60000);