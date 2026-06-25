import OpenAI from "openai";
import { pool } from "../config/db.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ── shared helper: fetch user workload ───────────────────────────
async function fetchWorkload(uid) {
  const [tasks] = await pool.query(
    `SELECT t.task_id AS id, t.title, c.name AS course,
            DATE_FORMAT(t.due_date,'%Y-%m-%d') AS due,
            t.priority, t.status
     FROM tasks t LEFT JOIN courses c ON t.course_id = c.course_id
     WHERE t.user_id = ? AND t.status <> 'Completed'
     ORDER BY t.due_date LIMIT 20`, [uid]
  );
  const [assignments] = await pool.query(
    `SELECT a.assignment_id AS id, a.title, c.name AS course,
            DATE_FORMAT(a.due_date,'%Y-%m-%d') AS due,
            a.priority, a.status
     FROM assignments a LEFT JOIN courses c ON a.course_id = c.course_id
     WHERE a.user_id = ? AND a.status NOT IN ('Submitted','Graded')
     ORDER BY a.due_date LIMIT 20`, [uid]
  );
  const [exams] = await pool.query(
    `SELECT e.exam_id AS id, e.subject AS title, c.name AS course,
            DATE_FORMAT(e.exam_date,'%Y-%m-%d') AS due,
            e.preparation
     FROM examinations e LEFT JOIN courses c ON e.course_id = c.course_id
     WHERE e.user_id = ? AND e.exam_date >= CURDATE()
     ORDER BY e.exam_date LIMIT 10`, [uid]
  );
  return { tasks, assignments, exams };
}

function workloadText({ tasks, assignments, exams }) {
  const lines = [];
  if (tasks.length)       { lines.push("TASKS:");       tasks.forEach(t => lines.push(`  - "${t.title}"${t.course?` (${t.course})`:""}  due:${t.due}  priority:${t.priority}`)); }
  if (assignments.length) { lines.push("ASSIGNMENTS:"); assignments.forEach(a => lines.push(`  - "${a.title}"${a.course?` (${a.course})`:""}  due:${a.due}  priority:${a.priority}`)); }
  if (exams.length)       { lines.push("EXAMS:");       exams.forEach(e => lines.push(`  - "${e.title}"${e.course?` (${e.course})`:""}  date:${e.due}  prep:${e.preparation}%`)); }
  return lines.join("\n");
}

// ── 1. AI Study Plan (existing) ──────────────────────────────────
export async function getRecommendation(req, res) {
  try {
    const uid = req.user.id;
    const wl = await fetchWorkload(uid);
    if (!wl.tasks.length && !wl.assignments.length && !wl.exams.length)
      return res.json({ recommendation: "You have no pending tasks, assignments, or upcoming exams. Add some to get personalised recommendations!" });

    const prompt = `You are a helpful academic study planner. A student's workload:\n\n${workloadText(wl)}\n\nProvide:\n1. What to prioritise first and why\n2. What needs immediate attention\n3. Exam preparation advice\n4. A suggested study action plan\n\nBe concise, practical, and encouraging. Use bullet points.`;

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful academic study planner assistant." },
        { role: "user",   content: prompt },
      ],
    });
    const recommendation = result.choices[0].message.content;
    await pool.query(`INSERT INTO ai_recommendations (user_id, priority_score, recommended_action) VALUES (?, 0, ?)`, [uid, recommendation]);
    res.json({ recommendation });
  } catch (err) {
    console.error("[recommendation]", err.message);
    res.status(500).json({ message: err.message });
  }
}

export async function getLastRecommendation(req, res) {
  try {
    const [[row]] = await pool.query(
      `SELECT recommended_action AS recommendation,
              DATE_FORMAT(generated_at, '%d %b %Y %h:%i %p') AS generatedAt
       FROM ai_recommendations WHERE user_id = ?
       ORDER BY generated_at DESC LIMIT 1`,
      [req.user.id]
    );
    res.json(row || { recommendation: null });
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

    const prompt = `Score each item from 0-100 based on urgency (deadline proximity, priority, low preparation). Today is ${new Date().toISOString().split("T")[0]}.

Items:
${itemList}

Return ONLY a JSON object in this exact format, no extra text:
{"scores":[{"index":1,"title":"...","type":"Task","score":85,"label":"Urgent","reason":"..."},...]}

Labels must be one of: Critical, Urgent, Moderate, Low`;

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a study planner. Respond with valid JSON only." },
        { role: "user",   content: prompt },
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

    const prompt = `Create a 7-day study schedule starting from ${today} for this student.

Workload:
${workloadText(wl)}

Rules:
- Schedule 1-3 study sessions per day, each 1-3 hours
- Focus more on items with closer deadlines
- Spread the workload evenly
- Use realistic times (08:00-21:00)
- Colors: use "indigo" for tasks, "orange" for assignments, "purple" for exams, "green" for review

Return ONLY a JSON object, no extra text:
{"sessions":[{"title":"Study: ...","courseName":"...","date":"YYYY-MM-DD","startTime":"HH:MM","duration":2,"color":"indigo"},...]}`;

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a study scheduler. Respond with valid JSON only." },
        { role: "user",   content: prompt },
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
    const uid      = req.user.id;
    const { sessions } = req.body;
    if (!Array.isArray(sessions) || !sessions.length)
      return res.status(400).json({ message: "No sessions provided." });

    let added = 0;
    for (const s of sessions) {
      if (!s.title || !s.date || !s.startTime) continue;
      let courseId = null;
      if (s.courseName?.trim()) {
        const [[ex]] = await pool.query(
          `SELECT course_id FROM courses WHERE user_id = ? AND name = ? LIMIT 1`, [uid, s.courseName.trim()]
        );
        if (ex) courseId = ex.course_id;
        else {
          const [r] = await pool.query(`INSERT INTO courses (user_id, name) VALUES (?, ?)`, [uid, s.courseName.trim()]);
          courseId = r.insertId;
        }
      }
      await pool.query(
        `INSERT INTO study_sessions (user_id, title, course_id, session_date, start_time, duration, color)
         VALUES (?, ?, ?, ?, ?, ?, ?)`,
        [uid, s.title, courseId, s.date, s.startTime, s.duration || 1, s.color || "indigo"]
      );
      added++;
    }
    res.json({ added });
  } catch (err) {
    console.error("[addSchedule]", err.message);
    res.status(500).json({ message: err.message });
  }
}

// ── 5. Chatbot ────────────────────────────────────────────────────
export async function chatWithAI(req, res) {
  try {
    const uid      = req.user.id;
    const { messages } = req.body; // [{ role: "user"|"assistant", content: string }]
    if (!messages?.length) return res.status(400).json({ message: "No messages provided." });

    const wl = await fetchWorkload(uid);
    const context = (wl.tasks.length || wl.assignments.length || wl.exams.length)
      ? `\n\nStudent's current workload:\n${workloadText(wl)}`
      : "\n\nThe student has no pending workload currently.";

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role: "system",
          content: `You are a friendly and helpful academic study assistant for a Smart Study Planner app. Help the student with study advice, time management, motivation, and questions about their workload.${context}`,
        },
        ...messages,
      ],
    });

    res.json({ reply: result.choices[0].message.content });
  } catch (err) {
    console.error("[chat]", err.message);
    res.status(500).json({ message: err.message });
  }
}
