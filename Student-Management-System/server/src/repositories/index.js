import { createRepository } from "./jsonRepository.js";
export const students = createRepository("students");
export const departments = createRepository("departments");
export const courses = createRepository("courses");
export const enrollments = createRepository("enrollments");
