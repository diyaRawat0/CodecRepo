import "dotenv/config";
import express from "express";
import cors from "cors";
import bcrypt from "bcrypt";
import jwt from "jsonwebtoken";
import { v4 as uuid } from "uuid";
import { users, quizzes, questions, attempts } from "./storage.js";
const app = express();
const PORT = process.env.PORT || 5000;
const SECRET = process.env.JWT_SECRET || "quizcraft-local-secret";
app.use(cors({ origin: process.env.CLIENT_URL || "http://localhost:5173" }));
app.use(express.json());
const cleanUser = ({ passwordHash, ...user }) => user;
const fail = (message, status = 400) => {
  const error = new Error(message);
  error.status = status;
  return error;
};
function auth(req, res, next) {
  const token = req.headers.authorization?.replace("Bearer ", "");
  if (!token) return next(fail("Authentication required", 401));
  try {
    req.user = jwt.verify(token, SECRET);
    next();
  } catch {
    next(fail("Invalid or expired token", 401));
  }
}
function role(name) {
  return (req, res, next) => {
    if (req.user?.role !== name) return next(fail("Forbidden", 403));
    next();
  };
}
const issue = (user) =>
  jwt.sign(
    { id: user.id, role: user.role, name: user.name, email: user.email },
    SECRET,
    { expiresIn: "8h" },
  );
app.get("/api/health", (_, res) => res.json({ ok: true }));
app.post("/api/auth/register", async (req, res, next) => {
  try {
    const { name, email, password } = req.body;
    if (!name || !email || !password || password.length < 8)
      throw fail("Name, email, and an 8+ character password are required");
    if (
      await users.findById(
        (await users.find((u) => u.email === email.toLowerCase()))[0]?.id,
      )
    )
      throw fail("Email is already registered", 409);
    const user = {
      id: uuid(),
      name,
      email: email.toLowerCase(),
      passwordHash: await bcrypt.hash(password, 10),
      role: "student",
      createdAt: new Date().toISOString(),
    };
    await users.insert(user);
    res.status(201).json({ token: issue(user), user: cleanUser(user) });
  } catch (e) {
    next(e);
  }
});
app.post("/api/auth/login", async (req, res, next) => {
  try {
    const user = (
      await users.find((u) => u.email === req.body.email?.toLowerCase())
    )[0];
    if (
      !user ||
      !(await bcrypt.compare(req.body.password || "", user.passwordHash))
    )
      throw fail("Invalid email or password", 401);
    res.json({ token: issue(user), user: cleanUser(user) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/auth/me", auth, async (req, res, next) => {
  try {
    const user = await users.findById(req.user.id);
    if (!user) throw fail("User not found", 404);
    res.json({ user: cleanUser(user) });
  } catch (e) {
    next(e);
  }
});
app.get("/api/quizzes", auth, async (req, res, next) => {
  try {
    const all = await quizzes.all();
    const visible =
      req.user.role === "admin"
        ? all
        : all.filter((q) => q.state === "published");
    const qs = await questions.all();
    res.json(
      visible.map((q) => ({
        ...q,
        questionCount: qs.filter((x) => x.quizId === q.id).length,
      })),
    );
  } catch (e) {
    next(e);
  }
});
app.get("/api/quizzes/:id", auth, async (req, res, next) => {
  try {
    const quiz = await quizzes.findById(req.params.id);
    if (!quiz || (req.user.role !== "admin" && quiz.state !== "published"))
      throw fail("Quiz not found", 404);
    const qs = (await questions.find((q) => q.quizId === quiz.id)).sort(
      (a, b) => a.order - b.order,
    );
    res.json({
      ...quiz,
      questionCount: qs.length,
      questions:
        req.user.role === "admin"
          ? qs
          : qs.map(({ correctOption, ...safe }) => safe),
    });
  } catch (e) {
    next(e);
  }
});
app.post("/api/quizzes", auth, role("admin"), async (req, res, next) => {
  try {
    const quiz = {
      id: uuid(),
      title: req.body.title,
      description: req.body.description || "",
      durationMinutes: Number(req.body.durationMinutes) || 10,
      marks: Number(req.body.marks) || 0,
      state: "draft",
      createdBy: req.user.id,
      createdAt: new Date().toISOString(),
    };
    if (!quiz.title) throw fail("Title is required");
    res.status(201).json(await quizzes.insert(quiz));
  } catch (e) {
    next(e);
  }
});
app.patch("/api/quizzes/:id", auth, role("admin"), async (req, res, next) => {
  try {
    const allowedStates = ["draft", "published", "retired"];
    const patch = {};
    for (const key of ["title", "description", "durationMinutes", "marks"]) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (req.body.state !== undefined) {
      if (!allowedStates.includes(req.body.state))
        throw fail("Invalid quiz state");
      patch.state = req.body.state;
    }
    if (patch.title !== undefined && !String(patch.title).trim())
      throw fail("Title is required");
    if (
      patch.durationMinutes !== undefined &&
      Number(patch.durationMinutes) < 1
    )
      throw fail("Duration must be at least one minute");
    const quiz = await quizzes.update(req.params.id, patch);
    if (!quiz) throw fail("Quiz not found", 404);
    res.json(quiz);
  } catch (e) {
    next(e);
  }
});
app.delete("/api/quizzes/:id", auth, role("admin"), async (req, res, next) => {
  try {
    if (!(await quizzes.remove(req.params.id)))
      throw fail("Quiz not found", 404);
    for (const q of await questions.find((x) => x.quizId === req.params.id))
      await questions.remove(q.id);
    res.status(204).end();
  } catch (e) {
    next(e);
  }
});
app.post(
  "/api/quizzes/:id/questions",
  auth,
  role("admin"),
  async (req, res, next) => {
    try {
      if (!(await quizzes.findById(req.params.id)))
        throw fail("Quiz not found", 404);
      const { text, options, correctOption, marks = 10 } = req.body;
      if (
        !text ||
        !options ||
        !["A", "B", "C", "D"].every(
          (key) => typeof options[key] === "string" && options[key].trim(),
        ) ||
        !["A", "B", "C", "D"].includes(correctOption)
      )
        throw fail(
          "Question text, four options, and a correct option are required",
        );
      const current = await questions.find((q) => q.quizId === req.params.id);
      const question = {
        id: uuid(),
        quizId: req.params.id,
        text,
        options,
        correctOption,
        marks: Number(marks),
        order: current.length,
      };
      res.status(201).json(await questions.insert(question));
    } catch (e) {
      next(e);
    }
  },
);
app.patch("/api/questions/:id", auth, role("admin"), async (req, res, next) => {
  try {
    const current = await questions.findById(req.params.id);
    if (!current) throw fail("Question not found", 404);
    const patch = {};
    for (const key of ["text", "options", "correctOption", "marks", "order"]) {
      if (req.body[key] !== undefined) patch[key] = req.body[key];
    }
    if (
      patch.options &&
      !["A", "B", "C", "D"].every(
        (key) =>
          typeof patch.options[key] === "string" && patch.options[key].trim(),
      )
    )
      throw fail("Four non-empty options are required");
    if (
      patch.correctOption &&
      !["A", "B", "C", "D"].includes(patch.correctOption)
    )
      throw fail("Invalid correct option");
    const q = await questions.update(req.params.id, patch);
    if (!q) throw fail("Question not found", 404);
    res.json(q);
  } catch (e) {
    next(e);
  }
});
app.delete(
  "/api/questions/:id",
  auth,
  role("admin"),
  async (req, res, next) => {
    try {
      if (!(await questions.remove(req.params.id)))
        throw fail("Question not found", 404);
      res.status(204).end();
    } catch (e) {
      next(e);
    }
  },
);
app.get("/api/attempts", auth, async (req, res, next) => {
  try {
    const list = await attempts.find(
      (a) => req.user.role === "admin" || a.userId === req.user.id,
    );
    const allUsers = await users.all(),
      allQuizzes = await quizzes.all();
    res.json(
      list.map((a) => ({
        ...a,
        userName: allUsers.find((u) => u.id === a.userId)?.name,
        quizTitle: allQuizzes.find((q) => q.id === a.quizId)?.title,
      })),
    );
  } catch (e) {
    next(e);
  }
});
app.post("/api/attempts/:quizId/start", auth, async (req, res, next) => {
  try {
    const quiz = await quizzes.findById(req.params.quizId);
    if (!quiz || quiz.state !== "published")
      throw fail("Only published quizzes can be attempted", 403);
    const prior = (
      await attempts.find(
        (a) => a.userId === req.user.id && a.quizId === quiz.id,
      )
    )[0];
    if (prior) {
      if (prior.status === "active") return res.json(await safeAttempt(prior));
      throw fail("You have already attempted this quiz", 409);
    }
    const startedAt = Date.now();
    const attempt = {
      id: uuid(),
      userId: req.user.id,
      quizId: quiz.id,
      startedAt: new Date(startedAt).toISOString(),
      expiresAt: new Date(
        startedAt + quiz.durationMinutes * 60000,
      ).toISOString(),
      status: "active",
      answers: [],
      score: null,
    };
    await attempts.insert(attempt);
    res.status(201).json(await safeAttempt(attempt));
  } catch (e) {
    next(e);
  }
});
async function safeAttempt(attempt) {
  const qs = (await questions.find((q) => q.quizId === attempt.quizId)).sort(
    (a, b) => a.order - b.order,
  );
  return { ...attempt, questions: qs.map(({ correctOption, ...q }) => q) };
}
app.post("/api/attempts/:id/submit", auth, async (req, res, next) => {
  try {
    const attempt = await attempts.findById(req.params.id);
    if (!attempt || attempt.userId !== req.user.id)
      throw fail("Attempt not found", 404);
    if (attempt.status !== "active")
      throw fail("Attempt has already been submitted", 409);
    const now = Date.now();
    if (now > new Date(attempt.expiresAt).getTime()) {
      const expired = await attempts.update(attempt.id, { status: "expired" });
      throw Object.assign(
        fail("Time expired. This attempt was not submitted normally.", 410),
        { attempt: expired },
      );
    }
    const qs = await questions.find((q) => q.quizId === attempt.quizId);
    const answers = Array.isArray(req.body.answers) ? req.body.answers : [];
    const validIds = new Set(qs.map((q) => q.id));
    if (
      answers.some(
        (a) =>
          !validIds.has(a.questionId) ||
          !a.selectedOption ||
          !["A", "B", "C", "D"].includes(a.selectedOption),
      )
    )
      throw fail("Invalid answer payload");
    const score = answers.reduce((total, a) => {
      const q = qs.find((x) => x.id === a.questionId);
      return total + (q?.correctOption === a.selectedOption ? q.marks : 0);
    }, 0);
    const saved = await attempts.update(attempt.id, {
      answers,
      status: "submitted",
      score,
      submittedAt: new Date().toISOString(),
    });
    res.json(saved);
  } catch (e) {
    next(e);
  }
});
app.use((err, req, res, _next) => {
  console.error(err.message);
  res
    .status(err.status || 500)
    .json({ message: err.message || "Server error", attempt: err.attempt });
});
await import("./seed.js");
app.listen(PORT, () =>
  console.log(`QuizCraft API listening at http://localhost:${PORT}`),
);
