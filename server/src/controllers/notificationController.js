import webpush from "web-push";
import { PushSubscription } from "../models/index.js";

<<<<<<< HEAD
// Only configure web-push if VAPID keys exist
if (
  process.env.VAPID_PUBLIC_KEY &&
  process.env.VAPID_PRIVATE_KEY
) {
  webpush.setVapidDetails(
    "mailto:" + process.env.EMAIL_USER,
    process.env.VAPID_PUBLIC_KEY,
    process.env.VAPID_PRIVATE_KEY
  );
} else {
  console.log("Push notifications disabled: VAPID keys not configured.");
}
=======
webpush.setVapidDetails(
  "mailto:" + process.env.EMAIL_USER,
  process.env.VAPID_PUBLIC_KEY,
  process.env.VAPID_PRIVATE_KEY
);
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10

export async function subscribe(req, res) {
  try {
    const { endpoint, keys } = req.body;
    if (!endpoint || !keys?.p256dh || !keys?.auth)
      return res.status(400).json({ message: "Invalid subscription object" });

    // Upsert: replace old sub for same user+endpoint
    await PushSubscription.destroy({ where: { user_id: req.user.id, endpoint } });
    await PushSubscription.create({
      user_id:  req.user.id,
      endpoint,
      p256dh:   keys.p256dh,
      auth:     keys.auth,
    });

    res.json({ message: "Subscribed to push notifications" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function unsubscribe(req, res) {
  try {
    const { endpoint } = req.body;
    await PushSubscription.destroy({ where: { user_id: req.user.id, endpoint } });
    res.json({ message: "Unsubscribed" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Internal server error" });
  }
}

export async function getVapidPublicKey(req, res) {
  res.json({ publicKey: process.env.VAPID_PUBLIC_KEY });
}

// Called internally by the cron job — not an Express handler
export async function sendPushToUser(userId, payload) {
  const subs = await PushSubscription.findAll({ where: { user_id: userId } });
  let delivered = 0;
  for (const sub of subs) {
    try {
      await webpush.sendNotification(
        { endpoint: sub.endpoint, keys: { p256dh: sub.p256dh, auth: sub.auth } },
        JSON.stringify(payload)
      );
      delivered += 1;
    } catch (err) {
      // 410 Gone = browser unsubscribed; clean up
      if (err.statusCode === 410) await sub.destroy();
    }
  }
  return delivered;
<<<<<<< HEAD
}
=======
}
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
