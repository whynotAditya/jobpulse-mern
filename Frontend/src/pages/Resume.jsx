import { useState, useEffect } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { Upload, FileText, Trash2, Cpu } from "lucide-react";
import "./Resume.css";

export default function ResumePage() {
    const [resumes, setResumes] = useState([]);
    const [loading, setLoading] = useState(true);
    const [uploading, setUploading] = useState(false);

    const fetchResumes = async () => {
        try {
            const res = await API.get("/resume");
            setResumes(res.data.data);
        } catch {
            toast.error("Failed to load resumes");
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => { fetchResumes(); }, []);

    const handleUpload = async (e) => {
        const file = e.target.files[0];
        if (!file) return;
        const formData = new FormData();
        formData.append("resume", file);
        setUploading(true);
        try {
            await API.post("/resume/upload", formData, {
                headers: { "Content-Type": "multipart/form-data" },
            });
            toast.success("Resume uploaded!");
            fetchResumes();
        } catch (err) {
            toast.error(err.response?.data?.message || "Upload failed");
        } finally {
            setUploading(false);
        }
    };

    const handleAnalyze = async (id) => {
        try {
            const res = await API.get(`/resume/${id}/analysis`);
            const d = res.data.data;
            toast.success(`Analysis complete! Found ${d.extractedSkills.length} skills`);
            fetchResumes();
        } catch {
            toast.error("Analysis failed");
        }
    };

    const handleDelete = async (id) => {
        if (!window.confirm("Delete this resume?")) return;
        try {
            await API.delete(`/resume/${id}`);
            toast.success("Resume removed");
            fetchResumes();
        } catch {
            toast.error("Failed to delete");
        }
    };

    return (
        <div className="resume-page animate-fade">
            <div className="resume-header">
                <div>
                    <h1>Resume Intelligence</h1>
                    <p>Upload and analyze your resumes with AI</p>
                </div>
                <label className="upload-btn" htmlFor="resume-upload">
                    {uploading ? <span className="spinner" /> : <><Upload size={18} /> Upload Resume</>}
                    <input id="resume-upload" type="file" accept=".pdf,.docx" onChange={handleUpload} hidden />
                </label>
            </div>

            {loading ? (
                <div className="list-loading">
                    {[1, 2].map((i) => <div key={i} className="skeleton-card" />)}
                </div>
            ) : resumes.length === 0 ? (
                <div className="empty-state">
                    <span className="empty-icon">📄</span>
                    <h3>No resumes yet</h3>
                    <p>Upload a PDF or DOCX to get started</p>
                </div>
            ) : (
                <div className="resume-list">
                    {resumes.map((r) => (
                        <div key={r._id} className="resume-card">
                            <div className="rc-top">
                                <FileText size={20} className="rc-icon" />
                                <div className="rc-info">
                                    <h3>{r.fileName}</h3>
                                    <span className={`status-badge badge-${r.analysisStatus === "completed" ? "success" : "warning"}`}>
                                        {r.analysisStatus}
                                    </span>
                                </div>
                            </div>

                            {r.extractedSkills.length > 0 && (
                                <div className="skills-wrap">
                                    {r.extractedSkills.map((s, i) => (
                                        <span key={i} className="skill-tag">{s}</span>
                                    ))}
                                </div>
                            )}

                            {r.keywords.length > 0 && (
                                <p className="keywords-text">Keywords: {r.keywords.join(", ")}</p>
                            )}

                            <div className="card-actions">
                                {r.analysisStatus !== "completed" && (
                                    <button className="action-btn edit-btn" onClick={() => handleAnalyze(r._id)}>
                                        <Cpu size={15} /> Analyze
                                    </button>
                                )}
                                <button className="action-btn delete-btn" onClick={() => handleDelete(r._id)}>
                                    <Trash2 size={15} /> Delete
                                </button>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
}
