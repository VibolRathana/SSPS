import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

export const User = sequelize.define(
  "User",
  {
    user_id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
    full_name:     { type: DataTypes.STRING, allowNull: false },
    email:         { type: DataTypes.STRING, allowNull: false, unique: true },
    password_hash: { type: DataTypes.STRING, allowNull: false },
    role:          { type: DataTypes.ENUM("Admin", "Student"), defaultValue: "Student" },
    major:         DataTypes.STRING,
    phone:         DataTypes.STRING,
    last_login:    DataTypes.DATE,
  },
  {
    tableName: "users",   // map to your existing table
    timestamps: false,    // your table has no createdAt/updatedAt pair
  }
);