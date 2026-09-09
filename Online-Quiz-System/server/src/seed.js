import bcrypt from "bcrypt";
import { v4 as uuid } from "uuid";
import { users, quizzes, questions, attempts, writeJson } from "./storage.js";
const existing = await users.all();
if (existing.length) {
  console.log("QuizCraft data already seeded.");
} else {
  const admin = {
    id: uuid(),
    name: "Avery Admin",
    email: "admin@quizcraft.local",
    passwordHash: await bcrypt.hash("Admin123!", 10),
    role: "admin",
    createdAt: new Date().toISOString(),
  };
  const student = {
    id: uuid(),
    name: "Jordan Student",
    email: "student@quizcraft.local",
    passwordHash: await bcrypt.hash("Student123!", 10),
    role: "student",
    createdAt: new Date().toISOString(),
  };
  const student2 = {
    id: uuid(),
    name: "Taylor Student",
    email: "taylor@quizcraft.local",
    passwordHash: await bcrypt.hash("Student123!", 10),
    role: "student",
    createdAt: new Date().toISOString(),
  };
  const quizA = {
    id: uuid(),
    title: "Frontend Foundations",
    description:
      "A sharp check-in on the browser, React, and modern web fundamentals.",
    durationMinutes: 12,
    marks: 50,
    state: "published",
    createdBy: admin.id,
    createdAt: new Date().toISOString(),
  };
  const quizB = {
    id: uuid(),
    title: "Node.js Systems",
    description:
      "Understand the runtime patterns behind reliable Node services.",
    durationMinutes: 15,
    marks: 50,
    state: "draft",
    createdBy: admin.id,
    createdAt: new Date().toISOString(),
  };
  const topics = [
    [
      quizA,
      [
        [
          "Which API selects an element by its id?",
          [
            "querySelector",
            "getElementById",
            "getElementsByClassName",
            "selectId",
          ],
          "B",
        ],
        [
          "What does JSX compile into?",
          ["SQL", "CSS", "JavaScript", "WebAssembly"],
          "C",
        ],
        [
          "Which hook stores local component state?",
          ["useEffect", "useMemo", "useState", "useRef"],
          "C",
        ],
        [
          "HTTP status 404 means:",
          ["Unauthorized", "Not found", "Created", "Redirected"],
          "B",
        ],
        [
          "Which CSS layout is one-dimensional?",
          ["Grid", "Flexbox", "Canvas", "Table"],
          "B",
        ],
      ],
    ],
    [
      quizB,
      [
        [
          "Node.js is built on which JavaScript engine?",
          ["V8", "SpiderMonkey", "Chakra", "JavaScriptCore"],
          "A",
        ],
        [
          "Which module format does this server use?",
          ["CommonJS", "ES modules", "AMD", "UMD"],
          "B",
        ],
        [
          "What does middleware do in Express?",
          [
            "Styles pages",
            "Handles request pipeline logic",
            "Compiles React",
            "Stores SQL",
          ],
          "B",
        ],
        [
          "Which status means a resource was created?",
          ["200", "201", "204", "304"],
          "B",
        ],
        [
          "What is JSON primarily used for?",
          ["Data interchange", "Image editing", "Encryption", "Layout"],
          "A",
        ],
      ],
    ],
  ];
  await writeJson("users.json", [admin, student, student2]);
  await writeJson("quizzes.json", [quizA, quizB]);
  await writeJson(
    "questions.json",
    topics.flatMap(([quiz, list]) =>
      list.map(([text, options, correct], order) => ({
        id: uuid(),
        quizId: quiz.id,
        text,
        options: Object.fromEntries(
          options.map((value, i) => [String.fromCharCode(65 + i), value]),
        ),
        correctOption: correct,
        marks: 10,
        order,
      })),
    ),
  );
  await writeJson("attempts.json", []);
  console.log("Seeded QuizCraft demo data.");
}
