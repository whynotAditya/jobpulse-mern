import { useState, useEffect } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { X } from "lucide-react";
import "./JobForm.css";

const STATUSES = ["Saved", "Applied", "Interview", "Offer", "Rejected"];

const INITIAL = {
    title: "", company: "", role: "", location: "",
    salary: "", description: "", status: "Saved", appliedDate: "", notes: ""
};

export default function JobForm({ fetchJobs, editingJob, onClose }) {
    const [form, setForm] = useState(INITIAL);
    const [loading, setLoading] = useState(false);

    useEffect(() => {
        if (editingJob) {
            setForm({
                title: editingJob.title || "",
                company: editingJob.company || "",
                role: editingJob.role || "",
                location: editingJob.location || "",
                salary: editingJob.salary || "",
                description: editingJob.description || "",
                status: editingJob.status || "Saved",
                appliedDate: editingJob.appliedDate ? editingJob.appliedDate.slice(0, 10) : "",
                notes: editingJob.notes || "",
            });
        }
    }, [editingJob]);

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!form.title || !form.company) return toast.error("Title and Company are required");
        setLoading(true);
        try {
            if (editingJob) {
                await API.put(`/jobs/${editingJob._id}`, form);
                toast.success("Job updated ✅");
            } else {
                await API.post("/jobs", form);
                toast.success("Job added 🎯");
            }
            fetchJobs();
            onClose();
        } catch (err) {
            toast.error(err.response?.data?.message || "Something went wrong");
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="job-form-wrapper">
            <div className="form-header">
                <h2>{editingJob ? "Edit Job" : "Add New Job"}</h2>
                <button className="close-btn" onClick={onClose} aria-label="Close"><X size={20} /></button>
            </div>
            <form onSubmit={handleSubmit} className="job-form">
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="jf-title">Title *</label>
                        <input id="jf-title" name="title" placeholder="Software Engineer" value={form.title} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="jf-company">Company *</label>
                        <input id="jf-company" name="company" placeholder="Google" value={form.company} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="jf-role">Role</label>
                        <input id="jf-role" name="role" placeholder="Frontend Developer" value={form.role} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="jf-location">Location</label>
                        <input id="jf-location" name="location" placeholder="Remote / Bangalore" value={form.location} onChange={handleChange} />
                    </div>
                </div>
                <div className="form-row">
                    <div className="form-field">
                        <label htmlFor="jf-salary">Salary</label>
                        <input id="jf-salary" name="salary" placeholder="12 LPA" value={form.salary} onChange={handleChange} />
                    </div>
                    <div className="form-field">
                        <label htmlFor="jf-status">Status</label>
                        <select id="jf-status" name="status" value={form.status} onChange={handleChange}>
                            {STATUSES.map((s) => <option key={s} value={s}>{s}</option>)}
                        </select>
                    </div>
                </div>
                <div className="form-field">
                    <label htmlFor="jf-date">Applied Date</label>
                    <input id="jf-date" name="appliedDate" type="date" value={form.appliedDate} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label htmlFor="jf-desc">Description</label>
                    <textarea id="jf-desc" name="description" rows={3} placeholder="Job description or link..." value={form.description} onChange={handleChange} />
                </div>
                <div className="form-field">
                    <label htmlFor="jf-notes">Notes</label>
                    <textarea id="jf-notes" name="notes" rows={2} placeholder="Your notes..." value={form.notes} onChange={handleChange} />
                </div>
                <button id="jf-submit" type="submit" className="submit-btn" disabled={loading}>
                    {loading ? <span className="spinner" /> : (editingJob ? "Update Job" : "Add Job")}
                </button>
            </form>
        </div>
    );
}