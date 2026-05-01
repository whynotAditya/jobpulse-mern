import express from "express";
import multer from "multer";
import path from "path";
import {
    uploadResume,
    getResumes,
    getResumeAnalysis,
    deleteResume,
} from "../controllers/resumeController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// Multer storage config
const storage = multer.diskStorage({
    destination: (_req, _file, cb) => {
        cb(null, "uploads/");
    },
    filename: (_req, file, cb) => {
        const uniqueSuffix = `${Date.now()}-${Math.round(Math.random() * 1e9)}`;
        cb(null, `${uniqueSuffix}${path.extname(file.originalname)}`);
    },
});

const fileFilter = (_req, file, cb) => {
    const allowedTypes = [
        "application/pdf",
        "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
    ];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);
    } else {
        cb(new Error("Only PDF and DOCX files are allowed"), false);
    }
};

const upload = multer({
    storage,
    fileFilter,
    limits: { fileSize: 5 * 1024 * 1024 }, // 5 MB
});

// All resume routes require authentication
router.use(protect);

router.route("/").get(getResumes);
router.post("/upload", upload.single("resume"), uploadResume);
router.get("/:id/analysis", getResumeAnalysis);
router.delete("/:id", deleteResume);

export default router;
