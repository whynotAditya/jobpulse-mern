import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Mail, Lock, ArrowRight } from "lucide-react";
import "./Auth.css";

const FEATURES = [
    { icon: "🎯", text: "Track every application in one place" },
    { icon: "🤖", text: "AI-powered resume analysis & scoring" },
    { icon: "🎙️", text: "Personalized interview prep questions" },
    { icon: "📊", text: "Visual analytics & Kanban pipeline" },
];

export default function Login() {
    const [email, setEmail] = useState("");
    const [password, setPassword] = useState("");
    const [loading, setLoading] = useState(false);
    const { login } = useAuth();
    const navigate = useNavigate();

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!email || !password) return toast.error("All fields are required");
        setLoading(true);
        try {
            await login(email, password);
            toast.success("Welcome back! 🎉");
            navigate("/");
        } catch (err) {
            toast.error(err.response?.data?.message || "Login failed");
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
                        Your career,<br />
                        <span className="highlight">supercharged</span>
                    </h2>
                    <p className="auth-left-sub">
                        The all-in-one AI platform to track applications, prep for interviews,
                        and land your dream job faster.
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
                        <h1>Welcome back</h1>
                        <p>Sign in to continue your job hunt journey</p>
                    </div>

                    <form onSubmit={handleSubmit} className="auth-form">
                        <div className="input-group">
                            <Mail size={17} className="input-icon" />
                            <input
                                id="login-email"
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
                                id="login-password"
                                type="password"
                                placeholder="Password"
                                value={password}
                                onChange={(e) => setPassword(e.target.value)}
                                autoComplete="current-password"
                            />
                        </div>
                        <button id="login-submit" type="submit" className="auth-btn" disabled={loading}>
                            {loading ? (
                                <span className="spinner" />
                            ) : (
                                <>Sign In <ArrowRight size={17} /></>
                            )}
                        </button>
                    </form>

                    <p className="auth-footer">
                        Don&apos;t have an account?{" "}
                        <Link to="/register">Create one free →</Link>
                    </p>
                    <p className="auth-terms">
                        By signing in, you agree to our{" "}
                        <a href="#">Terms</a> &amp; <a href="#">Privacy Policy</a>
                    </p>
                </div>
            </div>
        </div>
    );
}
