import { pool } from "../config/db.js";

async function findOrCreateCourse(userId, courseName) {
  if (!courseName || !courseName.trim()) return null;
  const name = courseName.trim();
  const [[existing]] = await pool.query(
    `SELECT course_id FROM courses WHERE user_id = ? AND name = ? LIMIT 1`,
    [userId, name]
  );
  if (existing) return existing.course_id;
  const [result] = await pool.query(
    `INSERT INTO courses (user_id, name) VALUES (?, ?)`,
    [userId, name]
  );
  return result.insertId;
}

// GET /api/tasks
export async function getTasks(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.task_id AS id, t.title AS name, c.name AS course,
              t.description,
              DATE_FORMAT(t.due_date, '%d %b %Y') AS due,
              t.due_date AS rawDue,
              t.priority, t.status
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.course_id
       WHERE t.user_id = ?
       ORDER BY t.due_date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/tasks
export async function createTask(req, res) {
  try {
    const { title, description, courseName, priority, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, course_id, title, description, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, courseId, title, description || null, priority || "Medium", dueDate]
    );
    res.status(201).json({ id: result.insertId, message: "Task created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/tasks/:id
export async function updateTask(req, res) {
  try {
    const { title, description, courseName, dueDate, priority, status } = req.body;
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `UPDATE tasks
       SET title       = COALESCE(?, title),
           description = COALESCE(?, description),
           course_id   = ?,
           due_date    = COALESCE(?, due_date),
           priority    = COALESCE(?, priority),
           status      = COALESCE(?, status)
       WHERE task_id = ? AND user_id = ?`,
      [title ?? null, description ?? null, courseId, dueDate ?? null, priority ?? null, status ?? null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/tasks/:id
export async function deleteTask(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM tasks WHERE task_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Task not found" });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
