import { useEffect, useRef, useState } from "react";
import { useNavigate } from "react-router-dom";
import { useInterviewStore } from "../store/useInterviewStore";

// ── Typing dots ───────────────────────────────────────────────────────────────
const TypingDots = () => (
  <div className="flex items-center gap-1 px-4 py-3">
    {[0, 1, 2].map((i) => (
      <span key={i} className="w-2 h-2 rounded-full bg-indigo-400 animate-bounce"
        style={{ animationDelay: `${i * 0.15}s` }} />
    ))}
  </div>
);

// ── Chat bubble ───────────────────────────────────────────────────────────────
const Bubble = ({ msg }) => {
  const isAI = msg.role === "assistant";
  return (
    <div className={`flex ${isAI ? "justify-start" : "justify-end"} mb-4`}>
      {isAI && (
        <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
      )}
      <div className={`max-w-[75%] px-4 py-3 rounded-2xl text-sm leading-relaxed whitespace-pre-wrap
        ${isAI ? "bg-zinc-800 text-zinc-100 rounded-tl-sm border border-zinc-700" : "bg-indigo-600 text-white rounded-tr-sm"}`}>
        {msg.content}
      </div>
      {!isAI && (
        <div className="w-8 h-8 rounded-full bg-zinc-700 flex items-center justify-center text-sm ml-2 shrink-0 mt-1">👤</div>
      )}
    </div>
  );
};

// ── Progress bar ──────────────────────────────────────────────────────────────
const ProgressBar = ({ count }) => {
  const total = 6;
  const pct = Math.min((count / total) * 100, 100);
  return (
    <div className="flex items-center gap-3">
      <span className="text-xs text-zinc-400 whitespace-nowrap">Q {Math.min(count, total)} / {total}</span>
      <div className="flex-1 bg-zinc-800 h-1.5 rounded-full overflow-hidden">
        <div className="h-full bg-indigo-500 transition-all duration-500" style={{ width: `${pct}%` }} />
      </div>
    </div>
  );
};

// ── Score ring ────────────────────────────────────────────────────────────────
const ScoreRing = ({ score, label, color }) => {
  const radius = 28;
  const circ = 2 * Math.PI * radius;
  const dash = ((score / 10) * 100 / 100) * circ;
  return (
    <div className="flex flex-col items-center gap-1">
      <svg width="72" height="72" className="-rotate-90">
        <circle cx="36" cy="36" r={radius} fill="none" stroke="#27272a" strokeWidth="6" />
        <circle cx="36" cy="36" r={radius} fill="none" stroke={color} strokeWidth="6"
          strokeDasharray={`${dash} ${circ}`} strokeLinecap="round"
          style={{ transition: "stroke-dasharray 1s ease" }} />
      </svg>
      <span className="text-lg font-bold -mt-12 mb-6" style={{ color }}>
        {score}<span className="text-xs text-zinc-500">/10</span>
      </span>
      <span className="text-xs text-zinc-400 text-center">{label}</span>
    </div>
  );
};

// ── Scorecard ─────────────────────────────────────────────────────────────────
const Scorecard = ({ scorecard, onRestart, onBack }) => {
  const verdictColor =
    scorecard.verdict?.toLowerCase().includes("senior") ? "text-green-400" :
    scorecard.verdict?.toLowerCase().includes("junior") ? "text-blue-400" :
    scorecard.verdict?.toLowerCase().includes("not") ? "text-red-400" : "text-yellow-400";

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">
      <div className="max-w-3xl mx-auto space-y-6">
        <div className="text-center space-y-2 pt-4">
          <div className="text-5xl">🏆</div>
          <h1 className="text-3xl font-bold">Interview Complete!</h1>
          <p className={`text-lg font-semibold ${verdictColor}`}>{scorecard.verdict}</p>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6 text-center">
          <p className="text-zinc-400 text-sm mb-2">Overall Score</p>
          <p className="text-6xl font-bold text-indigo-400">
            {scorecard.overallScore}<span className="text-2xl text-zinc-500">/10</span>
          </p>
          <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden mt-4">
            <div className="h-full bg-indigo-500 transition-all duration-1000"
              style={{ width: `${(scorecard.overallScore / 10) * 100}%` }} />
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-6">
          <h2 className="text-lg font-semibold mb-6 text-center">Category Breakdown</h2>
          <div className="grid grid-cols-2 sm:grid-cols-4 gap-6 justify-items-center">
            <ScoreRing score={scorecard.communication}  label="Communication"   color="#6366f1" />
            <ScoreRing score={scorecard.technical}      label="Technical"       color="#22d3ee" />
            <ScoreRing score={scorecard.problemSolving} label="Problem Solving" color="#f59e0b" />
            <ScoreRing score={scorecard.confidence}     label="Confidence"      color="#10b981" />
          </div>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-green-400 font-semibold mb-3">📈 Strengths</h2>
            <ul className="space-y-2">
              {scorecard.strengths?.map((s, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-green-400 mt-0.5">✓</span> {s}
                </li>
              ))}
            </ul>
          </div>
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-red-400 font-semibold mb-3">📉 Areas to Improve</h2>
            <ul className="space-y-2">
              {scorecard.weaknesses?.map((w, i) => (
                <li key={i} className="flex items-start gap-2 text-sm text-zinc-300">
                  <span className="text-red-400 mt-0.5">✗</span> {w}
                </li>
              ))}
            </ul>
          </div>
        </div>

        <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
          <h2 className="text-cyan-400 font-semibold mb-3">💬 Detailed Feedback</h2>
          <p className="text-zinc-300 text-sm leading-relaxed">{scorecard.feedback}</p>
        </div>

        {scorecard.tips?.length > 0 && (
          <div className="bg-zinc-900 border border-zinc-800 rounded-2xl p-5">
            <h2 className="text-yellow-400 font-semibold mb-3">💡 Tips to Improve</h2>
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
              {scorecard.tips.map((tip, i) => (
                <div key={i} className="bg-zinc-800 rounded-xl p-3 text-sm text-zinc-300 flex items-start gap-2">
                  <span className="text-yellow-400">—</span> {tip}
                </div>
              ))}
            </div>
          </div>
        )}

        <div className="flex justify-center gap-4 pb-8">
          <button onClick={onRestart} className="px-6 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl font-semibold">
            🔄 Try Again
          </button>
          <button onClick={onBack} className="px-6 py-3 bg-zinc-800 hover:bg-zinc-700 transition rounded-xl">
            ← Back to Resume
          </button>
        </div>
      </div>
    </div>
  );
};

// ── Main Page ─────────────────────────────────────────────────────────────────
const MockInterviewPage = () => {
  const navigate = useNavigate();
  const { messages, loading, error, isFinished, questionCount, scorecard,
    startInterview, resetInterview } = useInterviewStore();

  const [input, setInput] = useState("");
  const [started, setStarted] = useState(false);
  const [resumeText, setResumeText] = useState("");
  const bottomRef = useRef(null);

  useEffect(() => {
    bottomRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages, loading]);

  useEffect(() => {
    const saved = sessionStorage.getItem("resumeText");
    if (saved) setResumeText(saved);
  }, []);

  const handleStart = async () => {
    if (!resumeText) {
      alert("Resume text not found. Please upload your resume again.");
      navigate("/upload-resume");
      return;
    }
    setStarted(true);
    await startInterview(resumeText);
  };

  // ✅ Direct store sendMessage call — no stale closure
  const handleSend = () => {
    //  alert("CLICKED " + input); 
    const trimmed = input.trim();
    if (!trimmed) return;
    const state = useInterviewStore.getState();
    if (state.loading || state.isFinished) return;
    setInput("");
    useInterviewStore.getState().sendMessage(trimmed);
  };

  const handleKeyDown = (e) => {
    if (e.key === "Enter" && !e.shiftKey) {
      e.preventDefault();
      handleSend();
    }
  };

  const handleRestart = () => {
    resetInterview();
    setStarted(false);
    setInput("");
  };

  // Scorecard screen
  if (isFinished && scorecard) {
    return <Scorecard scorecard={scorecard} onRestart={handleRestart} onBack={() => navigate("/upload-resume")} />;
  }

  // Generating screen
  if (isFinished && !scorecard) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center">
        <div className="text-center space-y-4">
          <div className="text-4xl animate-pulse">📊</div>
          <p className="text-zinc-400">Generating your scorecard...</p>
        </div>
      </div>
    );
  }

  // Pre-start screen
  if (!started) {
    return (
      <div className="min-h-screen bg-zinc-950 text-white flex items-center justify-center p-6">
        <div className="max-w-lg w-full text-center space-y-6">
          <div className="w-20 h-20 mx-auto bg-indigo-600/20 border border-indigo-500/40 rounded-2xl flex items-center justify-center text-4xl">🎙️</div>
          <div>
            <h1 className="text-3xl font-bold mb-2">Mock Interview</h1>
            <p className="text-zinc-400 text-sm">
              AI will ask you <span className="text-indigo-400 font-semibold">6 personalized questions</span> based on your resume.
              You'll get a detailed scorecard at the end.
            </p>
          </div>

          {!resumeText && (
            <div className="text-left">
              <label className="text-xs text-zinc-400 mb-2 block">Paste your resume text (required)</label>
              <textarea rows={6}
                className="w-full bg-zinc-800 border border-zinc-700 rounded-xl p-3 text-sm text-zinc-200 resize-none focus:outline-none focus:border-indigo-500"
                placeholder="Paste your resume text here..."
                value={resumeText}
                onChange={(e) => setResumeText(e.target.value)} />
            </div>
          )}

          <div className="grid grid-cols-3 gap-3 text-sm">
            {[
              { icon: "⚡", label: "Technical", desc: "Skills & projects" },
              { icon: "🧠", label: "Behavioral", desc: "Soft skills" },
              { icon: "🏆", label: "Scorecard", desc: "After 6 questions" },
            ].map((item) => (
              <div key={item.label} className="bg-zinc-900 border border-zinc-800 rounded-xl p-3">
                <div className="text-xl mb-1">{item.icon}</div>
                <div className="font-semibold text-zinc-200">{item.label}</div>
                <div className="text-xs text-zinc-500">{item.desc}</div>
              </div>
            ))}
          </div>

          <button onClick={handleStart} disabled={!resumeText}
            className="w-full py-3 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition rounded-xl font-semibold text-lg">
            🚀 Start Interview
          </button>
          <button onClick={() => navigate("/upload-resume")} className="text-zinc-500 hover:text-zinc-300 text-sm transition">
            ← Back to Resume
          </button>
        </div>
      </div>
    );
  }

  // Chat screen
  return (
    <div className="min-h-screen bg-zinc-950 text-white flex flex-col">
      <div className="sticky top-0 z-10 bg-zinc-950/80 backdrop-blur border-b border-zinc-800 px-4 py-3">
        <div className="max-w-3xl mx-auto flex items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="w-9 h-9 bg-indigo-600/20 border border-indigo-500/40 rounded-xl flex items-center justify-center text-lg">🤖</div>
            <div>
              <p className="font-semibold text-sm">AI Interviewer</p>
              <p className="text-xs text-green-400 flex items-center gap-1">
                <span className="w-1.5 h-1.5 bg-green-400 rounded-full inline-block" /> Live Session
              </p>
            </div>
          </div>
          <div className="flex-1 max-w-xs hidden sm:block">
            <ProgressBar count={questionCount} />
          </div>
          <button onClick={handleRestart} className="text-xs text-zinc-500 hover:text-zinc-300 border border-zinc-700 px-3 py-1.5 rounded-lg transition">
            🔄 Restart
          </button>
        </div>
      </div>

      <div className="flex-1 overflow-y-auto px-4 py-6">
        <div className="max-w-3xl mx-auto">
          {messages.length === 0 && loading && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm"><TypingDots /></div>
            </div>
          )}

          {messages
            .filter((m) => !(m.role === "user" && m.content === "Start the interview"))
            .map((msg, i) => <Bubble key={i} msg={msg} />)}

          {messages.length > 0 && loading && (
            <div className="flex justify-start mb-4">
              <div className="w-8 h-8 rounded-full bg-indigo-600 flex items-center justify-center text-sm mr-2 shrink-0 mt-1">🤖</div>
              <div className="bg-zinc-800 border border-zinc-700 rounded-2xl rounded-tl-sm">
                {questionCount >= 6
                  ? <p className="px-4 py-3 text-sm text-zinc-400 animate-pulse">📊 Generating your scorecard...</p>
                  : <TypingDots />}
              </div>
            </div>
          )}

          {error && (
            <div className="text-center text-red-400 text-sm py-2 bg-red-500/10 rounded-lg border border-red-500/20">
              ⚠️ {error}
            </div>
          )}
          <div ref={bottomRef} />
        </div>
      </div>

      <div className="sticky bottom-0 bg-zinc-950/80 backdrop-blur border-t border-zinc-800 px-4 py-4">
        <div className="max-w-3xl mx-auto flex gap-3 items-end">
          <textarea rows={1} value={input}
            onChange={(e) => setInput(e.target.value)}
            onKeyDown={handleKeyDown}
            disabled={loading || messages.length === 0}
            placeholder={messages.length === 0 ? "Waiting for interviewer..." : "Type your answer... (Enter to send)"}
            className="flex-1 bg-zinc-800 border border-zinc-700 focus:border-indigo-500 rounded-xl px-4 py-3 text-sm text-zinc-100 resize-none focus:outline-none transition placeholder:text-zinc-600 disabled:opacity-50"
            style={{ maxHeight: "150px", overflowY: "auto" }}
            onInput={(e) => { e.target.style.height = "auto"; e.target.style.height = e.target.scrollHeight + "px"; }}
          />
          <button onClick={handleSend}
            disabled={!input.trim() || loading || messages.length === 0}
            className="w-11 h-11 bg-indigo-600 hover:bg-indigo-700 disabled:opacity-40 disabled:cursor-not-allowed transition rounded-xl flex items-center justify-center shrink-0">
            <svg className="w-5 h-5 rotate-90" fill="currentColor" viewBox="0 0 20 20">
              <path d="M10.894 2.553a1 1 0 00-1.788 0l-7 14a1 1 0 001.169 1.409l5-1.429A1 1 0 009 15.571V11a1 1 0 112 0v4.571a1 1 0 00.725.962l5 1.428a1 1 0 001.17-1.408l-7-14z" />
            </svg>
          </button>
        </div>
        <p className="text-center text-xs text-zinc-600 mt-2">Shift+Enter for new line • Enter to send</p>
      </div>
    </div>
  );
};

export default MockInterviewPage;