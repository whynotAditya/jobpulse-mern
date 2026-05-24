import { useState, useEffect } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { Sparkles, FileSignature, Briefcase, Copy, Check, RefreshCw, Building2, Palette } from "lucide-react";
import "./CoverLetter.css";

const TONES = ["Professional", "Enthusiastic", "Concise", "Creative"];

export default function CoverLetter() {
    const [jobs, setJobs] = useState([]);
    const [selectedJob, setSelectedJob] = useState("");
    const [form, setForm] = useState({
        jobTitle: "",
        company: "",
        description: "",
        skills: "",
        tone: "Professional",
    });
    const [coverLetter, setCoverLetter] = useState("");
    const [loading, setLoading] = useState(false);
    const [source, setSource] = useState("");
    const [copied, setCopied] = useState(false);

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
                    ...form,
                    jobTitle: job.title,
                    company: job.company,
                    description: job.description || "",
                });
            }
        } else {
            setForm({ ...form, jobTitle: "", company: "", description: "" });
        }
    };

    const handleGenerate = async (e) => {
        e.preventDefault();
        if (!form.jobTitle.trim()) {
            toast.error("Please enter a job title");
            return;
        }
        setLoading(true);
        setCoverLetter("");
        try {
            const res = await API.post("/ai/cover-letter", form);
            setCoverLetter(res.data.coverLetter);
            setSource(res.data.source);
            toast.success("Cover letter generated!");
        } catch (err) {
            toast.error(err.response?.data?.message || "Failed to generate cover letter");
        } finally {
            setLoading(false);
        }
    };

    const handleCopy = () => {
        navigator.clipboard.writeText(coverLetter);
        setCopied(true);
        toast.success("Copied to clipboard!");
        setTimeout(() => setCopied(false), 2000);
    };

    return (
        <div className="coverletter-page animate-fade">
            <div className="coverletter-header">
                <div>
                    <h1>
                        <FileSignature size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />
                        Cover Letter Generator
                    </h1>
                    <p>AI-crafted cover letters tailored to any job posting</p>
                </div>
                {source && (
                    <div className={`cl-source-badge ${source === "ai" ? "cl-source-ai" : "cl-source-template"}`}>
                        {source === "ai" ? <><Sparkles size={13} /> AI Generated</> : "📝 Smart Template"}
                    </div>
                )}
            </div>

            {/* ─── Form ─────────────────────────── */}
            <div className="cl-form-card">
                <form onSubmit={handleGenerate}>
                    <div className="cl-form-row">
                        <div className="cl-form-group">
                            <label htmlFor="cl-job-select">Import from Saved Jobs (optional)</label>
                            <div className="cl-select-wrapper">
                                <Briefcase size={15} className="cl-select-icon" />
                                <select id="cl-job-select" value={selectedJob} onChange={handleJobSelect}>
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

                    <div className="cl-form-row two-col">
                        <div className="cl-form-group">
                            <label htmlFor="cl-title">Job Title *</label>
                            <input
                                id="cl-title"
                                type="text"
                                placeholder="e.g. Senior Frontend Engineer"
                                value={form.jobTitle}
                                onChange={(e) => setForm({ ...form, jobTitle: e.target.value })}
                                required
                            />
                        </div>
                        <div className="cl-form-group">
                            <label htmlFor="cl-company">Company *</label>
                            <input
                                id="cl-company"
                                type="text"
                                placeholder="e.g. Google, Startup Inc."
                                value={form.company}
                                onChange={(e) => setForm({ ...form, company: e.target.value })}
                                required
                            />
                        </div>
                    </div>

                    <div className="cl-form-row">
                        <div className="cl-form-group">
                            <label htmlFor="cl-skills">Your Key Skills</label>
                            <input
                                id="cl-skills"
                                type="text"
                                placeholder="e.g. React, Node.js, TypeScript, Leadership"
                                value={form.skills}
                                onChange={(e) => setForm({ ...form, skills: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="cl-form-row">
                        <div className="cl-form-group">
                            <label htmlFor="cl-desc">Job Description (paste for better results)</label>
                            <textarea
                                id="cl-desc"
                                rows={5}
                                placeholder="Paste the full job description here for a highly tailored cover letter..."
                                value={form.description}
                                onChange={(e) => setForm({ ...form, description: e.target.value })}
                            />
                        </div>
                    </div>

                    <div className="cl-form-row">
                        <div className="cl-form-group">
                            <label><Palette size={13} style={{ verticalAlign: "middle", marginRight: 4 }} /> Tone</label>
                            <div className="tone-selector">
                                {TONES.map((t) => (
                                    <button
                                        key={t}
                                        type="button"
                                        className={`tone-chip ${form.tone === t ? "active" : ""}`}
                                        onClick={() => setForm({ ...form, tone: t })}
                                    >
                                        {t}
                                    </button>
                                ))}
                            </div>
                        </div>
                    </div>

                    <button id="cl-generate-btn" type="submit" className="cl-generate-btn" disabled={loading}>
                        {loading ? (
                            <><span className="cl-spinner-sm" /> Generating...</>
                        ) : (
                            <><Sparkles size={17} /> Generate Cover Letter</>
                        )}
                    </button>
                </form>
            </div>

            {/* ─── Loading Skeleton ──────────────── */}
            {loading && (
                <div className="cl-skeleton animate-fade">
                    {[1, 2, 3, 4, 5, 6, 7, 8].map((i) => (
                        <div key={i} className="cl-skeleton-line" />
                    ))}
                </div>
            )}

            {/* ─── Result ────────────────────────── */}
            {coverLetter && !loading && (
                <div className="cl-result-section animate-slide">
                    <div className="cl-result-header">
                        <h2>
                            <FileSignature size={18} />
                            Cover Letter for <em>{form.jobTitle}</em>
                            {form.company && <> at <em>{form.company}</em></>}
                        </h2>
                        <div className="cl-result-actions">
                            <button className={`cl-action-btn ${copied ? "copied" : ""}`} onClick={handleCopy}>
                                {copied ? <><Check size={14} /> Copied!</> : <><Copy size={14} /> Copy</>}
                            </button>
                            <button className="cl-action-btn" onClick={handleGenerate} disabled={loading}>
                                <RefreshCw size={14} /> Regenerate
                            </button>
                        </div>
                    </div>

                    <div className="cl-result-card">
                        <div className="cl-result-meta">
                            <span className="cl-meta-tag">
                                <Briefcase size={12} /> {form.jobTitle}
                            </span>
                            <span className="cl-meta-tag">
                                <Building2 size={12} /> {form.company}
                            </span>
                            <span className="cl-meta-tag">
                                <Palette size={12} /> {form.tone}
                            </span>
                        </div>
                        <div className="cl-result-body">{coverLetter}</div>
                    </div>
                </div>
            )}

            {/* Empty state */}
            {!coverLetter && !loading && (
                <div className="cl-empty">
                    <span className="cl-empty-icon">✉️</span>
                    <h3>Ready to impress?</h3>
                    <p>Fill in the job details above and generate a personalized cover letter in seconds</p>
                </div>
            )}
        </div>
    );
}
