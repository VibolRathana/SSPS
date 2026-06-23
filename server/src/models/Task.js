import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Task = sequelize.define(
  "Task",
  {
    task_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:  { type: DataTypes.INTEGER, allowNull: false },
    name:     { type: DataTypes.STRING, allowNull: false },
    course:   { type: DataTypes.STRING },
    due_date: { type: DataTypes.DATE },
    priority: { type: DataTypes.ENUM("Low", "Medium", "High"), defaultValue: "Medium" },
    status:   { type: DataTypes.ENUM("Pending", "In Progress", "Completed"), defaultValue: "Pending" },
  },
  {
    tableName: "tasks",
    timestamps: false,
  }
);