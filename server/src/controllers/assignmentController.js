import { Assignment, Course } from "../models/index.js";

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
      priority:    a.priority,
      status:      a.status,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createAssignment(req, res) {
  try {
    const { title, description, courseName, priority, dueDate } = req.body;
    if (!title || !dueDate)
      return res.status(400).json({ message: "Title and due date are required" });
    const course_id = await findOrCreateCourse(req.user.id, courseName);
    const a = await Assignment.create({
      user_id: req.user.id, course_id, title,
      description: description || null,
      priority:    priority    || "Medium",
      due_date:    dueDate,
    });
    res.status(201).json({ id: a.assignment_id, message: "Assignment created" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateAssignment(req, res) {
  try {
    const { title, description, courseName, dueDate, priority, status } = req.body;
    const course_id = await findOrCreateCourse(req.user.id, courseName);

    const updates = {};
    if (title       != null) updates.title       = title;
    if (description != null) updates.description = description;
    if (courseName  !== undefined) updates.course_id = course_id;
    if (dueDate     != null) updates.due_date     = dueDate;
    if (priority    != null) updates.priority     = priority;
    if (status      != null) updates.status       = status;

    const [count] = await Assignment.update(updates, {
      where: { assignment_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Assignment not found" });
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
    res.json({ message: "Assignment deleted" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
