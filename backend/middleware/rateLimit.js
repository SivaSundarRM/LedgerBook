// Minimal in-memory rate limiter keyed by IP + route.
// Good enough for a single-instance deployment; swap for a Redis-backed
// limiter (e.g. rate-limiter-flexible) if you ever run multiple instances.
function rateLimit({ windowMs = 15 * 60 * 1000, max = 5 } = {}) {
  const hits = new Map();

  return (req, res, next) => {
    const key = `${req.ip}:${req.baseUrl}${req.path}`;
    const now = Date.now();
    const entry = hits.get(key);

    if (!entry || now - entry.start > windowMs) {
      hits.set(key, { start: now, count: 1 });
      return next();
    }

    entry.count += 1;
    if (entry.count > max) {
      const retryAfterSec = Math.ceil((entry.start + windowMs - now) / 1000);
      res.set("Retry-After", String(retryAfterSec));
      return res.status(429).json({
        success: false,
        message: "Too many attempts. Please try again later.",
      });
    }

    next();
  };
}

module.exports = rateLimit;
