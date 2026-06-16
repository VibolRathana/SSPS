import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";
import { pool } from "../../config/db.js";

function createToken(user) {
  return jwt.sign({ id: user.user_id, role: user.role }, process.env.JWT_SECRET, { expiresIn: "7d" });
}

export async function register(req, res) {
  try {
    const { fullName, email, password } = req.body;
    if (!fullName || !email || !password)
      return res.status(400).json({ message: "All fields are required" });

    const [existing] = await pool.query("SELECT user_id FROM users WHERE email = ?", [email]);
    if (existing.length > 0)
      return res.status(409).json({ message: "Email is already registered" });

    const passwordHash = await bcrypt.hash(password, 10);

    const [result] = await pool.query(
      "INSERT INTO users (full_name, email, password_hash) VALUES (?, ?, ?)",
      [fullName, email, passwordHash]
    );

    const token = createToken({ user_id: result.insertId, role: "Student" });
    res.status(201).json({ message: "Account created", token, user: { id: result.insertId, fullName, email, role: "Student" } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}

export async function login(req, res) {
  try {
    const { email, password } = req.body;
    if (!email || !password)
      return res.status(400).json({ message: "Email and password are required" });

    const [rows] = await pool.query("SELECT * FROM users WHERE email = ?", [email]);
    if (rows.length === 0)
      return res.status(401).json({ message: "Invalid email or password" });

    const user = rows[0];
    const match = await bcrypt.compare(password, user.password_hash);
    if (!match)
      return res.status(401).json({ message: "Invalid email or password" });

    await pool.query("UPDATE users SET last_login = NOW() WHERE user_id = ?", [user.user_id]);

    const token = createToken(user);
    res.json({ message: "Logged in", token, user: { id: user.user_id, fullName: user.full_name, email: user.email, role: user.role } });
  } catch (err) {
    res.status(500).json({ message: err.message });
  }
}