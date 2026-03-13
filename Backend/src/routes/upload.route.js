import express from "express";
import upload from "../middlewares/multer.middleware.js";
import { uploadResume } from "../controllers/upload.controllers.js";

const router = express.Router();

router.post("/resume", upload.single("resume"), uploadResume);

export default router;