import express from "express";
import { getCourses, createCourse, deleteCourse } from "../controllers/courseController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();
router.use(protect);

router.get("/",    getCourses);
router.post("/",   createCourse);
router.delete("/:id", deleteCourse);

export default router;
