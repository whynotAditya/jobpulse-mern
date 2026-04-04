import express from "express";
import {
    createJob,
    getJobs,
    deleteJob,
    updateJob
} from "../controllers/jobController.js";

const router = express.Router();

router.post("/", createJob);
router.get("/", getJobs);
router.delete("/:id", deleteJob);
router.put("/:id", updateJob);

export default router;