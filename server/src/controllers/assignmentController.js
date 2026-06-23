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

// GET /api/assignments
export async function getAssignments(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT a.assignment_id AS id, a.title AS name, c.name AS course,
              a.description,
              DATE_FORMAT(a.due_date, '%d %b %Y') AS due,
              a.due_date AS rawDue,
              a.priority, a.status
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
    const { title, description, courseName, priority, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `INSERT INTO assignments (user_id, course_id, title, description, priority, due_date)
       VALUES (?, ?, ?, ?, ?, ?)`,
      [req.user.id, courseId, title, description || null, priority || "Medium", dueDate]
    );
    res.status(201).json({ id: result.insertId, message: "Assignment created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/assignments/:id
export async function updateAssignment(req, res) {
  try {
    const { title, description, courseName, dueDate, priority, status } = req.body;
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `UPDATE assignments
       SET title       = COALESCE(?, title),
           description = COALESCE(?, description),
           course_id   = ?,
           due_date    = COALESCE(?, due_date),
           priority    = COALESCE(?, priority),
           status      = COALESCE(?, status)
       WHERE assignment_id = ? AND user_id = ?`,
      [title ?? null, description ?? null, courseId, dueDate ?? null, priority ?? null, status ?? null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Assignment updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/assignments/:id
export async function deleteAssignment(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM assignments WHERE assignment_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Assignment not found" });
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
