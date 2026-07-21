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
    const recommendation= result.choices[0].message.content;
    await AiRecommendation.create({
      user_id:req.user.id,
      priority_score: scheduleData.workload[0].priority,
      recommended_action: recommendation
    });
    res.json({recommendation});
  }catch(err){
    res.status(500).json({message:err.message})
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
  try{
    const data= await buildScheduleData(req.user.id);
    res.json(data.workload);
  }catch(err){
    res.status(500).json({message:err.message});
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

// ── 5. Chatbot ───────────────────────────────────────────────────
export async function chatWithAI(req, res) {
  try {
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
     
    });
   
    res.json({reply:result.choices[0].message.content});
  } catch (err) {
    res.status(500).json({message:err.message});
  }
}
