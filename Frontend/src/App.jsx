import { BrowserRouter, Routes, Route, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";

import { AuthProvider, useAuth } from "./context/AuthContext";
import { ThemeProvider } from "./context/ThemeContext";
import Layout from "./components/Layout";
import Login from "./pages/Login";
import Register from "./pages/Register";
import Dashboard from "./pages/Dashboard";
import Jobs from "./pages/Jobs";
import ResumePage from "./pages/Resume";
import KanbanBoard from "./pages/KanbanBoard";
import InterviewPrep from "./pages/InterviewPrep";
import CoverLetter from "./pages/CoverLetter";
import Timeline from "./pages/Timeline";
import Reminders from "./pages/Reminders";
import Profile from "./pages/Profile";

function ProtectedRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) {
        return (
            <div style={{
                display: "flex", alignItems: "center", justifyContent: "center",
                minHeight: "100vh"
            }}>
                <div className="spinner-lg" style={{
                    width: 32, height: 32,
                    border: "3px solid #E2E8F0",
                    borderTopColor: "#3B82F6",
                    borderRadius: "50%",
                    animation: "spin 0.7s linear infinite"
                }} />
            </div>
        );
    }
    return user ? children : <Navigate to="/login" replace />;
}

function GuestRoute({ children }) {
    const { user, loading } = useAuth();
    if (loading) return null;
    return user ? <Navigate to="/" replace /> : children;
}

function App() {
    return (
        <ThemeProvider>
            <AuthProvider>
                <BrowserRouter>
                    <Routes>
                        <Route path="/login" element={<GuestRoute><Login /></GuestRoute>} />
                        <Route path="/register" element={<GuestRoute><Register /></GuestRoute>} />

                        <Route path="/" element={
                            <ProtectedRoute>
                                <Layout><Dashboard /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/jobs" element={
                            <ProtectedRoute>
                                <Layout><Jobs /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/kanban" element={
                            <ProtectedRoute>
                                <Layout><KanbanBoard /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/resume" element={
                            <ProtectedRoute>
                                <Layout><ResumePage /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/interview-prep" element={
                            <ProtectedRoute>
                                <Layout><InterviewPrep /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/cover-letter" element={
                            <ProtectedRoute>
                                <Layout><CoverLetter /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/timeline" element={
                            <ProtectedRoute>
                                <Layout><Timeline /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/reminders" element={
                            <ProtectedRoute>
                                <Layout><Reminders /></Layout>
                            </ProtectedRoute>
                        } />
                        <Route path="/profile" element={
                            <ProtectedRoute>
                                <Layout><Profile /></Layout>
                            </ProtectedRoute>
                        } />

                        <Route path="*" element={<Navigate to="/" replace />} />
                    </Routes>
                </BrowserRouter>
                <ToastContainer
                    position="top-right"
                    autoClose={3000}
                    hideProgressBar={false}
                    newestOnTop
                    closeOnClick
                    pauseOnHover
                    theme="colored"
                />
            </AuthProvider>
        </ThemeProvider>
    );
}

export default App;