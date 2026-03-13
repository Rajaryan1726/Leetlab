import React, { useState, useEffect } from "react";
import Editor from "@monaco-editor/react";
import {
  Play,
  Clock,
  ChevronRight,
  BookOpen,
  Terminal,
  Code2,
  Users,
  ThumbsUp,
  Home,
  Bot,
  Upload,
  Lightbulb,
  Cpu,
  Sparkles,
  FileSearch,
  BarChart2,
  Database,
  Zap,
  Bug,
} from "lucide-react";
import { Link, useParams } from "react-router-dom";
import { useProblemStore } from "../store/useProblemStore";
import { getLanguageId } from "../lib/lang";
import { useExecutionStore } from "../store/useExecutionStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import Submission from "../components/Submission";
import SubmissionsList from "../components/SubmissionList";
import useAIFeedback from "../lib/useAIFeedback";

const LANGUAGES = [
  { value: "javascript", label: "JavaScript" },
  { value: "python", label: "Python" },
  { value: "java", label: "Java" },
];

// AI Result Card
const AIResultCard = ({ activeAiTab, feedback, failedAnalysis, optimizeAnalysis }) => {
  // Hint, Suggestion, Review, Complexity, Space
  if (["hint", "suggestion", "feedback", "timeComplexity", "spaceComplexity"].includes(activeAiTab) && feedback) {
    const config = {
      hint: { icon: "💡", label: "Hint", value: feedback.hint, color: "#f59e0b" },
      suggestion: { icon: "🔧", label: "Suggestion", value: feedback.suggestion, color: "#3b82f6" },
      feedback: { icon: "📝", label: "Review", value: feedback.feedback, color: "#10b981" },
      timeComplexity: { icon: "⏱️", label: "Time Complexity", value: feedback.timeComplexity, color: "#8b5cf6" },
      spaceComplexity: { icon: "💾", label: "Space Complexity", value: feedback.spaceComplexity, color: "#ec4899" },
    }[activeAiTab];

    return (
      <div style={{
        background: `${config.color}10`,
        border: `1px solid ${config.color}30`,
        borderLeft: `3px solid ${config.color}`,
        borderRadius: "10px",
        padding: "14px 16px",
        marginTop: "10px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginBottom: "8px", color: config.color,
          fontSize: "11px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <span>{config.icon}</span>
          <span>{config.label}</span>
        </div>
        <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7" }}>
          {config.value}
        </p>
      </div>
    );
  }

  // Failed Analysis
  if (activeAiTab === "failed" && failedAnalysis) {
    return (
      <div style={{
        background: "#ef444410",
        border: "1px solid #ef444430",
        borderLeft: "3px solid #ef4444",
        borderRadius: "10px",
        padding: "14px 16px",
        marginTop: "10px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginBottom: "8px", color: "#ef4444",
          fontSize: "11px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <span>⚠️</span>
          <span>FAILED TEST CASE ANALYSIS</span>
        </div>
        <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7" }}>
          {failedAnalysis}
        </p>
      </div>
    );
  }

  // Optimize Analysis
  if (activeAiTab === "optimize" && optimizeAnalysis) {
    return (
      <div style={{
        background: "#10b98110",
        border: "1px solid #10b98130",
        borderLeft: "3px solid #10b981",
        borderRadius: "10px",
        padding: "14px 16px",
        marginTop: "10px",
      }}>
        <div style={{
          display: "flex", alignItems: "center", gap: "8px",
          marginBottom: "8px", color: "#10b981",
          fontSize: "11px", fontWeight: "700",
          textTransform: "uppercase", letterSpacing: "0.08em",
        }}>
          <span>🚀</span>
          <span>OPTIMIZATION SUGGESTION</span>
        </div>
        <p style={{ margin: 0, color: "#e2e8f0", fontSize: "13.5px", lineHeight: "1.7" }}>
          {optimizeAnalysis}
        </p>
      </div>
    );
  }

  return null;
};

const ProblemPage = () => {
  const { id } = useParams();
  const { getProblemById, problem, isProblemLoading } = useProblemStore();

  const {
    submissions,
    isLoading: isSubmissionsLoading,
    getSubmissionForProblem,
    getSubmissionCountForProblem,
    submissionCount,
  } = useSubmissionStore();

  const {
    executeCode,
    submitCode,
    runResult,
    submission: executionSubmission,
    isExecuting,
    isSubmitting,
  } = useExecutionStore();

  const [code, setCode] = useState("");
  const [activeTab, setActiveTab] = useState("description");
  const [selectedLanguage, setSelectedLanguage] = useState("javascript");
  const [testCases, setTestCases] = useState([]);
  const [activeAiTab, setActiveAiTab] = useState(null);

  const {
    feedback, failedAnalysis, optimizeAnalysis,
    loading: aiFeedbackLoading, error: aiFeedbackError,
    getAIFeedback, getFailedAnalysis, getOptimizeAnalysis
  } = useAIFeedback();

  useEffect(() => {
    getProblemById(id);
    getSubmissionCountForProblem(id);
  }, [id]);

  useEffect(() => {
    if (problem) {
      setCode(problem.codeSnippets?.[0]?.[selectedLanguage.toUpperCase()] || "");
      setTestCases(
        problem.testCases?.map(tc => ({
          input: tc.input,
          output: tc.output,
        })) || []
      );
    }
  }, [problem, selectedLanguage]);

  useEffect(() => {
    if (activeTab === "submissions" && id) {
      getSubmissionForProblem(id);
    }
  }, [activeTab, id]);

  useEffect(() => {
    if (executionSubmission && id) {
      getSubmissionForProblem(id);
    }
  }, [executionSubmission]);

  const handleRunCode = (e) => {
    e?.preventDefault();
    const language_id = getLanguageId(selectedLanguage);
    const stdin = testCases.map(tc => tc.input);
    const expected_outputs = testCases.map(tc => tc.output);
    executeCode(code, language_id, stdin, expected_outputs, id);
  };

  const handleSubmitCode = () => {
    const language_id = getLanguageId(selectedLanguage);
    submitCode(code, language_id, id);
  };

  // Hint, Suggestion, Review, Complexity, Space
  const handleCustomAI = async (tab) => {
    setActiveAiTab(tab);
    await getAIFeedback(problem.title, selectedLanguage, code);
  };

  // Failed button
  const handleFailed = async () => {
    setActiveAiTab("failed");
    const activeResult = executionSubmission || runResult;
    const failedTestCases = activeResult?.testCases?.filter(tc => !tc.passed) || [];
    await getFailedAnalysis(problem.title, selectedLanguage, code, failedTestCases);
  };

  // Optimize button
  const handleOptimize = async () => {
    setActiveAiTab("optimize");
    await getOptimizeAnalysis(problem.title, selectedLanguage, code);
  };

  if (isProblemLoading || !problem) {
    return (
      <div className="flex items-center justify-center h-screen">
        <span className="loading loading-spinner loading-lg text-primary"></span>
      </div>
    );
  }

  const renderTabContent = () => {
    switch (activeTab) {
      case "description":
        return (
          <div className="space-y-8">
            <p className="text-[15px] leading-relaxed text-gray-300">{problem.description}</p>
            {problem.examples?.length > 0 && (
              <div>
                <h3 className="text-lg font-semibold mb-3">Examples</h3>
                {problem.examples.map((ex, idx) => (
                  <div key={idx} className="bg-[#0d0d14] border border-white/10 rounded-lg p-4 mb-3">
                    <div className="font-mono text-sm space-y-1.5">
                      <div><span className="text-gray-500">Input:  </span><span className="text-white">{ex.input}</span></div>
                      <div><span className="text-gray-500">Output: </span><span className="text-emerald-400">{ex.output}</span></div>
                    </div>
                    {ex.explanation && (
                      <p className="mt-3 text-sm text-gray-400 border-t border-white/5 pt-3">
                        <span className="text-gray-400 font-medium">Explanation:</span> {ex.explanation}
                      </p>
                    )}
                  </div>
                ))}
              </div>
            )}
            {problem.constraints && (
              <div>
                <h3 className="text-lg font-semibold mb-3 flex items-center gap-2">
                  <span className="text-amber-400">⚠️</span> Constraints
                </h3>
                <div className="bg-amber-500/5 border border-amber-500/20 rounded-lg p-4">
                  <pre className="font-mono text-amber-300/80 text-sm whitespace-pre-wrap">
                    {problem.constraints}
                  </pre>
                </div>
              </div>
            )}
          </div>
        );
      case "submissions":
        return <SubmissionsList submissions={submissions} isLoading={isSubmissionsLoading} />;
      case "discussion":
        return <p className="text-lg opacity-70">No discussions yet</p>;
      case "hints":
        return problem.hints ? (
          <div className="bg-base-200 p-6 rounded-xl text-lg">{problem.hints}</div>
        ) : (
          <p className="text-lg opacity-70">No hints available</p>
        );
      default:
        return null;
    }
  };

  const customAiButtons = [
    { key: "hint", icon: <Lightbulb className="w-4 h-4" />, label: "Hint" },
    { key: "suggestion", icon: <Sparkles className="w-4 h-4" />, label: "Suggestion" },
    { key: "feedback", icon: <FileSearch className="w-4 h-4" />, label: "Review" },
    { key: "timeComplexity", icon: <BarChart2 className="w-4 h-4" />, label: "Complexity" },
    { key: "spaceComplexity", icon: <Database className="w-4 h-4" />, label: "Space" },
  ];

  return (
    <div className="min-h-screen w-full">
      {/* HEADER */}
      <nav className="bg-base-100 border-b border-white/5 px-5 py-3 pb-4 mb-2">
        <div className="flex items-center gap-3">
          <Link
            to="/"
            className="btn btn-ghost btn-sm btn-circle text-base-content/60 hover:text-primary hover:bg-primary/10 transition-colors"
          >
            <Home className="w-5 h-5" />
          </Link>
          <ChevronRight className="w-4 h-4 text-base-content/30" />

          <div className="flex flex-col gap-1.5">
            <div className="flex items-center gap-3">
              <h1 className="text-lg font-semibold tracking-tight">{problem.title}</h1>
              <div className={`badge badge-sm font-semibold ${problem.difficulty === "EASY"
                ? "badge-success text-success-content"
                : problem.difficulty === "MEDIUM"
                  ? "badge-warning text-warning-content"
                  : "badge-error text-error-content"
                }`}>
                {problem.difficulty
                  ? problem.difficulty.charAt(0) + problem.difficulty.slice(1).toLowerCase()
                  : "—"}
              </div>
            </div>
            <div className="flex items-center gap-2">
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1">
                <Users className="w-3 h-3" />
                {submissionCount} Submissions
              </span>
              <span className="flex items-center gap-1.5 text-xs text-gray-400 bg-white/5 rounded-full px-3 py-1">
                <ThumbsUp className="w-3 h-3" />
                95% Acceptance
              </span>
            </div>
          </div>
        </div>
      </nav>

      {/* MAIN */}
      <div className="p-5 grid grid-cols-1 lg:grid-cols-2 gap-6 min-h-[calc(100vh-96px)]">
        {/* LEFT */}
        <div className="card bg-base-100 shadow-xl rounded-xl border border-base-300 overflow-hidden flex flex-col">
          {/* Tabs */}
          <div className="border-b border-base-300 px-4 pt-1">
            <div className="flex gap-0">
              {["description", "submissions", "discussion", "hints"].map(tab => (
                <button
                  key={tab}
                  className={`px-4 py-2.5 text-sm transition-colors relative ${activeTab === tab
                    ? "text-violet-400 font-semibold"
                    : "text-gray-500 hover:text-gray-300"
                    }`}
                  onClick={() => setActiveTab(tab)}
                >
                  {tab.charAt(0).toUpperCase() + tab.slice(1)}
                  {activeTab === tab && (
                    <span className="absolute bottom-0 left-0 right-0 h-0.5 bg-violet-500 rounded-t" />
                  )}
                </button>
              ))}
            </div>
          </div>
          {/* Tab Content */}
          <div className="p-5 overflow-y-auto flex-1">
            {renderTabContent()}
          </div>
        </div>

        {/* RIGHT */}
        <div className="card bg-base-100 shadow-2xl flex flex-col">

          {/* EDITOR */}
          <div className="border-l-2 border-violet-500/20">
            <Editor
              height="calc(100vh - 380px)"
              language={selectedLanguage}
              theme="vs-dark"
              value={code}
              onChange={(v) => setCode(v || "")}
              options={{ fontSize: 16, minimap: { enabled: false }, lineNumbersMinChars: 3 }}
            />
          </div>

          {/* LANGUAGE + RUN + SUBMIT */}
          <div className="px-4 py-3 border-t border-white/10 flex items-center justify-between gap-3">
            {/* Language selector — left side */}
            <div className="flex items-center gap-2">
              <Code2 className="w-4 h-4 text-zinc-400" />
              <select
                className="select select-bordered select-sm bg-white/5 border-white/10 text-sm"
                value={selectedLanguage}
                onChange={(e) => setSelectedLanguage(e.target.value)}
              >
                {LANGUAGES.map(lang => (
                  <option key={lang.value} value={lang.value}>{lang.label}</option>
                ))}
              </select>
            </div>
            {/* Buttons — right side */}
            <div className="flex items-center gap-3">
              <button
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-violet-600 hover:bg-violet-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                onClick={handleRunCode}
                disabled={isExecuting || isSubmitting}
              >
                {isExecuting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Play className="w-4 h-4" />
                )}
                {isExecuting ? "Running..." : "Run Code"}
              </button>
              <button
                className="flex items-center gap-2 h-10 px-5 rounded-xl bg-emerald-600 hover:bg-emerald-700 text-white text-sm font-medium transition-colors disabled:opacity-50"
                onClick={handleSubmitCode}
                disabled={isExecuting || isSubmitting}
              >
                {isSubmitting ? (
                  <span className="loading loading-spinner loading-xs" />
                ) : (
                  <Upload className="w-4 h-4" />
                )}
                {isSubmitting ? "Submitting..." : "Submit"}
              </button>
            </div>
          </div>

          {/* AI BUTTONS */}
          <div className="px-4 py-3 bg-base-200 border-t border-white/10 space-y-2">
            {/* Row 1: Analysis */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 w-16 shrink-0">Analysis</span>
              <div className="flex flex-wrap gap-1.5">
                {customAiButtons.slice(0, 3).map(({ key, icon, label }) => (
                  <button
                    key={key}
                    className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border ${activeAiTab === key
                      ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                      : "bg-[#0d0d14] border-white/[0.08] text-gray-400 hover:border-violet-500/40 hover:bg-violet-500/[0.08] hover:text-gray-200"
                      }`}
                    onClick={() => handleCustomAI(key)}
                    disabled={aiFeedbackLoading}
                  >
                    {aiFeedbackLoading && activeAiTab === key ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : icon}
                    {label}
                  </button>
                ))}
              </div>
            </div>
            {/* Row 2: Performance */}
            <div className="flex items-center gap-2">
              <span className="text-[10px] uppercase tracking-widest text-gray-600 w-16 shrink-0">Perf</span>
              <div className="flex flex-wrap gap-1.5">
                {customAiButtons.slice(3).map(({ key, icon, label }) => (
                  <button
                    key={key}
                    className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border ${activeAiTab === key
                      ? "bg-violet-500/15 border-violet-500/40 text-violet-300"
                      : "bg-[#0d0d14] border-white/[0.08] text-gray-400 hover:border-violet-500/40 hover:bg-violet-500/[0.08] hover:text-gray-200"
                      }`}
                    onClick={() => handleCustomAI(key)}
                    disabled={aiFeedbackLoading}
                  >
                    {aiFeedbackLoading && activeAiTab === key ? (
                      <span className="loading loading-spinner loading-xs" />
                    ) : icon}
                    {label}
                  </button>
                ))}
                {/* Optimize */}
                <button
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border ${activeAiTab === "optimize"
                    ? "bg-emerald-500/15 border-emerald-500/40 text-emerald-300"
                    : "bg-[#0d0d14] border-white/[0.08] text-gray-400 hover:border-violet-500/40 hover:bg-violet-500/[0.08] hover:text-gray-200"
                    }`}
                  onClick={handleOptimize}
                  disabled={aiFeedbackLoading}
                >
                  {aiFeedbackLoading && activeAiTab === "optimize" ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : <Zap className="w-4 h-4" />}
                  Optimize
                </button>
                {/* Failed */}
                <button
                  className={`flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border ${activeAiTab === "failed"
                    ? "bg-red-500/15 border-red-500/40 text-red-300"
                    : "bg-[#0d0d14] border-white/[0.08] text-gray-400 hover:border-red-500/40 hover:bg-red-500/[0.08] hover:text-gray-200"
                    }`}
                  onClick={handleFailed}
                  disabled={aiFeedbackLoading}
                >
                  {aiFeedbackLoading && activeAiTab === "failed" ? (
                    <span className="loading loading-spinner loading-xs" />
                  ) : <Bug className="w-4 h-4" />}
                  Failed
                </button>
              </div>
            </div>
            {/* Re-analyze */}
            {feedback && (
              <button
                className="flex items-center gap-1.5 text-xs px-3 py-2 rounded-lg transition-all border bg-[#0d0d14] border-white/[0.08] text-gray-400 hover:border-violet-500/40 hover:bg-violet-500/[0.08] hover:text-gray-200 mt-1"
                onClick={() => handleCustomAI(activeAiTab)}
                disabled={aiFeedbackLoading}
              >
                🔄 Re-analyze
              </button>
            )}
          </div>

          {/* AI RESULT */}
          <div className="px-5 pb-4 bg-base-200">
            {aiFeedbackLoading && activeAiTab && (
              <div className="flex gap-2 items-center py-3 text-sm opacity-60">
                <span className="loading loading-dots loading-sm" />
                Analyzing your code...
              </div>
            )}
            {aiFeedbackError && (
              <div className="alert alert-error text-sm mt-2">{aiFeedbackError}</div>
            )}
            <AIResultCard
              activeAiTab={activeAiTab}
              feedback={feedback}
              failedAnalysis={failedAnalysis}
              optimizeAnalysis={optimizeAnalysis}
            />
          </div>
        </div>
      </div>

      {/* RUN RESULT */}
      {runResult && (
        <div className="mt-4 mb-4 bg-[#0d0d14] border border-white/10 rounded-xl overflow-hidden p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Play className="w-4 h-4 text-violet-400" /> Run Results
          </h2>
          <Submission submission={runResult} />
        </div>
      )}

      {/* SUBMIT RESULT */}
      {executionSubmission && (
        <div className="mt-4 mb-4 bg-[#0d0d14] border border-white/10 rounded-xl overflow-hidden p-6">
          <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
            <Upload className="w-4 h-4 text-emerald-400" /> Submission Results
          </h2>
          <Submission submission={executionSubmission} />
        </div>
      )}
    </div>
  );
};

export default ProblemPage;
