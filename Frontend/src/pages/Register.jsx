import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Mail, Lock, User, ArrowRight } from "lucide-react";
import "./Auth.css";

const FEATURES = [
    { icon: "🚀", text: "Get started in under 2 minutes" },
    { icon: "🔒", text: "Enterprise-grade JWT security" },
    { icon: "🧠", text: "AI resume analysis included free" },
    { icon: "📈", text: "Track success rates & interview rates" },
];

export default function Register() {
    const [name, setName] = useState("");
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { register } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!name || !email || !password) return toast.error("All fields are required");
        if (password.length < 6) return toast.error("Password must be at least 6 characters");
        setLoading(true);
        try {
            await register(name, email, password);
            toast.success("Account created! 🚀");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Registration failed");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="auth-page">
            {/* ─── Left Panel ─── */}
            <div className="auth-panel-left">
                <div className="auth-orb auth-orb-1" />
                <div className="auth-orb auth-orb-2" />
                <div className="auth-orb auth-orb-3" />

                <div className="auth-left-content">
                    <div className="auth-left-logo">
                        <div className="auth-logo-icon">⚡</div>
                        <span>JobPulse</span>
                    </div>
                    <h2 className="auth-left-headline">
                        Land your<br />
                        <span className="highlight">dream job</span>
                    </h2>
                    <p className="auth-left-sub">
                        Join thousands of job seekers who use JobPulse to organize
                        applications and get hired faster.
                    </p>
                    <div className="auth-features-list">
                        {FEATURES.map((f, i) => (
                            <div key={i} className="auth-feature-item">
                                <div className="auth-feature-icon">{f.icon}</div>
                                <span className="auth-feature-text">{f.text}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>

            {/* ─── Right Panel ─── */}
            <div className="auth-panel-right">
                <div className="auth-container">
                    <div className="auth-header">
                        <div className="auth-back-logo">
                            <div className="mini-logo-icon">⚡</div>
                            <span>JobPulse</span>
                        </div>
                        <h1>Create account</h1>
                        <p>Start tracking your career today — it&apos;s free</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <User size={17} className="input-icon" />
                            <input
                                id="register-name"
                                type="text"
                                placeholder="Your full name"
                                value={name}
                                onChange={(e) => setName(e.target.value)}
                                autoComplete="name"
                            />
                        </div>
                        <div className="input-group">
                            <Mail size={17} className="input-icon" />
                            <input
                                id="register-email"
                                type="email"
                                placeholder="Email address"
                                value={email}
                                onChange={(e) => setEmail(e.target.value)}
                                autoComplete="email"
                            />
                        </div>
                        <div className="input-group">
                            <Lock size={17} className="input-icon" />
                            <input
                                id="register-password"
                                type="password"
                                placeholder="Password (min 6 characters)"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="new-password"
                            />
                        </div>
                        <button id="register-submit" type="submit" className="auth-btn" disabled={loading}>
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                <>Create Free Account <ArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Already have an account?{" "}
                        <Link to="/login">Sign in →</Link>
                    </p>
                    <p className="auth-terms">
                        By creating an account, you agree to our{" "}
                        <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
