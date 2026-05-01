import { NavLink, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { useTheme } from "../context/ThemeContext";
import { LayoutDashboard, Briefcase, FileText, LogOut, Sun, Moon } from "lucide-react";
import "./Layout.css";

export default function Layout({ children }) {
    const { user, logout } = useAuth();
    const { theme, toggleTheme } = useTheme();
    const navigate = useNavigate();

    const handleLogout = async () => {
        await logout();
        navigate("/login");
    };

    return (
        <div className="app-layout">
            <aside className="sidebar">
                <div className="sidebar-top">
                    <div className="sidebar-logo">
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">JobPulse</span>
                    </div>

                    <nav className="sidebar-nav">
                        <NavLink to="/" end className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                            <LayoutDashboard size={18} /> Dashboard
                        </NavLink>
                        <NavLink to="/jobs" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                            <Briefcase size={18} /> Jobs
                        </NavLink>
                        <NavLink to="/resume" className={({ isActive }) => `nav-link ${isActive ? "active" : ""}`}>
                            <FileText size={18} /> Resume
                        </NavLink>
                    </nav>
                </div>

                <div className="sidebar-bottom">
                    <button className="theme-toggle" onClick={toggleTheme} aria-label="Toggle theme">
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        {theme === "light" ? "Dark Mode" : "Light Mode"}
                    </button>

                    <div className="user-card">
                        <div className="user-avatar">{user?.name?.charAt(0).toUpperCase()}</div>
                        <div className="user-info">
                            <span className="user-name">{user?.name}</span>
                            <span className="user-email">{user?.email}</span>
                        </div>
                    </div>

                    <button className="logout-btn" onClick={handleLogout}>
                        <LogOut size={16} /> Sign Out
                    </button>
                </div>
            </aside>

            <main className="main-content">
                {children}
            </main>
        </div>
    );
}
