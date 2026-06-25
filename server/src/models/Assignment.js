import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const Assignment = sequelize.define(
  "Assignment",
  {
    assignment_id: { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    user_id:       { type: DataTypes.INTEGER, allowNull: false },
    course_id:     DataTypes.INTEGER,
    title:         { type: DataTypes.STRING, allowNull: false },
    description:   DataTypes.TEXT,
    due_date:      { type: DataTypes.DATE, allowNull: false },
    due_time:      DataTypes.TIME,
    status:        {
      type: DataTypes.ENUM("Pending", "In Progress", "Submitted", "Graded"),
      defaultValue: "Pending",
    },
  },
  {
    tableName: "assignments",
    timestamps: false,
  }
);
