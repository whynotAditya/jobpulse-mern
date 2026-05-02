import { useState, useEffect } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { Sparkles, BrainCog, ChevronDown, ChevronUp, Briefcase } from "lucide-react";
import "./InterviewPrep.css";

const CATEGORY_COLORS = {
    Technical: "accent",
    Behavioral: "purple",
    Situational: "warning",
    "Company Fit": "success",
};

export default function InterviewPrep() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [form, setForm] = useState({ jobTitle: "", company: "", description: "" });
    const [questions, setQuestions] = useState([]);
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState("");
    const [expanded, setExpanded] = useState({});

    useEffect(() => {
        API.get("/jobs")
            .then((res) => setJobs(res.data.data))
            .catch(() => {});
    }, []);

    const handleJobSelect = (e) => {
        const id = e.target.value;
        setSelectedJob(id);
        if (id) {
            const job = jobs.find((j) => j._id === id);
            if (job) {
                setForm({
                    jobTitle: job.title,
                    company: job.company,
                    description: job.description || "",
                });
            }
        } else {
            setForm({ jobTitle: "", company: "", description: "" });
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!form.jobTitle.trim()) {
            toast.error("Please enter a job title");
            return;
        }
        setLoading(true);
        setQuestions([]);
        try {
            const res = await API.post("/ai/interview-prep", form);
            setQuestions(res.data.questions);
            setSource(res.data.source);
            setExpanded({});
            toast.success("Interview questions generated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate questions");
        } finally {
            setLoading(false);
        }
    };

    const toggleExpand = (i) =>
        setExpanded((prev) => ({ ...prev, [i]: !prev[i] }));

    return (
        <div className="interview-page animate-fade">
            <div className="interview-header">
                <div>
                    <h1>
                        <BrainCog size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        Interview Prep Hub
                    </h1>
                    <p>AI-powered tailored interview questions for any role</p>
                </div>
                {source && (
                    <div className={`source-badge ${source === "ai" ? "source-ai" : "source-static"}`}>
                        {source === "ai" ? <><Sparkles size={13} /> AI Generated</> : "📋 Smart Questions"}
                    </div>
                )}
            </div>

            {/* ─── Form ─────────────────────────── */}
            <div className="prep-form-card">
                <form onSubmit={handleGenerate}>
                    <div className="form-row">
                        <div className="form-group">
                            <label htmlFor="prep-job-select">Import from Saved Jobs (optional)</label>
                            <div className="select-wrapper">
                                <Briefcase size={15} className="select-icon" />
                                <select id="prep-job-select" value={selectedJob} onChange={handleJobSelect}>
                                    <option value="">— Select a saved job —</option>
                                    {jobs.map((j) => (
                                        <option key={j._id} value={j._id}>
                                            {j.title} @ {j.company}
                                        </option>
                                    ))}
                                </select>
                            </div>
                        </div>
                    </div>

                    <div className="form-row two-col">
                        <div className="form-group">
                            <label htmlFor="prep-title">Job Title *</label>
                            <input
                                id="prep-title"
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={form.jobTitle}
                                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                                required
                            />
                        </div>
                        <div className="form-group">
                            <label htmlFor="prep-company">Company</label>
                            <input
                                id="prep-company"
                                type="text"
                                placeholder="e.g. Google, Startup Inc."
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="form-group">
                        <label htmlFor="prep-desc">Job Description (paste it for better questions)</label>
                        <textarea
                            id="prep-desc"
                            rows={5}
                            placeholder="Paste the full job description here for highly tailored questions..."
                            value={form.description}
                            onChange={(e) => setForm({ ...form, description: e.target.value })}
                        />
                    </div>

                    <button id="prep-generate-btn" type="submit" className="generate-btn" disabled={loading}>
                        {loading ? (
                            <><span className="spinner-sm" /> Generating...</>
                        ) : (
                            <><Sparkles size={17} /> Generate Questions</>
                        )}
                    </button>
                </form>
            </div>

            {/* ─── Questions ───────────────────── */}
            {questions.length > 0 && (
                <div className="questions-section animate-slide">
                    <h2 className="questions-title">
                        {questions.length} Interview Questions for <em>{form.jobTitle}</em>
                        {form.company && <> at <em>{form.company}</em></>}
                    </h2>

                    <div className="questions-list">
                        {questions.map((q, i) => {
                            const color = CATEGORY_COLORS[q.category] || "accent";
                            return (
                                <div
                                    key={i}
                                    className={`question-card ${expanded[i] ? "expanded" : ""}`}
                                    style={{ animationDelay: `${i * 60}ms` }}
                                >
                                    <div className="q-top" onClick={() => toggleExpand(i)}>
                                        <div className="q-left">
                                            <span className={`q-num badge-${color}`}>{i + 1}</span>
                                            <span className={`q-category cat-${color}`}>{q.category}</span>
                                        </div>
                                        <p className="q-text">{q.question}</p>
                                        <button className="q-toggle" aria-label="toggle tip">
                                            {expanded[i] ? <ChevronUp size={16} /> : <ChevronDown size={16} />}
                                        </button>
                                    </div>
                                    {expanded[i] && (
                                        <div className="q-tip animate-fade">
                                            <span className="tip-label">💡 Tip</span>
                                            <p>{q.tip}</p>
                                        </div>
                                    )}
                                </div>
                            );
                        })}
                    </div>

                    <button
                        className="regenerate-btn"
                        onClick={handleGenerate}
                        disabled={loading}
                    >
                        <Sparkles size={15} /> Regenerate
                    </button>
                </div>
            )}

            {/* Empty state */}
            {questions.length === 0 && !loading && (
                <div className="prep-empty">
                    <span className="prep-empty-icon">🎙️</span>
                    <h3>Ready to prepare?</h3>
                    <p>Fill in the job details above and generate personalized interview questions</p>
                </div>
            )}
        </div>
    );
}
