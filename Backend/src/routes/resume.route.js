import express from "express";
import { analyzeResume, interviewChat, generateScorecard } from "../controllers/resume.controllers.js";

const router = express.Router();

router.post("/analyze", analyzeResume);
router.post("/interview", interviewChat);
router.post("/scorecard", generateScorecard);

export default router;