import { pool } from "../config/db.js";

export async function getCourses(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT course_id AS id, name, code, color FROM courses WHERE user_id = ? ORDER BY name`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createCourse(req, res) {
  try {
    const { name, code, color } = req.body;
    if (!name) return res.status(400).json({ message: "Course name is required" });
    const [result] = await pool.query(
      `INSERT INTO courses (user_id, name, code, color) VALUES (?, ?, ?, ?)`,
      [req.user.id, name, code || null, color || "#6366F1"]
    );
    res.status(201).json({ id: result.insertId, message: "Course created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM courses WHERE course_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
