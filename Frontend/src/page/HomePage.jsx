import React, { useEffect } from "react";
import { Loader, Code2, Terminal } from "lucide-react";
import { useProblemStore } from "../store/useProblemStore";
import ProblemTable from "../components/ProblemTable";

const HomePage = () => {
  const { getAllProblems, problems, isProblemsLoading } = useProblemStore();

  useEffect(() => {
    getAllProblems();
  }, [getAllProblems]);

  /* ── Loading state ── */
  if (isProblemsLoading) {
    return (
      <div className="flex flex-col items-center justify-center min-h-screen bg-zinc-950 relative overflow-hidden">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(99,102,241,0.12),transparent_60%)]" />
        <div className="relative flex flex-col items-center gap-6">
          <div className="relative">
            <div className="absolute -inset-4 rounded-full bg-indigo-500/20 blur-xl animate-pulse" />
            <div className="relative flex items-center justify-center h-16 w-16 rounded-2xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20">
              <Terminal className="h-8 w-8 text-indigo-400 animate-pulse" />
            </div>
          </div>
          <div className="flex items-center gap-3">
            <Loader className="h-5 w-5 animate-spin text-indigo-400" />
            <span className="text-sm text-zinc-500 font-medium">Loading problems…</span>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased relative overflow-hidden">

      {/* ── Background layers ── */}
      <div className="absolute inset-0">
        {/* Subtle grid pattern */}
        <div
          className="absolute inset-0 opacity-[0.03]"
          style={{
            backgroundImage: "linear-gradient(rgba(161,161,170,0.5) 1px, transparent 1px), linear-gradient(90deg, rgba(161,161,170,0.5) 1px, transparent 1px)",
            backgroundSize: "64px 64px",
          }}
        />

        {/* Radial gradients */}
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_20%_20%,rgba(99,102,241,0.15),transparent_50%),radial-gradient(circle_at_80%_80%,rgba(236,72,153,0.12),transparent_50%),radial-gradient(circle_at_50%_50%,rgba(139,92,246,0.08),transparent_60%)]" />

        {/* Floating orbs */}
        <div
          className="absolute top-[10%] left-[8%] w-80 h-80 rounded-full bg-indigo-500 opacity-20 blur-3xl"
          style={{ animation: "floatOrb 8s ease-in-out infinite" }}
        />
        <div
          className="absolute bottom-[10%] right-[8%] w-72 h-72 rounded-full bg-pink-500 opacity-20 blur-3xl"
          style={{ animation: "floatOrb 10s ease-in-out infinite reverse" }}
        />
        <div
          className="absolute top-[45%] left-[45%] w-48 h-48 rounded-full bg-purple-500 opacity-20 blur-3xl"
          style={{ animation: "floatOrb 12s ease-in-out infinite" }}
        />
      </div>

      <div className="relative z-10 flex flex-col items-center px-6 pt-16 pb-12">

        {/* ══════════ HERO SECTION ══════════ */}
        <div className="max-w-3xl text-center mb-8">

          {/* Title */}
          <h1 className="text-6xl md:text-7xl font-extrabold tracking-tight leading-[1.1]">
            Welcome to{" "}
            <span className="bg-gradient-to-r from-indigo-400 via-purple-400 to-pink-400 bg-clip-text text-transparent">
              LeetLab
            </span>
          </h1>

          {/* Subtitle */}
          <p className="mt-6 text-xl text-zinc-400 leading-[1.8] max-w-2xl mx-auto">
            Master algorithms, ace technical interviews, and level up your coding skills
            with our curated collection of problems.
          </p>
        </div>

        {/* ── Animated gradient divider ── */}
        <div className="w-full max-w-md mb-8 h-px relative">
          <div
            className="absolute inset-0 bg-gradient-to-r from-transparent via-indigo-500/60 to-transparent"
            style={{ animation: "shimmerLine 3s ease-in-out infinite" }}
          />
        </div>

        {/* ══════════ PROBLEMS TABLE ══════════ */}
        <div className="w-full max-w-6xl">
          {problems.length > 0 ? (
            <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden pt-4">
              {/* Top gradient line */}
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <ProblemTable problems={problems} />
            </div>
          ) : (
            <div className="relative rounded-2xl border border-zinc-800/80 bg-zinc-900/60 backdrop-blur-xl p-16 text-center shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden">
              <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-transparent via-indigo-500/50 to-transparent" />
              <Code2 className="h-12 w-12 text-zinc-700 mx-auto mb-4" />
              <p className="text-zinc-400 font-medium">No problems found</p>
              <p className="text-xs text-zinc-600 mt-1">Check back later for new problems!</p>
            </div>
          )}
        </div>
      </div>

      {/* ── Keyframe animations ── */}
      <style>{`
        @keyframes floatOrb {
          0%, 100% { transform: translateY(0px); }
          50% { transform: translateY(-30px); }
        }
        @keyframes shimmerLine {
          0%, 100% { opacity: 0.4; transform: scaleX(0.8); }
          50% { opacity: 1; transform: scaleX(1); }
        }
      `}</style>
    </div>
  );
};

export default HomePage;