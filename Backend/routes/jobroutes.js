import express from "express";
import {
    createJob,
    getJobs,
    getJobById,
    getJobStats,
    getWeeklyStats,
    getSalaryAnalytics,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All job routes require authentication
router.use(protect);

router.route("/").get(getJobs).post(createJob);
router.get("/stats", getJobStats);
router.get("/weekly-stats", getWeeklyStats);
router.get("/salary-analytics", getSalaryAnalytics);
router.route("/:id").get(getJobById).put(updateJob).delete(deleteJob);

export default router;