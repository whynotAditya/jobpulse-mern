import { useEffect, useState } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import {
    Bell, Plus, Check, Trash2, Clock, AlertTriangle,
    CalendarCheck, Target, Briefcase, ChevronRight
} from "lucide-react";
import "./Reminders.css";

const PRIORITIES = ["Low", "Medium", "High", "Urgent"];
const TYPES = ["Follow Up", "Interview", "Application Deadline", "Networking", "Custom"];
const TABS = ["Active", "Overdue", "Completed", "All"];

function isOverdue(dueDate) {
    return new Date(dueDate) < new Date() && new Date(dueDate).toDateString() !== new Date().toDateString();
}

function isToday(dueDate) {
    return new Date(dueDate).toDateString() === new Date().toDateString();
}

function formatDue(dueDate) {
    const d = new Date(dueDate);
    const now = new Date();
    const diffMs = d - now;
    const diffDays = Math.ceil(diffMs / (1000 * 60 * 60 * 24));

    if (isToday(dueDate)) return "Today";
    if (diffDays === 1) return "Tomorrow";
    if (diffDays === -1) return "Yesterday";
    if (diffDays < -1) return `${Math.abs(diffDays)} days overdue`;
    if (diffDays <= 7) return `In ${diffDays} days`;
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Reminders() {
    const [reminders, setReminders] = useState([]);
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [activeTab, setActiveTab] = useState("Active");
    const [showModal, setShowModal] = useState(false);
    const [form, setForm] = useState({
        title: "",
        description: "",
        dueDate: "",
        priority: "Medium",
        type: "Custom",
        job: "",
    });

    const fetchReminders = async () => {
        try {
            const res = await API.get("/reminders?sort=dueDate");
            setReminders(res.data.data);
        } catch {
            toast.error("Failed to load reminders");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchReminders();
        API.get("/jobs").then((res) => setJobs(res.data.data)).catch(() => {});
    }, []);

    const handleCreate = async (e) => {
        e.preventDefault();
        if (!form.title.trim() || !form.dueDate) {
            toast.error("Title and due date are required");
            return;
        }
        try {
            await API.post("/reminders", {
                ...form,
                job: form.job || undefined,
            });
            toast.success("Reminder created!");
            setShowModal(false);
            setForm({ title: "", description: "", dueDate: "", priority: "Medium", type: "Custom", job: "" });
            fetchReminders();
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to create reminder");
        }
    };

    const handleToggle = async (id) => {
        try {
            await API.patch(`/reminders/${id}/toggle`);
            fetchReminders();
        } catch {
            toast.error("Failed to update reminder");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this reminder?")) return;
        try {
            await API.delete(`/reminders/${id}`);
            toast.success("Reminder deleted");
            fetchReminders();
        } catch {
            toast.error("Failed to delete");
        }
    };

    // Filter by tab
    const filtered = reminders.filter((r) => {
        if (activeTab === "Active") return !r.completed;
        if (activeTab === "Overdue") return !r.completed && isOverdue(r.dueDate);
        if (activeTab === "Completed") return r.completed;
        return true;
    });

    // Stats
    const overdue = reminders.filter((r) => !r.completed && isOverdue(r.dueDate)).length;
    const today = reminders.filter((r) => !r.completed && isToday(r.dueDate)).length;
    const upcoming = reminders.filter((r) => !r.completed && !isOverdue(r.dueDate) && !isToday(r.dueDate)).length;
    const done = reminders.filter((r) => r.completed).length;

    if (loading) {
        return (
            <div className="dashboard-loading">
                <span className="spinner-lg" />
            </div>
        );
    }

    return (
        <div className="reminders-page animate-fade">
            <div className="reminders-header">
                <div>
                    <h1>
                        <Target size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        Goals & Reminders
                    </h1>
                    <p>Stay on top of follow-ups, deadlines, and career goals</p>
                </div>
                <button className="add-reminder-btn" onClick={() => setShowModal(true)}>
                    <Plus size={17} /> New Reminder
                </button>
            </div>

            {/* ─── Quick Stats ────────────────────── */}
            <div className="reminder-quick-stats">
                <div className="rq-stat" style={{ animationDelay: "0ms" }}>
                    <div className="rq-stat-icon rq-overdue"><AlertTriangle size={16} /></div>
                    <div className="rq-stat-info">
                        <span className="rq-stat-value">{overdue}</span>
                        <span className="rq-stat-label">Overdue</span>
                    </div>
                </div>
                <div className="rq-stat" style={{ animationDelay: "60ms" }}>
                    <div className="rq-stat-icon rq-today"><Clock size={16} /></div>
                    <div className="rq-stat-info">
                        <span className="rq-stat-value">{today}</span>
                        <span className="rq-stat-label">Due Today</span>
                    </div>
                </div>
                <div className="rq-stat" style={{ animationDelay: "120ms" }}>
                    <div className="rq-stat-icon rq-upcoming"><CalendarCheck size={16} /></div>
                    <div className="rq-stat-info">
                        <span className="rq-stat-value">{upcoming}</span>
                        <span className="rq-stat-label">Upcoming</span>
                    </div>
                </div>
                <div className="rq-stat" style={{ animationDelay: "180ms" }}>
                    <div className="rq-stat-icon rq-done"><Check size={16} /></div>
                    <div className="rq-stat-info">
                        <span className="rq-stat-value">{done}</span>
                        <span className="rq-stat-label">Completed</span>
                    </div>
                </div>
            </div>

            {/* ─── Tabs ──────────────────────────── */}
            <div className="reminder-tabs">
                {TABS.map((tab) => (
                    <button
                        key={tab}
                        className={`rem-tab ${activeTab === tab ? "active" : ""}`}
                        onClick={() => setActiveTab(tab)}
                    >
                        {tab}
                    </button>
                ))}
            </div>

            {/* ─── List ──────────────────────────── */}
            {filtered.length === 0 ? (
                <div className="reminders-empty">
                    <span className="reminders-empty-icon">🎯</span>
                    <h3>No reminders here</h3>
                    <p>{activeTab === "Active" ? "Create a reminder to get started!" : `No ${activeTab.toLowerCase()} reminders.`}</p>
                </div>
            ) : (
                <div className="reminder-list">
                    {filtered.map((rem, i) => {
                        const overdue = !rem.completed && isOverdue(rem.dueDate);
                        const dueToday = !rem.completed && isToday(rem.dueDate);
                        return (
                            <div
                                key={rem._id}
                                className={`reminder-item ${rem.completed ? "completed" : ""} ${overdue ? "overdue" : ""} ${dueToday ? "due-today" : ""}`}
                                style={{ animationDelay: `${i * 40}ms` }}
                            >
                                <button
                                    className={`rem-check ${rem.completed ? "checked" : ""}`}
                                    onClick={() => handleToggle(rem._id)}
                                    aria-label="Toggle complete"
                                >
                                    {rem.completed && <Check size={13} />}
                                </button>

                                <div className="rem-content">
                                    <span className={`rem-title ${rem.completed ? "done" : ""}`}>
                                        {rem.title}
                                    </span>
                                    {rem.description && <p className="rem-desc">{rem.description}</p>}
                                    {rem.job && (
                                        <span className="rem-job-link">
                                            <Briefcase size={11} /> {rem.job.title} @ {rem.job.company}
                                        </span>
                                    )}
                                </div>

                                <div className="rem-meta">
                                    <span className="rem-type-badge">{rem.type}</span>
                                    <span className={`rem-priority pri-${rem.priority.toLowerCase()}`}>
                                        {rem.priority}
                                    </span>
                                    <span className={`rem-due ${overdue ? "overdue-text" : ""} ${dueToday ? "today-text" : ""}`}>
                                        <Clock size={12} />
                                        {formatDue(rem.dueDate)}
                                    </span>
                                    <button className="rem-delete-btn" onClick={() => handleDelete(rem._id)}>
                                        <Trash2 size={14} />
                                    </button>
                                </div>
                            </div>
                        );
                    })}
                </div>
            )}

            {/* ─── Create Modal ───────────────────── */}
            {showModal && (
                <div className="rem-modal-overlay" onClick={() => setShowModal(false)}>
                    <div className="rem-modal animate-slide" onClick={(e) => e.stopPropagation()}>
                        <h2><Bell size={20} /> New Reminder</h2>
                        <form onSubmit={handleCreate}>
                            <div className="rem-form-group">
                                <label htmlFor="rem-title">Title *</label>
                                <input
                                    id="rem-title"
                                    type="text"
                                    placeholder="e.g. Follow up with Google recruiter"
                                    value={form.title}
                                    onChange={(e) => setForm({ ...form, title: e.target.value })}
                                    required
                                />
                            </div>
                            <div className="rem-form-group">
                                <label htmlFor="rem-desc">Description</label>
                                <textarea
                                    id="rem-desc"
                                    rows={3}
                                    placeholder="Optional notes..."
                                    value={form.description}
                                    onChange={(e) => setForm({ ...form, description: e.target.value })}
                                />
                            </div>
                            <div className="rem-form-row">
                                <div className="rem-form-group">
                                    <label htmlFor="rem-due">Due Date *</label>
                                    <input
                                        id="rem-due"
                                        type="date"
                                        value={form.dueDate}
                                        onChange={(e) => setForm({ ...form, dueDate: e.target.value })}
                                        required
                                    />
                                </div>
                                <div className="rem-form-group">
                                    <label htmlFor="rem-priority">Priority</label>
                                    <select
                                        id="rem-priority"
                                        value={form.priority}
                                        onChange={(e) => setForm({ ...form, priority: e.target.value })}
                                    >
                                        {PRIORITIES.map((p) => <option key={p} value={p}>{p}</option>)}
                                    </select>
                                </div>
                            </div>
                            <div className="rem-form-row">
                                <div className="rem-form-group">
                                    <label htmlFor="rem-type">Type</label>
                                    <select
                                        id="rem-type"
                                        value={form.type}
                                        onChange={(e) => setForm({ ...form, type: e.target.value })}
                                    >
                                        {TYPES.map((t) => <option key={t} value={t}>{t}</option>)}
                                    </select>
                                </div>
                                <div className="rem-form-group">
                                    <label htmlFor="rem-job">Link to Job (optional)</label>
                                    <select
                                        id="rem-job"
                                        value={form.job}
                                        onChange={(e) => setForm({ ...form, job: e.target.value })}
                                    >
                                        <option value="">— None —</option>
                                        {jobs.map((j) => (
                                            <option key={j._id} value={j._id}>{j.title} @ {j.company}</option>
                                        ))}
                                    </select>
                                </div>
                            </div>
                            <div className="rem-modal-actions">
                                <button type="button" className="rem-cancel-btn" onClick={() => setShowModal(false)}>
                                    Cancel
                                </button>
                                <button type="submit" className="rem-save-btn">
                                    Create Reminder
                                </button>
                            </div>
                        </form>
                    </div>
                </div>
            )}
        </div>
    );
}
