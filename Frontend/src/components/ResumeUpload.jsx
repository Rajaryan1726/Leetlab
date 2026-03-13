import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { useUploadStore } from "../store/useUploadStore";
import toast from "react-hot-toast";

const ResumeUpload = () => {
  const [file, setFile] = useState(null);
  const { uploadResume, loading, url, error, analysis } = useUploadStore();
  const navigate = useNavigate();

  const handleUpload = async () => {
    if (!file) {
      toast.error("Please select a file");
      return;
    }
    try {
      await uploadResume(file);
      toast.success("Resume uploaded & analyzed 🚀");
    } catch (err) {
      toast.error(err.message || "Upload failed");
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-white p-6">

      {/* UPLOAD CARD */}
      <div className="max-w-xl mx-auto bg-zinc-900 border border-zinc-800 rounded-xl p-6 shadow-lg">
        <h1 className="text-2xl font-bold mb-4 text-center">Upload Resume</h1>

        <input
          type="file"
          accept=".pdf"
          className="w-full mb-4 p-2 bg-zinc-800 border border-zinc-700 rounded-lg"
          onChange={(e) => setFile(e.target.files[0])}
        />

        <button
          onClick={handleUpload}
          className="w-full bg-indigo-600 hover:bg-indigo-700 transition py-2 rounded-lg font-semibold"
        >
          {loading ? "Uploading..." : "Upload Resume"}
        </button>

        {url && (
          <div className="mt-4 flex gap-3">
            <a
              href={`https://docs.google.com/viewer?url=${encodeURIComponent(url)}`}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-green-600 hover:bg-green-700 rounded-lg text-white transition"
            >
              View Resume
            </a>
            <a
              href={url}
              target="_blank"
              rel="noreferrer"
              className="px-4 py-2 bg-indigo-600 hover:bg-indigo-700 rounded-lg text-white transition"
            >
              Download Resume
            </a>
          </div>
        )}

        {error && <p className="mt-4 text-red-400 text-sm">{error}</p>}
      </div>

      {/* AI ANALYSIS */}
      {analysis && (
        <div className="max-w-5xl mx-auto mt-10 space-y-6">

          {/* CATEGORY BADGE */}
          {analysis.category && (
            <div className="p-4 rounded-xl bg-zinc-900 border border-indigo-500/40 flex items-center justify-between">
              <div className="flex items-center gap-3">
                <span className="text-2xl">🎯</span>
                <div>
                  <p className="text-xs text-zinc-400 mb-1">Detected Job Category</p>
                  <p className="text-lg font-bold text-indigo-400">
                    {analysis.category.replace(/-/g, " ")}
                  </p>
                </div>
              </div>
              <div className="text-right">
                <p className="text-xs text-zinc-400 mb-1">Model Confidence</p>
                <p className="text-lg font-bold text-green-400">
                  {analysis.categoryConfidence}%
                </p>
              </div>
            </div>
          )}

          {/* SCORE */}
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-xl font-bold mb-4">⭐ Overall Score</h2>
            <div className="flex items-center gap-4">
              <p className="text-4xl font-bold text-indigo-400 min-w-[80px]">
                {(analysis.score / 10).toFixed(1)}/10
              </p>
              <div className="w-full bg-zinc-800 h-3 rounded-full overflow-hidden">
                <div
                  className="h-full bg-indigo-500 transition-all duration-500"
                  style={{ width: `${analysis.score}%` }}
                />
              </div>
            </div>
            <p className="text-zinc-400 mt-3">
              Level: <span className="text-indigo-400 font-semibold">{analysis.level}</span>
            </p>
          </div>

          {/* SKILLS + MISSING KEYWORDS */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>⚡</span> Skills
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.skills?.map((skill, i) => (
                  <span key={i} className="px-3 py-1 bg-indigo-500/20 text-indigo-400 rounded-lg text-sm">
                    {skill}
                  </span>
                ))}
              </div>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>🔍</span>
                <span className="text-yellow-400">Missing Keywords</span>
              </h2>
              <div className="flex flex-wrap gap-2">
                {analysis.missingKeywords?.map((kw, i) => (
                  <span key={i} className="px-3 py-1 bg-yellow-500/20 text-yellow-400 rounded-lg text-sm">
                    {kw}
                  </span>
                ))}
              </div>
            </div>
          </div>

          {/* STRENGTHS + WEAKNESSES */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📈</span>
                <span className="text-green-400">Strengths</span>
              </h2>
              <ul className="space-y-2 text-zinc-300">
                {analysis.strengths?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-green-400 mt-1">✓</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>

            <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
              <h2 className="text-lg font-semibold mb-3 flex items-center gap-2">
                <span>📉</span>
                <span className="text-red-400">Weaknesses</span>
              </h2>
              <ul className="space-y-2 text-zinc-300">
                {analysis.weaknesses?.map((item, i) => (
                  <li key={i} className="flex items-start gap-2">
                    <span className="text-red-400 mt-1">✗</span>
                    {item}
                  </li>
                ))}
              </ul>
            </div>
          </div>

          {/* SUGGESTIONS */}
          <div className="p-6 rounded-xl bg-zinc-900 border border-zinc-800">
            <h2 className="text-lg font-semibold mb-4 flex items-center gap-2">
              <span>💡</span>
              <span className="text-cyan-400">Suggestions</span>
            </h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
              {analysis.suggestions?.map((item, i) => (
                <div key={i} className="p-3 bg-zinc-800 rounded-lg text-zinc-300 text-sm flex items-start gap-2">
                  <span className="text-cyan-400 mt-0.5">—</span>
                  {item}
                </div>
              ))}
            </div>
          </div>

          {/* MOCK INTERVIEW BUTTON */}
          <div className="flex justify-center pb-6">
            <button
             onClick={() => navigate("/mock-interview")}
              className="px-8 py-3 bg-indigo-600 hover:bg-indigo-700 transition rounded-xl font-semibold flex items-center gap-2"
            >
              💬 Start Mock Interview
            </button>
          </div>

        </div>
      )}
    </div>
  );
};

export default ResumeUpload;