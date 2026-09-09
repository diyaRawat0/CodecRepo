import React, { useEffect, useState } from "react";
import { createRoot } from "react-dom/client";
import {
  BrowserRouter,
  Link,
  NavLink,
  Route,
  Routes,
  useLocation,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  Activity,
  ArrowLeft,
  BookOpen,
  ChevronLeft,
  ChevronRight,
  CircleAlert,
  GraduationCap,
  LayoutDashboard,
  Menu,
  MoreHorizontal,
  Pencil,
  Plus,
  Search,
  Settings2,
  ShieldCheck,
  Trash2,
  Users,
  X,
} from "lucide-react";
import { messageOf, services } from "./services/api.js";
import "./index.css";

const nav = [
  { to: "/", label: "Dashboard", icon: LayoutDashboard },
  { to: "/students", label: "Students", icon: Users },
  { to: "/courses", label: "Courses", icon: BookOpen },
  { to: "/departments", label: "Departments", icon: GraduationCap },
  { to: "/enrollments", label: "Enrollments", icon: Activity },
];
function Layout({ children }) {
  const [open, setOpen] = useState(false);
  const location = useLocation();
  const title =
    nav.find((x) => x.to === location.pathname)?.label ||
    (location.pathname.includes("/students/")
      ? "Student profile"
      : "Workspace");
  return (
    <div className="min-h-screen lg:flex">
      <aside
        className={`fixed inset-y-0 left-0 z-30 w-72 transform border-r border-line bg-white p-6 transition lg:static lg:translate-x-0 ${open ? "translate-x-0" : "-translate-x-full"}`}
      >
        <div className="flex items-center justify-between">
          <Link to="/" className="flex items-center gap-3">
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-mint">
              <GraduationCap size={22} />
            </span>
            <span className="font-display text-xl font-bold">campusly</span>
          </Link>
          <button onClick={() => setOpen(false)} className="lg:hidden">
            <X size={20} />
          </button>
        </div>
        <div className="mt-12">
          <p className="eyebrow px-3">Workspace</p>
          <nav className="mt-3 space-y-1">
            {nav.map(({ to, label, icon: Icon }) => (
              <NavLink
                key={to}
                to={to}
                onClick={() => setOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-xl px-3 py-3 text-sm font-semibold transition ${isActive ? "bg-mint text-teal" : "text-muted hover:bg-sand hover:text-ink"}`
                }
              >
                <Icon size={18} />
                {label}
              </NavLink>
            ))}
          </nav>
        </div>
        <div className="absolute bottom-6 left-6 right-6 rounded-2xl bg-ink p-4 text-white">
          <div className="flex items-center gap-2 text-mint">
            <ShieldCheck size={17} />
            <span className="text-xs font-bold">Local workspace</span>
          </div>
          <p className="mt-2 text-xs leading-5 text-white/60">
            Your data is stored safely in local JSON files.
          </p>
        </div>
      </aside>
      {open && (
        <button
          aria-label="Close menu"
          className="fixed inset-0 z-20 bg-ink/30 lg:hidden"
          onClick={() => setOpen(false)}
        />
      )}
      <main className="min-w-0 flex-1">
        <header className="flex h-20 items-center justify-between border-b border-line bg-white/80 px-5 backdrop-blur md:px-10">
          <div className="flex items-center gap-3">
            <button className="lg:hidden" onClick={() => setOpen(true)}>
              <Menu />
            </button>
            <div>
              <p className="eyebrow">Campusly admin</p>
              <h1 className="font-display text-xl font-bold">{title}</h1>
            </div>
          </div>
          <div className="flex items-center gap-3">
            <div className="hidden items-center gap-2 rounded-full bg-mint px-3 py-2 text-xs font-semibold text-teal sm:flex">
              <span className="h-2 w-2 rounded-full bg-teal" /> API connected
            </div>
            <div className="grid h-10 w-10 place-items-center rounded-full bg-coral font-bold text-white">
              AD
            </div>
          </div>
        </header>
        <div className="mx-auto max-w-[1500px] p-5 md:p-10">{children}</div>
      </main>
    </div>
  );
}
function Header({ title, subtitle, action }) {
  return (
    <div className="mb-8 flex flex-col justify-between gap-5 md:flex-row md:items-end">
      <div>
        <p className="eyebrow">Overview</p>
        <h2 className="mt-2 font-display text-3xl font-bold tracking-tight">
          {title}
        </h2>
        <p className="mt-2 text-sm text-muted">{subtitle}</p>
      </div>
      {action}
    </div>
  );
}
function Toast({ text, error, onClose }) {
  return (
    text && (
      <div
        className={`fixed bottom-6 right-6 z-50 flex max-w-sm items-center gap-3 rounded-xl px-4 py-3 text-sm font-semibold text-white shadow-lg ${error ? "bg-coral" : "bg-teal"}`}
      >
        <span>{text}</span>
        <button onClick={onClose}>
          <X size={16} />
        </button>
      </div>
    )
  );
}
function Dashboard() {
  const [data, setData] = useState({});
  useEffect(() => {
    Promise.all(
      Object.entries(services).map(async ([key, service]) => [
        key,
        await service.list(
          key === "students" ? { limit: 5, sort: "newest" } : undefined,
        ),
      ]),
    )
      .then((pairs) => setData(Object.fromEntries(pairs)))
      .catch(() => {});
  }, []);
  const cards = [
    {
      label: "Total students",
      value: data.students?.pagination?.totalStudents ?? "—",
      icon: Users,
      color: "bg-mint text-teal",
    },
    {
      label: "Total courses",
      value: data.courses?.length ?? "—",
      icon: BookOpen,
      color: "bg-[#fff0d9] text-[#a36318]",
    },
    {
      label: "Departments",
      value: data.departments?.length ?? "—",
      icon: GraduationCap,
      color: "bg-[#ffe5e1] text-[#bf5948]",
    },
    {
      label: "Enrollments",
      value: data.enrollments?.length ?? "—",
      icon: Activity,
      color: "bg-[#e8e7ff] text-[#5952a7]",
    },
  ];
  return (
    <>
      <Header
        title="Good morning, Diya"
        subtitle="Overview of the student management system."
        action={
          <Link to="/students/new" className="btn-primary">
            <Plus size={17} /> Add student
          </Link>
        }
      />
      <div className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
        {cards.map(({ label, value, icon: Icon, color }) => (
          <div className="panel p-5" key={label}>
            <div className="flex items-start justify-between">
              <span
                className={`grid h-11 w-11 place-items-center rounded-xl ${color}`}
              >
                <Icon size={21} />
              </span>
              <MoreHorizontal size={18} className="text-muted" />
            </div>
            <p className="mt-7 text-sm text-muted">{label}</p>
            <p className="mt-1 font-display text-3xl font-bold">{value}</p>
          </div>
        ))}
      </div>
      <div className="mt-8 grid gap-6 xl:grid-cols-[1.4fr_1fr]">
        <div className="panel">
          <div className="flex items-center justify-between border-b border-line p-5">
            <div>
              <h3 className="font-display text-lg font-bold">
                Recent students
              </h3>
              <p className="mt-1 text-xs text-muted">
                The latest additions to your roster.
              </p>
            </div>
            <Link to="/students" className="text-sm font-bold text-teal">
              View all
            </Link>
          </div>
          <div className="divide-y divide-line">
            {(data.students?.students || []).map((s) => (
              <Link
                to={`/students/${s.id}`}
                key={s.id}
                className="flex items-center justify-between p-5 transition hover:bg-sand"
              >
                <div className="flex items-center gap-3">
                  <div className="grid h-10 w-10 place-items-center rounded-full bg-ink text-sm font-bold text-mint">
                    {s.firstName[0]}
                    {s.lastName[0]}
                  </div>
                  <div>
                    <p className="text-sm font-bold">
                      {s.firstName} {s.lastName}
                    </p>
                    <p className="text-xs text-muted">
                      {s.studentId} · {s.email}
                    </p>
                  </div>
                </div>
                <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold capitalize text-teal">
                  {s.status}
                </span>
              </Link>
            ))}
          </div>
        </div>
        <div className="panel p-6">
          <div className="flex items-center gap-3">
            <div className="grid h-10 w-10 place-items-center rounded-xl bg-ink text-mint">
              <Settings2 size={20} />
            </div>
            <div>
              <h3 className="font-display text-lg font-bold">Quick actions</h3>
              <p className="text-xs text-muted">Jump into common workflows.</p>
            </div>
          </div>
          <div className="mt-6 grid gap-3">
            {nav.slice(1).map(({ to, label, icon: Icon }) => (
              <Link
                className="flex items-center justify-between rounded-xl border border-line p-4 text-sm font-semibold transition hover:border-teal hover:bg-mint"
                to={to}
                key={to}
              >
                <span className="flex items-center gap-3">
                  <Icon size={18} className="text-teal" />
                  {label}
                </span>
                <ChevronRight size={17} className="text-muted" />
              </Link>
            ))}
          </div>
        </div>
      </div>
    </>
  );
}
const labels = {
  students: "Students",
  courses: "Courses",
  departments: "Departments",
  enrollments: "Enrollments",
};
function ResourcePage({ type }) {
  const [items, setItems] = useState([]);
  const [pagination, setPagination] = useState(null);
  const [query, setQuery] = useState({
    search: "",
    page: 1,
    limit: 8,
    sort: "name_asc",
  });
  const [loading, setLoading] = useState(true);
  const [toast, setToast] = useState("");
  const [error, setError] = useState("");
  const [refresh, setRefresh] = useState(0);
  const navigate = useNavigate();
  const service = services[type];
  useEffect(() => {
    setLoading(true);
    service
      .list(query)
      .then((result) => {
        setItems(type === "students" ? result.students : result);
        setPagination(result.pagination);
        setError("");
      })
      .catch((e) => setError(messageOf(e)))
      .finally(() => setLoading(false));
  }, [type, query, refresh]);
  const remove = async (item) => {
    if (!window.confirm(`Delete this ${type.slice(0, -1)}?`)) return;
    try {
      await service.remove(item.id);
      setToast("Record deleted");
      setRefresh((x) => x + 1);
    } catch (e) {
      setToast(messageOf(e));
    }
  };
  const isStudent = type === "students";
  return (
    <>
      <Header
        title={labels[type]}
        subtitle={`Manage ${type} records and academic information.`}
        action={
          <button
            className="btn-primary"
            onClick={() => navigate(`/${type}/new`)}
          >
            <Plus size={17} /> Add {type.slice(0, -1)}
          </button>
        }
      />
      <div className="panel overflow-hidden">
        <div className="flex flex-col gap-3 border-b border-line p-4 md:flex-row md:items-center md:justify-between">
          <div className="relative max-w-sm flex-1">
            <Search
              className="absolute left-3 top-1/2 -translate-y-1/2 text-muted"
              size={17}
            />
            <input
              className="field pl-10"
              placeholder={`Search ${type}...`}
              value={query.search}
              onChange={(e) =>
                setQuery({ ...query, search: e.target.value, page: 1 })
              }
            />
          </div>
          {isStudent && (
            <div className="flex flex-wrap gap-2">
              <select
                className="field mt-0 w-auto"
                value={query.year || ""}
                onChange={(e) =>
                  setQuery({ ...query, year: e.target.value, page: 1 })
                }
              >
                <option value="">All years</option>
                {[1, 2, 3, 4].map((x) => (
                  <option key={x} value={x}>
                    Year {x}
                  </option>
                ))}
              </select>
              <select
                className="field mt-0 w-auto"
                value={query.status || ""}
                onChange={(e) =>
                  setQuery({ ...query, status: e.target.value, page: 1 })
                }
              >
                <option value="">All statuses</option>
                <option value="active">Active</option>
                <option value="inactive">Inactive</option>
                <option value="graduated">Graduated</option>
              </select>
              <select
                className="field mt-0 w-auto"
                value={query.sort}
                onChange={(e) =>
                  setQuery({ ...query, sort: e.target.value, page: 1 })
                }
              >
                <option value="name_asc">Name A-Z</option>
                <option value="name_desc">Name Z-A</option>
                <option value="newest">Newest</option>
                <option value="year_asc">Year ascending</option>
              </select>
            </div>
          )}
        </div>
        {error ? (
          <div className="m-5 flex items-center gap-3 rounded-xl bg-[#fff0ed] p-4 text-sm font-semibold text-coral">
            <CircleAlert size={18} />
            {error}
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="w-full min-w-[700px] text-left text-sm">
              <thead className="bg-sand text-xs uppercase tracking-wider text-muted">
                <tr>
                  {(isStudent
                    ? ["Student", "Email", "Department", "Year", "Status"]
                    : type === "courses"
                      ? ["Course", "Department", "Credits"]
                      : type === "departments"
                        ? ["Department", "Code", "Description"]
                        : ["Student", "Course", "Term", "Grade"]
                  ).map((x) => (
                    <th className="px-5 py-4 font-bold" key={x}>
                      {x}
                    </th>
                  ))}
                  <th className="px-5 py-4"> </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-line">
                {loading
                  ? Array.from({ length: 5 }).map((_, i) => (
                      <tr key={i}>
                        {Array.from({ length: isStudent ? 6 : 4 }).map(
                          (__, j) => (
                            <td className="px-5 py-5" key={j}>
                              <div className="h-4 animate-pulse rounded bg-sand" />
                            </td>
                          ),
                        )}
                      </tr>
                    ))
                  : items.map((item) => (
                      <tr className="transition hover:bg-sand" key={item.id}>
                        {isStudent ? (
                          <>
                            <td className="px-5 py-4">
                              <Link
                                className="font-bold hover:text-teal"
                                to={`/students/${item.id}`}
                              >
                                {item.firstName} {item.lastName}
                              </Link>
                              <p className="mt-1 text-xs text-muted">
                                {item.studentId}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-muted">
                              {item.email}
                            </td>
                            <td className="px-5 py-4 text-muted">
                              {item.departmentId?.slice(0, 8)}...
                            </td>
                            <td className="px-5 py-4">Year {item.year}</td>
                            <td className="px-5 py-4">
                              <span className="rounded-full bg-mint px-2.5 py-1 text-xs font-bold capitalize text-teal">
                                {item.status}
                              </span>
                            </td>
                          </>
                        ) : type === "courses" ? (
                          <>
                            <td className="px-5 py-4">
                              <p className="font-bold">{item.name}</p>
                              <p className="mt-1 text-xs text-muted">
                                {item.courseCode}
                              </p>
                            </td>
                            <td className="px-5 py-4 text-muted">
                              {item.departmentId?.slice(0, 8)}...
                            </td>
                            <td className="px-5 py-4">{item.credits}</td>
                          </>
                        ) : type === "departments" ? (
                          <>
                            <td className="px-5 py-4 font-bold">{item.name}</td>
                            <td className="px-5 py-4 font-bold text-teal">
                              {item.code}
                            </td>
                            <td className="max-w-xs truncate px-5 py-4 text-muted">
                              {item.description}
                            </td>
                          </>
                        ) : (
                          <>
                            <td className="px-5 py-4 font-bold">
                              {item.studentId?.slice(0, 8)}...
                            </td>
                            <td className="px-5 py-4 font-bold">
                              {item.courseId?.slice(0, 8)}...
                            </td>
                            <td className="px-5 py-4 text-muted">
                              {item.semester} · {item.academicYear}
                            </td>
                            <td className="px-5 py-4">{item.grade || "—"}</td>
                          </>
                        )}
                        <td className="px-5 py-4">
                          <div className="flex justify-end gap-2">
                            <button
                              className="rounded-lg p-2 text-muted hover:bg-mint hover:text-teal"
                              onClick={() =>
                                navigate(`/${type}/${item.id}/edit`)
                              }
                            >
                              <Pencil size={16} />
                            </button>
                            <button
                              className="rounded-lg p-2 text-muted hover:bg-[#fff0ed] hover:text-coral"
                              onClick={() => remove(item)}
                            >
                              <Trash2 size={16} />
                            </button>
                          </div>
                        </td>
                      </tr>
                    ))}
              </tbody>
            </table>
            {!loading && !items.length && (
              <div className="p-16 text-center">
                <Search className="mx-auto text-muted" size={30} />
                <p className="mt-3 font-bold">No {type} found</p>
                <p className="mt-1 text-sm text-muted">
                  Try adjusting your search or create a new record.
                </p>
              </div>
            )}
          </div>
        )}
        <div className="flex items-center justify-between border-t border-line p-4 text-sm text-muted">
          <span>
            {pagination
              ? `${pagination.totalStudents} total records`
              : `${items.length} records`}
          </span>
          {pagination && (
            <div className="flex items-center gap-2">
              <button
                className="btn-secondary px-3 py-2"
                disabled={!pagination.hasPreviousPage}
                onClick={() => setQuery({ ...query, page: query.page - 1 })}
              >
                <ChevronLeft size={16} />
              </button>
              <span className="px-2 font-semibold text-ink">
                Page {pagination.page} of {Math.max(1, pagination.totalPages)}
              </span>
              <button
                className="btn-secondary px-3 py-2"
                disabled={!pagination.hasNextPage}
                onClick={() => setQuery({ ...query, page: query.page + 1 })}
              >
                <ChevronRight size={16} />
              </button>
            </div>
          )}
        </div>
      </div>
      <Toast
        text={toast}
        error={toast.includes("Cannot") || toast.includes("already")}
        onClose={() => setToast("")}
      />
    </>
  );
}
function FormPage({ type }) {
  const { id } = useParams();
  const edit = Boolean(id);
  const [form, setForm] = useState({
    status: "active",
    year: 1,
    credits: 3,
    semester: "Fall",
    academicYear: "2025-2026",
  });
  const [options, setOptions] = useState({
    departments: [],
    students: [],
    courses: [],
  });
  const [error, setError] = useState("");
  const [saving, setSaving] = useState(false);
  const navigate = useNavigate();
  useEffect(() => {
    Promise.all([
      services.departments.list(),
      services.students.list({ limit: 50 }),
      services.courses.list(),
    ]).then(([departments, students, courses]) =>
      setOptions({ departments, students: students.students, courses }),
    );
    if (edit)
      services[type]
        .get(id)
        .then(setForm)
        .catch((e) => setError(messageOf(e)));
  }, [id, type]);
  const fields =
    type === "students"
      ? [
          ["studentId", "Student ID"],
          ["firstName", "First name"],
          ["lastName", "Last name"],
          ["email", "Email"],
          ["phone", "Phone"],
          ["dateOfBirth", "Date of birth"],
        ]
      : type === "courses"
        ? [
            ["courseCode", "Course code"],
            ["name", "Course name"],
            ["description", "Description"],
            ["credits", "Credits"],
          ]
        : type === "departments"
          ? [
              ["name", "Department name"],
              ["code", "Code"],
              ["description", "Description"],
            ]
          : [["academicYear", "Academic year"]];
  const submit = async (e) => {
    e.preventDefault();
    setSaving(true);
    setError("");
    try {
      await services[type][edit ? "update" : "create"](
        edit ? id : undefined,
        form,
      );
      navigate(`/${type}`);
    } catch (err) {
      setError(messageOf(err));
    } finally {
      setSaving(false);
    }
  };
  return (
    <>
      <button
        className="mb-6 flex items-center gap-2 text-sm font-bold text-muted hover:text-teal"
        onClick={() => navigate(-1)}
      >
        <ArrowLeft size={17} /> Back
      </button>
      <Header
        title={`${edit ? "Edit" : "Add"} ${type.slice(0, -1)}`}
        subtitle="Keep the record accurate and up to date."
      />
      <form onSubmit={submit} className="panel max-w-3xl p-6 md:p-8">
        <div className="grid gap-5 md:grid-cols-2">
          {fields.map(([key, label]) => (
            <label
              className={key === "description" ? "md:col-span-2" : ""}
              key={key}
            >
              <span className="text-sm font-bold">{label}</span>
              {key === "description" ? (
                <textarea
                  className="field min-h-28"
                  value={form[key] || ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              ) : (
                <input
                  required={[
                    "studentId",
                    "firstName",
                    "lastName",
                    "email",
                    "name",
                    "courseCode",
                    "code",
                  ].includes(key)}
                  type={
                    key === "dateOfBirth"
                      ? "date"
                      : key === "credits"
                        ? "number"
                        : "text"
                  }
                  className="field"
                  value={form[key] ?? ""}
                  onChange={(e) => setForm({ ...form, [key]: e.target.value })}
                />
              )}
            </label>
          ))}
          {type === "students" && (
            <>
              <label>
                <span className="text-sm font-bold">Department</span>
                <select
                  required
                  className="field"
                  value={form.departmentId || ""}
                  onChange={(e) =>
                    setForm({ ...form, departmentId: e.target.value })
                  }
                >
                  <option value="">Select department</option>
                  {options.departments.map((d) => (
                    <option value={d.id} key={d.id}>
                      {d.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Year</span>
                <select
                  className="field"
                  value={form.year}
                  onChange={(e) =>
                    setForm({ ...form, year: Number(e.target.value) })
                  }
                >
                  {[1, 2, 3, 4].map((x) => (
                    <option key={x}>{x}</option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Status</span>
                <select
                  className="field"
                  value={form.status}
                  onChange={(e) => setForm({ ...form, status: e.target.value })}
                >
                  <option>active</option>
                  <option>inactive</option>
                  <option>graduated</option>
                </select>
              </label>
            </>
          )}
          {type === "courses" && (
            <label>
              <span className="text-sm font-bold">Department</span>
              <select
                required
                className="field"
                value={form.departmentId || ""}
                onChange={(e) =>
                  setForm({ ...form, departmentId: e.target.value })
                }
              >
                <option value="">Select department</option>
                {options.departments.map((d) => (
                  <option value={d.id} key={d.id}>
                    {d.name}
                  </option>
                ))}
              </select>
            </label>
          )}
          {type === "enrollments" && (
            <>
              <label>
                <span className="text-sm font-bold">Student</span>
                <select
                  required
                  className="field"
                  value={form.studentId || ""}
                  onChange={(e) =>
                    setForm({ ...form, studentId: e.target.value })
                  }
                >
                  <option value="">Select student</option>
                  {options.students.map((s) => (
                    <option value={s.id} key={s.id}>
                      {s.firstName} {s.lastName} · {s.studentId}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Course</span>
                <select
                  required
                  className="field"
                  value={form.courseId || ""}
                  onChange={(e) =>
                    setForm({ ...form, courseId: e.target.value })
                  }
                >
                  <option value="">Select course</option>
                  {options.courses.map((c) => (
                    <option value={c.id} key={c.id}>
                      {c.courseCode} · {c.name}
                    </option>
                  ))}
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Semester</span>
                <select
                  className="field"
                  value={form.semester}
                  onChange={(e) =>
                    setForm({ ...form, semester: e.target.value })
                  }
                >
                  <option>Fall</option>
                  <option>Spring</option>
                  <option>Summer</option>
                </select>
              </label>
              <label>
                <span className="text-sm font-bold">Grade</span>
                <input
                  className="field"
                  value={form.grade || ""}
                  placeholder="Optional"
                  onChange={(e) => setForm({ ...form, grade: e.target.value })}
                />
              </label>
            </>
          )}
        </div>
        {error && (
          <div className="mt-6 flex items-center gap-2 rounded-xl bg-[#fff0ed] p-3 text-sm font-semibold text-coral">
            <CircleAlert size={17} />
            {error}
          </div>
        )}
        <div className="mt-8 flex justify-end gap-3">
          <button
            type="button"
            className="btn-secondary"
            onClick={() => navigate(-1)}
          >
            Cancel
          </button>
          <button disabled={saving} className="btn-primary" type="submit">
            {saving ? "Saving..." : edit ? "Save changes" : "Create record"}
          </button>
        </div>
      </form>
    </>
  );
}
function StudentDetails() {
  const { id } = useParams();
  const [student, setStudent] = useState(null);
  const [history, setHistory] = useState([]);
  const [error, setError] = useState("");
  useEffect(() => {
    Promise.all([
      services.students.get(id),
      services.enrollments.list(),
      services.courses.list(),
    ])
      .then(([record, enrollments, courses]) => {
        setStudent(record);
        const courseMap = Object.fromEntries(
          courses.map((course) => [course.id, course]),
        );
        setHistory(
          enrollments
            .filter((enrollment) => enrollment.studentId === id)
            .map((enrollment) => ({
              ...enrollment,
              course: courseMap[enrollment.courseId],
            })),
        );
      })
      .catch((e) => setError(messageOf(e)));
  }, [id]);
  if (error) return <div className="panel p-8 text-coral">{error}</div>;
  if (!student) return <div className="panel h-64 animate-pulse" />;
  return (
    <>
      <Link
        to="/students"
        className="mb-6 flex items-center gap-2 text-sm font-bold text-muted hover:text-teal"
      >
        <ArrowLeft size={17} /> Back to students
      </Link>
      <Header
        title={`${student.firstName} ${student.lastName}`}
        subtitle={`${student.studentId} · Student profile`}
        action={
          <Link to={`/students/${id}/edit`} className="btn-primary">
            <Pencil size={16} /> Edit student
          </Link>
        }
      />
      <div className="grid gap-6 lg:grid-cols-[1fr_1.3fr]">
        <div className="panel p-6">
          <div className="flex items-center gap-4">
            <div className="grid h-16 w-16 place-items-center rounded-2xl bg-ink text-xl font-bold text-mint">
              {student.firstName[0]}
              {student.lastName[0]}
            </div>
            <div>
              <h3 className="font-display text-xl font-bold">
                {student.firstName} {student.lastName}
              </h3>
              <span className="mt-2 inline-block rounded-full bg-mint px-2.5 py-1 text-xs font-bold capitalize text-teal">
                {student.status}
              </span>
            </div>
          </div>
          <dl className="mt-8 grid gap-5 text-sm">
            <div>
              <dt className="text-muted">Email</dt>
              <dd className="mt-1 font-semibold">{student.email}</dd>
            </div>
            <div>
              <dt className="text-muted">Phone</dt>
              <dd className="mt-1 font-semibold">{student.phone || "—"}</dd>
            </div>
            <div>
              <dt className="text-muted">Date of birth</dt>
              <dd className="mt-1 font-semibold">
                {student.dateOfBirth || "—"}
              </dd>
            </div>
            <div>
              <dt className="text-muted">Academic year</dt>
              <dd className="mt-1 font-semibold">Year {student.year}</dd>
            </div>
          </dl>
        </div>
        <div className="panel p-6">
          <h3 className="font-display text-lg font-bold">Enrollment history</h3>
          <p className="mt-1 text-sm text-muted">
            Academic activity for this student.
          </p>
          <div className="mt-6 overflow-x-auto">
            <table className="w-full min-w-[500px] text-left text-sm">
              <thead className="border-b border-line text-xs uppercase text-muted">
                <tr>
                  <th className="pb-3">Course</th>
                  <th className="pb-3">Term</th>
                  <th className="pb-3">Grade</th>
                </tr>
              </thead>
              <tbody>
                {history.length ? (
                  history.map((enrollment) => (
                    <tr
                      className="border-b border-line last:border-0"
                      key={enrollment.id}
                    >
                      <td className="py-4 font-semibold">
                        {enrollment.course?.name || "Unknown course"}
                        <p className="text-xs text-muted">
                          {enrollment.course?.courseCode}
                        </p>
                      </td>
                      <td className="py-4 text-muted">
                        {enrollment.semester} · {enrollment.academicYear}
                      </td>
                      <td className="py-4 font-bold">
                        {enrollment.grade || "—"}
                      </td>
                    </tr>
                  ))
                ) : (
                  <tr>
                    <td className="py-8 text-muted" colSpan="3">
                      No enrollments yet.
                    </td>
                  </tr>
                )}
              </tbody>
            </table>
          </div>
        </div>
      </div>
    </>
  );
}
function App() {
  return (
    <Layout>
      <Routes>
        <Route path="/" element={<Dashboard />} />
        <Route path="/students" element={<ResourcePage type="students" />} />
        <Route path="/courses" element={<ResourcePage type="courses" />} />
        <Route
          path="/departments"
          element={<ResourcePage type="departments" />}
        />
        <Route
          path="/enrollments"
          element={<ResourcePage type="enrollments" />}
        />
        <Route path="/students/new" element={<FormPage type="students" />} />
        <Route
          path="/students/:id/edit"
          element={<FormPage type="students" />}
        />
        <Route path="/students/:id" element={<StudentDetails />} />
        {["courses", "departments", "enrollments"].map((type) => (
          <React.Fragment key={type}>
            <Route path={`/${type}/new`} element={<FormPage type={type} />} />
            <Route
              path={`/${type}/:id/edit`}
              element={<FormPage type={type} />}
            />
          </React.Fragment>
        ))}
      </Routes>
    </Layout>
  );
}
createRoot(document.getElementById("root")).render(
  <BrowserRouter>
    <App />
  </BrowserRouter>,
);
