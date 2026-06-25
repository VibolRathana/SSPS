import { Course } from "../models/index.js";

export async function getCourses(req, res) {
  try {
    const courses = await Course.findAll({
      where:      { user_id: req.user.id },
      attributes: ["course_id", "name", "code", "color"],
      order:      [["name", "ASC"]],
    });
    res.json(courses.map(c => ({ id: c.course_id, name: c.name, code: c.code, color: c.color })));
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function createCourse(req, res) {
  try {
    const { name, code, color } = req.body;
    if (!name) return res.status(400).json({ message: "Course name is required" });
    const course = await Course.create({
      user_id: req.user.id,
      name,
      code:  code  || null,
      color: color || "#6366F1",
    });
    res.status(201).json({ id: course.course_id, message: "Course created" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function deleteCourse(req, res) {
  try {
    const count = await Course.destroy({
      where: { course_id: req.params.id, user_id: req.user.id },
    });
    if (count === 0) return res.status(404).json({ message: "Course not found" });
    res.json({ message: "Course deleted" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
