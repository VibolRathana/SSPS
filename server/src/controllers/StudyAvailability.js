import { StudyAvailability } from "../models/index.js";

// =====================================
// Get User Availability
// =====================================

export async function getAvailability(req,res){
  try{
    const availability= await StudyAvailability.findAll({
        where:{
            user_id: req.user.id,
        },
        order:[["day_of_week" , "ASC"]],
    });
    res.json(availability);
  }catch(error){
    res.status(500).json({
        message:error.message,
    });
  }
}
// =====================================
// Create Availability
// =====================================

export async function createAvailability(req,res){
    console.log("BODY:",req.body);
    console.log("USER:" , req.user);
    try{
        const{day_of_week,available_hours}=req.body;
    if(!day_of_week || available_hours==null){
        return res.status(400).json({
            message: "Day and available hours are required."
        });
      }
      const existing= await StudyAvailability.findOne({
        where:{
            user_id:req.user.id,
            day_of_week,
        },

      });
      if (existing){
        return res.status(400).json({
            message: "Availability for this day already exists.",
        });
      }
      const availability= await StudyAvailability.create({
        user_id:req.user.id,
        day_of_week,
        available_hours,
      });
      res.status(201).json({
        message: "Availability created successfully.",
        availability,
      });

    }catch(error){
        res.status(500).json({
            message: error.message,
        });
    }
}
 // =====================================
         // Update Availability
 // =====================================
 export async function updateAvailability(req,res){
     console.log("UPDATE PARAM:", req.params.id);
     console.log("UPDATE BODY:", req.body);
    try{
        const{available_hours}=req.body;
        const availability= await StudyAvailability.findOne({
            where:{
                availability_id: req.params.id,
                user_id: req.user.id,
            },


        });
        if(!availability){
            return res.status(404).json({
                message:"Availability not found.",
            });
        }
        availability.available_hours = available_hours;
        await availability.save();
            console.log("UPDATED:", availability.toJSON());
        res.json({
            message:"Availability update succcessfully.",
            availability,
        });
    }catch(error){
        res.status(500).json({
            message:error.message,
        });
    }
 }