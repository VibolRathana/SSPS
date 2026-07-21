import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { Op } from "sequelize";
import { User, Task, Examination } from "../models/index.js";

function createToken(user) {
  return jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "1d" });
}

function normalizeEmail(email) {
  return String(email ?? "").trim().toLowerCase();
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
    const normalizedName = String(fullName ?? "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName || !normalizedEmail || !password)
      return res.status(400).json({ message: "All fields are required" });
    if (password.length < 8)
      return res.status(400).json({ message: "Password must be at least 8 characters" });

    const existing = await User.findOne({ where: { email: normalizedEmail } });
    if (existing) return res.status(409).json({ message: "Email is already registered" });

    const password_hash = await bcrypt.hash(password, 12);
    const user = await User.create({
      full_name: normalizedName,
      email: normalizedEmail,
      password_hash,
    });


    res.status(201).json({
      message: "Account created",
      token: createToken(user),
      user: userJSON(user),
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    const normalizedEmail = normalizeEmail(email);
    if (!normalizedEmail || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const user = await User.findOne({ where: { email: normalizedEmail } });
    if (!user) return res.status(401).json({ message: "Invalid email or password" });

    const match = await bcrypt.compare(password, user.password_hash);
    if (!match) return res.status(401).json({ message: "Invalid email or password" });

    await user.update({ last_login: new Date() });

    res.json({ message: "Logged in", token: createToken(user), user: userJSON(user) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function changePassword(req, res) {
  try {
    const { currentPassword, newPassword } = req.body;
    if (!currentPassword || !newPassword)
      return res.status(400).json({ message: "Current and new password are required" });
    if (newPassword.length < 8)
      return res.status(400).json({ message: "New password must be at least 8 characters" });

    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    const match = await bcrypt.compare(currentPassword, user.password_hash);
    if (!match) return res.status(401).json({ message: "Current password is incorrect" });

    await user.update({ password_hash: await bcrypt.hash(newPassword, 12) });
    res.json({ message: "Password updated successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function toggleNotifications(req, res) {
  try {
    const user = await User.findByPk(req.user.id);
    if (!user) return res.status(401).json({ message: "Account no longer exists" });
    await user.update({ notifications_enabled: !user.notifications_enabled });
    res.json({ notificationsEnabled: user.notifications_enabled });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function updateProfile(req, res) {
  try {
    const { fullName, email, major, phone, bio } = req.body;
    const normalizedName = String(fullName ?? "").trim();
    const normalizedEmail = normalizeEmail(email);

    if (!normalizedName || !normalizedEmail) {
      return res.status(400).json({ message: "Full name and email are required" });
    }

    const conflict = await User.findOne({
      where: { email: normalizedEmail, user_id: { [Op.ne]: req.user.id } },
    });
    if (conflict) return res.status(409).json({ message: "That email is already in use" });

    await User.update(
      {
        full_name: normalizedName,
        email: normalizedEmail,
        major: String(major ?? "").trim() || null,
        phone: String(phone ?? "").trim() || null,
        bio: String(bio ?? "").trim() || null,
      },
      { where: { user_id: req.user.id } }
    );
    const u = await User.findByPk(req.user.id);
    res.json({ message: "Profile updated", user: userJSON(u) });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getStats(req, res) {
  try {
    const uid = req.user.id;
    const tasksCompleted = await Task.count({ where: { user_id: uid, status: "Completed" } });
    const achievements   = await Examination.count({ where: { user_id: uid } });
    res.json({ tasksCompleted, achievements });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}
