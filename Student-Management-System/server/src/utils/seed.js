import { writeCollection } from "./jsonStore.js";
import crypto from "node:crypto";
const uid = () => crypto.randomUUID();
const departments = [
  "Computer Science",
  "Business",
  "Engineering",
  "Arts & Humanities",
  "Health Sciences",
  "Mathematics",
].map((name, i) => ({
  id: uid(),
  name,
  code: ["CS", "BUS", "ENG", "ART", "HLT", "MAT"][i],
  description: `${name} department`,
}));
const first = [
  "Diya",
  "Maya",
  "Liam",
  "Sophia",
  "Noah",
  "Zoe",
  "Ethan",
  "Ava",
  "Lucas",
  "Ivy",
];
const last = [
  "Sharma",
  "Patel",
  "Chen",
  "Williams",
  "Garcia",
  "Brown",
  "Khan",
  "Miller",
  "Davis",
  "Wilson",
];
const students = Array.from({ length: 30 }, (_, i) => ({
  id: uid(),
  studentId: `STU-${String(1001 + i)}`,
  firstName: first[i % 10],
  lastName: last[(i * 3) % 10],
  email: `${first[i % 10].toLowerCase()}.${i + 1}@campus.edu`,
  phone: `+1 555 010 ${String(i + 10).padStart(2, "0")}`,
  dateOfBirth: `200${i % 5}-0${(i % 8) + 1}-15`,
  departmentId: departments[i % 6].id,
  year: (i % 4) + 1,
  status: ["active", "active", "active", "inactive", "graduated"][i % 5],
  createdAt: new Date(Date.now() - i * 86400000).toISOString(),
  updatedAt: new Date().toISOString(),
}));
const courseNames = [
  "Data Structures",
  "Web Engineering",
  "Financial Accounting",
  "Design Thinking",
  "Calculus II",
  "Cloud Systems",
  "Human Anatomy",
  "Digital Marketing",
  "Thermodynamics",
  "Modern History",
  "Statistics",
  "Operating Systems",
  "Business Law",
  "Linear Algebra",
  "Mobile Computing",
];
const courses = courseNames.map((name, i) => ({
  id: uid(),
  courseCode: `${["CS", "BUS", "ENG", "ART", "HLT", "MAT"][i % 6]}${200 + i}`,
  name,
  description: `${name} fundamentals and practice`,
  credits: (i % 3) + 2,
  departmentId: departments[i % 6].id,
}));
const enrollments = Array.from({ length: 40 }, (_, i) => ({
  id: uid(),
  studentId: students[i % 30].id,
  courseId: courses[i % 15].id,
  semester: ["Fall", "Spring", "Summer"][i % 3],
  academicYear: "2025-2026",
  grade: ["A", "B+", "B", "A-", null][i % 5],
  enrolledAt: new Date(Date.now() - i * 3600000).toISOString(),
}));
await writeCollection("departments", departments);
await writeCollection("students", students);
await writeCollection("courses", courses);
await writeCollection("enrollments", enrollments);
console.log(
  "Seeded 6 departments, 30 students, 15 courses, and 40 enrollments.",
);
