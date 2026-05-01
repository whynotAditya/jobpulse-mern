import { useState } from "react";
import { Link, useNavigate } from "react-router-dom";
import { useAuth } from "../context/AuthContext";
import { toast } from "react-toastify";
import { Mail, Lock, User, UserPlus } from "lucide-react";
import "./Auth.css";

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
            <div className="auth-container animate-fade">
                <div className="auth-header">
                    <div className="auth-logo">
                        <span className="logo-icon">⚡</span>
                        <span className="logo-text">JobPulse</span>
                    </div>
                    <h1>Create account</h1>
                    <p>Start tracking your job applications today</p>
                </div>

                <form onSubmit={handleSubmit} className="auth-form">
                    <div className="input-group">
                        <User size={18} className="input-icon" />
                        <input id="register-name" type="text" placeholder="Full name" value={name} onChange={(e) => setName(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <Mail size={18} className="input-icon" />
                        <input id="register-email" type="email" placeholder="Email address" value={email} onChange={(e) => setEmail(e.target.value)} />
                    </div>
                    <div className="input-group">
                        <Lock size={18} className="input-icon" />
                        <input id="register-password" type="password" placeholder="Password (6+ characters)" value={password} onChange={(e) => setPassword(e.target.value)} />
                    </div>
                    <button id="register-submit" type="submit" className="auth-btn" disabled={loading}>
                        {loading ? <span className="spinner" /> : <><UserPlus size={18} />Create Account</>}
                    </button>
                </form>

                <p className="auth-footer">
                    Already have an account? <Link to="/login">Sign in</Link>
                </p>
            </div>
        </div>
    );
}
