import { Op } from "sequelize";
import { sequelize } from "../config/db.js";
import { StudySession, Course } from "../models/index.js";

async function findOrCreateCourse(userId, courseName) {
  if (!courseName?.trim()) return null;
  const [course] = await Course.findOrCreate({
    where:    { user_id: userId, name: courseName.trim() },
    defaults: { user_id: userId, name: courseName.trim() },
  });
  return course.course_id;
}

export async function getSessions(req, res) {
  try {
    const uid = req.user.id;
    const { year, month } = req.query;

    const where = { user_id: uid };
    if (year && month) {
      where[Op.and] = [
        sequelize.where(sequelize.fn("YEAR",  sequelize.col("session_date")), year),
        sequelize.where(sequelize.fn("MONTH", sequelize.col("session_date")), month),
      ];
    }

    const rows = await StudySession.findAll({
      where,
      include: [{ model: Course, attributes: ["name"], required: false }],
      order:   [["session_date", "ASC"], ["start_time", "ASC"]],
    });

    res.json(rows.map(s => ({
      id:        s.session_id,
      title:     s.title,
      course:    s.Course?.name || null,
      date:      s.session_date,
      startTime: s.start_time?.slice(0, 5),
      duration:  Number(s.duration),
      color:     s.color,
      courseId:  s.course_id,
    })));
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function createSession(req, res) {
  try {
    const uid = req.user.id;
    const { title, courseName, date, startTime, duration, color } = req.body;
    if (!title || !date || !startTime)
      return res.status(400).json({ message: "Title, date, and start time are required." });

    const course_id = await findOrCreateCourse(uid, courseName);
    const s = await StudySession.create({
      user_id: uid, course_id,
      title:        title.trim(),
      session_date: date,
      start_time:   startTime,
      duration:     duration || 1.0,
      color:        color    || "indigo",
    });
    res.status(201).json({ id: s.session_id });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateSession(req, res) {
  try {
    const uid = req.user.id;
    const { title, courseName, date, startTime, duration, color } = req.body;
    const course_id = await findOrCreateCourse(uid, courseName);

    const updates = {};
    if (title    != null) updates.title        = title;
    if (courseName !== undefined) updates.course_id = course_id;
    if (date     != null) updates.session_date = date;
    if (startTime!= null) updates.start_time   = startTime;
    if (duration != null) updates.duration     = duration;
    if (color    != null) updates.color        = color;

    const [count] = await StudySession.update(updates, {
      where: { session_id: req.params.id, user_id: uid },
    });
    if (count === 0) return res.status(404).json({ message: "Study session not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function deleteSession(req, res) {
  try {
    const count = await StudySession.destroy({
      where: { session_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Study session not found" });
    res.json({ success: true });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
