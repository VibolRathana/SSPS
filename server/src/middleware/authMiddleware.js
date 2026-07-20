import jwt from "jsonwebtoken";
import { User } from "../models/index.js";

export async function protect(req, res, next) {
  const header = req.headers.authorization;
  if (!header?.startsWith("Bearer ")) {
    return res.status(401).json({ message: "Not authorized, no token" });
  }

  let decoded;
  try {
    decoded = jwt.verify(header.slice(7), process.env.JWT_SECRET);
  } catch {
    return res.status(401).json({ message: "Not authorized, token invalid" });
  }

  try {
    const user = await User.findByPk(decoded.id, {
      attributes: ["user_id", "role"],
    });
    if (!user) {
      return res.status(401).json({ message: "Account no longer exists" });
    }

    req.user = { id: user.user_id, role: user.role };
    next();
  } catch (err) {
    next(err);
  }
}

export function authorize(...allowedRoles) {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({ message: "Not authorized, please log in" });
    }
    if (!allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ message: "Access denied: admins only" });
    }
    next();
  };
}
