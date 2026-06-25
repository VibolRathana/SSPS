import { pool } from "../config/db.js";

export async function getAdminStats(req, res) {
  try {
    const [[userCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalUsers,
              SUM(role = 'Student') AS totalStudents,
              SUM(role = 'Admin')   AS totalAdmins
       FROM users`
    );
    const [[taskCounts]] = await pool.query(
      `SELECT COUNT(*)                    AS totalTasks,
              SUM(status = 'Pending')     AS pending,
              SUM(status = 'In Progress') AS inProgress,
              SUM(status = 'Completed')   AS completed
       FROM tasks`
    );
    const [[assignCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalAssignments FROM assignments`
    );
    const [[examCounts]] = await pool.query(
      `SELECT COUNT(*) AS totalExams FROM examinations`
    );
    const [recentUsers] = await pool.query(
      `SELECT user_id AS id, full_name AS fullName, email, role,
              DATE_FORMAT(created_at, '%d %b %Y') AS joinedAt
       FROM users ORDER BY created_at DESC LIMIT 5`
    );

    res.json({
      users:       { total: Number(userCounts.totalUsers), students: Number(userCounts.totalStudents), admins: Number(userCounts.totalAdmins) },
      tasks:       { total: Number(taskCounts.totalTasks), pending: Number(taskCounts.pending), inProgress: Number(taskCounts.inProgress), completed: Number(taskCounts.completed) },
      assignments: { total: Number(assignCounts.totalAssignments) },
      exams:       { total: Number(examCounts.totalExams) },
      recentUsers,
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id AS id, full_name AS fullName, email, role, major, phone,
              DATE_FORMAT(last_login,  '%d %b %Y %h:%i %p') AS lastLogin,
              DATE_FORMAT(created_at,  '%d %b %Y')           AS joinedAt,
              notifications_enabled AS notificationsEnabled
       FROM users ORDER BY created_at DESC`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateUserRole(req, res) {
  try {
    const { id } = req.params;
    const { role } = req.body;
    if (!["Student", "Admin"].includes(role))
      return res.status(400).json({ message: "Invalid role." });
    if (Number(id) === req.user.id)
      return res.status(400).json({ message: "Cannot change your own role." });
    await pool.query(`UPDATE users SET role = ? WHERE user_id = ?`, [role, id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id)
      return res.status(400).json({ message: "Cannot delete your own account." });
    await pool.query(`DELETE FROM users WHERE user_id = ?`, [id]);
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getSecurityInfo(req, res) {
  try {
    const [admins] = await pool.query(
      `SELECT user_id AS id, full_name AS fullName, email,
              DATE_FORMAT(last_login, '%d %b %Y %h:%i %p') AS lastLogin,
              DATE_FORMAT(created_at, '%d %b %Y')           AS joinedAt
       FROM users WHERE role = 'Admin' ORDER BY created_at`
    );
    const [recentLogins] = await pool.query(
      `SELECT user_id AS id, full_name AS fullName, email, role,
              DATE_FORMAT(last_login, '%d %b %Y %h:%i %p') AS lastLogin
       FROM users WHERE last_login IS NOT NULL
       ORDER BY last_login DESC LIMIT 10`
    );
    const [[counts]] = await pool.query(
      `SELECT
        (SELECT COUNT(*) FROM users)        AS totalUsers,
        (SELECT COUNT(*) FROM tasks)        AS totalTasks,
        (SELECT COUNT(*) FROM assignments)  AS totalAssignments,
        (SELECT COUNT(*) FROM examinations) AS totalExams,
        (SELECT COUNT(*) FROM reminders)    AS totalReminders,
        (SELECT COUNT(*) FROM study_sessions) AS totalSessions`
    );
    res.json({ admins, recentLogins, counts });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
