import { create } from "zustand";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

// ✅ Module-level counter — React state/closure se bilkul alag
let answerCount = 0;

export const useInterviewStore = create((set, get) => ({
  messages: [],
  loading: false,
  error: null,
  isFinished: false,
  questionCount: 0,
  resumeText: null,
  scorecard: null,

  startInterview: async (resumeText) => {
    answerCount = 0; // reset module-level counter
    set({
      loading: true,
      error: null,
      messages: [],
      isFinished: false,
      questionCount: 0,
      resumeText,
      scorecard: null,
    });

    try {
      const res = await fetch(`${BASE_URL}/api/v1/resume/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({
          resumeText,
          messages: [{ role: "user", content: "Start the interview" }],
        }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      set({
        messages: [
          { role: "user", content: "Start the interview" },
          { role: "assistant", content: data.message },
        ],
        loading: false,
        questionCount: 0,
      });
    } catch (err) {
      set({ loading: false, error: err.message });
    }
  },

  sendMessage: async (userMessage) => {
    const { messages, resumeText } = get();

    // ✅ Module-level counter use karo
    answerCount += 1;
    const currentCount = answerCount;
    console.log("📨 Answer number:", currentCount);

    const updatedMessages = [...messages, { role: "user", content: userMessage }];
    set({ messages: updatedMessages, loading: true, error: null, questionCount: currentCount });

    try {
      const res = await fetch(`${BASE_URL}/api/v1/resume/interview`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resumeText, messages: updatedMessages }),
      });

      const data = await res.json();
      if (!data.success) throw new Error(data.message);

      const finalMessages = [...updatedMessages, { role: "assistant", content: data.message }];
      set({ messages: finalMessages, loading: false });

      console.log("✅ Answer count after response:", currentCount);

      // ✅ 6 answers ke baad scorecard
      if (currentCount >= 6) {
        console.log("🎯 Generating scorecard now!");
        set({ isFinished: true });
        await get().generateScorecard(resumeText, finalMessages);
      }
    } catch (err) {
      console.error("❌ Error:", err.message);
      set({ loading: false, error: err.message });
    }
  },

  generateScorecard: async (resumeText, messages) => {
    console.log("📊 Calling /scorecard API...");
    set({ loading: true });

    try {
      const res = await fetch(`${BASE_URL}/api/v1/resume/scorecard`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        credentials: "include",
        body: JSON.stringify({ resumeText, messages }),
      });

      console.log("📊 Scorecard status:", res.status);
      const data = await res.json();
      console.log("📊 Scorecard data:", data);

      if (!data.success) throw new Error(data.message);
      set({ scorecard: data.scorecard, isFinished: true, loading: false });
    } catch (err) {
      console.error("❌ Scorecard error:", err.message);
      set({ loading: false, error: err.message, isFinished: true });
    }
  },

  resetInterview: () => {
    answerCount = 0;
    set({
      messages: [],
      loading: false,
      error: null,
      isFinished: false,
      questionCount: 0,
      resumeText: null,
      scorecard: null,
    });
  },
}));