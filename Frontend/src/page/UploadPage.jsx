import React, { useState, useRef, useCallback } from "react";
import {
  UploadCloud,
  FileText,
  X,
  CheckCircle2,
  AlertCircle,
  Loader2,
  ArrowLeft,
  Star,
  Zap,
  TrendingUp,
  TrendingDown,
  Search,
  Lightbulb,
  MessageSquare,
  Sparkles,
  Shield,
  Target,
} from "lucide-react";
import { useNavigate } from "react-router-dom";
import { useUploadStore } from "../store/useUploadStore";

const MAX_FILE_SIZE_MB = 5;

const formatBytes = (bytes) => {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return `${parseFloat((bytes / Math.pow(k, i)).toFixed(2))} ${sizes[i]}`;
};

const UploadPage = () => {
  const navigate = useNavigate();
  const { uploadResume, loading, url, error, analysis } = useUploadStore();

  const [file, setFile] = useState(null);
  const [dragOver, setDragOver] = useState(false);
  const [validationError, setValidationError] = useState(null);
  const [success, setSuccess] = useState(false);
  const inputRef = useRef(null);

  const validateAndSet = useCallback((f) => {
    setValidationError(null);
    setSuccess(false);
    if (!f) return;
    if (f.type !== "application/pdf") {
      setValidationError("Only PDF files are accepted.");
      return;
    }
    if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
      setValidationError(`File exceeds the ${MAX_FILE_SIZE_MB} MB limit.`);
      return;
    }
    setFile(f);
  }, []);

  const handleDrop = useCallback(
    (e) => {
      e.preventDefault();
      setDragOver(false);
      validateAndSet(e.dataTransfer.files[0]);
    },
    [validateAndSet]
  );
  const handleDragOver = (e) => { e.preventDefault(); setDragOver(true); };
  const handleDragLeave = () => setDragOver(false);
  const handleFileChange = (e) => { validateAndSet(e.target.files[0]); e.target.value = ""; };
  const handleRemove = () => { setFile(null); setValidationError(null); setSuccess(false); };

  const handleUpload = async () => {
    if (!file) return;
    setSuccess(false);
    const ok = await uploadResume(file);
    if (ok) {
      setSuccess(true);
      setFile(null);
    }
  };

  const displayError = validationError || error;

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased relative px-4 py-16 overflow-hidden"
      style={{ background: "linear-gradient(135deg, #1a0533 0%, #0d0118 40%, #080010 100%)" }}
    >
      {/* Glow blobs */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 left-1/4 h-[500px] w-[500px] rounded-full bg-violet-600/20 blur-[120px]" />
        <div className="absolute bottom-0 right-1/4 h-[400px] w-[400px] rounded-full bg-violet-600/15 blur-[100px]" />
      </div>

      {/* Back button */}
      <button
        onClick={() => navigate(-1)}
        className="absolute top-6 left-6 flex items-center gap-2 text-gray-400 hover:text-white transition-colors text-sm group"
      >
        <ArrowLeft className="w-4 h-4 group-hover:-translate-x-0.5 transition-transform" />
        Back
      </button>

      {/* HEADER */}
      <div className="relative z-10 w-full max-w-2xl mx-auto text-center mb-8">
        <div className="inline-flex items-center gap-2 bg-violet-500/10 border border-violet-500/20 rounded-full px-4 py-1.5 mb-4">
          <Sparkles className="w-3.5 h-3.5 text-violet-400" />
          <span className="text-xs text-violet-400 font-medium">AI-Powered Analysis</span>
        </div>
        <h1 className="text-3xl font-bold text-white mb-2">Upload Your Resume</h1>
        <p className="text-gray-400 text-sm mb-8">
          Our AI will analyze your resume and personalize your interview preparation
        </p>
        <div className="flex flex-wrap gap-3 justify-center mb-8">
          {[
            { icon: "🎯", label: "Skill Gap Analysis" },
            { icon: "📊", label: "Personalized Problems" },
            { icon: "🤖", label: "AI Interview Prep" },
          ].map((pill) => (
            <span
              key={pill.label}
              className="bg-white/5 border border-white/10 hover:border-violet-500/40 hover:bg-violet-500/10 hover:-translate-y-0.5 rounded-full px-4 py-1.5 text-xs text-gray-400 flex items-center gap-1.5 transition-all duration-200 cursor-default"
            >
              <span>{pill.icon}</span> {pill.label}
            </span>
          ))}
        </div>
      </div>

      {/* UPLOAD CARD */}
      <div className="relative z-10 w-full max-w-xl mx-auto">
        <div className="relative bg-[#12121a]/90 border border-violet-500/15 rounded-2xl backdrop-blur-sm shadow-2xl shadow-violet-500/5 p-10 flex flex-col gap-6">

          {!file ? (
            <div
              onDrop={handleDrop}
              onDragOver={handleDragOver}
              onDragLeave={handleDragLeave}
              onClick={() => inputRef.current?.click()}
              className="flex flex-col items-center justify-center gap-4 cursor-pointer select-none transition-all duration-300"
              style={{
                borderRadius: "16px",
                padding: "48px",
                border: dragOver ? "2px dashed rgba(139, 92, 246, 0.7)" : "2px dashed rgba(139, 92, 246, 0.4)",
                background: dragOver ? "rgba(139, 92, 246, 0.08)" : "rgba(139, 92, 246, 0.03)",
                transform: dragOver ? "scale(1.01)" : "scale(1)",
              }}
            >
              <UploadCloud className="h-10 w-10 text-violet-400 animate-bounce" />
              <div className="text-center space-y-1.5">
                <p className="text-sm font-medium text-white">
                  {dragOver ? "Drop your resume here" : "Drag & drop your resume here"}
                </p>
                <p className="text-xs text-zinc-500">
                  or{" "}
                  <span className="text-violet-400 font-semibold underline underline-offset-2 hover:text-violet-300 transition-colors">
                    click to browse
                  </span>
                </p>
                <p className="text-xs text-gray-600">PDF only • Max 5 MB</p>
              </div>
              <input ref={inputRef} type="file" accept="application/pdf" className="hidden" onChange={handleFileChange} />
            </div>
          ) : (
            <div className="flex items-center gap-4 p-4 bg-white/5 border border-white/10 rounded-xl transition-all">
              <div className="w-12 h-12 bg-red-500/10 border border-red-500/20 rounded-xl flex items-center justify-center shrink-0">
                <FileText className="w-6 h-6 text-red-400" />
              </div>
              <div className="flex-1 min-w-0">
                <p className="text-white font-medium text-sm truncate">{file.name}</p>
                <p className="text-gray-500 text-xs mt-0.5">{formatBytes(file.size)} • PDF</p>
              </div>
              <button onClick={handleRemove} className="p-1.5 rounded-lg hover:bg-white/5 transition-colors group" title="Remove file">
                <X className="w-4 h-4 text-gray-500 group-hover:text-red-400 transition-colors" />
              </button>
            </div>
          )}

          {displayError && (
            <div className="flex items-start gap-3 rounded-xl border border-rose-500/20 bg-rose-500/10 px-4 py-3 text-sm text-rose-400">
              <AlertCircle className="h-4 w-4 mt-0.5 shrink-0" />
              <span>{displayError}</span>
            </div>
          )}

          {success && (
            <div className="flex items-start gap-3 rounded-xl border border-emerald-500/20 bg-emerald-500/10 px-4 py-3 text-sm text-emerald-400">
              <CheckCircle2 className="h-4 w-4 mt-0.5 shrink-0" />
              <span>
                Resume uploaded successfully!{" "}
                {url && (
                  <a
                    href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="underline underline-offset-2 text-emerald-300 hover:text-emerald-200"
                  >
                    View file →
                  </a>
                )}
              </span>
            </div>
          )}

          <div>
            <button
              onClick={handleUpload}
              disabled={!file || loading}
              className={`w-full flex items-center justify-center gap-2 rounded-xl px-6 py-3 text-sm font-semibold transition-all duration-300
                ${!file || loading
                  ? "bg-white/5 text-gray-600 cursor-not-allowed border border-white/5 opacity-40"
                  : "bg-gradient-to-r from-violet-600 to-purple-600 text-white cursor-pointer hover:brightness-110 shadow-[0_4px_20px_-4px_rgba(109,40,217,0.5)] border border-violet-400/20"
                }`}
            >
              {loading ? (
                <><Loader2 className="h-4 w-4 animate-spin" /> Uploading & Analyzing…</>
              ) : (
                <><UploadCloud className="h-4 w-4" /> Analyze Resume</>
              )}
            </button>
            {loading && (
              <div className="h-1 bg-white/10 rounded-full mt-3 overflow-hidden">
                <div className="h-full bg-violet-500 rounded-full transition-all duration-500 w-full animate-pulse" />
              </div>
            )}
          </div>

          <div className="flex items-center justify-center gap-2">
            <Shield className="w-3.5 h-3.5 text-emerald-400" />
            <span className="text-xs text-gray-500">Your resume is encrypted and only visible to you</span>
          </div>
        </div>
      </div>

      {/* AI ANALYSIS */}
      {analysis && (
        <div className="relative z-10 max-w-5xl mx-auto mt-12 space-y-6">
          <h2 className="text-2xl font-bold text-center text-white mb-8">AI Resume Analysis</h2>

          {/* CATEGORY BADGE */}
          {analysis.category && (
            <div className="rounded-2xl border border-violet-500/30 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-violet-500/5 flex items-center justify-between">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-violet-500/10 border border-violet-500/20 flex items-center justify-center">
                  <Target className="h-6 w-6 text-violet-400" />
                </div>
                <div>
                  <p className="text-xs text-gray-500 mb-1">Detected Job Category</p>
                  <p className="text-xl font-bold text-violet-400">
                    {analysis.category.replace(/-/g, " ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-gray-500 mb-1">Model Confidence</p>
                <p className="text-2xl font-bold text-emerald-400">{analysis.categoryConfidence}%</p>
                <div className="w-24 h-1.5 bg-white/10 rounded-full mt-1.5 overflow-hidden ml-auto">
                  <div
                    className="h-full bg-emerald-400 rounded-full transition-all duration-700"
                    style={{ width: `${analysis.categoryConfidence}%` }}
                  />
                </div>
              </div>
            </div>
          )}

          {/* Score */}
          <div className="rounded-2xl border border-violet-500/20 bg-[#12121a]/90 backdrop-blur-xl p-6 shadow-lg shadow-violet-500/5">
            <div className="flex items-center gap-2 mb-4">
              <Star className="h-5 w-5 text-violet-400" />
              <h3 className="text-lg font-bold text-white">Overall Score</h3>
            </div>
            <div className="flex items-center gap-4">
              <p className="text-5xl font-bold text-violet-400 min-w-[90px]">
                {(analysis.score / 10).toFixed(1)}
                <span className="text-2xl text-gray-500">/10</span>
              </p>
              <div className="flex-1">
                <div className="w-full bg-white/10 h-3 rounded-full overflow-hidden">
                  <div
                    className="h-full bg-gradient-to-r from-violet-600 to-purple-500 transition-all duration-700"
                    style={{ width: `${analysis.score}%` }}
                  />
                </div>
                <p className="text-sm text-gray-400 mt-2">
                  Level: <span className="text-violet-400 font-semibold capitalize">{analysis.level}</span>
                </p>
              </div>
            </div>
          </div>

          {/* 2-col grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="rounded-2xl border border-violet-500/20 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-violet-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Zap className="h-5 w-5 text-violet-400" />
                <h3 className="text-lg font-bold text-white">Skills</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-md text-sm font-medium border border-violet-500/20 text-violet-300 bg-violet-500/10">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-amber-500/20 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-amber-500/5">
              <div className="flex items-center gap-2 mb-4">
                <Search className="h-5 w-5 text-amber-400" />
                <h3 className="text-lg font-bold text-amber-400">Missing Keywords</h3>
              </div>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((kw, i) => (
                  <span key={i} className="px-3 py-1.5 rounded-md text-sm font-medium border border-amber-500/20 text-amber-400 bg-amber-500/10">
                    {kw}
                  </span>
                ))}
              </div>
            </div>

            <div className="rounded-2xl border border-emerald-500/20 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-emerald-500/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingUp className="h-5 w-5 text-emerald-400" />
                <h3 className="text-lg font-bold text-emerald-400">Strengths</h3>
              </div>
              <ul className="space-y-2">
                {analysis.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-emerald-400 mt-0.5">✓</span>{item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="rounded-2xl border border-rose-500/20 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-rose-500/5">
              <div className="flex items-center gap-2 mb-4">
                <TrendingDown className="h-5 w-5 text-rose-400" />
                <h3 className="text-lg font-bold text-rose-400">Weaknesses</h3>
              </div>
              <ul className="space-y-2">
                {analysis.weaknesses?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2 text-gray-300 text-sm">
                    <span className="text-rose-400 mt-0.5">✗</span>{item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* Suggestions */}
          <div className="rounded-2xl border border-cyan-500/20 bg-[#12121a]/90 backdrop-blur-xl p-5 shadow-lg shadow-cyan-500/5">
            <div className="flex items-center gap-2 mb-4">
              <Lightbulb className="h-5 w-5 text-cyan-400" />
              <h3 className="text-lg font-bold text-cyan-400">Suggestions</h3>
            </div>
            <ul className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.suggestions?.map((item, i) => (
                <li key={i} className="flex items-start gap-2 text-gray-300 text-sm bg-white/3 rounded-lg p-3">
                  <span className="text-cyan-400 mt-0.5">→</span>{item}
                </li>
              ))}
            </ul>
          </div>

          {/* ✅ Start Mock Interview — navigate to /mock-interview */}
          <div className="flex justify-center pt-4 pb-2">
            <button
              onClick={() => navigate("/mock-interview")}
              className="flex items-center gap-2 rounded-xl bg-gradient-to-r from-violet-600 to-purple-600 hover:brightness-110 px-8 py-3 text-sm font-semibold text-white transition shadow-lg shadow-violet-500/25"
            >
              <MessageSquare className="h-5 w-5" />
              Start Mock Interview
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default UploadPage;