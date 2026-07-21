import express from "express";
import { register, login, updateProfile, changePassword, toggleNotifications, getStats } from "../controllers/authController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

/**
 * @swagger
 * tags:
 *   name: Auth
 *   description: Authentication and user profile
 */

/**
 * @swagger
 * /auth/register:
 *   post:
 *     summary: Register a new student account
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [fullName, email, password]
 *             properties:
 *               fullName: { type: string, example: Dara Chan }
 *               email:    { type: string, example: dara@ssps.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       201: { description: Account created, returns token and user }
 *       409: { description: Email already registered }
 */
router.post("/register", register);

/**
 * @swagger
 * /auth/login:
 *   post:
 *     summary: Login and receive a JWT token
 *     tags: [Auth]
 *     security: []
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [email, password]
 *             properties:
 *               email:    { type: string, example: dara@ssps.com }
 *               password: { type: string, example: "123456" }
 *     responses:
 *       200: { description: Logged in, returns token and user }
 *       401: { description: Invalid email or password }
 */
router.post("/login", login);

/**
 * @swagger
 * /auth/profile:
 *   put:
 *     summary: Update user profile
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             properties:
 *               fullName: { type: string }
 *               email:    { type: string }
 *               major:    { type: string }
 *               phone:    { type: string }
 *               bio:      { type: string }
 *     responses:
 *       200: { description: Profile updated }
 */
router.put("/profile", protect, updateProfile);

/**
 * @swagger
 * /auth/password:
 *   put:
 *     summary: Change password
 *     tags: [Auth]
 *     requestBody:
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required: [currentPassword, newPassword]
 *             properties:
 *               currentPassword: { type: string }
 *               newPassword:     { type: string }
 *     responses:
 *       200: { description: Password updated }
 *       401: { description: Current password incorrect }
 */
router.put("/password", protect, changePassword);

/**
 * @swagger
 * /auth/notifications:
 *   patch:
 *     summary: Toggle email notifications on/off
 *     tags: [Auth]
 *     responses:
 *       200: { description: Returns notificationsEnabled boolean }
 */
router.patch("/notifications", protect, toggleNotifications);

/**
 * @swagger
 * /auth/stats:
 *   get:
 *     summary: Get profile stats (tasks completed, achievements)
 *     tags: [Auth]
 *     responses:
 *       200: { description: Returns tasksCompleted and achievements }
 */
router.get("/stats", protect, getStats);

export default router;
