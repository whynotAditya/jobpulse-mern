import { useEffect, useState } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { Clock, Briefcase, TrendingUp, Award, XCircle, Bookmark, Calendar, Filter } from "lucide-react";
import "./Timeline.css";

const STATUSES = ["All", "Applied", "Interview", "Offer", "Rejected", "Saved"];

const MONTHS = [
    "January", "February", "March", "April", "May", "June",
    "July", "August", "September", "October", "November", "December",
];

function formatDate(dateStr) {
    const d = new Date(dateStr);
    return d.toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" });
}

function getMonthKey(dateStr) {
    const d = new Date(dateStr);
    return `${d.getFullYear()}-${String(d.getMonth()).padStart(2, "0")}`;
}

function getMonthLabel(dateStr) {
    const d = new Date(dateStr);
    return `${MONTHS[d.getMonth()]} ${d.getFullYear()}`;
}

export default function Timeline() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [statusFilter, setStatusFilter] = useState("All");

    useEffect(() => {
        API.get("/jobs?sort=-createdAt")
            .then((res) => setJobs(res.data.data))
            .catch(() => toast.error("Failed to load jobs"))
            .finally(() => setLoading(false));
    }, []);

    const filtered = statusFilter === "All"
        ? jobs
        : jobs.filter((j) => j.status === statusFilter);

    // Group by month
    const grouped = {};
    filtered.forEach((job) => {
        const key = getMonthKey(job.createdAt);
        if (!grouped[key]) grouped[key] = { label: getMonthLabel(job.createdAt), jobs: [] };
        grouped[key].jobs.push(job);
    });

    const sortedMonths = Object.keys(grouped).sort((a, b) => b.localeCompare(a));

    // Stats
    const stats = {
        total: jobs.length,
        applied: jobs.filter((j) => j.status === "Applied").length,
        interview: jobs.filter((j) => j.status === "Interview").length,
        offer: jobs.filter((j) => j.status === "Offer").length,
        rejected: jobs.filter((j) => j.status === "Rejected").length,
    };

    const statCards = [
        { label: "Total", value: stats.total, icon: <Briefcase size={18} />, bg: "bg-accent" },
        { label: "Applied", value: stats.applied, icon: <TrendingUp size={18} />, bg: "bg-warning" },
        { label: "Interview", value: stats.interview, icon: <Clock size={18} />, bg: "bg-purple" },
        { label: "Offers", value: stats.offer, icon: <Award size={18} />, bg: "bg-success" },
        { label: "Rejected", value: stats.rejected, icon: <XCircle size={18} />, bg: "bg-error" },
    ];

    if (loading) {
        return (
            <div className="dashboard-loading">
                <span className="spinner-lg" />
            </div>
        );
    }

    return (
        <div className="timeline-page animate-fade">
            <div className="timeline-header">
                <div>
                    <h1>
                        <Calendar size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        Application Timeline
                    </h1>
                    <p>Your complete job application history at a glance</p>
                </div>
            </div>

            {/* ─── Stats ─────────────────────────── */}
            <div className="timeline-stats">
                {statCards.map((s, i) => (
                    <div key={i} className="tl-stat-card" style={{ animationDelay: `${i * 60}ms` }}>
                        <div className={`tl-stat-icon ${s.bg}`}>{s.icon}</div>
                        <div className="tl-stat-info">
                            <span className="tl-stat-value">{s.value}</span>
                            <span className="tl-stat-label">{s.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            {/* ─── Filters ───────────────────────── */}
            <div className="timeline-filters">
                <Filter size={16} style={{ color: "var(--text-muted)" }} />
                {STATUSES.map((s) => (
                    <button
                        key={s}
                        className={`tl-filter-chip ${statusFilter === s ? "active" : ""}`}
                        onClick={() => setStatusFilter(s)}
                    >
                        {s}
                    </button>
                ))}
            </div>

            {/* ─── Timeline ──────────────────────── */}
            {filtered.length === 0 ? (
                <div className="timeline-empty">
                    <span className="timeline-empty-icon">📅</span>
                    <h3>No applications found</h3>
                    <p>{statusFilter !== "All" ? `No ${statusFilter} applications yet.` : "Start adding jobs to see your timeline!"}</p>
                </div>
            ) : (
                <div className="timeline-container">
                    {sortedMonths.map((monthKey) => (
                        <div key={monthKey} className="timeline-month-group">
                            <div className="timeline-month-label">
                                <Calendar size={13} />
                                {grouped[monthKey].label}
                            </div>

                            {grouped[monthKey].jobs.map((job, i) => (
                                <div
                                    key={job._id}
                                    className="timeline-item"
                                    style={{ animationDelay: `${i * 50}ms` }}
                                >
                                    <div className={`timeline-dot dot-${job.status.toLowerCase()}`} />
                                    <div className="timeline-card">
                                        <div className="tl-card-left">
                                            <div className="tl-company-icon">
                                                {job.company.charAt(0).toUpperCase()}
                                            </div>
                                            <div className="tl-card-info">
                                                <span className="tl-card-title">{job.title}</span>
                                                <span className="tl-card-company">
                                                    {job.company}
                                                    {job.location && ` · ${job.location}`}
                                                </span>
                                            </div>
                                        </div>
                                        <div className="tl-card-right">
                                            <span className="tl-card-date">{formatDate(job.createdAt)}</span>
                                            <span className={`tl-status-pill tl-status-${job.status.toLowerCase()}`}>
                                                {job.status}
                                            </span>
                                        </div>
                                    </div>
                                </div>
                            ))}
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
