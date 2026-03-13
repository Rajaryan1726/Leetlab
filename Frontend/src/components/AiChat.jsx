import { useState } from "react";
import { sendAiMessage } from "../api/ai.api";

const AiChat = () => {
  const [message, setMessage] = useState("");
  const [reply, setReply] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSend = async () => {
    if (!message.trim()) return;

    try {
      setLoading(true);
      const data = await sendAiMessage(message);
      setReply(data.reply);
      setMessage("");
    } catch (error) {
      console.error(error);
      alert("AI failed");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={{ maxWidth: "600px", margin: "auto" }}>
      <h2>🤖 AI Assistant</h2>

      <textarea
        rows="4"
        placeholder="Ask anything..."
        value={message}
        onChange={(e) => setMessage(e.target.value)}
        style={{ width: "100%" }}
      />

      <button onClick={handleSend} disabled={loading}>
        {loading ? "Thinking..." : "Ask AI"}
      </button>

      {reply && (
        <div style={{ marginTop: "16px" }}>
          <strong>AI Reply:</strong>
          <p>{reply}</p>
        </div>
      )}
    </div>
  );
};

export default AiChat;
