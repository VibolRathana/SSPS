import { pool } from "../config/db.js";

export async function getUsers(req, res) {
  try {
    const [rows] = await pool.query(
      `SELECT user_id AS id, full_name AS fullName, email, role, major, phone, last_login AS lastLogin
       FROM users
       ORDER BY user_id`
    );
    res.json(rows);
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getAdminStats(req, res) {
  try {
    const [[userCounts]] = await pool.query(
      `SELECT
         COUNT(*) AS totalUsers,
         SUM(role = 'Student') AS totalStudents,
         SUM(role = 'Admin')   AS totalAdmins
       FROM users`
    );

    const [[taskCounts]] = await pool.query(
      `SELECT
         COUNT(*)                          AS totalTasks,
         SUM(status = 'Pending')           AS pending,
         SUM(status = 'In Progress')       AS inProgress,
         SUM(status = 'Completed')         AS completed
       FROM tasks`
    );

    res.json({
      users: {
        total:    Number(userCounts.totalUsers),
        students: Number(userCounts.totalStudents),
        admins:   Number(userCounts.totalAdmins),
      },
      tasks: {
        total:      Number(taskCounts.totalTasks),
        pending:    Number(taskCounts.pending),
        inProgress: Number(taskCounts.inProgress),
        completed:  Number(taskCounts.completed),
      },
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
