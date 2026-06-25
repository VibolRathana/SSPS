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
    res.status(500).json({ message: err.message });
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
    res.status(500).json({ message: err.message });
  }
}

export async function updateSession(req, res) {
  try {
    const uid = req.user.id;
    const { title, courseName, date, startTime, duration, color } = req.body;
    const course_id = await findOrCreateCourse(uid, courseName);

    const updates = {};
    if (title    != null) updates.title        = title;
    if (course_id!= null) updates.course_id    = course_id;
    if (date     != null) updates.session_date = date;
    if (startTime!= null) updates.start_time   = startTime;
    if (duration != null) updates.duration     = duration;
    if (color    != null) updates.color        = color;

    await StudySession.update(updates, {
      where: { session_id: req.params.id, user_id: uid },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteSession(req, res) {
  try {
    await StudySession.destroy({
      where: { session_id: req.params.id, user_id: req.user.id },
    });
    res.json({ success: true });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
