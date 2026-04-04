import API from "../Api";

export default function JobList({ jobs, fetchJobs }) {

    const deleteJob = async (id) => {
        try {
            await API.delete(`/jobs/${id}`);
            fetchJobs();
        } catch (err) {
            console.log(err);
        }
    };

    return (
        <div>
            {jobs.length === 0 ? (
                <p>No jobs available</p>
            ) : (
                jobs.map((job) => (
                    <div key={job._id} className="card">
                        <h3>{job.title}</h3>
                        <p><b>Company:</b> {job.company}</p>
                        <p><b>Location:</b> {job.location}</p>
                        <p><b>Salary:</b> {job.salary}</p>
                        <p>{job.description}</p>

                        <button 
                            className="button button-danger"
                            onClick={() => deleteJob(job._id)}
                        >
                            Delete
                        </button>
                    </div>
                ))
            )}
        </div>
    );
}