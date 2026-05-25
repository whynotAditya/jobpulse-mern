import mongoose from "mongoose";

const notificationSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        type: {
            type: String,
            enum: [
                "reminder_due",
                "job_status_change",
                "interview_upcoming",
                "application_milestone",
                "system",
            ],
            default: "system",
        },
        title: {
            type: String,
            required: true,
            trim: true,
        },
        message: {
            type: String,
            trim: true,
            default: "",
        },
        read: {
            type: Boolean,
            default: false,
        },
        link: {
            type: String,
            default: "",
        },
        relatedJob: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Job",
            default: null,
        },
        relatedReminder: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "Reminder",
            default: null,
        },
    },
    { timestamps: true }
);

notificationSchema.index({ user: 1, read: 1 });
notificationSchema.index({ user: 1, createdAt: -1 });

export default mongoose.model("Notification", notificationSchema);
