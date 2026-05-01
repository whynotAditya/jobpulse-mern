import { useEffect, useState, useCallback } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import JobForm from "../components/JobForm";
import JobList from "../components/JobList";
import { Search, Filter } from "lucide-react";
import "./Jobs.css";

const STATUSES = ["All", "Saved", "Applied", "Interview", "Offer", "Rejected"];

export default function Jobs() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [showForm, setShowForm] = useState(false);
    const [editingJob, setEditingJob] = useState(null);
    const [search, setSearch] = useState("");
    const [statusFilter, setStatusFilter] = useState("All");

    const fetchJobs = useCallback(async () => {
        try {
            const params = {};
            if (search) params.search = search;
            if (statusFilter !== "All") params.status = statusFilter;
            const res = await API.get("/jobs", { params });
            setJobs(res.data.data);
        } catch (err) {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, [search, statusFilter]);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const handleEdit = (job) => {
        setEditingJob(job);
        setShowForm(true);
    };

    const handleFormClose = () => {
        setShowForm(false);
        setEditingJob(null);
    };

    return (
        <div className="jobs-page animate-fade">
            <div className="jobs-header">
                <div>
                    <h1>My Applications</h1>
                    <p>{jobs.length} job{jobs.length !== 1 ? "s" : ""} tracked</p>
                </div>
                <button id="add-job-btn" className="btn-primary" onClick={() => setShowForm(true)}>
                    + Add Job
                </button>
            </div>

            <div className="jobs-toolbar">
                <div className="search-box">
                    <Search size={18} className="search-icon" />
                    <input
                        id="job-search"
                        type="text"
                        placeholder="Search jobs or companies..."
                        value={search}
                        onChange={(e) => setSearch(e.target.value)}
                    />
                </div>
                <div className="filter-group">
                    <Filter size={16} />
                    {STATUSES.map((s) => (
                        <button
                            key={s}
                            className={`filter-chip ${statusFilter === s ? "active" : ""}`}
                            onClick={() => setStatusFilter(s)}
                        >
                            {s}
                        </button>
                    ))}
                </div>
            </div>

            {showForm && (
                <div className="modal-overlay" onClick={handleFormClose}>
                    <div className="modal-content animate-slide" onClick={(e) => e.stopPropagation()}>
                        <JobForm
                            fetchJobs={fetchJobs}
                            editingJob={editingJob}
                            onClose={handleFormClose}
                        />
                    </div>
                </div>
            )}

            <JobList jobs={jobs} fetchJobs={fetchJobs} loading={loading} onEdit={handleEdit} />
        </div>
    );
}
