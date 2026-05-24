import mongoose from "mongoose";

const reminderSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        job: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            default: null,
        },
        title: {
            type: String,
            required: [true, "Reminder title is required"],
            trim: true,
        },
        description: {
            type: String,
            trim: true,
            default: "",
        },
        dueDate: {
            type: Date,
            required: [true, "Due date is required"],
        },
        priority: {
            type: String,
            enum: ["Low", "Medium", "High", "Urgent"],
            default: "Medium",
        },
        type: {
            type: String,
            enum: ["Follow Up", "Interview", "Application Deadline", "Networking", "Custom"],
            default: "Custom",
        },
        completed: {
            type: Boolean,
            default: false,
        },
        completedAt: {
            type: Date,
            default: null,
        },
    },
    { timestamps: true }
);

// Index for fast user-scoped queries
reminderSchema.index({ user: 1, dueDate: 1 });
reminderSchema.index({ user: 1, completed: 1 });

export default mongoose.model("Reminder", reminderSchema);
