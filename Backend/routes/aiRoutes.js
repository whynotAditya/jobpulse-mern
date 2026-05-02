import express from "express";
import { interviewPrep } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/interview-prep", interviewPrep);

export default router;
