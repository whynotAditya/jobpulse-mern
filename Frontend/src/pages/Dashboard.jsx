import { useEffect, useState } from "react";
import API from "../Api";
import { useAuth } from "../context/AuthContext";
import { Briefcase, TrendingUp, Award, XCircle, Bookmark, BarChart2, Clock } from "lucide-react";
import { Link } from "react-router-dom";
import "./Dashboard.css";

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [weekly, setWeekly] = useState([]);
    const [recentJobs, setRecentJobs] = useState([]);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        Promise.all([
            API.get("/jobs/stats"),
            API.get("/jobs/weekly-stats"),
            API.get("/jobs?sort=-createdAt"),
        ])
            .then(([statsRes, weeklyRes, jobsRes]) => {
                setStats(statsRes.data.data);
                setWeekly(weeklyRes.data.data);
                setRecentJobs(jobsRes.data.data.slice(0, 5));
            })
            .catch(() => {})
            .finally(() => setLoading(false));
    }, []);

    if (loading) {
        return (
            <div className="dashboard-loading">
                <span className="spinner-lg" />
            </div>
        );
    }

    const cards = [
        { label: "Total Applications", value: stats?.total || 0, icon: <Briefcase size={22} />, color: "accent" },
        { label: "Interviews",         value: stats?.interview || 0, icon: <TrendingUp size={22} />, color: "warning" },
        { label: "Offers",             value: stats?.offer || 0, icon: <Award size={22} />, color: "success" },
        { label: "Rejected",           value: stats?.rejected || 0, icon: <XCircle size={22} />, color: "error" },
        { label: "Saved",              value: stats?.saved || 0, icon: <Bookmark size={22} />, color: "purple" },
    ];

    // ─── Bar chart helpers ───────────
    const maxCount = Math.max(...weekly.map((w) => w.count), 1);

    const STATUS_COLORS = {
        Applied:   { bg: "#3B82F6", light: "rgba(59,130,246,0.15)" },
        Interview: { bg: "#F59E0B", light: "rgba(245,158,11,0.15)" },
        Offer:     { bg: "#22C55E", light: "rgba(34,197,94,0.15)" },
        Rejected:  { bg: "#EF4444", light: "rgba(239,68,68,0.15)" },
        Saved:     { bg: "#8B5CF6", light: "rgba(139,92,246,0.15)" },
    };

    return (
        <div className="dashboard animate-fade">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
                <p>Here&apos;s your job hunt overview</p>
            </div>

            {/* ─── Stat Cards ──────────────── */}
            <div className="stats-grid">
                {cards.map((c, i) => (
                    <div key={i} className={`stat-card stat-${c.color}`} style={{ animationDelay: `${i * 80}ms` }}>
                        <div className="stat-icon">{c.icon}</div>
                        <div className="stat-info">
                            <span className="stat-value">{c.value}</span>
                            <span className="stat-label">{c.label}</span>
                        </div>
                    </div>
                ))}
            </div>

            <div className="dashboard-lower">
                {/* ─── Activity Chart ──────── */}
                <div className="chart-card">
                    <div className="chart-header">
                        <div className="chart-title">
                            <BarChart2 size={18} />
                            <h3>Weekly Activity</h3>
                        </div>
                        <p className="chart-sub">Applications added per week (last 8 weeks)</p>
                    </div>

                    {weekly.every((w) => w.count === 0) ? (
                        <div className="chart-empty">
                            <BarChart2 size={32} style={{ opacity: 0.3 }} />
                            <p>No activity yet — start adding jobs!</p>
                        </div>
                    ) : (
                        <div className="bar-chart">
                            {weekly.map((w, i) => {
                                const pct = maxCount > 0 ? (w.count / maxCount) * 100 : 0;
                                return (
                                    <div key={i} className="bar-group">
                                        <div className="bar-track">
                                            <div
                                                className="bar-fill"
                                                style={{
                                                    height: `${pct}%`,
                                                    animationDelay: `${i * 60}ms`,
                                                }}
                                                title={`${w.count} applications`}
                                            />
                                        </div>
                                        <span className="bar-label">{w.label}</span>
                                        {w.count > 0 && <span className="bar-count">{w.count}</span>}
                                    </div>
                                );
                            })}
                        </div>
                    )}

                    {/* Legend */}
                    <div className="chart-legend">
                        {Object.entries(STATUS_COLORS).map(([status, { bg }]) => (
                            <span key={status} className="legend-item">
                                <span className="legend-dot" style={{ background: bg }} />
                                {status}
                            </span>
                        ))}
                    </div>
                </div>

                {/* ─── Side panel ──────────── */}
                <div className="dashboard-side">
                    {/* Rate Rings */}
                    <div className="rates-grid">
                        <div className="rate-card">
                            <div className="rate-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" className="ring-bg" />
                                    <circle cx="50" cy="50" r="42" className="ring-fill ring-success" strokeDasharray={`${(stats?.successRate || 0) * 2.64} 264`} />
                                </svg>
                                <span className="rate-value">{stats?.successRate || 0}%</span>
                            </div>
                            <span className="rate-label">Success Rate</span>
                        </div>
                        <div className="rate-card">
                            <div className="rate-ring">
                                <svg viewBox="0 0 100 100">
                                    <circle cx="50" cy="50" r="42" className="ring-bg" />
                                    <circle cx="50" cy="50" r="42" className="ring-fill ring-interview" strokeDasharray={`${(stats?.interviewRate || 0) * 2.64} 264`} />
                                </svg>
                                <span className="rate-value">{stats?.interviewRate || 0}%</span>
                            </div>
                            <span className="rate-label">Interview Rate</span>
                        </div>
                    </div>

                    {/* Recent Jobs */}
                    <div className="recent-card">
                        <div className="recent-header">
                            <Clock size={16} />
                            <h3>Recent Applications</h3>
                        </div>
                        {recentJobs.length === 0 ? (
                            <p className="recent-empty">No applications yet. <Link to="/jobs">Add one!</Link></p>
                        ) : (
                            <ul className="recent-list">
                                {recentJobs.map((job) => (
                                    <li key={job._id} className="recent-item">
                                        <div className="recent-info">
                                            <span className="recent-title">{job.title}</span>
                                            <span className="recent-company">{job.company}</span>
                                        </div>
                                        <span className={`status-pill status-${job.status.toLowerCase()}`}>
                                            {job.status}
                                        </span>
                                    </li>
                                ))}
                            </ul>
                        )}
                        <Link to="/jobs" className="view-all-link">View all jobs →</Link>
                    </div>
                </div>
            </div>
        </div>
    );
}
