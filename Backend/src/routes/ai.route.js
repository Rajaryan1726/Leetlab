// import express from "express";
// import { aiChatController, aiProblemAssistant } from "../controllers/ai.controllers.js";
// import { verifyJWT } from "../middlewares/loggedin.middleware.js"; // optional

// const router = express.Router();

// // POST /api/v1/ai/chat
// router.post("/chat", verifyJWT, aiChatController);
// // POST /api/v1/ai/problem-assistant
// router.post("/problem", verifyJWT, aiProblemAssistant);


// export default router;



import express from "express";
import { getAIAnalysis } from "../controllers/ai.controllers.js";

const router = express.Router();

// POST /api/ai/analyze
// Body: { problemName, language, userCode }
// Returns: { hint, suggestion, feedback, timeComplexity, spaceComplexity }
router.post("/analyze", getAIAnalysis);

export default router;