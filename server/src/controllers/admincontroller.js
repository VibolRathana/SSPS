import { QueryTypes, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { User, Task, Assignment, Examination } from "../models/index.js";

export async function getAdminStats(req, res) {
  try {
    const totalUsers    = await User.count();
    const totalStudents = await User.count({ where: { role: "Student" } });
    const totalAdmins   = await User.count({ where: { role: "Admin"   } });

    const totalTasks       = await Task.count();
    const pendingTasks     = await Task.count({ where: { status: "Pending"     } });
    const inProgressTasks  = await Task.count({ where: { status: "In Progress" } });
    const completedTasks   = await Task.count({ where: { status: "Completed"   } });
    const totalAssignments = await Assignment.count();
    const totalExams       = await Examination.count();

    const recentUsers = await User.findAll({
      attributes: [
        "user_id",
        "full_name",
        "email",
        "role",
        [sequelize.fn("DATE_FORMAT", sequelize.col("created_at"), "%d %b %Y"), "joinedAt"],
      ],
      order: [["created_at", "DESC"]],
      limit: 5,
    });

    res.json({
      users:       { total: totalUsers, students: totalStudents, admins: totalAdmins },
      tasks:       { total: totalTasks, pending: pendingTasks, inProgress: inProgressTasks, completed: completedTasks },
      assignments: { total: totalAssignments },
      exams:       { total: totalExams },
      recentUsers: recentUsers.map(u => ({
        id:       u.user_id,
        fullName: u.full_name,
        email:    u.email,
        role:     u.role,
        joinedAt: u.get("joinedAt"),
      })),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getUsers(req, res) {
  try {
    const rows = await User.findAll({
      attributes: [
        "user_id", "full_name", "email", "role", "major", "phone", "notifications_enabled",
        [sequelize.fn("DATE_FORMAT", sequelize.col("last_login"),  "%d %b %Y %h:%i %p"), "lastLogin"],
        [sequelize.fn("DATE_FORMAT", sequelize.col("created_at"),  "%d %b %Y"),           "joinedAt"],
      ],
      order: [["created_at", "DESC"]],
    });
    res.json(rows.map(u => ({
      id:                   u.user_id,
      fullName:             u.full_name,
      email:                u.email,
      role:                 u.role,
      major:                u.major,
      phone:                u.phone,
      notificationsEnabled: u.notifications_enabled,
      lastLogin:            u.get("lastLogin"),
      joinedAt:             u.get("joinedAt"),
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
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
    const [count] = await User.update({ role }, { where: { user_id: id } });
    if (count === 0) return res.status(404).json({ message: "User not found." });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteUser(req, res) {
  try {
    const { id } = req.params;
    if (Number(id) === req.user.id)
      return res.status(400).json({ message: "Cannot delete your own account." });
    const count = await User.destroy({ where: { user_id: id } });
    if (count === 0) return res.status(404).json({ message: "User not found." });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getSecurityInfo(req, res) {
  try {
    const admins = await User.findAll({
      where: { role: "Admin" },
      attributes: [
        "user_id", "full_name", "email",
        [sequelize.fn("DATE_FORMAT", sequelize.col("last_login"),  "%d %b %Y %h:%i %p"), "lastLogin"],
        [sequelize.fn("DATE_FORMAT", sequelize.col("created_at"),  "%d %b %Y"),           "joinedAt"],
      ],
      order: [["created_at", "ASC"]],
    });

    const recentLogins = await User.findAll({
      where: { last_login: { [Op.ne]: null } },
      attributes: [
        "user_id", "full_name", "email", "role",
        [sequelize.fn("DATE_FORMAT", sequelize.col("last_login"), "%d %b %Y %h:%i %p"), "lastLogin"],
      ],
      order: [["last_login", "DESC"]],
      limit: 10,
    });

    const [counts] = await sequelize.query(`
      SELECT
        (SELECT COUNT(*) FROM users)          AS totalUsers,
        (SELECT COUNT(*) FROM tasks)          AS totalTasks,
        (SELECT COUNT(*) FROM assignments)    AS totalAssignments,
        (SELECT COUNT(*) FROM examinations)   AS totalExams,
        (SELECT COUNT(*) FROM reminders)      AS totalReminders,
        (SELECT COUNT(*) FROM study_sessions) AS totalSessions
    `, { type: QueryTypes.SELECT });

    res.json({
      admins: admins.map(u => ({
        id: u.user_id, fullName: u.full_name, email: u.email,
        lastLogin: u.get("lastLogin"), joinedAt: u.get("joinedAt"),
      })),
      recentLogins: recentLogins.map(u => ({
        id: u.user_id, fullName: u.full_name, email: u.email,
        role: u.role, lastLogin: u.get("lastLogin"),
      })),
      counts,
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
