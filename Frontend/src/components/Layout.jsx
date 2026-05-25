import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useState, useEffect, useCallback } from "react";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import API from "../Api";
import {
    LayoutDashboard, Briefcase, FileText, LogOut,
    Sun, Moon, Kanban, BrainCog, User, Bell, Settings2,
    FileSignature, Calendar, Target, DollarSign,
    Clock, AlertTriangle, Award, Info, Check
} from "lucide-react";
import "./Layout.css";
import "./Notifications.css";

const NAV_GROUPS = [
    {
        label: "Overview",
        links: [
            { to: "/",         end: true,  icon: LayoutDashboard, label: "Dashboard" },
            { to: "/jobs",     end: false, icon: Briefcase,        label: "Jobs" },
            { to: "/kanban",   end: false, icon: Kanban,           label: "Kanban" },
            { to: "/timeline", end: false, icon: Calendar,         label: "Timeline" },
            { to: "/salary",   end: false, icon: DollarSign,       label: "Salary" },
        ],
    },
    {
        label: "AI Tools",
        links: [
            { to: "/resume",         end: false, icon: FileText, label: "Resume AI" },
            { to: "/interview-prep", end: false, icon: BrainCog, label: "Interview Prep" },
            { to: "/cover-letter",   end: false, icon: FileSignature, label: "Cover Letter" },
        ],
    },
    {
        label: "Account",
        links: [
            { to: "/reminders", end: false, icon: Target, label: "Reminders" },
            { to: "/profile",   end: false, icon: User,   label: "Profile" },
        ],
    },
];

const PAGE_TITLES = {
    "/":               { title: "Dashboard",      sub: "Your job hunt at a glance" },
    "/jobs":           { title: "My Applications", sub: "Track and manage your jobs" },
    "/kanban":         { title: "Kanban Board",    sub: "Visual pipeline tracker" },
    "/timeline":       { title: "Timeline",        sub: "Chronological application history" },
    "/resume":         { title: "Resume AI",       sub: "Upload and analyze resumes" },
    "/interview-prep": { title: "Interview Prep",  sub: "AI-powered preparation hub" },
    "/cover-letter":   { title: "Cover Letter",    sub: "AI-crafted cover letters" },
    "/reminders":      { title: "Reminders",       sub: "Track goals & follow-ups" },
    "/salary":         { title: "Salary Analytics", sub: "Compensation insights" },
    "/profile":        { title: "Profile",         sub: "Account settings & preferences" },
};

const NOTIF_ICONS = {
    reminder_due:          { icon: AlertTriangle, cls: "ni-reminder" },
    job_status_change:     { icon: Briefcase,     cls: "ni-job" },
    interview_upcoming:    { icon: BrainCog,      cls: "ni-interview" },
    application_milestone: { icon: Award,         cls: "ni-milestone" },
    system:                { icon: Info,          cls: "ni-system" },
};

function timeAgo(dateStr) {
    const seconds = Math.floor((Date.now() - new Date(dateStr)) / 1000);
    if (seconds < 60) return "Just now";
    const mins = Math.floor(seconds / 60);
    if (mins < 60) return `${mins}m ago`;
    const hrs = Math.floor(mins / 60);
    if (hrs < 24) return `${hrs}h ago`;
    const days = Math.floor(hrs / 24);
    if (days < 7) return `${days}d ago`;
    return new Date(dateStr).toLocaleDateString("en-US", { month: "short", day: "numeric" });
}

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();

    // ─── Notification state ─────────────
    const [notifications, setNotifications] = useState([]);
    const [unreadCount, setUnreadCount] = useState(0);
    const [showNotifs, setShowNotifs] = useState(false);

    const fetchNotifications = useCallback(async () => {
        try {
            // Auto-generate notifications from due reminders
            await API.post("/notifications/generate").catch(() => {});
            const res = await API.get("/notifications?limit=20");
            setNotifications(res.data.data);
            setUnreadCount(res.data.unreadCount);
        } catch {
            // Silently fail — notifications are non-critical
        }
    }, []);

    useEffect(() => {
        fetchNotifications();
        // Refresh every 60 seconds
        const interval = setInterval(fetchNotifications, 60000);
        return () => clearInterval(interval);
    }, [fetchNotifications]);

    const handleMarkAsRead = async (id) => {
        try {
            await API.put(`/notifications/${id}/read`);
            fetchNotifications();
        } catch {}
    };

    const handleMarkAllRead = async () => {
        try {
            await API.put("/notifications/read-all");
            fetchNotifications();
        } catch {}
    };

    const handleNotifClick = (notif) => {
        if (!notif.read) handleMarkAsRead(notif._id);
        if (notif.link) {
            navigate(notif.link);
            setShowNotifs(false);
        }
    };

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    const pageInfo = PAGE_TITLES[pathname] || { title: "JobPulse", sub: "" };
    const initials = user?.name?.split(" ").map(n => n[0]).join("").toUpperCase().slice(0, 2);
    const hour = new Date().getHours();
    const greeting = hour < 12 ? "Good morning" : hour < 18 ? "Good afternoon" : "Good evening";

    return (
        <div className="app-layout">
            {/* ─── Sidebar ──────────────────── */}
            <aside className="sidebar">
                <div className="sidebar-top">
                    {/* Logo */}
                    <div className="sidebar-logo">
                        <div className="logo-icon-wrap">⚡</div>
                        <span className="logo-text">JobPulse</span>
                        <span className="logo-badge">Pro</span>
                    </div>

                    {/* Nav Groups */}
                    <nav className="sidebar-nav">
                        {NAV_GROUPS.map((group) => (
                            <div key={group.label}>
                                <div className="nav-section-label">{group.label}</div>
                                {group.links.map(({ to, end, icon: Icon, label }) => (
                                    <NavLink
                                        key={to}
                                        to={to}
                                        end={end}
                                        className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}
                                    >
                                        <span className="nav-icon"><Icon size={17} /></span>
                                        <span className="nav-label">{label}</span>
                                    </NavLink>
                                ))}
                            </div>
                        ))}
                    </nav>
                </div>

                {/* Bottom */}
                <div className="sidebar-bottom">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === "light" ? <Moon size={17} /> : <Sun size={17} />}
                        {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </button>

                    <div className="user-card">
                        <div className="user-avatar">{initials}</div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                        <div className="user-online" title="Online" />
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={15} /> Sign Out
                    </button>
                </div>
            </aside>

            {/* ─── Main Area ──────────────── */}
            <div className="main-content">
                {/* Sticky Header */}
                <header className="page-header">
                    <div className="page-header-left">
                        <span className="page-header-title">{pageInfo.title}</span>
                        <span className="page-header-sub">{pageInfo.sub}</span>
                    </div>
                    <div className="page-header-right">
                        <button
                            className="header-action-btn"
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                            title={theme === "light" ? "Switch to Dark Mode" : "Switch to Light Mode"}
                        >
                            {theme === "light" ? <Moon size={16} /> : <Sun size={16} />}
                        </button>

                        {/* ─── Notification Bell ──────── */}
                        <div className="notif-wrapper">
                            <button
                                className="header-action-btn notif-bell"
                                aria-label="Notifications"
                                title="Notifications"
                                onClick={() => setShowNotifs(!showNotifs)}
                            >
                                <Bell size={16} />
                                {unreadCount > 0 && (
                                    <span className="notif-badge">{unreadCount > 9 ? "9+" : unreadCount}</span>
                                )}
                            </button>

                            {showNotifs && (
                                <>
                                    <div className="notif-overlay" onClick={() => setShowNotifs(false)} />
                                    <div className="notif-dropdown">
                                        <div className="notif-dropdown-header">
                                            <h4><Bell size={15} /> Notifications</h4>
                                            {unreadCount > 0 && (
                                                <button className="notif-read-all-btn" onClick={handleMarkAllRead}>
                                                    Mark all read
                                                </button>
                                            )}
                                        </div>

                                        {notifications.length === 0 ? (
                                            <div className="notif-empty">
                                                <span className="notif-empty-icon">🔔</span>
                                                <p>No notifications yet</p>
                                            </div>
                                        ) : (
                                            <div className="notif-list">
                                                {notifications.map((notif) => {
                                                    const iconInfo = NOTIF_ICONS[notif.type] || NOTIF_ICONS.system;
                                                    const IconComp = iconInfo.icon;
                                                    return (
                                                        <div
                                                            key={notif._id}
                                                            className={`notif-item ${!notif.read ? "unread" : ""}`}
                                                            onClick={() => handleNotifClick(notif)}
                                                        >
                                                            <div className={`notif-icon ${iconInfo.cls}`}>
                                                                <IconComp size={15} />
                                                            </div>
                                                            <div className="notif-content">
                                                                <div className="notif-title">{notif.title}</div>
                                                                {notif.message && (
                                                                    <div className="notif-message">{notif.message}</div>
                                                                )}
                                                                <div className="notif-time">
                                                                    <Clock size={10} style={{ verticalAlign: "middle", marginRight: 3 }} />
                                                                    {timeAgo(notif.createdAt)}
                                                                </div>
                                                            </div>
                                                            {!notif.read && <div className="notif-unread-dot" />}
                                                        </div>
                                                    );
                                                })}
                                            </div>
                                        )}
                                    </div>
                                </>
                            )}
                        </div>

                        <div className="user-avatar" style={{ cursor: "pointer" }} onClick={() => navigate("/profile")} title={greeting + ", " + user?.name}>
                            {initials}
                        </div>
                    </div>
                </header>

                {/* Page Content */}
                <main className="page-body animate-fade">
                    {children}
                </main>
            </div>
        </div>
    );
}
