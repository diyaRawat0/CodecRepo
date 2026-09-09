import { AppError } from "../middleware/errors.js";
import {
  students,
  departments,
  courses,
  enrollments,
} from "../repositories/index.js";
import { clean, required, email, id, oneOf } from "../validators/common.js";
const now = () => new Date().toISOString();
const repositories = { students, departments, courses, enrollments };
const find = async (repo, value, label) => {
  const item = await repo.findById(value);
  if (!item) throw new AppError(`${label} not found`, 404);
  return item;
};
export async function listStudents(query) {
  let items = await students.findAll();
  const deps = await departments.findAll();
  const search = clean(query.search)?.toLowerCase();
  if (search)
    items = items.filter((s) =>
      [s.studentId, s.firstName, s.lastName, s.email].some((v) =>
        v.toLowerCase().includes(search),
      ),
    );
  if (query.department)
    items = items.filter(
      (s) =>
        s.departmentId === query.department ||
        deps.find((d) => d.id === s.departmentId)?.code.toLowerCase() ===
          query.department.toLowerCase(),
    );
  if (query.year)
    items = items.filter((s) => String(s.year) === String(query.year));
  if (query.status) items = items.filter((s) => s.status === query.status);
  const sort = [
    "name_asc",
    "name_desc",
    "studentId",
    "year_asc",
    "year_desc",
    "newest",
  ].includes(query.sort)
    ? query.sort
    : "name_asc";
  items.sort((a, b) =>
    sort === "studentId"
      ? a.studentId.localeCompare(b.studentId)
      : sort === "year_asc"
        ? a.year - b.year
        : sort === "year_desc"
          ? b.year - a.year
          : sort === "newest"
            ? b.createdAt.localeCompare(a.createdAt)
            : `${a.firstName} ${a.lastName}`.localeCompare(
                `${b.firstName} ${b.lastName}`,
              ) * (sort === "name_desc" ? -1 : 1),
  );
  const page = Math.max(1, Number.parseInt(query.page || 1, 10));
  const limit = Math.min(
    50,
    Math.max(1, Number.parseInt(query.limit || 10, 10)),
  );
  const totalStudents = items.length;
  const totalPages = Math.ceil(totalStudents / limit);
  return {
    students: items.slice((page - 1) * limit, page * limit),
    pagination: {
      page,
      limit,
      totalStudents,
      totalPages,
      hasNextPage: page < totalPages,
      hasPreviousPage: page > 1,
    },
  };
}
export async function list(collection) {
  return repositories[collection].findAll();
}
export async function get(collection, itemId) {
  return find(repositories[collection], itemId, collection.slice(0, -1));
}
export async function save(collection, payload, itemId) {
  const repo = repositories[collection];
  const data = { ...payload };
  if (collection === "students") {
    data.studentId = required(data.studentId, "Student ID");
    data.firstName = required(data.firstName, "First name");
    data.lastName = required(data.lastName, "Last name");
    data.email = email(data.email);
    data.departmentId = id(data.departmentId, "Department");
    await find(departments, data.departmentId, "Department");
    data.year = Number(data.year);
    if (!Number.isInteger(data.year) || data.year < 1 || data.year > 4)
      throw new AppError("Year must be between 1 and 4");
    data.status = oneOf(
      data.status,
      ["active", "inactive", "graduated"],
      "Status",
    );
    if (data.phone && !/^[+\d ()-]{7,20}$/.test(data.phone))
      throw new AppError("Phone format is invalid");
    data.updatedAt = now();
  }
  if (collection === "departments") {
    data.name = required(data.name, "Name");
    data.code = required(data.code, "Code").toUpperCase();
  }
  if (collection === "courses") {
    data.courseCode = required(data.courseCode, "Course code").toUpperCase();
    data.name = required(data.name, "Name");
    data.credits = Number(data.credits);
    if (!Number.isInteger(data.credits) || data.credits < 1)
      throw new AppError("Credits must be a positive integer");
    data.departmentId = id(data.departmentId, "Department");
    await find(departments, data.departmentId, "Department");
  }
  if (collection === "enrollments") {
    data.studentId = id(data.studentId, "Student");
    data.courseId = id(data.courseId, "Course");
    await find(students, data.studentId, "Student");
    await find(courses, data.courseId, "Course");
    data.semester = oneOf(
      data.semester,
      ["Fall", "Spring", "Summer"],
      "Semester",
    );
    data.academicYear = required(data.academicYear, "Academic year");
    data.grade = data.grade ? clean(data.grade).toUpperCase() : null;
  }
  if (!itemId) {
    if (collection === "students") {
      data.createdAt = now();
      if (
        (await students.findAll()).some(
          (s) => s.studentId === data.studentId || s.email === data.email,
        )
      )
        throw new AppError("Student ID or email already exists", 409);
    }
    if (
      collection === "departments" &&
      (await departments.findAll()).some((d) => d.code === data.code)
    )
      throw new AppError("Department code already exists", 409);
    if (
      collection === "courses" &&
      (await courses.findAll()).some((c) => c.courseCode === data.courseCode)
    )
      throw new AppError("Course code already exists", 409);
    if (
      collection === "enrollments" &&
      (await enrollments.findAll()).some(
        (e) =>
          e.studentId === data.studentId &&
          e.courseId === data.courseId &&
          e.semester === data.semester &&
          e.academicYear === data.academicYear,
      )
    )
      throw new AppError("Duplicate enrollment already exists", 409);
    return repo.create(data);
  }
  await find(repo, itemId, collection.slice(0, -1));
  return repo.update(itemId, data);
}
export async function remove(collection, itemId) {
  const repo = repositories[collection];
  await find(repo, itemId, collection.slice(0, -1));
  const links = await enrollments.findAll();
  if (
    collection === "departments" &&
    ((await students.findAll()).some((s) => s.departmentId === itemId) ||
      (await courses.findAll()).some((c) => c.departmentId === itemId))
  )
    throw new AppError(
      "Cannot delete department while students or courses reference it",
      409,
    );
  if (
    ["students", "courses"].includes(collection) &&
    links.some(
      (e) => e[collection === "students" ? "studentId" : "courseId"] === itemId,
    )
  )
    throw new AppError(
      `Cannot delete ${collection.slice(0, -1)} while enrollments reference it`,
      409,
    );
  await repo.delete(itemId);
}
