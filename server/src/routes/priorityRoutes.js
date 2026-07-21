import express from "express";
import { getPriorityResults } from "../controllers/priorityController.js";
import{protect} from"../middleware/authMiddleware.js";

const router= express.Router();
router.get("/",protect,getPriorityResults);

export default router;