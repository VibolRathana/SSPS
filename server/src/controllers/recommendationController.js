import OpenAI from "openai";
import { QueryTypes } from "sequelize";
import { sequelize } from "../config/db.js";
import { AiRecommendation, Course, StudySession } from "../models/index.js";

const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ── shared helper: fetch user workload ───────────────────────────
async function fetchWorkload(uid) {
  const tasks = await sequelize.query(
    `SELECT t.task_id AS id, t.title, c.name AS course,
            t.due_date AS due, t.priority, t.status
     FROM tasks t LEFT JOIN courses c ON t.course_id = c.course_id
     WHERE t.user_id = ? AND t.status <> 'Completed'
     ORDER BY t.due_date LIMIT 20`,
    { replacements: [uid], type: QueryTypes.SELECT }
  );
  const assignments = await sequelize.query(
    `SELECT a.assignment_id AS id, a.title, c.name AS course,
            a.due_date AS due, a.priority, a.status
     FROM assignments a LEFT JOIN courses c ON a.course_id = c.course_id
     WHERE a.user_id = ? AND a.status NOT IN ('Submitted','Graded')
     ORDER BY a.due_date LIMIT 20`,
    { replacements: [uid], type: QueryTypes.SELECT }
  );
  const exams = await sequelize.query(
    `SELECT e.exam_id AS id, e.subject AS title, c.name AS course,
            e.exam_date AS due, e.preparation
     FROM examinations e LEFT JOIN courses c ON e.course_id = c.course_id
     WHERE e.user_id = ? AND e.exam_date >= CURDATE()
     ORDER BY e.exam_date LIMIT 10`,
    { replacements: [uid], type: QueryTypes.SELECT }
  );
  return { tasks, assignments, exams };
}

function workloadText({ tasks, assignments, exams }) {
  const lines = [];
  if (tasks.length)       { lines.push("TASKS:");       tasks.forEach(t => lines.push(`  - "${t.title}"${t.course ? ` (${t.course})` : ""}  due:${t.due}  priority:${t.priority}`)); }
  if (assignments.length) { lines.push("ASSIGNMENTS:"); assignments.forEach(a => lines.push(`  - "${a.title}"${a.course ? ` (${a.course})` : ""}  due:${a.due}  priority:${a.priority}`)); }
  if (exams.length)       { lines.push("EXAMS:");       exams.forEach(e => lines.push(`  - "${e.title}"${e.course ? ` (${e.course})` : ""}  date:${e.due}  prep:${e.preparation}%`)); }
  return lines.join("\n");
}

// ── 1. AI Study Plan ─────────────────────────────────────────────
export async function getRecommendation(req, res) {
  try {
    const uid = req.user.id;
    const wl  = await fetchWorkload(uid);
    if (!wl.tasks.length && !wl.assignments.length && !wl.exams.length)
      return res.json({ recommendation: "You have no pending tasks, assignments, or upcoming exams. Add some to get personalised recommendations!" });

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful academic study planner assistant." },
        { role: "user",   content: `You are a helpful academic study planner. A student's workload:\n\n${workloadText(wl)}\n\nProvide:\n1. What to prioritise first and why\n2. What needs immediate attention\n3. Exam preparation advice\n4. A suggested study action plan\n\nBe concise, practical, and encouraging. Use bullet points.` },
      ],
    });
    const recommendation = result.choices[0].message.content;
    await AiRecommendation.create({ user_id: uid, priority_score: 0, recommended_action: recommendation });
    res.json({ recommendation });
  } catch (err) {
    console.error("[recommendation]", err.message);
    res.status(500).json({ message: err.message });
  }
}

export async function getLastRecommendation(req, res) {
  try {
    const row = await AiRecommendation.findOne({
      where:      { user_id: req.user.id },
      order:      [["generated_at", "DESC"]],
      attributes: [
        "recommended_action",
        [sequelize.fn("DATE_FORMAT", sequelize.col("generated_at"), "%d %b %Y %h:%i %p"), "generatedAt"],
      ],
    });
    res.json(row ? {
      recommendation: row.recommended_action,
      generatedAt:    row.get("generatedAt"),
    } : { recommendation: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

// ── 2. Score generation ──────────────────────────────────────────
export async function getScores(req, res) {
  try {
    const uid = req.user.id;
    const wl  = await fetchWorkload(uid);
    const all = [
      ...wl.tasks.map(t => ({ ...t, type: "Task" })),
      ...wl.assignments.map(a => ({ ...a, type: "Assignment" })),
      ...wl.exams.map(e => ({ ...e, type: "Exam" })),
    ];
    if (!all.length) return res.json({ scores: [] });

    const itemList = all.map((item, i) =>
      `${i + 1}. [${item.type}] "${item.title}"${item.course ? ` (${item.course})` : ""}  due/date: ${item.due}${item.priority ? `  priority: ${item.priority}` : ""}${item.preparation !== undefined ? `  prep: ${item.preparation}%` : ""}`
    ).join("\n");

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a study planner. Respond with valid JSON only." },
        { role: "user",   content: `Score each item 0-100 by urgency. Today: ${new Date().toISOString().split("T")[0]}.\n\nItems:\n${itemList}\n\nReturn ONLY:\n{"scores":[{"index":1,"title":"...","type":"Task","score":85,"label":"Urgent","reason":"..."}]}\n\nLabels: Critical, Urgent, Moderate, Low` },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(result.choices[0].message.content);
    res.json({ scores: parsed.scores ?? [] });
  } catch (err) {
    console.error("[scores]", err.message);
    res.status(500).json({ message: err.message });
  }
}

// ── 3. Generate study schedule ───────────────────────────────────
export async function generateSchedule(req, res) {
  try {
    const uid   = req.user.id;
    const wl    = await fetchWorkload(uid);
    const today = new Date().toISOString().split("T")[0];

    if (!wl.tasks.length && !wl.assignments.length && !wl.exams.length)
      return res.json({ sessions: [] });

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a study scheduler. Respond with valid JSON only." },
        { role: "user",   content: `Create a 7-day study schedule starting ${today}.\n\nWorkload:\n${workloadText(wl)}\n\nRules: 1-3 sessions/day, 1-3 hours each, spread evenly, times 08:00-21:00.\nColors: indigo=tasks, orange=assignments, purple=exams, green=review.\n\nReturn ONLY:\n{"sessions":[{"title":"Study: ...","courseName":"...","date":"YYYY-MM-DD","startTime":"HH:MM","duration":2,"color":"indigo"}]}` },
      ],
      response_format: { type: "json_object" },
    });

    const parsed = JSON.parse(result.choices[0].message.content);
    res.json({ sessions: parsed.sessions ?? [] });
  } catch (err) {
    console.error("[generateSchedule]", err.message);
    res.status(500).json({ message: err.message });
  }
}

// ── 4. Add generated sessions to schedule ────────────────────────
export async function addScheduleSessions(req, res) {
  try {
    const uid = req.user.id;
    const { sessions } = req.body;
    if (!Array.isArray(sessions) || !sessions.length)
      return res.status(400).json({ message: "No sessions provided." });

    let added = 0;
    for (const s of sessions) {
      if (!s.title || !s.date || !s.startTime) continue;
      let course_id = null;
      if (s.courseName?.trim()) {
        const [course] = await Course.findOrCreate({
          where:    { user_id: uid, name: s.courseName.trim() },
          defaults: { user_id: uid, name: s.courseName.trim() },
        });
        course_id = course.course_id;
      }
      await StudySession.create({
        user_id: uid, course_id,
        title:        s.title,
        session_date: s.date,
        start_time:   s.startTime,
        duration:     s.duration || 1,
        color:        s.color    || "indigo",
      });
      added++;
    }
    res.json({ added });
  } catch (err) {
    console.error("[addSchedule]", err.message);
    res.status(500).json({ message: err.message });
  }
}

// ── 5. Chatbot ───────────────────────────────────────────────────
export async function chatWithAI(req, res) {
  try {
    const uid = req.user.id;
    const { messages } = req.body;
    if (!messages?.length) return res.status(400).json({ message: "No messages provided." });

    const wl = await fetchWorkload(uid);
    const context = (wl.tasks.length || wl.assignments.length || wl.exams.length)
      ? `\n\nStudent's current workload:\n${workloadText(wl)}`
      : "\n\nThe student has no pending workload currently.";

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `You are a friendly academic study assistant for a Smart Study Planner app.${context}` },
        ...messages,
      ],
    });
    res.json({ reply: result.choices[0].message.content });
  } catch (err) {
    console.error("[chat]", err.message);
    res.status(500).json({ message: err.message });
  }
}
