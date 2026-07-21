import { PriorityResult,Task,Assignment,Examination,Course } from "../models/index.js";

export async function getPriorityResults(req,res){
    try{
        const results= await PriorityResult.findAll({
            where :{user_id:req.user.id},
            order:[["priority_score","DESC"]],

        });
        const formatted =[];
        for(const item of results){
            let score=null;
            let title="";
            let course= null;
            let source=null;

            if(item.source_type==="Task"){
                source=await Task.findByPk(item.source_id,{include:[{model:Course, attributes:["name"]}]});
                title= source?.title;
                course= source?.Course?.name || null;
            }
            if(item.source_type==="Assignment"){
                source=await Assignment.findByPk(item.source_id,{
                    include:[{model:Course , attributes:["name"]}],
                });
                title= source?.title;
                course= source?.Course?.name ||null;
            }
            if(item.source_type==="Exam"){
                source= await Examination.findByPk(item.source_id,{include:[{model:Course,attributes:["name"]}]});
                title=source?.subject;
                course= source?.Course?.name ||null;
            }

            formatted.push({
                id: item.priority_result_id,
                title,
                course,
                source_type:item.source_type,
                score: item.priority_score,
                level: item.priority_level,
            });
        }
        res.json(formatted)
    }catch(error){
        res.status(500).json({message:error.message});
    }
}