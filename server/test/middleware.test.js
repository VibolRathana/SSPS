import test from "node:test";
import assert from "node:assert/strict";
import { adminOnly } from "../src/middleware/roleMiddleware.js";
import { createRateLimit } from "../src/middleware/rateLimitMiddleware.js";

function responseStub() {
  return {
    statusCode: 200,
    body: null,
    headers: {},
    status(code) {
      this.statusCode = code;
      return this;
    },
    json(body) {
      this.body = body;
      return this;
    },
    set(name, value) {
      this.headers[name] = value;
      return this;
    },
  };
}

test("adminOnly rejects students", () => {
  const res = responseStub();
  let called = false;

  adminOnly({ user: { role: "Student" } }, res, () => { called = true; });

  assert.equal(called, false);
  assert.equal(res.statusCode, 403);
});

test("adminOnly allows administrators", () => {
  const res = responseStub();
  let called = false;

  adminOnly({ user: { role: "Admin" } }, res, () => { called = true; });

  assert.equal(called, true);
  assert.equal(res.statusCode, 200);
});

test("rate limiter rejects requests over the configured maximum", () => {
  const limit = createRateLimit({ windowMs: 60_000, max: 2 });
  const req = { user: { id: 10 }, ip: "127.0.0.1" };
  let allowed = 0;

  limit(req, responseStub(), () => { allowed += 1; });
  limit(req, responseStub(), () => { allowed += 1; });
  const rejected = responseStub();
  limit(req, rejected, () => { allowed += 1; });

  assert.equal(allowed, 2);
  assert.equal(rejected.statusCode, 429);
  assert.ok(Number(rejected.headers["Retry-After"]) > 0);
<<<<<<< HEAD
});
=======
});
>>>>>>> 3181c10820689d94d41d47be843bb8cf678f2f10
