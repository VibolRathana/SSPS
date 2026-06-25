import { pool } from "../config/db.js";

export async function getDashboard(req, res) {
  try {
    const uid = req.user.id;

    // ── Stats ──────────────────────────────────────────────────
    const [[pendingTasks]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM tasks
       WHERE user_id = ? AND status NOT IN ('Completed')`, [uid]
    );
    const [[pendingAssignments]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM assignments
       WHERE user_id = ? AND status NOT IN ('Submitted','Graded')`, [uid]
    );
    const [[upcomingExams]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM examinations
       WHERE user_id = ? AND exam_date >= CURDATE()`, [uid]
    );
    const [[weekSessions]] = await pool.query(
      `SELECT COUNT(*) AS cnt FROM study_sessions
       WHERE user_id = ?
         AND YEARWEEK(session_date, 1) = YEARWEEK(CURDATE(), 1)`, [uid]
    );

    // ── Upcoming deadlines (tasks + assignments, next 14 days) ──
    const [taskDeadlines] = await pool.query(
      `SELECT t.task_id AS id, t.title, 'Task' AS type,
              DATE_FORMAT(t.due_date,'%d %b %Y') AS dueDate,
              t.due_date AS rawDue, t.priority, t.status,
              c.name AS course
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.course_id
       WHERE t.user_id = ? AND t.status NOT IN ('Completed')
         AND t.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
       ORDER BY t.due_date LIMIT 10`, [uid]
    );
    const [assignDeadlines] = await pool.query(
      `SELECT a.assignment_id AS id, a.title, 'Assignment' AS type,
              DATE_FORMAT(a.due_date,'%d %b %Y') AS dueDate,
              a.due_date AS rawDue, a.priority, a.status,
              c.name AS course
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.course_id
       WHERE a.user_id = ? AND a.status NOT IN ('Submitted','Graded')
         AND a.due_date BETWEEN CURDATE() AND DATE_ADD(CURDATE(), INTERVAL 14 DAY)
       ORDER BY a.due_date LIMIT 10`, [uid]
    );
    // Merge and sort by rawDue
    const deadlines = [...taskDeadlines, ...assignDeadlines]
      .sort((a, b) => new Date(a.rawDue) - new Date(b.rawDue))
      .slice(0, 8);

    // ── Today's study sessions ──────────────────────────────────
    const [todaySessions] = await pool.query(
      `SELECT s.session_id AS id, s.title,
              TIME_FORMAT(s.start_time,'%H:%i') AS startTime,
              s.duration, s.color,
              c.name AS course
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.course_id
       WHERE s.user_id = ? AND s.session_date = CURDATE()
       ORDER BY s.start_time`, [uid]
    );

    // ── Upcoming exams ──────────────────────────────────────────
    const [exams] = await pool.query(
      `SELECT e.exam_id AS id, e.subject,
              DATE_FORMAT(e.exam_date,'%d %b %Y') AS examDate,
              e.exam_date AS rawDate,
              e.preparation,
              c.name AS course,
              DATEDIFF(e.exam_date, CURDATE()) AS daysLeft
       FROM examinations e
       LEFT JOIN courses c ON e.course_id = c.course_id
       WHERE e.user_id = ? AND e.exam_date >= CURDATE()
       ORDER BY e.exam_date LIMIT 4`, [uid]
    );

    // ── Study hours by course this week ────────────────────────
    const [studyByCourse] = await pool.query(
      `SELECT c.name AS course, SUM(s.duration) AS hours
       FROM study_sessions s
       LEFT JOIN courses c ON s.course_id = c.course_id
       WHERE s.user_id = ?
         AND YEARWEEK(s.session_date, 1) = YEARWEEK(CURDATE(), 1)
       GROUP BY c.name
       ORDER BY hours DESC LIMIT 6`, [uid]
    );

    // ── Task status distribution ────────────────────────────────
    const [[taskStatus]] = await pool.query(
      `SELECT
         SUM(status = 'Completed')   AS completed,
         SUM(status = 'In Progress') AS inProgress,
         SUM(status = 'Pending')     AS pending,
         SUM(status = 'Overdue')     AS overdue
       FROM tasks WHERE user_id = ?`, [uid]
    );

    res.json({
      stats: {
        pendingTasks:        Number(pendingTasks.cnt),
        pendingAssignments:  Number(pendingAssignments.cnt),
        upcomingExams:       Number(upcomingExams.cnt),
        weekSessions:        Number(weekSessions.cnt),
      },
      deadlines,
      todaySessions,
      exams,
      studyByCourse: studyByCourse.map(r => ({ course: r.course || "Uncategorised", hours: Number(r.hours) })),
      taskStatus: [
        { name: "Completed",   value: Number(taskStatus.completed  || 0), color: "#10B981" },
        { name: "In Progress", value: Number(taskStatus.inProgress || 0), color: "#6366F1" },
        { name: "Pending",     value: Number(taskStatus.pending    || 0), color: "#F59E0B" },
      ].filter(d => d.value > 0),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
