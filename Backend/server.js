import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import helmet from "helmet";
import morgan from "morgan";
import cookieParser from "cookie-parser";
import path from "path";
import { fileURLToPath } from "url";

import connectDB from "./config/db.js";
import { errorHandler, notFound } from "./middleware/errorMiddleware.js";
import authRoutes from "./routes/authRoutes.js";
import jobRoutes from "./routes/jobroutes.js";
import resumeRoutes from "./routes/resumeRoutes.js";
import aiRoutes from "./routes/aiRoutes.js";

// ─── Config ──────────────────────────────
dotenv.config();

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// ─── Database ────────────────────────────
connectDB();

// ─── App ─────────────────────────────────
const app = express();

// ─── Security & Parsing Middleware ───────
app.use(helmet());

// ─── CORS ────────────────────────────────
const allowedOrigins = (process.env.CLIENT_URL || "http://localhost:5173")
    .split(",")
    .map((url) => url.trim());

app.use(cors({
    origin: (origin, callback) => {
        // Allow requests with no origin (mobile apps, curl, etc.)
        if (!origin || allowedOrigins.includes(origin)) {
            callback(null, true);
        } else {
            callback(new Error("Not allowed by CORS"));
        }
    },
    credentials: true,
}));
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(cookieParser());

// ─── Logging (dev only) ──────────────────
if (process.env.NODE_ENV !== "production") {
    app.use(morgan("dev"));
}

// ─── Static files (resume uploads) ──────
app.use("/uploads", express.static(path.join(__dirname, "uploads")));

// ─── Routes ──────────────────────────────
app.get("/", (_req, res) => {
    res.json({
        success: true,
        message: "🚀 JobPulse API is running",
        version: "2.0.0",
        endpoints: {
            auth: "/api/auth",
            jobs: "/api/jobs",
            resume: "/api/resume",
            ai: "/api/ai",
        },
    });
});

app.use("/api/auth", authRoutes);
app.use("/api/jobs", jobRoutes);
app.use("/api/resume", resumeRoutes);
app.use("/api/ai", aiRoutes);

// ─── Error Handling ──────────────────────
app.use(notFound);
app.use(errorHandler);

// ─── Start Server ────────────────────────
const PORT = process.env.PORT || 5000;
app.listen(PORT, () => {
    console.log(`\n🚀 JobPulse API Server`);
    console.log(`   Environment : ${process.env.NODE_ENV || "development"}`);
    console.log(`   Port        : ${PORT}`);
    console.log(`   Client URL  : ${process.env.CLIENT_URL || "http://localhost:5173"}\n`);
});