import { Examination, Course } from "../models/index.js";

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

export async function getExams(req, res) {
  try {
    const rows = await Examination.findAll({
      where:   { user_id: req.user.id },
      include: [{ model: Course, attributes: ["name", "color"], required: false }],
      order:   [["exam_date", "ASC"]],
    });
    res.json(rows.map(e => ({
      id:          e.exam_id,
      name:        e.subject,
      courseId:    e.course_id,
      course:      e.Course?.name  || null,
      courseColor: e.Course?.color || null,
      date:        fmtDate(e.exam_date),
      rawDate:     e.exam_date,
      preparation: e.preparation,
    })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createExam(req, res) {
  try {
    const { subject, courseName, examDate, preparation } = req.body;
    if (!subject || !examDate)
      return res.status(400).json({ message: "Subject and exam date are required" });
    const course_id = await findOrCreateCourse(req.user.id, courseName);
    const exam = await Examination.create({
      user_id: req.user.id, course_id, subject,
      exam_date:   examDate,
      preparation: preparation ?? 0,
    });
    res.status(201).json({ id: exam.exam_id, message: "Exam created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateExam(req, res) {
  try {
    const { subject, courseName, examDate, preparation } = req.body;
    const course_id = await findOrCreateCourse(req.user.id, courseName);

    const updates = {};
    if (subject     != null) updates.subject     = subject;
    if (course_id   != null) updates.course_id   = course_id;
    if (examDate    != null) updates.exam_date    = examDate;
    if (preparation != null) updates.preparation = preparation;

    const [count] = await Examination.update(updates, {
      where: { exam_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam updated" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteExam(req, res) {
  try {
    const count = await Examination.destroy({
      where: { exam_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Exam not found" });
    res.json({ message: "Exam deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
