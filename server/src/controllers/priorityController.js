import Task from "../models/Task.js";
import Assignment from "../models/Assignment.js";
import Examination from '../models/Exam.js';
import PriorityResult from "../models/PriorityResult.js";
import { calculatePriority,getPriorityLevel } from "../services/priorityService.js";

export const generateTaskPriority = async(req,res)=>{
    try{
        const task= await Task.findByPk(req.params.id);
        if(!task){
            return res.status(404).json({
                message:"Task not Found",
            });
        }
        const score = calculatePriority(task);
        const level = getPriorityLevel(score);
        const result= await PriorityResult.create({
            user_id:task.user_id,
            item_type:"Task",
            item_id: task.task_id,
            priority_score:score,
            priority_level:level,
        });
        res.status(200).json(result);

    }catch(error){
        res.status(500).json({
            message: error.message,
        });
    }
};

export const generateAssignmentPriority= async(req,res)=>{
    try{
        const assignment= await Assignment.findByPk(req.params.id);
        if(!assignment){
            return res.status(404).json({
                message:"Assignment not Found",
            });
        }
        const score=calculatePriority(assignment);
        const level=getPriorityLevel(score);
        const result= await PriorityResult.create({
            user_id:assignment.user_id,
            item_type:"Assignment",
            item_id:assignment.assignment_id,
            priority_score:score,
            priority_level:level,
        });
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({
            message:error.message,
        });
    }
};
export const generateExaminationPriority= async(req,res)=>{
    try{
        const exam= await Examination.findByPk(req.params.id);
        if(!exam){
            return res.status(404).json({
                message:"examination not Found",
            });
        }
        const score=calculatePriority(exam);
        const level=getPriorityLevel(score);
        const result= await PriorityResult.create({
            user_id:exam.user_id,
            item_type:"Exam",
            item_id:exam.exam_id,
            priority_score:score,
            priority_level:level,
        });
        res.status(200).json(result);
    }catch(error){
        res.status(500).json({
            message:error.message,
        });
    }
};
