import express from "express";
import { subscribe, unsubscribe, getVapidPublicKey } from "../controllers/notificationController.js";
import { protect } from "../middleware/authMiddleware.js";

const router = express.Router();

router.get("/vapid-public-key", getVapidPublicKey);
router.post("/subscribe",       protect, subscribe);
router.post("/unsubscribe",     protect, unsubscribe);

<<<<<<< HEAD
export default router;
=======
export default router;
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
