import { Assignment, Course, PriorityResult } from "../models/index.js";
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

export async function getAssignments(req, res) {
  try {
    const rows = await Assignment.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Course, attributes: ["name"], required: false }],
      order:   [["due_date", "ASC"]],
    });
    res.json(rows.map(a => ({
      id:          a.assignment_id,
      name:        a.title,
      course:      a.Course?.name || null,
      description: a.description,
      due:         fmtDate(a.due_date),
      rawDue:      a.due_date,
      difficulty: a.difficulty,
      progress: a.progress,
      estimated_hours: a.estimated_hours,
      status:      a.status,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAssignment(req, res) {
  try {
    const { title, description, courseName, difficulty, progress,estimated_hours, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const course_id = await findOrCreateCourse(req.user.id, courseName);
    const a = await Assignment.create({
      user_id: req.user.id, course_id, title,
      description: description || null,
      difficulty:    difficulty   || "Medium",
      progress: progress ??0,
      estimated_hours: estimated_hours ?? 1,
      due_date:    dueDate,
    });
    //=== CalculatePriority ===//
    const score= calculatePriority(a);
    await PriorityResult.create({
      user_id:req.user.id,
      source_type:"Assignment",
      source_id:a.assignment_id,
      priority_score:score,
      priority_level: getPriorityLevel(score),
    });
    res.status(201).json({ id: a.assignment_id, message: "Assignment created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAssignment(req, res) {
  try {
    const { title, description, courseName, dueDate, difficulty,progress, status } = req.body;
    const course_id = await findOrCreateCourse(req.user.id, courseName);

    const updates = {};
    if (title       != null) updates.title       = title;
    if (description != null) updates.description = description;
    if (courseName  !== undefined) updates.course_id = course_id;
    if (dueDate     != null) updates.due_date     = dueDate;
    if (difficulty  != null) updates.difficulty   = difficulty;
    if (progress    != null) updates.progress     = progress;
    if (estimated_hours !=null) update.estimated_hours=estimated_hours;
    if (status      != null) updates.status       = status;

    const [count] = await Assignment.update(updates, {
      where: { assignment_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Assignment not found" });
    //=== Recalculate Priority ===//
    const updateAssignment=await Assignment.findByPk(req.params.id);
    const score= calculatePriority(updateAssignment);
    await PriorityResult.update(
      {
        priority_score:score,
        priority_level:getPriorityLevel(score),
      },
      {
        where:{
          source_type:"Assignment",
          source_id: req.params.id,
          user_id:req.user.id,
        }
      }
    );
    res.json({ message: "Assignment updated" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteAssignment(req, res) {
  try {
    const count = await Assignment.destroy({
      where: { assignment_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Assignment not found" });
    //=== Delete Priority Record ===//
    await PriorityResult.destroy({
      where:{
        source_type:"Assignment",
        source_id: req.params.id,
        user_id:req.user.id,
      }
    });
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
