import { useState } from "react";

const useAIFeedback = () => {
  const [feedback, setFeedback] = useState(null);
  const [failedAnalysis, setFailedAnalysis] = useState(null);
  const [optimizeAnalysis, setOptimizeAnalysis] = useState(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState(null);

  const getAIFeedback = async (problemName, language, userCode) => {
    if (!userCode?.trim()) { setError("Pehle code likho!"); return; }
    setLoading(true);
    setError(null);
    setFeedback(null);
    try {
      const res = await fetch("http://localhost:3000/api/v1/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ problemName, language, userCode }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setFeedback(data);
    } catch (err) {
      setError("AI feedback lene mein error aayi. Dobara try karo.");
    } finally {
      setLoading(false);
    }
  };

  const getFailedAnalysis = async (problemName, language, userCode, failedTestCases) => {
    if (!userCode?.trim()) { setError("Pehle code likho!"); return; }
    setLoading(true);
    setError(null);
    setFailedAnalysis(null);
    try {
      const failedStr = failedTestCases?.map((tc, i) =>
        `Test ${i+1}: Input=${tc.input}, Expected=${tc.expected}, Got=${tc.actual}`
      ).join("\n") || "No failed test cases found.";

      const res = await fetch("http://localhost:3000/api/v1/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemName,
          language,
          userCode,
          customPrompt: `Analyze why these test cases failed and how to fix the code:\n${failedStr}`
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setFailedAnalysis(data.feedback || data.hint || "Analysis complete.");
    } catch (err) {
      setError("Failed analysis mein error aayi.");
    } finally {
      setLoading(false);
    }
  };

  const getOptimizeAnalysis = async (problemName, language, userCode) => {
    if (!userCode?.trim()) { setError("Pehle code likho!"); return; }
    setLoading(true);
    setError(null);
    setOptimizeAnalysis(null);
    try {
      const res = await fetch("http://localhost:3000/api/v1/ai/analyze", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          problemName,
          language,
          userCode,
          customPrompt: "Suggest an optimized version of this code with better time and space complexity."
        }),
      });
      if (!res.ok) throw new Error("Server error");
      const data = await res.json();
      setOptimizeAnalysis(data.suggestion || data.feedback || "Optimization complete.");
    } catch (err) {
      setError("Optimize analysis mein error aayi.");
    } finally {
      setLoading(false);
    }
  };

  const clearFeedback = () => {
    setFeedback(null);
    setFailedAnalysis(null);
    setOptimizeAnalysis(null);
    setError(null);
  };

  return {
    feedback, failedAnalysis, optimizeAnalysis,
    loading, error,
    getAIFeedback, getFailedAnalysis, getOptimizeAnalysis, clearFeedback
  };
};

export default useAIFeedback;