import mongoose from "mongoose";

const resumeSchema = new mongoose.Schema(
    {
        user: {
            type: mongoose.Schema.Types.ObjectId,
            ref: "User",
            required: true,
        },
        fileName: {
            type: String,
            required: true,
        },
        fileUrl: {
            type: String,
            required: true,
        },
        fileType: {
            type: String,
            enum: ["application/pdf", "application/vnd.openxmlformats-officedocument.wordprocessingml.document"],
            required: true,
        },
        extractedSkills: {
            type: [String],
            default: [],
        },
        experience: {
            type: String,
            default: "",
        },
        keywords: {
            type: [String],
            default: [],
        },
        analysisStatus: {
            type: String,
            enum: ["pending", "processing", "completed", "failed"],
            default: "pending",
        },
    },
    { timestamps: true }
);

resumeSchema.index({ user: 1 });

export default mongoose.model("Resume", resumeSchema);
