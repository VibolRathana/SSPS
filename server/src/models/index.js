import { DataTypes } from "sequelize";
import { sequelize } from "../config/db.js";

// ── User ──────────────────────────────────────────────────────────
export const User = sequelize.define("User", {
  user_id:               { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  full_name:             { type: DataTypes.STRING(100),  allowNull: false },
  email:                 { type: DataTypes.STRING(150),  allowNull: false, unique: true },
  password_hash:         { type: DataTypes.STRING(255),  allowNull: false },
  role:                  { type: DataTypes.ENUM("Admin", "Student"), defaultValue: "Student" },
  major:                 DataTypes.STRING(100),
  phone:                 DataTypes.STRING(30),
  bio:                   DataTypes.STRING(255),
  notifications_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  last_login:            DataTypes.DATE,
}, { tableName: "users", createdAt: "created_at", updatedAt: false });

// ── Course ────────────────────────────────────────────────────────
export const Course = sequelize.define("Course", {
  course_id: { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:   { type: DataTypes.INTEGER,     allowNull: false },
  name:      { type: DataTypes.STRING(100), allowNull: false },
  code:      DataTypes.STRING(20),
  color:     { type: DataTypes.STRING(7),   defaultValue: "#6366F1" },
}, { tableName: "courses", createdAt: "created_at", updatedAt: false });

// ── Task ──────────────────────────────────────────────────────────
export const Task = sequelize.define("Task", {
  task_id:     { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:     { type: DataTypes.INTEGER,     allowNull: false },
  course_id:   DataTypes.INTEGER,
  title:       { type: DataTypes.STRING(150), allowNull: false },
  description: DataTypes.TEXT,
  priority:    { type: DataTypes.ENUM("Low", "Medium", "High"),              defaultValue: "Medium" },
  status:      { type: DataTypes.ENUM("Pending", "In Progress", "Completed"), defaultValue: "Pending" },
  due_date:    { type: DataTypes.DATEONLY,    allowNull: false },
}, { tableName: "tasks", createdAt: "created_at", updatedAt: false });

// ── Assignment ────────────────────────────────────────────────────
export const Assignment = sequelize.define("Assignment", {
  assignment_id: { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:       { type: DataTypes.INTEGER,     allowNull: false },
  course_id:     DataTypes.INTEGER,
  title:         { type: DataTypes.STRING(150), allowNull: false },
  description:   DataTypes.TEXT,
  priority:      { type: DataTypes.ENUM("Low", "Medium", "High"),                        defaultValue: "Medium" },
  status:        { type: DataTypes.ENUM("Pending", "In Progress", "Submitted", "Graded"), defaultValue: "Pending" },
  due_date:      { type: DataTypes.DATEONLY,    allowNull: false },
}, { tableName: "assignments", createdAt: "created_at", updatedAt: false });

// ── Examination ───────────────────────────────────────────────────
export const Examination = sequelize.define("Examination", {
  exam_id:     { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:     { type: DataTypes.INTEGER,     allowNull: false },
  course_id:   DataTypes.INTEGER,
  subject:     { type: DataTypes.STRING(150), allowNull: false },
  exam_date:   { type: DataTypes.DATEONLY,    allowNull: false },
  preparation: { type: DataTypes.INTEGER,     defaultValue: 0 },
}, { tableName: "examinations", createdAt: "created_at", updatedAt: false });

// ── Reminder ──────────────────────────────────────────────────────
export const Reminder = sequelize.define("Reminder", {
  reminder_id:   { type: DataTypes.INTEGER,     primaryKey: true, autoIncrement: true },
  user_id:       { type: DataTypes.INTEGER,     allowNull: false },
  reminder_type: { type: DataTypes.ENUM("Task", "Assignment", "Exam", "Study Session"), allowNull: false },
  description:   DataTypes.STRING(255),
  remind_date:   { type: DataTypes.DATEONLY,    allowNull: false },
  remind_time:   { type: DataTypes.TIME,        allowNull: false, defaultValue: "23:59:00" },
  notify_before: { type: DataTypes.ENUM("15 minutes", "1 hour", "1 day"), defaultValue: "1 hour" },
  email_enabled: { type: DataTypes.BOOLEAN, defaultValue: true },
  email_sent:    { type: DataTypes.BOOLEAN, defaultValue: false },
  push_sent:     { type: DataTypes.BOOLEAN, allowNull: false, defaultValue: false },
  is_active:     { type: DataTypes.BOOLEAN, defaultValue: true },
}, { tableName: "reminders", createdAt: "created_at", updatedAt: false });

// ── StudySession ──────────────────────────────────────────────────
export const StudySession = sequelize.define("StudySession", {
  session_id:   { type: DataTypes.INTEGER,      primaryKey: true, autoIncrement: true },
  user_id:      { type: DataTypes.INTEGER,      allowNull: false },
  course_id:    DataTypes.INTEGER,
  title:        { type: DataTypes.STRING(150),  allowNull: false },
  session_date: { type: DataTypes.DATEONLY,     allowNull: false },
  start_time:   { type: DataTypes.TIME,         allowNull: false, defaultValue: "08:00:00" },
  duration:     { type: DataTypes.DECIMAL(4,1), allowNull: false, defaultValue: 1.0 },
  color:        { type: DataTypes.STRING(20),   defaultValue: "indigo" },
}, { tableName: "study_sessions", createdAt: "created_at", updatedAt: false });

// ── AiRecommendation ──────────────────────────────────────────────
export const AiRecommendation = sequelize.define("AiRecommendation", {
  recommendation_id:  { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:            { type: DataTypes.INTEGER, allowNull: false },
  priority_score:     { type: DataTypes.INTEGER, defaultValue: 0 },
  recommended_action: { type: DataTypes.TEXT,    allowNull: false },
  generated_at:       { type: DataTypes.DATE,    defaultValue: DataTypes.NOW },
}, { tableName: "ai_recommendations", timestamps: false });

// ── PushSubscription ──────────────────────────────────────────────
export const PushSubscription = sequelize.define("PushSubscription", {
  id:       { type: DataTypes.INTEGER, primaryKey: true, autoIncrement: true },
  user_id:  { type: DataTypes.INTEGER, allowNull: false },
  endpoint: { type: DataTypes.TEXT,    allowNull: false },
  p256dh:   { type: DataTypes.TEXT,    allowNull: false },
  auth:     { type: DataTypes.TEXT,    allowNull: false },
}, { tableName: "push_subscriptions", createdAt: "created_at", updatedAt: false });

// ── Associations ──────────────────────────────────────────────────
User.hasMany(Course,            { foreignKey: "user_id" });
Course.belongsTo(User,          { foreignKey: "user_id" });

User.hasMany(Task,              { foreignKey: "user_id" });
Task.belongsTo(User,            { foreignKey: "user_id" });
Task.belongsTo(Course,          { foreignKey: "course_id" });
Course.hasMany(Task,            { foreignKey: "course_id" });

User.hasMany(Assignment,        { foreignKey: "user_id" });
Assignment.belongsTo(User,      { foreignKey: "user_id" });
Assignment.belongsTo(Course,    { foreignKey: "course_id" });
Course.hasMany(Assignment,      { foreignKey: "course_id" });

User.hasMany(Examination,       { foreignKey: "user_id" });
Examination.belongsTo(User,     { foreignKey: "user_id" });
Examination.belongsTo(Course,   { foreignKey: "course_id" });
Course.hasMany(Examination,     { foreignKey: "course_id" });

User.hasMany(Reminder,          { foreignKey: "user_id" });
Reminder.belongsTo(User,        { foreignKey: "user_id" });

User.hasMany(StudySession,      { foreignKey: "user_id" });
StudySession.belongsTo(User,    { foreignKey: "user_id" });
StudySession.belongsTo(Course,  { foreignKey: "course_id" });
Course.hasMany(StudySession,    { foreignKey: "course_id" });

User.hasMany(AiRecommendation,  { foreignKey: "user_id" });
AiRecommendation.belongsTo(User,{ foreignKey: "user_id" });

User.hasMany(PushSubscription,  { foreignKey: "user_id" });
PushSubscription.belongsTo(User,{ foreignKey: "user_id" });
