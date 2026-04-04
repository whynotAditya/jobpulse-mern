import { useEffect, useState } from "react";
import API from "./Api";
import JobForm from "./components/JobForm";
import JobList from "./components/JobList";
import "./App.css";

function App() {
    const [jobs, setJobs] = useState([]);

    const fetchJobs = async () => {
        try {
            const res = await API.get("/jobs");
            setJobs(res.data);
        } catch (err) {
            console.log(err);
        }
    };

    useEffect(() => {
        fetchJobs();
    }, []);

    return (
        <div className="container">
            <h1 className="title">JobPulse 🚀</h1>
            <JobForm fetchJobs={fetchJobs} />
            <JobList jobs={jobs} fetchJobs={fetchJobs} />
        </div>
    );
}

export default App;