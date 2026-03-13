import express from "express";
import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import cors from "cors";
import cookieParser from "cookie-parser";
import connectDb from "./db/db.js";
import passport from "./utils/passport.js"; 

import userRoutes from "./routes/user.route.js";
import problemRoutes from "./routes/problems.route.js";
import executeCodeRouter from "./routes/executeCode.route.js";
import submissionsRouter from "./routes/submissions.route.js";
import playlistRouter from "./routes/playlist.route.js";
import aiRouter from "./routes/ai.route.js";
import uploadRoute from './routes/upload.route.js';
import resumeRoute from "./routes/resume.route.js";

const app = express();

/* ===== MIDDLEWARES ===== */
app.use(express.json({ limit: "10mb" }));
app.use(express.urlencoded({ extended: true, limit: "10mb" }));
app.use(express.static("public"));
app.use(
  cors({
    origin: process.env.CLIENT_URL,
    credentials: true,
    methods: ["GET", "POST", "PUT", "PATCH", "DELETE", "OPTIONS"],
    allowedHeaders: ["Content-Type", "Authorization"],
  })
);
app.use(cookieParser());
app.use(passport.initialize()); // ✅ passport initialize

/* ===== ROUTES ===== */
app.use("/api/v1/auth", userRoutes);
app.use("/api/v1/problems", problemRoutes);
app.use("/api/v1/execute", executeCodeRouter);
app.use("/api/v1/submission", submissionsRouter);
app.use("/api/v1/playlists", playlistRouter);
app.use("/api/v1/ai", aiRouter);
app.use("/api/v1/upload", uploadRoute);
app.use("/api/v1/resume", resumeRoute);

/* ===== START SERVER ===== */
const PORT = process.env.PORT || 3000;
console.log("Allowed origin:", process.env.CLIENT_URL);
connectDb()
  .then(() => {
    app.listen(PORT, () =>
      console.log(`🚀 Server running on port ${PORT}`)
    );
  })
  .catch((err) => {
    console.error("❌ MongoDB connection error", err);
    process.exit(1);
  });