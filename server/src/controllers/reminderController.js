import { pool } from "../config/db.js";

// GET /api/reminders
export async function getReminders(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT reminder_id AS id,
              reminder_type AS type,
              description,
              DATE_FORMAT(remind_date, '%d %b') AS date,
              TIME_FORMAT(remind_time, '%h:%i %p') AS time,
              DATE_FORMAT(remind_date, '%Y-%m-%d') AS rawDate,
              TIME_FORMAT(remind_time, '%H:%i') AS rawTime,
              notify_before AS notifyBefore,
              email_enabled AS emailEnabled,
              is_active AS isActive,
              email_sent AS emailSent
       FROM reminders
       WHERE user_id = ?
       ORDER BY remind_date, remind_time`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/reminders
export async function createReminder(req, res) {
  try {
    const { type, remindDate, remindTime, notifyBefore, description } = req.body;
    if (!type || !remindDate || !remindTime)
      return res.status(400).json({ message: "Type, date, and time are required" });
    const [result] = await pool.query(
      `INSERT INTO reminders (user_id, reminder_type, description, remind_date, remind_time, notify_before)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, type, description || null, remindDate, remindTime, notifyBefore || "1 hour"]
    );
    res.status(201).json({ id: result.insertId, message: "Reminder created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/reminders/:id
export async function updateReminder(req, res) {
  try {
    const { type, remindDate, remindTime, notifyBefore, description } = req.body;
    const [result] = await pool.query(
      `UPDATE reminders
       SET reminder_type = COALESCE(?, reminder_type),
           description   = COALESCE(?, description),
           remind_date   = COALESCE(?, remind_date),
           remind_time   = COALESCE(?, remind_time),
           notify_before = COALESCE(?, notify_before),
           email_sent    = FALSE
       WHERE reminder_id = ? AND user_id = ?`,
      [type ?? null, description ?? null, remindDate ?? null, remindTime ?? null, notifyBefore ?? null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PATCH /api/reminders/:id/toggle
export async function toggleReminder(req, res) {
  try {
    const [result] = await pool.query(
      `UPDATE reminders SET is_active = !is_active WHERE reminder_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Toggled" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/reminders/:id
export async function deleteReminder(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM reminders WHERE reminder_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Reminder not found" });
    res.json({ message: "Reminder deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
