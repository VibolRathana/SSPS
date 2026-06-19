import { pool } from "../config/db.js";

// GET /api/assignments — only this user's assignments
export async function getAssignments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_id AS id, a.title AS name, c.name AS course,
              DATE_FORMAT(a.due_date, '%d %b %Y') AS due, a.status
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.course_id
       WHERE a.user_id = ?
       ORDER BY a.due_date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/assignments
export async function createAssignment(req, res) {
  try {
    const { title, courseId, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const [result] = await pool.query(
      `INSERT INTO assignments (user_id, course_id, title, due_date) VALUES (?, ?, ?, ?)`,
      [req.user.id, courseId || null, title, dueDate]
    );
    res.status(201).json({ id: result.insertId, message: "Assignment created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}