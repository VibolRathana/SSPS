import { useState, useEffect } from "react";
import api from "../api/axios";

function urlBase64ToUint8Array(base64String) {
  const padding = "=".repeat((4 - (base64String.length % 4)) % 4);
  const base64 = (base64String + padding).replace(/-/g, "+").replace(/_/g, "/");
  const raw = atob(base64);
  return Uint8Array.from([...raw].map((c) => c.charCodeAt(0)));
}

const isPushSupported =
  typeof window !== "undefined" &&
  "serviceWorker" in navigator &&
  "PushManager" in window &&
  "Notification" in window;

export function usePushNotification() {
  const [supported] = useState(isPushSupported);
  const [subscribed, setSubscribed] = useState(false);
  const [loading, setLoading] = useState(false);

  async function subscribe() {
    if (!supported) return;
    setLoading(true);
    try {
      // Ask permission first — this shows the browser Allow/Block popup
      const permission = await Notification.requestPermission();
      if (permission !== "granted") return;

      const reg = await navigator.serviceWorker.ready;
      const { data } = await api.get("/notifications/vapid-public-key");

      const pushSub = await reg.pushManager.subscribe({
        userVisibleOnly:      true,
        applicationServerKey: urlBase64ToUint8Array(data.publicKey),
      });

      await api.post("/notifications/subscribe", pushSub.toJSON());
      setSubscribed(true);
    } catch (err) {
      console.error("Push subscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  async function unsubscribe() {
    if (!supported) return;
    setLoading(true);
    try {
      const reg = await navigator.serviceWorker.ready;
      const pushSub = await reg.pushManager.getSubscription();
      if (pushSub) {
        await api.post("/notifications/unsubscribe", { endpoint: pushSub.endpoint });
        await pushSub.unsubscribe();
      }
      setSubscribed(false);
    } catch (err) {
      console.error("Push unsubscribe failed:", err);
    } finally {
      setLoading(false);
    }
  }

  // Check if already subscribed on mount
  useEffect(() => {
    if (!supported) return;
    navigator.serviceWorker.ready
      .then((reg) => reg.pushManager.getSubscription())
      .then((s) => setSubscribed(!!s))
      .catch(() => setSubscribed(false));
  }, [supported]);

  return { supported, subscribed, loading, subscribe, unsubscribe };
}
