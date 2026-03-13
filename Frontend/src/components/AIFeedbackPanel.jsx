import { useState } from "react";
import useAIFeedback from "../lib/useAIFeedback";

const LoadingDots = () => (
  <div style={{ display: "flex", gap: "4px", alignItems: "center", justifyContent: "center", padding: "12px 0" }}>
    {[0, 1, 2].map((i) => (
      <div key={i} style={{
        width: "7px", height: "7px", borderRadius: "50%",
        background: "#a78bfa",
        animation: "aiBounce 1.2s infinite",
        animationDelay: `${i * 0.2}s`,
      }} />
    ))}
  </div>
);

const AIResultPanel = ({ feedback, activeTab }) => {
  const content = {
    hint: { icon: "💡", label: "Hint", value: feedback?.hint, color: "#f59e0b" },
    suggestion: { icon: "🔧", label: "Suggestion", value: feedback?.suggestion, color: "#3b82f6" },
    feedback: { icon: "📝", label: "Review", value: feedback?.feedback, color: "#10b981" },
    timeComplexity: { icon: "⏱️", label: "Time Complexity", value: feedback?.timeComplexity, color: "#8b5cf6" },
    spaceComplexity: { icon: "💾", label: "Space Complexity", value: feedback?.spaceComplexity, color: "#ec4899" },
  }[activeTab];

  if (!content) return null;

  return (
    <div style={{
      background: `${content.color}10`,
      border: `1px solid ${content.color}30`,
      borderLeft: `3px solid ${content.color}`,
      borderRadius: "10px",
      padding: "14px 16px",
      marginTop: "10px",
    }}>
      <div style={{
        display: "flex", alignItems: "center", gap: "8px",
        marginBottom: "8px", color: content.color,
        fontSize: "11px", fontWeight: "700",
        textTransform: "uppercase", letterSpacing: "0.08em",
      }}>
        <span>{content.icon}</span>
        <span>{content.label}</span>
      </div>
      <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7" }}>
        {content.value}
      </p>
    </div>
  );
};

const AIFeedbackPanel = ({ problemName, language, userCode }) => {
  const [activeTab, setActiveTab] = useState(null);
  const { feedback, loading, error, getAIFeedback } = useAIFeedback();

  const handleTabClick = async (tab) => {
    setActiveTab(tab);
    if (!feedback) {
      await getAIFeedback(problemName, language, userCode);
    }
  };

  const buttons = [
    { key: "hint", icon: "💡", label: "Hint" },
    { key: "suggestion", icon: "🔧", label: "Suggestion" },
    { key: "feedback", icon: "📝", label: "Review" },
    { key: "timeComplexity", icon: "⏱️", label: "Complexity" },
    { key: "spaceComplexity", icon: "💾", label: "Space" },
  ];

  return (
    <>
      <style>{`
        @keyframes aiBounce {
          0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
          40% { transform: scale(1); opacity: 1; }
        }
        .ai-tab-btn:hover {
          background: rgba(139, 92, 246, 0.15) !important;
          border-color: rgba(139, 92, 246, 0.4) !important;
          color: #a78bfa !important;
        }
      `}</style>

      <div style={{ width: "100%" }}>
        {/* Buttons Row */}
        <div style={{ display: "flex", gap: "8px", flexWrap: "wrap" }}>
          {buttons.map(({ key, icon, label }) => (
            <button
              key={key}
              className="ai-tab-btn"
              onClick={() => handleTabClick(key)}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px",
                background: activeTab === key ? "rgba(139, 92, 246, 0.2)" : "rgba(255,255,255,0.04)",
                border: activeTab === key ? "1px solid rgba(139, 92, 246, 0.5)" : "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: activeTab === key ? "#a78bfa" : "#9ca3af",
                fontSize: "13px", fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                opacity: loading && activeTab !== key ? 0.5 : 1,
                fontFamily: "inherit",
              }}
            >
              <span>{icon}</span>
              <span>{label}</span>
            </button>
          ))}

          {feedback && (
            <button
              className="ai-tab-btn"
              onClick={() => getAIFeedback(problemName, language, userCode)}
              disabled={loading}
              style={{
                display: "flex", alignItems: "center", gap: "6px",
                padding: "8px 14px",
                background: "rgba(255,255,255,0.04)",
                border: "1px solid rgba(255,255,255,0.1)",
                borderRadius: "8px",
                color: "#6b7280", fontSize: "13px", fontWeight: "500",
                cursor: loading ? "not-allowed" : "pointer",
                transition: "all 0.2s ease",
                fontFamily: "inherit",
              }}
            >
              <span>🔄</span>
              <span>Re-analyze</span>
            </button>
          )}
        </div>

        {loading && activeTab && <LoadingDots />}

        {error && (
          <div style={{
            marginTop: "10px",
            background: "rgba(239, 68, 68, 0.1)",
            border: "1px solid rgba(239, 68, 68, 0.3)",
            borderRadius: "10px", padding: "12px 14px",
            color: "#fca5a5", fontSize: "13px",
          }}>
            ⚠️ {error}
          </div>
        )}

        {feedback && activeTab && !loading && (
          <AIResultPanel feedback={feedback} activeTab={activeTab} />
        )}
      </div>
    </>
  );
};

export default AIFeedbackPanel;