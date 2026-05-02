import { useState } from "react";
import { useAuth } from "../context/AuthContext";
import API from "../Api";
import { toast } from "react-toastify";
import { useTheme } from "../context/ThemeContext";
import { User, Lock, Moon, Sun, ShieldCheck } from "lucide-react";
import "./Profile.css";

export default function Profile() {
    const { user } = useAuth();
    const { theme, toggleTheme } = useTheme();

    const [profileForm, setProfileForm] = useState({
        name: user?.name || "",
        email: user?.email || "",
    });
    const [passwordForm, setPasswordForm] = useState({
        currentPassword: "",
        newPassword: "",
        confirmPassword: "",
    });
    const [profileLoading, setProfileLoading] = useState(false);
    const [passwordLoading, setPasswordLoading] = useState(false);

    const handleProfileSave = async (e) => {
        e.preventDefault();
        setProfileLoading(true);
        try {
            await API.put("/auth/profile", profileForm);
            toast.success("Profile updated successfully!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to update profile");
        } finally {
            setProfileLoading(false);
        }
    };

    const handlePasswordChange = async (e) => {
        e.preventDefault();
        if (passwordForm.newPassword !== passwordForm.confirmPassword) {
            toast.error("New passwords do not match");
            return;
        }
        setPasswordLoading(true);
        try {
            await API.put("/auth/password", {
                currentPassword: passwordForm.currentPassword,
                newPassword: passwordForm.newPassword,
            });
            toast.success("Password changed successfully!");
            setPasswordForm({ currentPassword: "", newPassword: "", confirmPassword: "" });
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to change password");
        } finally {
            setPasswordLoading(false);
        }
    };

    const initials = user?.name
        ?.split(" ")
        .map((n) => n[0])
        .join("")
        .toUpperCase()
        .slice(0, 2);

    return (
        <div className="profile-page animate-fade">
            <div className="profile-header">
                <h1><User size={24} style={{ verticalAlign: "middle", marginRight: 8 }} />Profile & Settings</h1>
                <p>Manage your account details and preferences</p>
            </div>

            {/* ─── Avatar Banner ──────────────── */}
            <div className="profile-banner">
                <div className="profile-avatar-lg">{initials}</div>
                <div className="profile-banner-info">
                    <h2>{user?.name}</h2>
                    <p>{user?.email}</p>
                    <span className="member-badge">
                        <ShieldCheck size={13} /> Active Member
                    </span>
                </div>
            </div>

            <div className="profile-grid">
                {/* ─── Account Info ─────────────── */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <User size={18} />
                        <h3>Account Information</h3>
                    </div>
                    <form onSubmit={handleProfileSave}>
                        <div className="settings-form-group">
                            <label htmlFor="profile-name">Full Name</label>
                            <input
                                id="profile-name"
                                type="text"
                                value={profileForm.name}
                                onChange={(e) => setProfileForm({ ...profileForm, name: e.target.value })}
                                placeholder="Your full name"
                            />
                        </div>
                        <div className="settings-form-group">
                            <label htmlFor="profile-email">Email Address</label>
                            <input
                                id="profile-email"
                                type="email"
                                value={profileForm.email}
                                onChange={(e) => setProfileForm({ ...profileForm, email: e.target.value })}
                                placeholder="your@email.com"
                            />
                        </div>
                        <button id="profile-save-btn" type="submit" className="save-btn" disabled={profileLoading}>
                            {profileLoading ? <><span className="spinner-sm-dark" /> Saving...</> : "Save Changes"}
                        </button>
                    </form>
                </div>

                {/* ─── Change Password ──────────── */}
                <div className="settings-card">
                    <div className="settings-card-header">
                        <Lock size={18} />
                        <h3>Change Password</h3>
                    </div>
                    <form onSubmit={handlePasswordChange}>
                        <div className="settings-form-group">
                            <label htmlFor="current-pass">Current Password</label>
                            <input
                                id="current-pass"
                                type="password"
                                value={passwordForm.currentPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, currentPassword: e.target.value })}
                                placeholder="••••••••"
                                required
                            />
                        </div>
                        <div className="settings-form-group">
                            <label htmlFor="new-pass">New Password</label>
                            <input
                                id="new-pass"
                                type="password"
                                value={passwordForm.newPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, newPassword: e.target.value })}
                                placeholder="Min 6 characters"
                                minLength={6}
                                required
                            />
                        </div>
                        <div className="settings-form-group">
                            <label htmlFor="confirm-pass">Confirm New Password</label>
                            <input
                                id="confirm-pass"
                                type="password"
                                value={passwordForm.confirmPassword}
                                onChange={(e) => setPasswordForm({ ...passwordForm, confirmPassword: e.target.value })}
                                placeholder="Repeat new password"
                                minLength={6}
                                required
                            />
                        </div>
                        <button id="password-change-btn" type="submit" className="save-btn save-btn-danger" disabled={passwordLoading}>
                            {passwordLoading ? <><span className="spinner-sm-dark" /> Updating...</> : "Update Password"}
                        </button>
                    </form>
                </div>

                {/* ─── Preferences ─────────────── */}
                <div className="settings-card preferences-card">
                    <div className="settings-card-header">
                        {theme === "light" ? <Moon size={18} /> : <Sun size={18} />}
                        <h3>Preferences</h3>
                    </div>

                    <div className="pref-row">
                        <div className="pref-info">
                            <span className="pref-label">Theme</span>
                            <span className="pref-desc">{theme === "light" ? "Currently using light mode" : "Currently using dark mode"}</span>
                        </div>
                        <button
                            id="profile-theme-toggle"
                            className={`toggle-switch ${theme === "dark" ? "toggle-on" : ""}`}
                            onClick={toggleTheme}
                            aria-label="Toggle theme"
                        >
                            <span className="toggle-thumb" />
                        </button>
                    </div>

                    <div className="pref-row">
                        <div className="pref-info">
                            <span className="pref-label">Dark Mode</span>
                            <span className="pref-desc">Enable for a comfortable night-time experience</span>
                        </div>
                        <span className={`pref-status ${theme === "dark" ? "status-on" : "status-off"}`}>
                            {theme === "dark" ? "ON" : "OFF"}
                        </span>
                    </div>
                </div>
            </div>
        </div>
    );
}
