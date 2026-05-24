import { NavLink, useNavigate, useLocation } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import {
    LayoutDashboard, Briefcase, FileText, LogOut,
    Sun, Moon, Kanban, BrainCog, User, Bell, Settings2, FileSignature, Calendar, Target
} from "lucide-react";
import "./Layout.css";

const NAV_GROUPS = [
    {
        label: "Overview",
        links: [
            { to: "/",         end: true,  icon: LayoutDashboard, label: "Dashboard" },
            { to: "/jobs",     end: false, icon: Briefcase,        label: "Jobs" },
            { to: "/kanban",   end: false, icon: Kanban,           label: "Kanban" },
            { to: "/timeline", end: false, icon: Calendar,         label: "Timeline" },
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
    "/profile":        { title: "Profile",         sub: "Account settings & preferences" },
};

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();
    const { pathname } = useLocation();

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
                        <button className="header-action-btn" aria-label="Notifications" title="Notifications">
                            <Bell size={16} />
                        </button>
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
