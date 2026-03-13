// import axios from "axios";

// export const aiChatController = async (req, res) => {
//   try {
//     const { message } = req.body;

//     if (!message) {
//       return res.status(400).json({
//         success: false,
//         message: "Message is required",
//       });
//     }

//     const response = await axios.post(
//       "https://openrouter.ai/api/v1/chat/completions",
//       {
//         model: process.env.AI_MODEL || "arcee-ai/trinity-large-preview:free",
//         messages: [
//           {
//             role: "system",
//             content: "You are a helpful coding assistant for students",
//           },
//           {
//             role: "user",
//             content: message,
//           },
//         ],
//       },
//       {
//         headers: {
//           Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//           "HTTP-Referer": process.env.CLIENT_URL || "http://localhost:3000",
//           "X-Title": "Coding Platform Backend",
//           "Content-Type": "application/json",
//         },
//       }
//     );

//     return res.status(200).json({
//       success: true,
//       reply: response.data.choices[0].message.content,
//     });

//   } catch (error) {
//     console.error("AI ERROR:", error.response?.data || error.message);

//     return res.status(500).json({
//       success: false,
//       message: "AI service failed",
//     });
//   }
// };

// export const aiProblemAssistant = async (req, res) => {
//   try {
//     const {
//       mode,
//       problem,
//       userCode,
//       language,
//       executionResult,
//       failedTestCases,
//     } = req.body;

//     let prompt = "";

//     switch (mode) {
//       case "HINT":
//         prompt = `
// You are a coding interview assistant.
// Give ONLY a hint (not the full solution).

// Problem:
// ${problem}
//         `;
//         break;

//       case "FAILED_TESTCASE_ANALYSIS":
//         prompt = `
// User Code:
// ${userCode}

// Language: ${language}

// Failed Test Cases:
// ${JSON.stringify(failedTestCases, null, 2)}

// Explain clearly:
// - Why these test cases failed
// - What logic or edge case is missing
//         `;
//         break;

//       case "COMPLEXITY_ANALYSIS":
//         prompt = `
// Analyze the following code:

// ${userCode}

// Explain:
// - Time Complexity
// - Space Complexity
// - Whether the solution is optimal
//         `;
//         break;

//       case "CODE_REVIEW":
//         prompt = `
// Do a professional code review.

// Code:
// ${userCode}

// Review based on:
// - Readability
// - Correctness
// - Edge cases
// - Possible improvements
//         `;
//         break;

//       case "OPTIMIZATION":
//         prompt = `
// Optimize the following solution.

// Code:
// ${userCode}

// Explain:
// - What should be changed
// - Why it improves performance
// - Updated time & space complexity
//         `;
//         break;

//       default:
//         return res.status(400).json({ message: "Invalid AI mode" });
//     }

//     /* ================= OPENROUTER CALL WITH FALLBACK ================= */

//     const callOpenRouter = async (model) => {
//       return axios.post(
//         "https://openrouter.ai/api/v1/chat/completions",
//         {
//           model,
//           messages: [
//             { role: "system", content: "You are a DSA expert." },
//             { role: "user", content: prompt },
//           ],
//         },
//         {
//           headers: {
//             Authorization: `Bearer ${process.env.OPENROUTER_API_KEY}`,
//             "HTTP-Referer":
//               process.env.CLIENT_URL || "http://localhost:5173",
//             "X-Title": "LeetLab AI",
//           },
//           timeout: 30000,
//         }
//       );
//     };

//     let response;

//     try {
//       // 🔹 Primary model
//       response = await callOpenRouter(process.env.AI_MODEL_PRIMARY);
//     } catch (err) {
//       console.warn(
//         "Primary model failed, switching to fallback:",
//         err?.response?.data || err.message
//       );

//       // 🔹 Fallback model
//       response = await callOpenRouter(process.env.AI_MODEL_FALLBACK);
//     }

//     /* ================= SAFE RESPONSE PARSING ================= */

//     const aiMessage =
//       response?.data?.choices?.[0]?.message?.content;

//     if (!aiMessage) {
//       console.error(
//         "OpenRouter invalid response:",
//         JSON.stringify(response.data, null, 2)
//       );
//       return res.status(502).json({
//         message: "AI providers are temporarily unavailable",
//       });
//     }

//     return res.json({
//       success: true,
//       reply: aiMessage,
//     });

//   } catch (error) {
//     console.error("AI CONTROLLER ERROR:", error);
//     return res.status(500).json({
//       message: "AI failed. Please try again later.",
//     });
//   }
// };


import { getAIFeedback } from "../utils/ai-service.js";

export const getAIAnalysis = async (req, res) => {
  try {
    const { problemName, language, userCode } = req.body;

    // --- Validation ---
    if (!problemName || typeof problemName !== "string" || !problemName.trim()) {
      return res.status(400).json({ error: "problemName is required." });
    }
    if (!language || typeof language !== "string" || !language.trim()) {
      return res.status(400).json({ error: "language is required." });
    }
    if (!userCode || typeof userCode !== "string" || !userCode.trim()) {
      return res.status(400).json({ error: "userCode is required." });
    }

    // --- Call AI Service ---
    const result = await getAIFeedback(
      problemName.trim(),
      language.trim(),
      userCode.trim()
    );

    return res.status(200).json(result);

  } catch (error) {
    console.error("[AI Controller Error]", error?.message || error);

    if (error?.message?.includes("loading")) {
      return res.status(503).json({
        error: "Model is loading, please retry in 20-30 seconds.",
      });
    }
    if (error?.message?.includes("rate limit") || error?.status === 429) {
      return res.status(429).json({
        error: "HuggingFace rate limit reached. Try again later.",
      });
    }

    return res.status(500).json({ error: "Internal server error." });
  }
};
