import {Op} from "sequelize";
import{Task, Assignment, Examination , Course, StudyAvailability} from "../models/index.js";
import { calculatePriority,getPriorityLevel } from "./PriorityService.js";


// =======================================
// Build Available Study Slots (Next 7 Days)
// =======================================
export function buildAvailableSlots(availability) {

    const slots = [];

    const today = new Date();

    
    console.log("==================================");
    console.log("SERVER TODAY:", today.toISOString());

    // Remove time portion
    today.setHours(0, 0, 0, 0);

    let slotId = 1;

    for (let i = 0; i < 7; i++) {

        const current = new Date(today);
        current.setDate(today.getDate() + i);

        const weekday = current.toLocaleDateString("en-US", {
            weekday: "long",
        });

        const available = availability.find(
            a =>
                String(a.day).toLowerCase() ===
                String(weekday).toLowerCase()
        );

        if (!available || Number(available.availableHours) <= 0) {
            continue;
        }

        let remaining = Number(available.availableHours);
        let hour = 8;

        while (remaining > 0) {

            const duration = Math.min(2, remaining);
            const date =current.getFullYear() + "-" +String(current.getMonth() + 1).padStart(2, "0") +"-" +String(current.getDate()).padStart(2, "0");
            slots.push({
                slotId,
                date,
                weekday,
                startTime: `${String(hour).padStart(2, "0")}:00`,
                duration,
            });

            slotId++;
            hour += duration;
            remaining -= duration;
        }
    }

    console.log("Generated Slots:");
    console.table(slots);

    return slots;
}
/*
|--------------------------------------------------------------------------
        | Split Workload into Study Sessions
|--------------------------------------------------------------------------
*/
 export function splitIntoStudySessions(workload){
    const sessions= [];

    workload.forEach((item)=>{
        let remaining = Number(item.estimatedHours);
        while (remaining > 0) {
      const duration = Math.min(2, remaining);

      sessions.push({
        ...item,
        duration,
      });

      remaining -= duration;
    }
    });
    return sessions;
 }
/*
|--------------------------------------------------------------------------
| Build AI Schedule Data
|--------------------------------------------------------------------------
| This service prepares structured data before sending it to AI.
| AI only needs to organize the schedule.
|--------------------------------------------------------------------------
*/
export async function buildScheduleData(userId){
const availability= await StudyAvailability.findAll({
    where:{
        user_id:userId,
    },
    order:[["day_of_week", "ASC"]],
});

  // ================================
           // Get Tasks
  // ================================
const tasks = await Task.findAll({
    where:{
        user_id:userId,
        status: {
            [Op.ne]: "Completed",
        }
    },
    include:[
        {
            model:Course,
            attributes:["name"],
        }
    ]
});

  // ================================
         // Get Assignments
  // ================================
  const assignments= await Assignment.findAll({
    where: {
        user_id:userId,
        status:{
            [Op.notIn]:["Submitted", "Graded"],
        }
    },
    include:[
        {
            model:Course,
            attributes:["name"],
        }
    ]
  });
  
  // ================================
         // Get Exams
  // ================================
   
  const exams= await Examination.findAll({
    where:{
        user_id:userId,
    },
    include:[
        {
            model: Course,
            attributes:["name"],
        }
    ]
  });
  // ================================
         // Build workload
  // ================================
  const workload=[];

  for(const task of tasks){
    const score = calculatePriority(task);
    workload.push({
        type:"Task",
        title:task.title,
        course: task.Course?.name ||"",
        dueDate: task.due_date
    ? new Date(task.due_date).toISOString().split("T")[0]
    : null,
        difficulty: task.difficulty,
        estimatedHours: task.estimated_hours,
        progress : task.progress,
        priority : score,
        priorityLevel : getPriorityLevel(score),
    });
  }

  for(const assignment of assignments){
    const score = calculatePriority(assignment);
    workload.push({
        type:"Assignment",
        title:assignment.title,
        course: assignment.Course?.name ||"",
        dueDate: assignment.due_date
    ? new Date(assignment.due_date).toISOString().split("T")[0]
    : null,
        difficulty: assignment.difficulty,
        estimatedHours: assignment.estimated_hours,
        progress : assignment.progress,
        priority : score,
        priorityLevel : getPriorityLevel(score),
    });
  }

  for (const exam of exams) {
    const score = calculatePriority(exam);

    workload.push({
      type: "Exam",
      title: exam.subject,
      course: exam.Course?.name || "",
      dueDate: exam.exam_date
    ? new Date(exam.exam_date).toISOString().split("T")[0]
    : null,
      difficulty: exam.difficulty,
      estimatedHours: exam.estimated_hours,
      progress: exam.preparation,
      priority: score,
      priorityLevel: getPriorityLevel(score),
    });
  }

     workload.sort((a,b)=>b.priority - a.priority);
// ================================
          // Return JSON for AI
// ================================
    const availableHours = 
        availability.map(item=>({
            day: item.day_of_week,
            availableHours:item.available_hours,
        }));
    
    const availableSlots= buildAvailableSlots(availableHours);
    const splitWorkload= splitIntoStudySessions(workload);
    console.log("========== BUILD SCHEDULE ==========");
console.log("Tasks:", tasks.length);
console.log("Assignments:", assignments.length);
console.log("Exams:", exams.length);
console.log("Workload:", workload);
console.log("Split Workload:", splitWorkload);
console.log("Available Slots:", availableSlots);
    return {
      availableHours:availability.map((item)=>({
        day: item.day_of_week,
        availableHours: item.available_hours,
      })),
      availableSlots,
      splitWorkload,
      tasks: workload.filter((x)=> x.type==="Task"),
      assignments: workload.filter((x)=> x.type==="Assignment"),
      exams: workload.filter((x)=> x.type==="Exam"),
      workload,

    };
  }


    