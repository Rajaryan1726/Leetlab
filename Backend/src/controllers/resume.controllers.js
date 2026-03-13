import Groq from "groq-sdk";

const groq = new Groq({ apiKey: process.env.GROQ_API_KEY });

/* ================= ML MODEL CATEGORY ================= */
const getResumeCategory = async (resumeText) => {
  try {
    const response = await fetch("http://localhost:8000/predict", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({ text: resumeText }),
    });
    const data = await response.json();
    return data;
  } catch (error) {
    console.warn("⚠️ ML Server not available:", error.message);
    return null;
  }
};

/* ================= GROQ AI CALL ================= */
const callGroq = async (messages) => {
  return groq.chat.completions.create({
    model: process.env.GROQ_MODEL || "llama3-8b-8192",
    messages,
    temperature: 0,
    response_format: { type: "json_object" },
  });
};

/* ================= ANALYZE RESUME CONTROLLER ================= */
export const analyzeResume = async (req, res) => {
  try {
    const { resumeText } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: "Resume text is required" });
    }

    const [mlResult, aiResponse] = await Promise.all([
      getResumeCategory(resumeText),
      callGroq([
        {
          role: "system",
          content: "You are a professional ATS resume analyzer. Always respond with valid JSON only.",
        },
        {
          role: "user",
          content: `
Analyze this resume and return ONLY valid JSON in this exact format:
{
  "score": <number 0-100>,
  "level": "<beginner | intermediate | advanced>",
  "skills": ["skill1", "skill2"],
  "strengths": ["strength1", "strength2"],
  "weaknesses": ["weakness1", "weakness2"],
  "missingKeywords": ["keyword1", "keyword2"],
  "suggestions": ["suggestion1", "suggestion2"]
}

Resume:
${resumeText}
          `,
        },
      ]),
    ]);

    let aiReply = aiResponse?.choices?.[0]?.message?.content;

    if (!aiReply) {
      return res.status(502).json({ success: false, message: "Invalid AI response" });
    }

    let parsed;
    try {
      parsed = JSON.parse(aiReply);
    } catch (err) {
      const jsonMatch = aiReply.match(/\{[\s\S]*\}/);
      if (jsonMatch) {
        parsed = JSON.parse(jsonMatch[0]);
      } else {
        return res.json({ success: true, analysis: aiReply });
      }
    }

    if (mlResult) {
      parsed.category = mlResult.category;
      parsed.categoryConfidence = mlResult.confidence;
    }

    return res.json({ success: true, analysis: parsed });
  } catch (error) {
    console.error("🚨 Resume AI Error:", error?.message);
    return res.status(500).json({ success: false, message: "Resume analysis failed" });
  }
};

/* ================= INTERVIEW CHAT CONTROLLER ================= */
export const interviewChat = async (req, res) => {
  try {
    const { resumeText, messages } = req.body;

    if (!resumeText) {
      return res.status(400).json({ success: false, message: "Resume text is required" });
    }

   const systemPrompt = `You are a professional technical interviewer conducting a mock interview.
You have been given the candidate's resume. Your job is to:
1. Ask ONE interview question at a time based on their resume
2. Ask about their skills, projects, and experience mentioned in the resume
3. After the candidate answers, give brief feedback (1-2 lines) then immediately ask the next question
4. Mix technical questions with behavioral ones
5. Keep a professional but friendly tone

Resume:
${resumeText}

IMPORTANT:
- Ask only ONE question at a time
- Keep responses concise and professional
- Start with a brief greeting and your first question
- Do NOT wrap up or conclude the interview yourself
- Do NOT say things like "That concludes our interview", "Best of luck", or give any closing remarks
- Do NOT summarize the interview or give overall feedback
- Just keep asking questions and giving brief per-answer feedback
- The system will handle ending the interview automatically`;
    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-8b-8192",
      messages: [
        { role: "system", content: systemPrompt },
        ...messages,
      ],
      temperature: 0.7,
    });

    const aiReply = response?.choices?.[0]?.message?.content;

    if (!aiReply) {
      return res.status(502).json({ success: false, message: "Invalid AI response" });
    }

    return res.json({ success: true, message: aiReply });
  } catch (error) {
    console.error("🚨 Interview AI Error:", error?.message);
    return res.status(500).json({ success: false, message: "Interview failed" });
  }
};

/* ================= SCORECARD CONTROLLER ================= */
export const generateScorecard = async (req, res) => {
  try {
    const { resumeText, messages } = req.body;

    if (!resumeText || !messages) {
      return res.status(400).json({ success: false, message: "resumeText and messages required" });
    }

    const conversationSummary = messages
      .filter((m) => m.content !== "Start the interview")
      .map((m) => `${m.role === "user" ? "Candidate" : "Interviewer"}: ${m.content}`)
      .join("\n\n");

    const response = await groq.chat.completions.create({
      model: process.env.GROQ_MODEL || "llama3-8b-8192",
      messages: [
        {
          role: "system",
          content: "You are a professional interview evaluator. Always respond with valid JSON only. No markdown.",
        },
        {
          role: "user",
          content: `
Evaluate this mock interview and return ONLY this JSON:
{
  "overallScore": <1-10>,
  "communication": <1-10>,
  "technical": <1-10>,
  "problemSolving": <1-10>,
  "confidence": <1-10>,
  "verdict": "<Ready for Senior Role | Ready for Junior Role | Needs More Preparation | Not Ready Yet>",
  "strengths": ["s1", "s2", "s3"],
  "weaknesses": ["w1", "w2", "w3"],
  "feedback": "<2-3 sentences of detailed overall feedback>",
  "tips": ["t1", "t2", "t3", "t4"]
}

Resume: ${resumeText}

Interview Conversation:
${conversationSummary}`,
        },
      ],
      temperature: 0.3,
      response_format: { type: "json_object" },
    });

    const aiReply = response?.choices?.[0]?.message?.content;
    if (!aiReply) return res.status(502).json({ success: false, message: "Invalid AI response" });

    let scorecard;
    try {
      scorecard = JSON.parse(aiReply);
    } catch {
      const match = aiReply.match(/\{[\s\S]*\}/);
      if (match) scorecard = JSON.parse(match[0]);
      else return res.status(500).json({ success: false, message: "Failed to parse scorecard" });
    }

    return res.json({ success: true, scorecard });
  } catch (error) {
    console.error("🚨 Scorecard Error:", error?.message);
    return res.status(500).json({ success: false, message: "Scorecard generation failed" });
  }
};