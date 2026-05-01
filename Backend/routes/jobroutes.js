import express from "express";
import {
    createJob,
    getJobs,
    getJobById,
    getJobStats,
    updateJob,
    deleteJob,
} from "../controllers/jobController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

// All job routes require authentication
router.use(protect);

router.route("/").get(getJobs).post(createJob);
router.get("/stats", getJobStats);
router.route("/:id").get(getJobById).put(updateJob).delete(deleteJob);

export default router;