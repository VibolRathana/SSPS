import { Task, Course, PriorityResult } from "../models/index.js";
import { calculatePriority,getPriorityLevel } from "../services/PriorityService.js";

async function findOrCreateCourse(userId, courseName) {
  if (!courseName?.trim()) return null;
  const [course] = await Course.findOrCreate({
    where:    { user_id: userId, name: courseName.trim() },
    defaults: { user_id: userId, name: courseName.trim() },
  });
  return course.course_id;
}

function fmtDate(d) {
  if (!d) return null;
  return new Date(d + "T00:00:00").toLocaleDateString("en-GB", { day: "2-digit", month: "short", year: "numeric" });
}

export async function getTasks(req, res) {
  try {
    const tasks = await Task.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Course, attributes: ["name"], required: false }],
      order:   [["due_date", "ASC"]],
    });
    res.json(tasks.map(t => ({
      id              : t.task_id,
      name            : t.title,
      course          : t.Course?.name || null,
      description     : t.description,
      due             : fmtDate(t.due_date),
      rawDue          : t.due_date,
      difficulty      : t.difficulty,
      progress        : t.progress,
      estimated_hours : t.estimated_hours,
      status          : t.status,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createTask(req, res) {
  try {
    const { title, description, courseName, difficulty,progress,estimated_hours, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const course_id = await findOrCreateCourse(req.user.id, courseName);
    const task = await Task.create({
      user_id: req.user.id, course_id, title,
      description: description || null,
      difficulty:    difficulty  || "Medium",
      progress:      progress ??0,
      estimated_hours: estimated_hours?? 1,
      due_date:    dueDate,
    });
    //====Calculate Priority====//
    const score= calculatePriority(task);
    await PriorityResult.create({
      user_id: req.user.id,
      source_type: "Task",
      source_id: task.task_id,
      priority_score: score,
      priority_level: getPriorityLevel(score)
    });
    res.status(201).json({ id: task.task_id, message: "Task created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateTask(req, res) {
  try {
    const { title, description, courseName, dueDate, difficulty,progress,estimated_hours, status } = req.body;
    const course_id = await findOrCreateCourse(req.user.id, courseName);

    const updates = {};
    if (title       != null) updates.title        = title;
    if (description != null) updates.description  = description;
    if (course_id   != null) updates.course_id    = course_id;
    if (dueDate     != null) updates.due_date     = dueDate;
    if (difficulty  != null) updates.difficulty   = difficulty;
    if (progress    != null) updates.progress      = progress;
    if (estimated_hours !=null) updates.estimated_hours=estimated_hours;
    if (status      != null) updates.status       = status;

    const [count] = await Task.update(updates, {
      where: { task_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Task not found" });
    //==== Recalculate Priority ====//
    const updateTask = await  Task.findByPk(req.params.id);
    const score = calculatePriority(updateTask);
    await PriorityResult.update(
      {
        priority_score:score,
        priority_level:getPriorityLevel(score),
      },
      {
        where:{
          source_type:"Task",
          source_id:req.params.id,
          user_id:req.user.id,
        }
      }
    );
    res.json({ message: "Task updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteTask(req, res) {
  try {
    const count = await Task.destroy({
      where: { task_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Task not found" });
    //=== Delete Priority record ===//
    await PriorityResult.destroy({
      where:{
        source_type:"Task",
        source_id: req.params.id,
        user_id:req.user.id,
      }
    });
    res.json({ message: "Task deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
