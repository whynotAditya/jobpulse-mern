import { useEffect, useState } from "react";
import API from "../Api";
import { useAuth } from "../context/AuthContext";
import { Briefcase, TrendingUp, Award, XCircle, Bookmark } from "lucide-react";
import "./Dashboard.css";

export default function Dashboard() {
    const { user } = useAuth();
    const [stats, setStats] = useState(null);
    const [loading, setLoading] = useState(true);

    useEffect(() => {
        API.get("/jobs/stats")
            .then((res) => setStats(res.data.data))
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
        { label: "Interviews", value: stats?.interview || 0, icon: <TrendingUp size={22} />, color: "warning" },
        { label: "Offers", value: stats?.offer || 0, icon: <Award size={22} />, color: "success" },
        { label: "Rejected", value: stats?.rejected || 0, icon: <XCircle size={22} />, color: "error" },
        { label: "Saved", value: stats?.saved || 0, icon: <Bookmark size={22} />, color: "purple" },
    ];

    return (
        <div className="dashboard animate-fade">
            <div className="dashboard-header">
                <h1>Welcome back, {user?.name?.split(" ")[0]} 👋</h1>
                <p>Here&apos;s your job hunt overview</p>
            </div>

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

            <div className="rates-grid">
                <div className="rate-card">
                    <div className="rate-ring" style={{ "--pct": stats?.successRate || 0 }}>
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" className="ring-bg" />
                            <circle cx="50" cy="50" r="42" className="ring-fill ring-success" strokeDasharray={`${(stats?.successRate || 0) * 2.64} 264`} />
                        </svg>
                        <span className="rate-value">{stats?.successRate || 0}%</span>
                    </div>
                    <span className="rate-label">Success Rate</span>
                </div>
                <div className="rate-card">
                    <div className="rate-ring" style={{ "--pct": stats?.interviewRate || 0 }}>
                        <svg viewBox="0 0 100 100">
                            <circle cx="50" cy="50" r="42" className="ring-bg" />
                            <circle cx="50" cy="50" r="42" className="ring-fill ring-interview" strokeDasharray={`${(stats?.interviewRate || 0) * 2.64} 264`} />
                        </svg>
                        <span className="rate-value">{stats?.interviewRate || 0}%</span>
                    </div>
                    <span className="rate-label">Interview Rate</span>
                </div>
            </div>
        </div>
    );
}
