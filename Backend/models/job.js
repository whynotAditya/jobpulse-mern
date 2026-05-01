import mongoose from "mongoose";

const JOB_STATUSES = ["Applied", "Interview", "Offer", "Rejected", "Saved"];

const jobSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        title: {
            type: String,
            required: [true, "Job title is required"],
            trim: true,
        },
        company: {
            type: String,
            required: [true, "Company name is required"],
            trim: true,
        },
        role: {
            type: String,
            trim: true,
            default: "",
        },
        location: {
            type: String,
            trim: true,
            default: "",
        },
        salary: {
            type: String,
            trim: true,
            default: "",
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        status: {
            type: String,
            enum: {
                values: JOB_STATUSES,
                message: "{VALUE} is not a valid status",
            },
            default: "Saved",
        },
        appliedDate: {
            type: Date,
            default: null,
        },
        notes: {
            type: String,
            default: "",
        },
    },
    { timestamps: true }
);

// Index for fast user-scoped queries
jobSchema.index({ user: 1, status: 1 });
jobSchema.index({ user: 1, createdAt: -1 });

export { JOB_STATUSES };
export default mongoose.model("Job", jobSchema);