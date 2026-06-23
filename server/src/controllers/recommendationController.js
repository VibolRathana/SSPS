import OpenAI from "openai";
import { pool } from "../config/db.js";

const client = new OpenAI({
  apiKey: process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

export async function getRecommendation(req, res) {
  try {
    const uid = req.user.id;

    // Fetch pending/in-progress tasks
    const [tasks] = await pool.query(
      `SELECT t.title, c.name AS course, DATE_FORMAT(t.due_date,'%d %b %Y') AS due,
              t.priority, t.status
       FROM tasks t
       LEFT JOIN courses c ON t.course_id = c.course_id
       WHERE t.user_id = ? AND t.status <> 'Completed'
       ORDER BY t.due_date LIMIT 20`,
      [uid]
    );

    // Fetch pending/in-progress assignments
    const [assignments] = await pool.query(
      `SELECT a.title, c.name AS course, DATE_FORMAT(a.due_date,'%d %b %Y') AS due,
              a.priority, a.status
       FROM assignments a
       LEFT JOIN courses c ON a.course_id = c.course_id
       WHERE a.user_id = ? AND a.status NOT IN ('Submitted','Graded')
       ORDER BY a.due_date LIMIT 20`,
      [uid]
    );

    // Fetch upcoming exams
    const [exams] = await pool.query(
      `SELECT e.subject, c.name AS course, DATE_FORMAT(e.exam_date,'%d %b %Y') AS date,
              e.preparation
       FROM examinations e
       LEFT JOIN courses c ON e.course_id = c.course_id
       WHERE e.user_id = ? AND e.exam_date >= CURDATE()
       ORDER BY e.exam_date LIMIT 10`,
      [uid]
    );

    if (tasks.length === 0 && assignments.length === 0 && exams.length === 0) {
      return res.json({
        recommendation: "You have no pending tasks, assignments, or upcoming exams right now. Add some to get personalized recommendations!",
      });
    }

    // Build the prompt
    const lines = [];

    if (tasks.length > 0) {
      lines.push("PENDING TASKS:");
      tasks.forEach((t) =>
        lines.push(`  - "${t.title}"${t.course ? ` (${t.course})` : ""} | Due: ${t.due} | Priority: ${t.priority} | Status: ${t.status}`)
      );
    }

    if (assignments.length > 0) {
      lines.push("\nPENDING ASSIGNMENTS:");
      assignments.forEach((a) =>
        lines.push(`  - "${a.title}"${a.course ? ` (${a.course})` : ""} | Due: ${a.due} | Priority: ${a.priority} | Status: ${a.status}`)
      );
    }

    if (exams.length > 0) {
      lines.push("\nUPCOMING EXAMS:");
      exams.forEach((e) =>
        lines.push(`  - "${e.subject}"${e.course ? ` (${e.course})` : ""} | Date: ${e.date} | Preparation: ${e.preparation}%`)
      );
    }

    const prompt = `You are a helpful academic study planner assistant. A student has shared their current workload with you.

${lines.join("\n")}

Based on this data, please provide:
1. What they should prioritize and tackle first (and why)
2. What needs immediate attention based on deadlines
3. Specific advice on exam preparation (for any low-preparation exams)
4. A suggested study order or action plan

Keep your response practical, encouraging, and concise. Use bullet points where helpful.`;

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: "You are a helpful academic study planner assistant." },
        { role: "user", content: prompt },
      ],
    });
    const recommendation = result.choices[0].message.content;

    // Store the latest recommendation
    await pool.query(
      `INSERT INTO ai_recommendations (user_id, priority_score, recommended_action) VALUES (?, 0, ?)`,
      [uid, recommendation]
    );

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
       FROM ai_recommendations
       WHERE user_id = ?
       ORDER BY generated_at DESC LIMIT 1`,
      [req.user.id]
    );
    res.json(row || { recommendation: null });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
