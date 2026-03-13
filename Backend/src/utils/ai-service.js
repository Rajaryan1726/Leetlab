// const HF_SPACE_URL = process.env.HF_SPACE_URL;

// function buildPrompt(problemName, language, userCode) {
//   return `### Instruction:
// Give hint, suggestion, feedback, time and space complexity for this code.

// ### Input:
// Problem: ${problemName}
// Language: ${language}
// Code:
// ${userCode}

// ### Response:
// Hint:`;
// }

// function parseModelResponse(rawText) {
//   const fullText = "Hint:" + rawText;

//   const extract = (label, nextLabels) => {
//     const pattern = new RegExp(
//       `${label}[:\\s]*([^\\n]*(?:\\n(?!${nextLabels.map((l) => `${l}[:\\s]`).join("|")})[^\\n]*)*)`,
//       "i"
//     );
//     const match = fullText.match(pattern);
//     return match ? match[1].trim() : "";
//   };

//   return {
//     hint: extract("Hint", ["Suggestion", "Feedback", "Time Complexity", "Space Complexity"]) || "No hint available.",
//     suggestion: extract("Suggestion", ["Feedback", "Time Complexity", "Space Complexity"]) || "No suggestion available.",
//     feedback: extract("Feedback", ["Time Complexity", "Space Complexity"]) || "No feedback available.",
//     timeComplexity: extract("Time Complexity", ["Space Complexity"]) || "N/A",
//     spaceComplexity: extract("Space Complexity", []) || "N/A",
//   };
// }

// async function callGradioAPI(prompt) {
//   const joinRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict`, {
//     method: "POST",
//     headers: {
//       "Content-Type": "application/json",
//       "ngrok-skip-browser-warning": "true",
//     },
//     body: JSON.stringify({ data: [prompt] }),
//   });

//   if (!joinRes.ok) throw new Error(`Gradio join error: ${joinRes.status}`);

//   const { event_id } = await joinRes.json();

//   const resultRes = await fetch(`${HF_SPACE_URL}/gradio_api/call/predict/${event_id}`, {
//     headers: { "ngrok-skip-browser-warning": "true" },
//   });

//   if (!resultRes.ok) throw new Error(`Gradio result error: ${resultRes.status}`);

//   const text = await resultRes.text();
//   const lines = text.split("\n").filter(l => l.startsWith("data:"));
//   const lastData = lines[lines.length - 1].replace("data: ", "");
//   const parsed = JSON.parse(lastData);

//   return parsed[0];
// }

// export async function getAIFeedback(problemName, language, userCode) {
//   const prompt = buildPrompt(problemName, language, userCode);
//   const rawOutput = await callGradioAPI(prompt);
//   return parseModelResponse(rawOutput);
// }




import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

function buildPrompt(problemName, language, userCode, customPrompt = null) {
  if (customPrompt) {
    return `### Instruction:
${customPrompt}

### Input:
Problem: ${problemName}
Language: ${language}
Code:
${userCode}

### Response:
`;
  }

  return `### Instruction:
Give hint, suggestion, feedback, time and space complexity for this code.

### Input:
Problem: ${problemName}
Language: ${language}
Code:
${userCode}

### Response:
Hint:`;
}

function parseModelResponse(rawText) {
  const fullText = rawText.includes("Hint:") ? rawText : "Hint: " + rawText;

  const extract = (label, nextLabels) => {
    const pattern = new RegExp(
      `${label}[:\\s]*([^\\n]*(?:\\n(?!${nextLabels.map((l) => `${l}[:\\s]`).join("|")})[^\\n]*)*)`,
      "i"
    );
    const match = fullText.match(pattern);
    return match ? match[1].trim() : "";
  };

  return {
    hint: extract("Hint", ["Suggestion", "Feedback", "Time Complexity", "Space Complexity"]) || "Think about optimizing your approach.",
    suggestion: extract("Suggestion", ["Feedback", "Time Complexity", "Space Complexity"]) || "Consider using a better data structure.",
    feedback: extract("Feedback", ["Time Complexity", "Space Complexity"]) || "Review your solution for edge cases.",
    timeComplexity: extract("Time Complexity", ["Space Complexity"]) || "N/A",
    spaceComplexity: extract("Space Complexity", []) || "N/A",
  };
}

export async function getAIFeedback(problemName, language, userCode, customPrompt = null) {
  const prompt = buildPrompt(problemName, language, userCode, customPrompt);

  const response = await groq.chat.completions.create({
    model: "llama-3.1-8b-instant",
    messages: [
      {
        role: "system",
        content: `You are an expert coding assistant for a LeetCode-style platform called LeetLab.
You help users improve their code by providing:
- Clear hints without giving away the full solution
- Specific suggestions for improvement
- Detailed feedback on their approach
- Accurate time and space complexity analysis

Always format your response exactly like this:
Hint: <hint here>
Suggestion: <suggestion here>
Feedback: <feedback here>
Time Complexity: <complexity here>
Space Complexity: <complexity here>`
      },
      {
        role: "user",
        content: prompt
      }
    ],
    temperature: 0.7,
    max_tokens: 500,
  });

  const rawText = response.choices[0]?.message?.content || "";
  return parseModelResponse(rawText);
}