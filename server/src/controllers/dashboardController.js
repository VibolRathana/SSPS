import { QueryTypes, Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { Task, Assignment, Examination, StudySession, Course } from "../models/index.js";

export async function getDashboard(req, res) {
  try {
    const uid = req.user.id;

    const [dates] = await sequelize.query(
      `SELECT CURDATE() AS today,
              DATE_ADD(CURDATE(), INTERVAL 14 DAY) AS in14`,
      { type: QueryTypes.SELECT }
    );
    const today = dates.today;
    const in14 = dates.in14;

    // ── Stats ──────────────────────────────────────────────────
    const pendingTasks       = await Task.count({ where: { user_id: uid, status: { [Op.ne]: "Completed" } } });
    const pendingAssignments = await Assignment.count({ where: { user_id: uid, status: { [Op.notIn]: ["Submitted", "Graded"] } } });
    const upcomingExams      = await Examination.count({ where: { user_id: uid, exam_date: { [Op.gte]: today } } });
    const weekSessions       = await sequelize.query(
      `SELECT COUNT(*) AS cnt FROM study_sessions
       WHERE user_id = ? AND YEARWEEK(session_date, 1) = YEARWEEK(CURDATE(), 1)`,
      { replacements: [uid], type: QueryTypes.SELECT }
    );

    // ── Upcoming deadlines (next 14 days) ──────────────────────
    const taskDeadlines = await Task.findAll({
      where: { user_id: uid, status: { [Op.ne]: "Completed" }, due_date: { [Op.between]: [today, in14] } },
      include: [{ model: Course, attributes: ["name"], required: false }],
      order: [["due_date", "ASC"]], limit: 10,
    });
    const assignDeadlines = await Assignment.findAll({
      where: { user_id: uid, status: { [Op.notIn]: ["Submitted", "Graded"] }, due_date: { [Op.between]: [today, in14] } },
      include: [{ model: Course, attributes: ["name"], required: false }],
      order: [["due_date", "ASC"]], limit: 10,
    });

    const fmtDate = d => d ? new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" }) : null;

    const deadlines = [
      ...taskDeadlines.map(t => ({ id: t.task_id, title: t.title, type: "Task", dueDate: fmtDate(t.due_date), rawDue: t.due_date, priority: t.priority, status: t.status, course: t.Course?.name || null })),
      ...assignDeadlines.map(a => ({ id: a.assignment_id, title: a.title, type: "Assignment", dueDate: fmtDate(a.due_date), rawDue: a.due_date, priority: a.priority, status: a.status, course: a.Course?.name || null })),
    ].sort((a, b) => new Date(a.rawDue) - new Date(b.rawDue)).slice(0, 8);

    // ── Today's sessions ───────────────────────────────────────
    const todaySessions = await StudySession.findAll({
      where: { user_id: uid, session_date: today },
      include: [{ model: Course, attributes: ["name"], required: false }],
      order: [["start_time", "ASC"]],
    });

    // ── Upcoming exams ──────────────────────────────────────────
    const exams = await sequelize.query(
      `SELECT e.exam_id AS id, e.subject,
              DATE_FORMAT(e.exam_date,'%d %b %Y') AS examDate,
              e.exam_date AS rawDate, e.preparation,
              c.name AS course,
              DATEDIFF(e.exam_date, CURDATE()) AS daysLeft
       FROM examinations e
       LEFT JOIN courses c ON e.course_id = c.course_id
       WHERE e.user_id = ? AND e.exam_date >= CURDATE()
       ORDER BY e.exam_date LIMIT 4`,
      { replacements: [uid], type: QueryTypes.SELECT }
    );

    // ── Study hours by course this week ────────────────────────
    const studyByCourse = await sequelize.query(
      `SELECT c.name AS course, SUM(s.duration) AS hours
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.course_id
       WHERE s.user_id = ? AND YEARWEEK(s.session_date, 1) = YEARWEEK(CURDATE(), 1)
       GROUP BY c.name ORDER BY hours DESC LIMIT 6`,
      { replacements: [uid], type: QueryTypes.SELECT }
    );

    // ── Task status distribution ────────────────────────────────
    const completedCount   = await Task.count({ where: { user_id: uid, status: "Completed"   } });
    const inProgressCount  = await Task.count({ where: { user_id: uid, status: "In Progress" } });
    const pendingCount     = await Task.count({ where: { user_id: uid, status: "Pending"     } });

    res.json({
      stats: {
        pendingTasks,
        pendingAssignments,
        upcomingExams,
        weekSessions: Number(weekSessions[0]?.cnt || 0),
      },
      deadlines,
      todaySessions: todaySessions.map(s => ({
        id:        s.session_id,
        title:     s.title,
        startTime: s.start_time?.slice(0, 5),
        duration:  Number(s.duration),
        color:     s.color,
        course:    s.Course?.name || null,
      })),
      exams,
      studyByCourse: studyByCourse.map(r => ({ course: r.course || "Uncategorised", hours: Number(r.hours) })),
      taskStatus: [
        { name: "Completed",   value: completedCount,  color: "#10B981" },
        { name: "In Progress", value: inProgressCount, color: "#6366F1" },
        { name: "Pending",     value: pendingCount,    color: "#F59E0B" },
      ].filter(d => d.value > 0),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
