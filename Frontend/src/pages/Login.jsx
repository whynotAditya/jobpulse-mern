import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Mail, Lock, LogIn } from "lucide-react";
import "./Auth.css";

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
            <div className="auth-container animate-fade">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">JobPulse</span>
                    </div>
                    <h1>Welcome back</h1>
                    <p>Sign in to continue tracking your career</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
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
                        <Lock size={18} className="input-icon" />
                        <input
                            id="login-password"
                            type="password"
                            placeholder="Password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            autoComplete="current-password"
                        />
                    </div>
                    <button
                        id="login-submit"
                        type="submit"
                        className="auth-btn"
                        disabled={loading}
                    >
                        {loading ? (
                            <span className="spinner" />
                        ) : (
                            <>
                                <LogIn size={18} />
                                Sign In
                            </>
                        )}
                    </button>
                </form>

                <p className="auth-footer">
                    Don&apos;t have an account? <Link to="/register">Create one</Link>
                </p>
            </div>
        </div>
    );
}
