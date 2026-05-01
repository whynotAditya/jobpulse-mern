import Resume from "../models/resume.js";
import asyncHandler from "../middleware/asyncHandler.js";

// ────────────────────────────────────────
// POST /api/resume/upload
// ────────────────────────────────────────
export const uploadResume = asyncHandler(async (req, res) => {
    if (!req.file) {
        res.status(400);
        throw new Error("Please upload a file (PDF or DOCX)");
    }

    const resume = await Resume.create({
        user: req.user._id,
        fileName: req.file.originalname,
        fileUrl: `/uploads/${req.file.filename}`,
        fileType: req.file.mimetype,
        analysisStatus: "pending",
    });

    res.status(201).json({ success: true, data: resume });
});

// ────────────────────────────────────────
// GET /api/resume
// ────────────────────────────────────────
export const getResumes = asyncHandler(async (req, res) => {
    const resumes = await Resume.find({ user: req.user._id }).sort("-createdAt");
    res.json({ success: true, count: resumes.length, data: resumes });
});

// ────────────────────────────────────────
// GET /api/resume/:id/analysis
// Mock analysis — will be replaced by FastAPI microservice
// ────────────────────────────────────────
export const getResumeAnalysis = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!resume) {
        res.status(404);
        throw new Error("Resume not found");
    }

    // If analysis hasn't been done, trigger a mock analysis
    if (resume.analysisStatus === "pending") {
        resume.analysisStatus = "completed";
        resume.extractedSkills = [
            "JavaScript", "React", "Node.js", "MongoDB", "Express",
            "HTML", "CSS", "Git",
        ];
        resume.keywords = ["full-stack", "web development", "REST API", "MERN"];
        resume.experience = "0-2 years";
        await resume.save();
    }

    res.json({ success: true, data: resume });
});

// ────────────────────────────────────────
// DELETE /api/resume/:id
// ────────────────────────────────────────
export const deleteResume = asyncHandler(async (req, res) => {
    const resume = await Resume.findOne({
        _id: req.params.id,
        user: req.user._id,
    });

    if (!resume) {
        res.status(404);
        throw new Error("Resume not found");
    }

    await resume.deleteOne();
    res.json({ success: true, message: "Resume removed" });
});
