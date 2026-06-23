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

// GET /api/exams
export async function getExams(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT e.exam_id AS id, e.subject AS name, e.course_id AS courseId,
              c.name AS course, c.color AS courseColor,
              DATE_FORMAT(e.exam_date, '%d %b %Y') AS date,
              e.exam_date AS rawDate,
              e.preparation
       FROM examinations e
       LEFT JOIN courses c ON e.course_id = c.course_id
       WHERE e.user_id = ?
       ORDER BY e.exam_date`,
      [req.user.id]
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// POST /api/exams
export async function createExam(req, res) {
  try {
    const { subject, courseName, examDate, preparation } = req.body;
    if (!subject || !examDate)
      return res.status(400).json({ message: "Subject and exam date are required" });
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `INSERT INTO examinations (user_id, course_id, subject, exam_date, preparation)
       VALUES (?, ?, ?, ?, ?)`,
      [req.user.id, courseId, subject, examDate, preparation ?? 0]
    );
    res.status(201).json({ id: result.insertId, message: "Exam created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// PUT /api/exams/:id
export async function updateExam(req, res) {
  try {
    const { subject, courseName, examDate, preparation } = req.body;
    const courseId = await findOrCreateCourse(req.user.id, courseName);
    const [result] = await pool.query(
      `UPDATE examinations
       SET subject     = COALESCE(?, subject),
           course_id   = ?,
           exam_date   = COALESCE(?, exam_date),
           preparation = COALESCE(?, preparation)
       WHERE exam_id = ? AND user_id = ?`,
      [subject ?? null, courseId, examDate ?? null, preparation ?? null, req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// DELETE /api/exams/:id
export async function deleteExam(req, res) {
  try {
    const [result] = await pool.query(
      `DELETE FROM examinations WHERE exam_id = ? AND user_id = ?`,
      [req.params.id, req.user.id]
    );
    if (result.affectedRows === 0)
      return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
