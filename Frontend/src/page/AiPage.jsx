import { useState } from "react";
import axiosInstance from "../api/axios";

const AiPage = () => {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const askAi = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      setError("");
      setReply("");

      const res = await axiosInstance.post("/api/v1/ai/chat", {
        message,
      });

      setReply(res.data.reply);
      setMessage("");
    } catch (err) {
      console.error(err);
      setError("AI response failed. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="w-full max-w-3xl mx-auto px-4 py-6">
      <h1 className="text-2xl font-bold text-white mb-4 flex items-center gap-2">
        🤖 AI Assistant
      </h1>

      {/* Input */}
      <textarea
        className="w-full min-h-[120px] p-3 rounded-xl
                   bg-black/40 border border-white/10
                   text-white placeholder-gray-400
                   focus:outline-none focus:ring-2 focus:ring-purple-500"
        placeholder="Ask anything (DSA, hints, explanation, code help...)"
        value={message}
        onChange={(e) => setMessage(e.target.value)}
      />

      {/* Button */}
      <button
        onClick={askAi}
        disabled={loading}
        className="mt-3 px-5 py-2 rounded-xl
                   bg-gradient-to-r from-indigo-500 to-purple-600
                   text-white font-semibold
                   hover:opacity-90 disabled:opacity-50"
      >
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {/* Error */}
      {error && (
        <div className="mt-4 p-3 rounded-lg bg-red-500/10 text-red-400">
          {error}
        </div>
      )}

      {/* AI Reply */}
      {reply && (
        <div className="mt-6 p-4 rounded-xl bg-black/50 border border-white/10">
          <h3 className="mb-2 text-white font-semibold">AI Reply</h3>
          <pre className="whitespace-pre-wrap text-gray-200 text-sm leading-relaxed">
            {reply}
          </pre>
        </div>
      )}
    </div>
  );
};

export default AiPage;
