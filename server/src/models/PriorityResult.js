import {DataTypes} from "sequelize";
import { sequelize } from "../config/db.js";

const PriorityResult = sequelize.define(
    "PriorityResult",
    {
        priority_id:{
            type: DataTypes.INTEGER,
            primarykey:true,
            autoIncrement: true,
        },
        user_id:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        item_type:{
            type:DataTypes.ENUM(
                "Task",
                "Assignment",
                "Exam"
            ),
            allowNull: false,
        },
        item_id:{
            type: DataTypes.INTEGER,
            allowNull:false,
        },
        priority_score:{
            type:DataTypes.FLOAT,
            allowNull:false,
        },
        priority_level:{
            typr: DataTypes.ENUM(
                "Low",
                "Medium",
                "High"
            ),
            allowNull:false,
        },
    },
    {
        tableName: "priority_results",
        timestamps: true,
        createdAt: ' generated_at',
        updateAt: false,
    }
);
export default PriorityResult;
