import OpenAI from "openai";
import { sequelize } from "../config/db.js";
import { AiRecommendation, Course, StudySession } from "../models/index.js";
import { buildScheduleData } from "../services/ScheduleService.js";

const client = new OpenAI({
  apiKey:  process.env.GROQ_API_KEY,
  baseURL: "https://api.groq.com/openai/v1",
});

// ── 1. AI Study Plan ─────────────────────────────────────────────
export async function getRecommendation(req, res) {
  try{
    const scheduleData= await buildScheduleData(req.user.id);

    if(scheduleData.workload.length===0){
      return res.json({
        recommendation: "You have no pending tasks, assignmnets or exams."
      });
    }
    const result= await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        {
          role:"system",
          content: "You are an academic study planner."
        },
        {
          role:"user",
          content: `You are helping a university student.
                    Student availability: ${JSON.stringify(scheduleData.availableHours,null,2)}
                    Student workload: ${JSON.stringify(scheduleData.workload,null,2)}
                    Please provide:
                    1. Highest priority task
                    2. Explain why
                    3. Study strategy
                    4. Time management tips
                        
                        keep under 200 words.`
        }
      ]
    });
<<<<<<< HEAD
    const recommendation= result.choices[0].message.content;
    await AiRecommendation.create({
      user_id:req.user.id,
      priority_score: scheduleData.workload[0].priority,
      recommended_action: recommendation
    });
    res.json({recommendation});
  }catch(err){
    res.status(500).json({message:err.message})
=======
    const recommendation = result.choices[0].message.content;
    await AiRecommendation.create({ user_id: uid, priority_score: 0, recommended_action: recommendation });
    res.json({ recommendation });
  } catch (err) {
    console.error("[recommendation]", err.message);
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
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
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── 2. Score generation ──────────────────────────────────────────
export async function getScores(req, res) {
<<<<<<< HEAD
  try{
    const data= await buildScheduleData(req.user.id);
    res.json(data.workload);
  }catch(err){
    res.status(500).json({message:err.message});
=======
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
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
  }
}

// ── 3. Generate study schedule ───────────────────────────────────
export async function generateSchedule(req, res) {
  try {
    const uid   = req.user.id;
    const scheduleData= await buildScheduleData(uid);  // Get prepared data from ScheduleService
      if (
            scheduleData.tasks.length === 0 &&
            scheduleData.assignments.length === 0 &&
            scheduleData.exams.length === 0
        ) {
            return res.json({
                message: "No tasks, assignments or exams found.",
                sessions: [],
            });
        }

    const validSlots = []; //Remove slots after deadline

    for (const work of scheduleData.splitWorkload) {

      const due = new Date(work.dueDate);

      scheduleData.availableSlots.forEach((slot) => {

        if (new Date(slot.date) <= due) {

            validSlots.push({
                ...slot,
               workloadTitle: work.title,
            });

        }

    });

<<<<<<< HEAD
}
//Add
    console.log("========== VALID SLOTS ==========");
    console.log(validSlots);

    if (validSlots.length === 0) {

            return res.json({
                message:
                    "No available study slots before task deadlines.",
                sessions: [],
            });

        }
    
    // send structured data to AI

    const result= await client.chat.completions.create({
      model:"llama-3.1-8b-instant",
      messages:[
        {
          role:"system",
          content: `
             You are an AI Study Schedule Planner.

            Rules:

            1. Use ONLY the provided workloadId values.
            2. Use ONLY the provided slotId values.
            3. Never invent workloadId.
            4. Never invent slotId.
            5. Never invent titles.
            6. Never invent course names.
            7. Never invent dates.
            8. Never invent start times.
            9. Never schedule after dueDate.
           10. Each slotId can only be used once.
           11. Return JSON only.

               Required format:

                {
                    "sessions":[
                          {
                           "workloadId":0,
                           "slotId":1
                          }
                              ]
                  }
                    `
        },
        {
          role: "user",
          content:
            `
            create a 7-day study schedule.
            Student availability:${JSON.stringify(scheduleData.availableHours, null, 2)}
            Available study slots: ${JSON.stringify(validSlots,null,2)}
            Split study sessions: ${JSON.stringify(scheduleData.splitWorkload.map((item,index)=>({
              workloadId: index,
              title:item.title,
              course: item.course,
              dueDate: item.dueDate,
              duration: item.duration,
            })),null,2)}

            `
        }
      ],
      response_format:{
        type:"json_object"
      }
    });
    console.log("========== AI RAW ==========");
    console.log(result.choices[0].message.content);
    const parsed = JSON.parse(
    result.choices[0].message.content
);
console.log("========== AI PARSED ==========");
    console.log(parsed);
const aiSessions =parsed.sessions || [];
console.log("========== AI SESSIONS ==========");
console.log(aiSessions);

//Prevent Dupliccation Slots
const usedSlots = new Set();

const sessions = aiSessions.map((item) => {
     console.log("Processing:", item);
    const workload =scheduleData.splitWorkload[item.workloadId];

    if (!workload) {
        return null;
    }

    let slot = scheduleData.availableSlots.find(
        s => Number(s.slotId) === Number(item.slotId)
    );

    if (!slot) {
        return null;
    }

    const due = new Date(workload.dueDate);

    if (new Date(slot.date) > due) {
      
        console.log("Slot after due date. Searching earlier slot...");
        slot = scheduleData.availableSlots.find(
            s =>
                new Date(s.date) <= due &&
                !usedSlots.has(s.slotId)
        );

        if (!slot) {
            return null;
        }

    }

    if (usedSlots.has(slot.slotId)) {
        return null;
    }

    usedSlots.add(slot.slotId);

    return {
        title: workload.title,
        courseName: workload.course,
        date: slot.date,
        startTime: slot.startTime,
        duration: workload.duration,
        color: "indigo",
    };
 console.log("Accepted session:", session);

      return session;

}).filter(Boolean);
console.log("========== FINAL SESSIONS ==========");
    console.log(sessions);
     res.json({
      message: "AI schedule generated",
      sessions,
    });
  }catch (err) {
  return res.status(500).json({
    message: err.message,
  });
}

}

// ── 4. Add generated sessions to schedule ────────────────────────

export async function addScheduleSessions(req, res) { 
  try { 
    const uid = req.user.id; 
    const { sessions } = req.body; 
    if (!sessions?.length) { 
      return res.status(400).json({ message: "No sessions.", }); } 
      await StudySession.destroy({ where: { user_id: uid }, }); 
      let added = 0; 
      for (const s of sessions) { 
        let course_id = null; 
        if (s.courseName) {
           const [course] = await Course.findOrCreate({ where: { user_id: uid, name: s.courseName, }, defaults: { user_id: uid, name: s.courseName, }, }); 
           course_id = course.course_id; }
            await StudySession.create({ user_id: uid, course_id, title: s.title, session_date: s.date, start_time: s.startTime, duration: s.duration, color: s.color, });
             added++;
             } 
             res.json({ added, });
             }
              catch (err) {
                 res.status(500).json({ message: err.message, }); } }
=======
    const parsed = JSON.parse(result.choices[0].message.content);
    res.json({ sessions: parsed.sessions ?? [] });
  } catch (err) {
    console.error("[generateSchedule]", err.message);
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

// ── 4. Add generated sessions to schedule ────────────────────────
export async function addScheduleSessions(req, res) {
  try {
    const uid = req.user.id;
    const { sessions } = req.body;
    if (!Array.isArray(sessions) || !sessions.length)
      return res.status(400).json({ message: "No sessions provided." });
    if (sessions.length > 50)
      return res.status(400).json({ message: "A maximum of 50 sessions can be added at once." });

    let added = 0;
    for (const s of sessions) {
      const duration = Number(s.duration ?? 1);
      if (
        typeof s.title !== "string" || !s.title.trim() || s.title.length > 150 ||
        !/^\d{4}-\d{2}-\d{2}$/.test(String(s.date)) ||
        !/^([01]\d|2[0-3]):[0-5]\d$/.test(String(s.startTime)) ||
        !Number.isFinite(duration) || duration <= 0 || duration > 12
      ) continue;
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
        title:        s.title.trim(),
        session_date: s.date,
        start_time:   s.startTime,
        duration,
        color:        s.color    || "indigo",
      });
      added++;
    }
    if (added === 0) {
      return res.status(400).json({ message: "No valid sessions were provided." });
    }
    res.json({ added });
  } catch (err) {
    console.error("[addSchedule]", err.message);
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

// ── 5. Chatbot ───────────────────────────────────────────────────
export async function chatWithAI(req, res) {
  try {
<<<<<<< HEAD
    const {messages}= req.body;
    const scheduleData= await buildScheduleData(req.user.id);
     if(!messages || !messages.length){
      return res.status(400).json({message:"No message provided."})
    };
    const result= await client.chat.completions.create({
      model:"llama-3.1-8b-instant",
      messages:[
        {
          role:"system",
          content: `You are a Smart Study Planner assistent.
          Student availability: ${JSON.stringify(scheduleData.availableHours,null,2)}
          Student workload: ${JSON.stringify(scheduleData.workload,null,2)}
          Answer questions based on the student's current schedule.`
        },
        ...messages
      ]
     
=======
    const uid = req.user.id;
    const { messages } = req.body;
    const safeMessages = Array.isArray(messages)
      ? messages
          .filter(m =>
            ["user", "assistant"].includes(m?.role) &&
            typeof m.content === "string" &&
            m.content.trim()
          )
          .slice(-20)
          .map(m => ({ role: m.role, content: m.content.slice(0, 4000) }))
      : [];
    if (!safeMessages.length)
      return res.status(400).json({ message: "No valid messages provided." });

    const wl = await fetchWorkload(uid);
    const context = (wl.tasks.length || wl.assignments.length || wl.exams.length)
      ? `\n\nStudent's current workload:\n${workloadText(wl)}`
      : "\n\nThe student has no pending workload currently.";

    const result = await client.chat.completions.create({
      model: "llama-3.1-8b-instant",
      messages: [
        { role: "system", content: `You are a friendly academic study assistant for a Smart Study Planner app.${context}` },
        ...safeMessages,
      ],
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
    });
   
    res.json({reply:result.choices[0].message.content});
  } catch (err) {
<<<<<<< HEAD
    res.status(500).json({message:err.message});
=======
    console.error("[chat]", err.message);
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
  }
}
