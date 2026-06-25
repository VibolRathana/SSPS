import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User, Task, StudySession, Examination } from "../models/index.js";

function createToken(user) {
  return jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function userJSON(u) {
  return {
    id:                   u.user_id,
    fullName:             u.full_name,
    email:                u.email,
    role:                 u.role,
    major:                u.major,
    phone:                u.phone,
    bio:                  u.bio,
    notificationsEnabled: u.notifications_enabled ?? true,
  };
}

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const existing = await User.findOne({ where: { email } });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const password_hash = await bcrypt.hash(password, 10);
    const user = await User.create({ full_name: fullName, email, password_hash });

    res.status(201).json({
      message: "Account created",
      token: createToken(user),
      user: userJSON(user),
    });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ where: { email } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    await user.update({ last_login: new Date() });

    res.json({ message: "Logged in", token: createToken(user), user: userJSON(user) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 6)
      return res.status(400).json({ message: "New password must be at least 6 characters" });

    const user = await User.findByPk(req.user.id);
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    await user.update({ password_hash: await bcrypt.hash(newPassword, 10) });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function toggleNotifications(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    await user.update({ notifications_enabled: !user.notifications_enabled });
    res.json({ notificationsEnabled: user.notifications_enabled });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function updateProfile(req, res) {
  try {
    const { fullName, email, major, phone, bio } = req.body;

    const conflict = await User.findOne({
      where: { email, user_id: { [Op.ne]: req.user.id } },
    });
    if (conflict) return res.status(409).json({ message: "That email is already in use" });

    await User.update(
      { full_name: fullName, email, major: major || null, phone: phone || null, bio: bio || null },
      { where: { user_id: req.user.id } }
    );
    const u = await User.findByPk(req.user.id);
    res.json({ message: "Profile updated", user: userJSON(u) });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function getStats(req, res) {
  try {
    const uid = req.user.id;
    const tasksCompleted = await Task.count({ where: { user_id: uid, status: "Completed" } });
    const studyHours     = await StudySession.sum("duration", { where: { user_id: uid } }) || 0;
    const achievements   = await Examination.count({ where: { user_id: uid } });
    res.json({ tasksCompleted, studyHours: Number(studyHours), achievements });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}
