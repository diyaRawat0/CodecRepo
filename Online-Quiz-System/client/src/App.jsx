import { useEffect, useState } from "react";
import {
  BrowserRouter,
  Routes,
  Route,
  Navigate,
  Link,
  useNavigate,
  useParams,
} from "react-router-dom";
import {
  ArrowLeft,
  BarChart3,
  BookOpen,
  Check,
  ChevronRight,
  Clock3,
  FilePlus2,
  LayoutDashboard,
  LogOut,
  Menu,
  Pencil,
  Play,
  Plus,
  ShieldCheck,
  Trash2,
  Trophy,
  UserRound,
  X,
} from "lucide-react";
import { api, messageOf } from "./api";
import "./App.css";

const cn = (...values) => values.filter(Boolean).join(" ");
function Button({
  children,
  variant = "primary",
  size = "",
  className = "",
  ...props
}) {
  return (
    <button
      className={cn("btn", `btn-${variant}`, size && `btn-${size}`, className)}
      {...props}
    >
      {children}
    </button>
  );
}
function Card({ children, className = "" }) {
  return <section className={cn("card", className)}>{children}</section>;
}
function Badge({ children, tone = "muted" }) {
  return <span className={cn("badge", `badge-${tone}`)}>{children}</span>;
}
function Field({ label, ...props }) {
  return (
    <label className="field">
      <span>{label}</span>
      <input {...props} />
    </label>
  );
}
function Alert({ children, tone = "error" }) {
  return <div className={cn("alert", `alert-${tone}`)}>{children}</div>;
}
function Empty({ title, text }) {
  return (
    <div className="empty">
      <BookOpen size={28} />
      <h3>{title}</h3>
      <p>{text}</p>
    </div>
  );
}
function Layout({ user, onLogout, children }) {
  const [mobile, setMobile] = useState(false);
  const nav =
    user.role === "admin"
      ? [
          ["/admin", "Overview", LayoutDashboard],
          ["/admin/quizzes", "Quiz library", BookOpen],
          ["/results", "Results", BarChart3],
        ]
      : [
          ["/dashboard", "Dashboard", LayoutDashboard],
          ["/quizzes", "Explore quizzes", BookOpen],
          ["/results", "My results", Trophy],
          ["/profile", "Profile", UserRound],
        ];
  return (
    <div className="app-shell">
      <header className="topbar">
        <button
          className="icon-btn mobile-only"
          onClick={() => setMobile(true)}
          aria-label="Open navigation"
        >
          <Menu size={20} />
        </button>
        <Link
          className="wordmark"
          to={user.role === "admin" ? "/admin" : "/dashboard"}
        >
          quizcraft<span>.</span>
        </Link>
        <div className="top-actions">
          <span className="user-name">{user.name}</span>
          <Badge tone="teal">{user.role}</Badge>
          <button className="icon-btn" onClick={onLogout} aria-label="Sign out">
            <LogOut size={18} />
          </button>
        </div>
      </header>
      <aside className={cn("sidebar", mobile && "sidebar-open")}>
        <div className="sidebar-head">
          <span className="label">WORKSPACE</span>
          <button
            className="icon-btn mobile-only"
            onClick={() => setMobile(false)}
          >
            <X size={18} />
          </button>
        </div>
        {nav.map(([href, label, Icon]) => (
          <Link
            className="nav-link"
            key={href}
            to={href}
            onClick={() => setMobile(false)}
          >
            <Icon size={17} />
            {label}
          </Link>
        ))}
      </aside>
      {mobile && <div className="scrim" onClick={() => setMobile(false)} />}
      <main className="main-content">{children}</main>
    </div>
  );
}
function Page({ eyebrow, title, description, action, children }) {
  return (
    <div className="page">
      <div className="page-head">
        <div>
          <div className="eyebrow">{eyebrow}</div>
          <h1>{title}</h1>
          {description && <p className="page-description">{description}</p>}
        </div>
        {action}
      </div>
      {children}
    </div>
  );
}
function Auth({ onAuth }) {
  const [register, setRegister] = useState(false);
  const [form, setForm] = useState({ name: "", email: "", password: "" });
  const [error, setError] = useState("");
  const submit = async (e) => {
    e.preventDefault();
    try {
      const { data } = await api.post(
        `/auth/${register ? "register" : "login"}`,
        form,
      );
      localStorage.setItem("quizcraft_token", data.token);
      onAuth(data.user);
    } catch (err) {
      setError(messageOf(err));
    }
  };
  const demoLogin = (email, password) => {
    setRegister(false);
    setForm({ name: "", email, password });
    setError("");
  };
  return (
    <div className="auth-layout">
      <div className="auth-visual">
        <div className="eyebrow">LOCAL KNOWLEDGE STUDIO</div>
        <h1>Make every answer count.</h1>
        <p>
          Focused practice, honest timing, and clear progress for every learner.
        </p>
        <div className="quote">
          <ShieldCheck size={18} /> Server-verified results. Always.
        </div>
      </div>
      <Card className="auth-card">
        <div className="logo-tile">
          <BookOpen size={22} />
        </div>
        <div className="wordmark">
          quizcraft<span>.</span>
        </div>
        <h2>{register ? "Create your account" : "Welcome back"}</h2>
        <p className="muted">
          {register
            ? "Start building your knowledge streak."
            : "Pick up where you left off."}
        </p>
        {error && <Alert>{error}</Alert>}
        <form onSubmit={submit} className="form-stack">
          {register && (
            <Field
              label="Full name"
              required
              value={form.name}
              onChange={(e) => setForm({ ...form, name: e.target.value })}
            />
          )}
          <Field
            label="Email"
            type="email"
            required
            value={form.email}
            onChange={(e) => setForm({ ...form, email: e.target.value })}
          />
          <Field
            label="Password"
            type="password"
            required
            value={form.password}
            onChange={(e) => setForm({ ...form, password: e.target.value })}
          />
          <Button type="submit" className="full-width">
            {register ? "Create account" : "Sign in"}
            <ChevronRight size={17} />
          </Button>
        </form>
        <button className="link-btn" onClick={() => setRegister(!register)}>
          {register
            ? "Already have an account? Sign in"
            : "New here? Create an account"}
        </button>
        <div className="demo-login">
          <span>Quick demo access</span>
          <button
            onClick={() => demoLogin("admin@quizcraft.local", "Admin123!")}
          >
            Admin login
          </button>
          <button
            onClick={() => demoLogin("student@quizcraft.local", "Student123!")}
          >
            Student login
          </button>
        </div>
      </Card>
    </div>
  );
}
function useFetch(url) {
  const [state, setState] = useState({ loading: true, data: null, error: "" });
  useEffect(() => {
    let alive = true;
    api
      .get(url)
      .then(
        (r) => alive && setState({ loading: false, data: r.data, error: "" }),
      )
      .catch(
        (e) =>
          alive &&
          setState({ loading: false, data: null, error: messageOf(e) }),
      );
    return () => {
      alive = false;
    };
  }, [url]);
  return state;
}
function Stat({ icon: Icon, label, value }) {
  return (
    <Card className="stat">
      <div className="stat-icon">
        <Icon size={18} />
      </div>
      <div className="stat-label">{label}</div>
      <strong>{value}</strong>
    </Card>
  );
}
function QuizCards({ quizzes }) {
  if (!quizzes?.length)
    return (
      <Empty
        title="No published quizzes yet"
        text="Check back when an admin publishes the next challenge."
      />
    );
  return (
    <div className="quiz-grid">
      {quizzes.map((q) => (
        <Card className="quiz-card" key={q.id}>
          <div className="card-row">
            <Badge tone={q.state === "published" ? "teal" : "muted"}>
              {q.state}
            </Badge>
            <span className="small-muted">{q.questionCount} questions</span>
          </div>
          <h3>{q.title}</h3>
          <p>{q.description}</p>
          <div className="card-footer">
            <span>
              <Clock3 size={15} />
              {q.durationMinutes} min
            </span>
            <Link className="text-link" to={`/quiz/${q.id}`}>
              View quiz <ChevronRight size={15} />
            </Link>
          </div>
        </Card>
      ))}
    </div>
  );
}
function Dashboard() {
  const { data: quizzes, loading, error } = useFetch("/quizzes");
  const { data: attempts } = useFetch("/attempts");
  return (
    <Page
      eyebrow="STUDENT SPACE"
      title="Ready when you are."
      description="Choose a challenge, trust your preparation, and let the timer keep you honest."
    >
      {error && <Alert>{error}</Alert>}
      <div className="stats-grid">
        <Stat
          icon={BookOpen}
          label="Available quizzes"
          value={quizzes?.length ?? "—"}
        />
        <Stat
          icon={Check}
          label="Completed"
          value={
            attempts?.filter((a) => a.status === "submitted").length ?? "—"
          }
        />
        <Stat
          icon={Trophy}
          label="Average score"
          value={
            attempts?.length
              ? `${Math.round(attempts.reduce((n, a) => n + (a.score || 0), 0) / attempts.length)} pts`
              : "—"
          }
        />
      </div>
      <div className="section-title">
        <h2>Pick up a new challenge</h2>
        <Link className="text-link" to="/quizzes">
          View all <ChevronRight size={15} />
        </Link>
      </div>
      {loading ? (
        <div className="loading">Loading quizzes...</div>
      ) : (
        <QuizCards quizzes={(quizzes || []).slice(0, 3)} />
      )}
    </Page>
  );
}
function QuizList() {
  const { data, loading, error } = useFetch("/quizzes");
  return (
    <Page
      eyebrow="LIBRARY"
      title="Explore quizzes"
      description="Short, focused challenges designed to show what you know."
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <div className="loading">Loading quizzes...</div>
      ) : (
        <QuizCards quizzes={data} />
      )}
    </Page>
  );
}
function QuizDetail() {
  const { id } = useParams();
  const { data, loading, error } = useFetch(`/quizzes/${id}`);
  const nav = useNavigate();
  if (loading) return <div className="loading">Loading quiz...</div>;
  if (error) return <Alert>{error}</Alert>;
  return (
    <Page
      eyebrow="QUIZ BRIEF"
      title={data.title}
      description={data.description}
    >
      <Card className="detail-card">
        <div className="detail-metrics">
          <div>
            <span>Questions</span>
            <strong>{data.questionCount}</strong>
          </div>
          <div>
            <span>Duration</span>
            <strong>{data.durationMinutes} min</strong>
          </div>
          <div>
            <span>Total marks</span>
            <strong>{data.marks}</strong>
          </div>
        </div>
        <Alert tone="info">
          <Clock3 size={17} /> Your deadline is calculated by the server. The
          browser countdown cannot extend it.
        </Alert>
        <Button onClick={() => nav(`/quiz/${id}/attempt`)}>
          <Play size={16} /> Start quiz
        </Button>
      </Card>
    </Page>
  );
}
function Attempt() {
  const { id } = useParams();
  const nav = useNavigate();
  const [attempt, setAttempt] = useState(null);
  const [answers, setAnswers] = useState({});
  const [error, setError] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [remaining, setRemaining] = useState(0);
  useEffect(() => {
    api
      .post(`/attempts/${id}/start`)
      .then((r) => {
        setAttempt(r.data);
        setRemaining(Math.max(0, new Date(r.data.expiresAt) - Date.now()));
      })
      .catch((e) => setError(messageOf(e)));
  }, [id]);
  useEffect(() => {
    if (!attempt) return;
    const timer = setInterval(
      () => setRemaining(Math.max(0, new Date(attempt.expiresAt) - Date.now())),
      1000,
    );
    return () => clearInterval(timer);
  }, [attempt]);
  const submit = async () => {
    try {
      await api.post(`/attempts/${attempt.id}/submit`, {
        answers: Object.entries(answers).map(
          ([questionId, selectedOption]) => ({ questionId, selectedOption }),
        ),
      });
      nav("/results");
    } catch (e) {
      setError(messageOf(e));
    }
  };
  useEffect(() => {
    if (attempt && remaining === 0) submit();
  }, [remaining]);
  if (error) return <Alert>{error}</Alert>;
  if (!attempt)
    return <div className="loading">Starting secure attempt...</div>;
  const mins = Math.floor(remaining / 60000),
    secs = Math.floor((remaining % 60000) / 1000);
  return (
    <Page
      eyebrow="LIVE ATTEMPT"
      title="Stay sharp."
      action={
        <div className={cn("timer", remaining < 60000 && "timer-danger")}>
          <Clock3 size={16} />
          {mins}:{String(secs).padStart(2, "0")}
        </div>
      }
    >
      <div className="progress-track">
        <span
          style={{
            width: `${(Object.keys(answers).length / attempt.questions.length) * 100}%`,
          }}
        />
      </div>
      <div className="question-list">
        {attempt.questions.map((q, i) => (
          <Card className="question-card" key={q.id}>
            <div className="eyebrow">
              QUESTION {String(i + 1).padStart(2, "0")} · {q.marks} MARKS
            </div>
            <h3>{q.text}</h3>
            <div className="options">
              {Object.entries(q.options).map(([key, value]) => (
                <button
                  className={cn(
                    "option",
                    answers[q.id] === key && "option-selected",
                  )}
                  key={key}
                  onClick={() => setAnswers({ ...answers, [q.id]: key })}
                >
                  <b>{key}</b>
                  <span>{value}</span>
                  {answers[q.id] === key && <Check size={17} />}
                </button>
              ))}
            </div>
          </Card>
        ))}
      </div>
      <Button onClick={() => setConfirm(true)}>Submit attempt</Button>
      {confirm && (
        <div className="modal-backdrop">
          <Card className="modal">
            <h2>Submit your attempt?</h2>
            <p>
              You answered {Object.keys(answers).length} of{" "}
              {attempt.questions.length} questions. The server will calculate
              your score.
            </p>
            <div className="modal-actions">
              <Button variant="ghost" onClick={() => setConfirm(false)}>
                Keep working
              </Button>
              <Button onClick={submit}>Submit now</Button>
            </div>
          </Card>
        </div>
      )}
    </Page>
  );
}
function Results() {
  const { data, loading, error } = useFetch("/attempts");
  return (
    <Page
      eyebrow="PERFORMANCE"
      title="Your results"
      description="A record of every challenge you have completed."
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <div className="loading">Loading results...</div>
      ) : !data?.length ? (
        <Empty
          title="No attempts yet"
          text="Complete a quiz and your results will appear here."
        />
      ) : (
        <div className="result-list">
          {data.map((a) => (
            <Card className="result-row" key={a.id}>
              <div>
                <h3>{a.quizTitle || "Quiz"}</h3>
                <span className="small-muted">
                  {a.status} · {new Date(a.startedAt).toLocaleDateString()}
                </span>
              </div>
              <Badge tone={a.status === "submitted" ? "teal" : "amber"}>
                {a.status === "submitted" ? `${a.score} points` : a.status}
              </Badge>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
function Profile({ user }) {
  return (
    <Page eyebrow="ACCOUNT" title="Your profile">
      <Card className="profile-card">
        <div className="avatar">{user.name?.[0]}</div>
        <h2>{user.name}</h2>
        <p>{user.email}</p>
        <Badge tone="teal">Student</Badge>
      </Card>
    </Page>
  );
}
function Admin() {
  const { data, loading, error } = useFetch("/quizzes");
  const remove = async (id) => {
    if (window.confirm("Delete this quiz and all its questions?")) {
      await api.delete(`/quizzes/${id}`);
      window.location.reload();
    }
  };
  return (
    <Page
      eyebrow="ADMIN CONSOLE"
      title="Control room"
      description="Build, publish, and review your assessment library."
      action={
        <Link className="btn btn-primary" to="/admin/quizzes/new">
          <Plus size={16} /> New quiz
        </Link>
      }
    >
      {error && <Alert>{error}</Alert>}
      <div className="stats-grid admin-stats">
        <Stat
          icon={BookOpen}
          label="Total quizzes"
          value={data?.length ?? "—"}
        />
        <Stat
          icon={ShieldCheck}
          label="Published"
          value={data?.filter((q) => q.state === "published").length ?? "—"}
        />
        <Stat icon={BarChart3} label="Manage" value="Library" />
      </div>
      <div className="section-title">
        <h2>Quiz library</h2>
      </div>
      {loading ? (
        <div className="loading">Loading library...</div>
      ) : (
        <div className="admin-list">
          {data?.map((q) => (
            <Card className="admin-row" key={q.id}>
              <div>
                <div className="card-row">
                  <Badge
                    tone={
                      q.state === "published"
                        ? "teal"
                        : q.state === "retired"
                          ? "amber"
                          : "muted"
                    }
                  >
                    {q.state}
                  </Badge>
                  <span className="small-muted">
                    {q.questionCount} questions · {q.durationMinutes} min
                  </span>
                </div>
                <h3>{q.title}</h3>
              </div>
              <div className="row-actions">
                <Link
                  className="btn btn-ghost btn-small"
                  to={`/admin/quizzes/${q.id}/results`}
                >
                  Results
                </Link>
                <Link
                  className="btn btn-ghost btn-small"
                  to={`/admin/quizzes/${q.id}/edit`}
                >
                  <Pencil size={14} /> Edit
                </Link>
                <button
                  className="btn btn-danger btn-small"
                  onClick={() => remove(q.id)}
                >
                  <Trash2 size={14} />
                </button>
              </div>
            </Card>
          ))}
        </div>
      )}
    </Page>
  );
}
function Editor() {
  const { id } = useParams();
  const editing = Boolean(id);
  const nav = useNavigate();
  const existing = editing ? useFetch(`/quizzes/${id}`) : { data: null };
  const [form, setForm] = useState({
    title: "",
    description: "",
    durationMinutes: 10,
    marks: 50,
    state: "draft",
  });
  const [questions, setQuestions] = useState([]);
  const [question, setQuestion] = useState({
    text: "",
    A: "",
    B: "",
    C: "",
    D: "",
    correctOption: "A",
    marks: 10,
  });
  const [editingQuestion, setEditingQuestion] = useState(null);
  const [notice, setNotice] = useState("");
  useEffect(() => {
    if (existing.data) {
      setForm(existing.data);
      setQuestions(existing.data.questions || []);
    }
  }, [existing.data]);
  const save = async (e) => {
    e.preventDefault();
    const r = editing
      ? await api.patch(`/quizzes/${id}`, form)
      : await api.post("/quizzes", form);
    setNotice("Quiz saved");
    if (!editing) nav(`/admin/quizzes/${r.data.id}/edit`);
  };
  const saveQuestion = async (e) => {
    e.preventDefault();
    const payload = {
      text: question.text,
      options: { A: question.A, B: question.B, C: question.C, D: question.D },
      correctOption: question.correctOption,
      marks: Number(question.marks),
    };
    const r = editingQuestion
      ? await api.patch(`/questions/${editingQuestion}`, payload)
      : await api.post(`/quizzes/${id}/questions`, payload);
    setQuestions(
      editingQuestion
        ? questions.map((q) => (q.id === editingQuestion ? r.data : q))
        : [...questions, r.data],
    );
    setEditingQuestion(null);
    setQuestion({
      text: "",
      A: "",
      B: "",
      C: "",
      D: "",
      correctOption: "A",
      marks: 10,
    });
    setNotice("Question saved");
  };
  return (
    <Page
      eyebrow="QUIZ EDITOR"
      title={editing ? "Refine quiz" : "Create quiz"}
      action={
        <Link className="btn btn-ghost" to="/admin">
          <ArrowLeft size={16} /> Back
        </Link>
      }
    >
      <Card>
        <form className="form-stack editor-form" onSubmit={save}>
          <Field
            label="Title"
            required
            value={form.title}
            onChange={(e) => setForm({ ...form, title: e.target.value })}
          />
          <label className="field">
            <span>Description</span>
            <textarea
              rows="4"
              value={form.description}
              onChange={(e) =>
                setForm({ ...form, description: e.target.value })
              }
            />
          </label>
          <div className="two-col">
            <Field
              label="Duration (minutes)"
              type="number"
              value={form.durationMinutes}
              onChange={(e) =>
                setForm({ ...form, durationMinutes: e.target.value })
              }
            />
            <Field
              label="Total marks"
              type="number"
              value={form.marks}
              onChange={(e) => setForm({ ...form, marks: e.target.value })}
            />
          </div>
          <Button type="submit">Save quiz</Button>
          {notice && <Alert tone="success">{notice}</Alert>}
        </form>
      </Card>
      {editing && (
        <>
          <div className="section-title editor-section">
            <h2>Questions</h2>
            <Button
              variant="outline"
              size="small"
              onClick={async () => {
                const state =
                  form.state === "published" ? "retired" : "published";
                await api.patch(`/quizzes/${id}`, { state });
                setForm({ ...form, state });
                setNotice(`Quiz ${state}`);
              }}
            >
              {form.state === "published" ? "Retire quiz" : "Publish quiz"}
            </Button>
          </div>
          <div className="admin-list">
            {questions.map((q) => (
              <Card className="admin-row" key={q.id}>
                <div>
                  <h3>{q.text}</h3>
                  <span className="small-muted">
                    Correct: {q.correctOption} · {q.marks} marks
                  </span>
                </div>
                <div className="row-actions">
                  <Button
                    variant="ghost"
                    size="small"
                    onClick={() => {
                      setEditingQuestion(q.id);
                      setQuestion({
                        text: q.text,
                        A: q.options.A,
                        B: q.options.B,
                        C: q.options.C,
                        D: q.options.D,
                        correctOption: q.correctOption,
                        marks: q.marks,
                      });
                    }}
                  >
                    <Pencil size={14} /> Edit
                  </Button>
                  <Button
                    variant="danger"
                    size="small"
                    onClick={async () => {
                      await api.delete(`/questions/${q.id}`);
                      setQuestions(
                        questions.filter((item) => item.id !== q.id),
                      );
                    }}
                  >
                    <Trash2 size={14} />
                  </Button>
                </div>
              </Card>
            ))}
          </div>
          <Card>
            <h2 className="form-title">
              {editingQuestion ? "Edit question" : "Add question"}
            </h2>
            <form className="form-stack" onSubmit={saveQuestion}>
              <Field
                label="Question"
                required
                value={question.text}
                onChange={(e) =>
                  setQuestion({ ...question, text: e.target.value })
                }
              />
              <div className="two-col">
                {["A", "B", "C", "D"].map((key) => (
                  <Field
                    key={key}
                    label={`Option ${key}`}
                    required
                    value={question[key]}
                    onChange={(e) =>
                      setQuestion({ ...question, [key]: e.target.value })
                    }
                  />
                ))}
              </div>
              <div className="two-col">
                <label className="field">
                  <span>Correct option</span>
                  <select
                    value={question.correctOption}
                    onChange={(e) =>
                      setQuestion({
                        ...question,
                        correctOption: e.target.value,
                      })
                    }
                  >
                    {["A", "B", "C", "D"].map((key) => (
                      <option key={key}>{key}</option>
                    ))}
                  </select>
                </label>
                <Field
                  label="Marks"
                  type="number"
                  value={question.marks}
                  onChange={(e) =>
                    setQuestion({ ...question, marks: e.target.value })
                  }
                />
              </div>
              <Button type="submit">
                {editingQuestion ? "Save question" : "Add question"}{" "}
                <Plus size={16} />
              </Button>
            </form>
          </Card>
        </>
      )}
    </Page>
  );
}
function AdminResults() {
  const { id } = useParams();
  const { data, loading, error } = useFetch("/attempts");
  const rows = data?.filter((a) => a.quizId === id) || [];
  return (
    <Page
      eyebrow="QUIZ RESULTS"
      title="Student attempts"
      action={
        <Link className="btn btn-ghost" to={`/admin/quizzes/${id}/edit`}>
          <ArrowLeft size={16} /> Back
        </Link>
      }
    >
      {error && <Alert>{error}</Alert>}
      {loading ? (
        <div className="loading">Loading attempts...</div>
      ) : rows.length ? (
        <div className="result-list">
          {rows.map((a) => (
            <Card className="result-row" key={a.id}>
              <div>
                <h3>{a.userName}</h3>
                <span className="small-muted">
                  {a.status} · {new Date(a.startedAt).toLocaleString()}
                </span>
              </div>
              <Badge tone={a.status === "submitted" ? "teal" : "amber"}>
                {a.status === "submitted" ? `${a.score} points` : a.status}
              </Badge>
            </Card>
          ))}
        </div>
      ) : (
        <Empty
          title="No attempts yet"
          text="Student results will appear here after this quiz is taken."
        />
      )}
    </Page>
  );
}
function AdminOnly({ user, children }) {
  return user.role === "admin" ? (
    children
  ) : (
    <Navigate to="/dashboard" replace />
  );
}
function App() {
  const [user, setUser] = useState(null);
  const [ready, setReady] = useState(false);
  useEffect(() => {
    const token = localStorage.getItem("quizcraft_token");
    if (token)
      api
        .get("/auth/me")
        .then((r) => setUser(r.data.user))
        .catch(() => localStorage.removeItem("quizcraft_token"))
        .finally(() => setReady(true));
    else setReady(true);
  }, []);
  if (!ready) return <div className="loading">Loading QuizCraft...</div>;
  return (
    <BrowserRouter>
      {user ? (
        <Layout
          user={user}
          onLogout={() => {
            localStorage.removeItem("quizcraft_token");
            setUser(null);
          }}
        >
          <Routes>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/quizzes" element={<QuizList />} />
            <Route path="/quiz/:id" element={<QuizDetail />} />
            <Route path="/quiz/:id/attempt" element={<Attempt />} />
            <Route path="/results" element={<Results />} />
            <Route path="/profile" element={<Profile user={user} />} />
            <Route
              path="/admin"
              element={
                <AdminOnly user={user}>
                  <Admin />
                </AdminOnly>
              }
            />
            <Route
              path="/admin/quizzes"
              element={
                <AdminOnly user={user}>
                  <Admin />
                </AdminOnly>
              }
            />
            <Route
              path="/admin/quizzes/new"
              element={
                <AdminOnly user={user}>
                  <Editor />
                </AdminOnly>
              }
            />
            <Route
              path="/admin/quizzes/:id/edit"
              element={
                <AdminOnly user={user}>
                  <Editor />
                </AdminOnly>
              }
            />
            <Route
              path="/admin/quizzes/:id/results"
              element={
                <AdminOnly user={user}>
                  <AdminResults />
                </AdminOnly>
              }
            />
            <Route
              path="*"
              element={
                <Navigate
                  to={user.role === "admin" ? "/admin" : "/dashboard"}
                />
              }
            />
          </Routes>
        </Layout>
      ) : (
        <Routes>
          <Route path="*" element={<Auth onAuth={setUser} />} />
        </Routes>
      )}
    </BrowserRouter>
  );
}
export default App;
