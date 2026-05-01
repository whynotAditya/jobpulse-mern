import API from "../Api";
import { toast } from "react-toastify";
import { MapPin, DollarSign, Calendar, Edit2, Trash2 } from "lucide-react";
import "./JobList.css";

const STATUS_COLORS = {
    Saved: "badge-purple",
    Applied: "badge-accent",
    Interview: "badge-warning",
    Offer: "badge-success",
    Rejected: "badge-error",
};

export default function JobList({ jobs, fetchJobs, loading, onEdit }) {
    const deleteJob = async (id) => {
        if (!window.confirm("Delete this job?")) return;
        try {
            await API.delete(`/jobs/${id}`);
            toast.success("Job removed");
            fetchJobs();
        } catch {
            toast.error("Failed to delete");
        }
    };

    if (loading) {
        return (
            <div className="list-loading">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="skeleton-card" />
                ))}
            </div>
        );
    }

    if (jobs.length === 0) {
        return (
            <div className="empty-state">
                <span className="empty-icon">📭</span>
                <h3>No jobs found</h3>
                <p>Start adding jobs to track your applications</p>
            </div>
        );
    }

    return (
        <div className="job-list">
            {jobs.map((job, i) => (
                <div key={job._id} className="job-card animate-fade" style={{ animationDelay: `${i * 60}ms` }}>
                    <div className="card-top">
                        <div className="card-info">
                            <h3 className="job-title">{job.title}</h3>
                            <p className="job-company">{job.company}{job.role ? ` · ${job.role}` : ""}</p>
                        </div>
                        <span className={`status-badge ${STATUS_COLORS[job.status] || "badge-accent"}`}>
                            {job.status}
                        </span>
                    </div>

                    <div className="card-meta">
                        {job.location && <span className="meta-item"><MapPin size={14} />{job.location}</span>}
                        {job.salary && <span className="meta-item"><DollarSign size={14} />{job.salary}</span>}
                        {job.appliedDate && (
                            <span className="meta-item">
                                <Calendar size={14} />
                                {new Date(job.appliedDate).toLocaleDateString("en-IN", { day: "numeric", month: "short", year: "numeric" })}
                            </span>
                        )}
                    </div>

                    {job.description && <p className="card-desc">{job.description}</p>}
                    {job.notes && <p className="card-notes">📝 {job.notes}</p>}

                    <div className="card-actions">
                        <button className="action-btn edit-btn" onClick={() => onEdit(job)} aria-label="Edit">
                            <Edit2 size={15} /> Edit
                        </button>
                        <button className="action-btn delete-btn" onClick={() => deleteJob(job._id)} aria-label="Delete">
                            <Trash2 size={15} /> Delete
                        </button>
                    </div>
                </div>
            ))}
        </div>
    );
}