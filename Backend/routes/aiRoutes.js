import express from "express";
import { interviewPrep, generateCoverLetter } from "../controllers/aiController.js";
import protect from "../middleware/authMiddleware.js";

const router = express.Router();

router.use(protect);

router.post("/interview-prep", interviewPrep);
router.post("/cover-letter", generateCoverLetter);

export default router;
