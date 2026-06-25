import express from 'express';
import { generateTaskPriority,generateAssignmentPriority,generateExaminationPriority } from '../controllers/pritotityController.js';


const router = express.Router();
router.post("/task/:id",generateTaskPriority);
router.post("/assignment/:id",generateAssignmentPriority);
router.post("/exam/:id",generateExaminationPriority);
export default router;
