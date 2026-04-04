import { useState } from "react";
import API from "../Api";

export default function JobForm({ fetchJobs }) {
    const [form, setForm] = useState({
        title: "",
        company: "",
        location: "",
        salary: "",
        description: ""
    });

    const handleChange = (e) => {
        setForm({ ...form, [e.target.name]: e.target.value });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        try {
            await API.post("/jobs", form);
            fetchJobs();
            setForm({
                title: "",
                company: "",
                location: "",
                salary: "",
                description: ""
            });
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <form onSubmit={handleSubmit} className="card">
            <input className="input" name="title" placeholder="Title" value={form.title} onChange={handleChange} />
            <input className="input" name="company" placeholder="Company" value={form.company} onChange={handleChange} />
            <input className="input" name="location" placeholder="Location" value={form.location} onChange={handleChange} />
            <input className="input" name="salary" placeholder="Salary" value={form.salary} onChange={handleChange} />
            <input className="input" name="description" placeholder="Description" value={form.description} onChange={handleChange} />

            <button className="button button-primary">Add Job</button>
        </form>
    );
}