import { pool } from "../config/db.js";

// GET /api/tasks — only THIS user's tasks
export async function getTasks(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT t.task_id AS id, t.title AS name, c.name AS course,
              DATE_FORMAT(t.due_date, '%d %b %Y') AS due,
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
    const { title, courseId, priority, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const [result] = await pool.query(
      `INSERT INTO tasks (user_id, course_id, title, priority, due_date)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, courseId || null, title, priority || "Medium", dueDate]
    );
    res.status(201).json({ id: result.insertId, message: "Task created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}