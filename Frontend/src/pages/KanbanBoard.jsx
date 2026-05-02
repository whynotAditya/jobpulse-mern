import { useEffect, useState, useCallback, useRef } from "react";
import API from "../Api";
import { toast } from "react-toastify";
import { Kanban, Plus, GripVertical } from "lucide-react";
import "./KanbanBoard.css";

const COLUMNS = [
    { id: "Saved",     label: "Saved",       color: "purple", emoji: "🔖" },
    { id: "Applied",   label: "Applied",     color: "accent", emoji: "📤" },
    { id: "Interview", label: "Interviewing", color: "warning", emoji: "🎙️" },
    { id: "Offer",     label: "Offered",     color: "success", emoji: "🎉" },
    { id: "Rejected",  label: "Rejected",    color: "error",   emoji: "❌" },
];

export default function KanbanBoard() {
    const [jobs, setJobs] = useState([]);
    const [loading, setLoading] = useState(true);
    const [dragging, setDragging] = useState(null); // { job, sourceCol }
    const [dragOver, setDragOver] = useState(null); // column id
    const dragJob = useRef(null);

    const fetchJobs = useCallback(async () => {
        try {
            const res = await API.get("/jobs");
            setJobs(res.data.data);
        } catch {
            toast.error("Failed to load jobs");
        } finally {
            setLoading(false);
        }
    }, []);

    useEffect(() => { fetchJobs(); }, [fetchJobs]);

    const jobsByCol = (colId) => jobs.filter((j) => j.status === colId);

    // ─── Drag handlers ───────────────────
    const onDragStart = (e, job) => {
        dragJob.current = job;
        setDragging(job._id);
        e.dataTransfer.effectAllowed = "move";
    };

    const onDragOver = (e, colId) => {
        e.preventDefault();
        e.dataTransfer.dropEffect = "move";
        setDragOver(colId);
    };

    const onDrop = async (e, colId) => {
        e.preventDefault();
        const job = dragJob.current;
        if (!job || job.status === colId) {
            setDragOver(null);
            setDragging(null);
            return;
        }

        // Optimistic update
        setJobs((prev) =>
            prev.map((j) => (j._id === job._id ? { ...j, status: colId } : j))
        );
        setDragOver(null);
        setDragging(null);

        try {
            await API.put(`/jobs/${job._id}`, { status: colId });
            toast.success(`Moved to ${colId}`);
        } catch {
            toast.error("Failed to update status");
            fetchJobs(); // revert
        }
    };

    const onDragEnd = () => {
        setDragging(null);
        setDragOver(null);
        dragJob.current = null;
    };

    if (loading) {
        return (
            <div className="kanban-loading">
                <span className="spinner-lg" />
            </div>
        );
    }

    return (
        <div className="kanban-page animate-fade">
            <div className="kanban-header">
                <div>
                    <h1><Kanban size={26} style={{ verticalAlign: "middle", marginRight: 8 }} />Kanban Board</h1>
                    <p>Drag & drop jobs between stages</p>
                </div>
                <div className="kanban-total">
                    <span>{jobs.length}</span> total applications
                </div>
            </div>

            <div className="kanban-board">
                {COLUMNS.map((col) => {
                    const colJobs = jobsByCol(col.id);
                    const isOver = dragOver === col.id;
                    return (
                        <div
                            key={col.id}
                            className={`kanban-col kanban-col-${col.color} ${isOver ? "drag-over" : ""}`}
                            onDragOver={(e) => onDragOver(e, col.id)}
                            onDrop={(e) => onDrop(e, col.id)}
                            onDragLeave={() => setDragOver(null)}
                        >
                            <div className="col-header">
                                <span className="col-emoji">{col.emoji}</span>
                                <span className="col-label">{col.label}</span>
                                <span className={`col-count badge-${col.color}`}>{colJobs.length}</span>
                            </div>

                            <div className="col-cards">
                                {colJobs.length === 0 ? (
                                    <div className={`col-empty ${isOver ? "col-empty-active" : ""}`}>
                                        <Plus size={18} />
                                        <span>Drop here</span>
                                    </div>
                                ) : (
                                    colJobs.map((job) => (
                                        <div
                                            key={job._id}
                                            className={`kanban-card ${dragging === job._id ? "dragging" : ""}`}
                                            draggable
                                            onDragStart={(e) => onDragStart(e, job)}
                                            onDragEnd={onDragEnd}
                                        >
                                            <div className="card-grip">
                                                <GripVertical size={14} />
                                            </div>
                                            <div className="card-body">
                                                <h4 className="card-title">{job.title}</h4>
                                                <p className="card-company">{job.company}</p>
                                                {job.location && (
                                                    <p className="card-location">📍 {job.location}</p>
                                                )}
                                                {job.salary && (
                                                    <p className="card-salary">💰 {job.salary}</p>
                                                )}
                                                {job.appliedDate && (
                                                    <p className="card-date">
                                                        🗓 {new Date(job.appliedDate).toLocaleDateString()}
                                                    </p>
                                                )}
                                            </div>
                                        </div>
                                    ))
                                )}
                            </div>
                        </div>
                    );
                })}
            </div>
        </div>
    );
}
