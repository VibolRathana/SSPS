export function createRateLimit({ windowMs, max }) {
  const buckets = new Map();

  return (req, res, next) => {
    const now = Date.now();
    const key = String(req.user?.id ?? req.ip);
    const current = buckets.get(key);

    if (!current || current.resetAt <= now) {
      buckets.set(key, { count: 1, resetAt: now + windowMs });
      return next();
    }

    current.count += 1;
    if (current.count > max) {
      const retryAfter = Math.ceil((current.resetAt - now) / 1000);
      res.set("Retry-After", String(retryAfter));
      return res.status(429).json({ message: "Too many AI requests. Please try again later." });
    }

    next();
  };
<<<<<<< HEAD
}
=======
}
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
