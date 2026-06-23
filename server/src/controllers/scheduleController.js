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

export async function getSessions(req, res) {
  try {
    const uid = req.user.id;
    const { year, month } = req.query;

    let where = `s.user_id = ?`;
    const params = [uid];
    if (year && month) {
      where += ` AND YEAR(s.session_date) = ? AND MONTH(s.session_date) = ?`;
      params.push(year, month);
    }

    const [rows] = await pool.query(
      `SELECT s.session_id AS id, s.title, c.name AS course,
              DATE_FORMAT(s.session_date, '%Y-%m-%d') AS date,
              TIME_FORMAT(s.start_time, '%H:%i') AS startTime,
              s.duration, s.color, s.course_id AS courseId
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.course_id
       WHERE ${where}
       ORDER BY s.session_date, s.start_time`,
      params
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createSession(req, res) {
  try {
    const uid = req.user.id;
    const { title, courseName, date, startTime, duration, color } = req.body;
    if (!title || !date || !startTime) {
      return res.status(400).json({ message: "Title, date, and start time are required." });
    }
    const courseId = await findOrCreateCourse(uid, courseName);
    const [result] = await pool.query(
      `INSERT INTO study_sessions (user_id, title, course_id, session_date, start_time, duration, color)
       VALUES (?, ?, ?, ?, ?, ?, ?)`,
      [uid, title.trim(), courseId, date, startTime, duration || 1.0, color || "indigo"]
    );
    res.status(201).json({ id: result.insertId });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateSession(req, res) {
  try {
    const uid = req.user.id;
    const { id } = req.params;
    const { title, courseName, date, startTime, duration, color } = req.body;
    const courseId = await findOrCreateCourse(uid, courseName);
    await pool.query(
      `UPDATE study_sessions
       SET title = COALESCE(?, title),
           course_id = ?,
           session_date = COALESCE(?, session_date),
           start_time = COALESCE(?, start_time),
           duration = COALESCE(?, duration),
           color = COALESCE(?, color)
       WHERE session_id = ? AND user_id = ?`,
      [title, courseId, date, startTime, duration, color, id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteSession(req, res) {
  try {
    const uid = req.user.id;
    const { id } = req.params;
    await pool.query(
      `DELETE FROM study_sessions WHERE session_id = ? AND user_id = ?`,
      [id, uid]
    );
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
