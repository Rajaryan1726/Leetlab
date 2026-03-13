import React, { useState, useEffect } from "react";
import {
  Sparkles,
  Bot,
  Code2,
  Play,
  Flame,
  BarChart3,
  ArrowRight,
  Github,
  Twitter,
  Terminal,
  ChevronRight,
} from "lucide-react";

/* ── Keyframes ── */
const globalStyles = `
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50% { transform: translateY(-15px); }
}
`;

/* ── Code Snippets ── */
const codeSnippets = [
  {
    file: "solution.py",
    lines: [
      [
        { text: "def", cls: "text-fuchsia-400" },
        { text: " " },
        { text: "two_sum", cls: "text-cyan-400" },
        { text: "(nums, target):", cls: "text-zinc-400" },
      ],
      [
        { text: "    seen", cls: "text-zinc-500" },
        { text: " = {}", cls: "text-zinc-400" },
      ],
      [
        { text: "    for", cls: "text-fuchsia-400" },
        { text: " i, n ", cls: "text-zinc-300" },
        { text: "in", cls: "text-fuchsia-400" },
        { text: " enumerate", cls: "text-cyan-400" },
        { text: "(nums):", cls: "text-zinc-400" },
      ],
      [
        { text: "        comp", cls: "text-zinc-500" },
        { text: " = target - n", cls: "text-zinc-400" },
      ],
      [
        { text: "        if", cls: "text-fuchsia-400" },
        { text: " comp ", cls: "text-zinc-300" },
        { text: "in", cls: "text-fuchsia-400" },
        { text: " seen:", cls: "text-zinc-300" },
      ],
      [
        { text: "            return", cls: "text-fuchsia-400" },
        { text: " [seen[comp], i]", cls: "text-zinc-400" },
      ],
      [
        { text: "        seen[n]", cls: "text-zinc-500" },
        { text: " = i", cls: "text-zinc-400" },
      ],
    ],
    review: "AI Review: Optimal — O(n) time, O(n) space ✓",
  },
  {
    file: "binary_search.py",
    lines: [
      [
        { text: "def", cls: "text-fuchsia-400" },
        { text: " " },
        { text: "binary_search", cls: "text-cyan-400" },
        { text: "(arr, target):", cls: "text-zinc-400" },
      ],
      [
        { text: "    lo, hi", cls: "text-zinc-500" },
        { text: " = 0, len(arr) - 1", cls: "text-zinc-400" },
      ],
      [
        { text: "    while", cls: "text-fuchsia-400" },
        { text: " lo <= hi:", cls: "text-zinc-300" },
      ],
      [
        { text: "        mid", cls: "text-zinc-500" },
        { text: " = (lo + hi) // 2", cls: "text-zinc-400" },
      ],
      [
        { text: "        if", cls: "text-fuchsia-400" },
        { text: " arr[mid] == target:", cls: "text-zinc-300" },
      ],
      [
        { text: "            return", cls: "text-fuchsia-400" },
        { text: " mid", cls: "text-zinc-400" },
      ],
      [
        { text: "        elif", cls: "text-fuchsia-400" },
        { text: " arr[mid] < target:", cls: "text-zinc-300" },
      ],
      [
        { text: "            lo", cls: "text-zinc-500" },
        { text: " = mid + 1", cls: "text-zinc-400" },
      ],
      [
        { text: "        else:", cls: "text-fuchsia-400" },
      ],
      [
        { text: "            hi", cls: "text-zinc-500" },
        { text: " = mid - 1", cls: "text-zinc-400" },
      ],
    ],
    review: "AI Review: Optimal — O(log n) time, O(1) space ✓",
  },
  {
    file: "valid_parens.js",
    lines: [
      [
        { text: "function", cls: "text-fuchsia-400" },
        { text: " " },
        { text: "isValid", cls: "text-cyan-400" },
        { text: "(s) {", cls: "text-zinc-400" },
      ],
      [
        { text: "  const", cls: "text-fuchsia-400" },
        { text: " stack ", cls: "text-zinc-500" },
        { text: "= [];", cls: "text-zinc-400" },
      ],
      [
        { text: "  const", cls: "text-fuchsia-400" },
        { text: " map ", cls: "text-zinc-500" },
        { text: "= { ')':'(', ']':'[', '}':'{' };", cls: "text-zinc-400" },
      ],
      [
        { text: "  for", cls: "text-fuchsia-400" },
        { text: " (", cls: "text-zinc-400" },
        { text: "const", cls: "text-fuchsia-400" },
        { text: " c ", cls: "text-zinc-300" },
        { text: "of", cls: "text-fuchsia-400" },
        { text: " s) {", cls: "text-zinc-400" },
      ],
      [
        { text: "    if", cls: "text-fuchsia-400" },
        { text: " (c ", cls: "text-zinc-300" },
        { text: "in", cls: "text-fuchsia-400" },
        { text: " map) {", cls: "text-zinc-300" },
      ],
      [
        { text: "      if", cls: "text-fuchsia-400" },
        { text: " (stack.pop() !== map[c])", cls: "text-zinc-300" },
      ],
      [
        { text: "        return", cls: "text-fuchsia-400" },
        { text: " false;", cls: "text-zinc-400" },
      ],
      [
        { text: "    } ", cls: "text-zinc-400" },
        { text: "else", cls: "text-fuchsia-400" },
        { text: " stack.push(c);", cls: "text-zinc-400" },
      ],
      [
        { text: "  }", cls: "text-zinc-400" },
      ],
      [
        { text: "  return", cls: "text-fuchsia-400" },
        { text: " stack.length === 0;", cls: "text-zinc-400" },
      ],
      [
        { text: "}", cls: "text-zinc-400" },
      ],
    ],
    review: "AI Review: Optimal — O(n) time, O(n) space ✓",
  },
];

/* ── Feature card configs ── */
const features = [
  {
    icon: Bot,
    title: "AI Code Review & Scoring",
    desc: "Instant, line-by-line AI feedback with scoring.",
    gradient: "from-indigo-500 to-purple-600",
    iconBg: "bg-indigo-500/20",
    iconGlow: "shadow-indigo-500/30",
    iconColor: "text-indigo-400",
    cardBg: "bg-gradient-to-br from-indigo-950/40 to-zinc-900/70",
    borderHover: "hover:border-indigo-500/60",
    glowColor: "from-indigo-500 via-purple-500 to-indigo-600",
  },
  {
    icon: Sparkles,
    title: "AI Interviewer",
    desc: "Adaptive AI that asks real interview follow-ups.",
    gradient: "from-cyan-500 to-teal-500",
    iconBg: "bg-cyan-500/20",
    iconGlow: "shadow-cyan-500/30",
    iconColor: "text-cyan-400",
    cardBg: "bg-gradient-to-br from-cyan-950/40 to-zinc-900/70",
    borderHover: "hover:border-cyan-500/60",
    glowColor: "from-cyan-400 via-teal-500 to-cyan-600",
  },
  {
    icon: Code2,
    title: "Real-time Execution",
    desc: "Live test case feedback without refresh.",
    gradient: "from-emerald-500 to-green-500",
    iconBg: "bg-emerald-500/20",
    iconGlow: "shadow-emerald-500/30",
    iconColor: "text-emerald-400",
    cardBg: "bg-gradient-to-br from-emerald-950/40 to-zinc-900/70",
    borderHover: "hover:border-emerald-500/60",
    glowColor: "from-emerald-400 via-green-500 to-emerald-600",
  },
  {
    icon: Flame,
    title: "Playlists & Streaks",
    desc: "Structured learning with streak tracking.",
    gradient: "from-amber-500 to-orange-500",
    iconBg: "bg-amber-500/20",
    iconGlow: "shadow-amber-500/30",
    iconColor: "text-amber-400",
    cardBg: "bg-gradient-to-br from-amber-950/40 to-zinc-900/70",
    borderHover: "hover:border-amber-500/60",
    glowColor: "from-amber-400 via-orange-500 to-amber-600",
  },
  {
    icon: BarChart3,
    title: "Skill-based Analytics",
    desc: "Measure readiness, not just solved count.",
    gradient: "from-rose-500 to-pink-500",
    iconBg: "bg-rose-500/20",
    iconGlow: "shadow-rose-500/30",
    iconColor: "text-rose-400",
    cardBg: "bg-gradient-to-br from-rose-950/40 to-zinc-900/70",
    borderHover: "hover:border-rose-500/60",
    glowColor: "from-rose-400 via-pink-500 to-rose-600",
  },
];

/* ── Step configs ── */
const steps = [
  { num: "01", label: "Solve Problems", numGrad: "from-indigo-400 to-violet-400", glowClr: "from-indigo-500/60 to-violet-500/60" },
  { num: "02", label: "AI Reviews Code", numGrad: "from-cyan-400 to-teal-400", glowClr: "from-cyan-500/60 to-teal-500/60" },
  { num: "03", label: "Get Scored", numGrad: "from-emerald-400 to-green-400", glowClr: "from-emerald-500/60 to-green-500/60" },
  { num: "04", label: "Improve Skills", numGrad: "from-amber-400 to-orange-400", glowClr: "from-amber-500/60 to-orange-500/60" },
  { num: "05", label: "Interview Ready", numGrad: "from-rose-400 to-pink-400", glowClr: "from-rose-500/60 to-pink-500/60" },
];

function LandingPage() {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [fade, setFade] = useState(true);

  useEffect(() => {
    const interval = setInterval(() => {
      setFade(false);
      setTimeout(() => {
        setSnippetIdx((prev) => (prev + 1) % codeSnippets.length);
        setFade(true);
      }, 300);
    }, 3000);
    return () => clearInterval(interval);
  }, []);

  const currentSnippet = codeSnippets[snippetIdx];

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased relative overflow-x-hidden">
      <style>{globalStyles}</style>

      {/* ── Glow Blobs ── */}
      <div className="pointer-events-none fixed inset-0">
        <div className="absolute -top-32 -left-32 h-[500px] w-[500px] rounded-full bg-indigo-600/25 blur-[120px]" />
        <div className="absolute bottom-0 right-0 h-[400px] w-[400px] rounded-full bg-fuchsia-600/15 blur-[100px]" />
      </div>

      {/* ── Header ── */}
      <header className="relative z-10 mx-auto max-w-7xl px-6 py-6 flex items-center justify-between">
        <div className="flex items-center gap-2 font-semibold text-lg">
          <Sparkles className="h-5 w-5 text-indigo-400" />
          <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent font-bold">
            LeetLab
          </span>
        </div>
        <nav className="hidden md:flex items-center gap-6 text-sm text-zinc-300">
          <a href="#features" className="hover:text-white transition">Features</a>
          <a href="#how" className="hover:text-white transition">How it works</a>
          <a href="#cta" className="hover:text-white transition">Start</a>
          <a
            href="/login"
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm hover:border-zinc-500 transition"
          >
            Login
          </a>
        </nav>
      </header>

      {/* ── Hero ── */}
      <section className="relative z-10 mx-auto max-w-7xl px-6 pt-20 pb-28">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Left – Copy */}
          <div className="text-center lg:text-left">
            <h1 className="text-5xl md:text-7xl font-extrabold leading-[1.1] tracking-tight">
              <span className="bg-gradient-to-r from-indigo-400 via-fuchsia-400 to-cyan-400 bg-clip-text text-transparent">
                Beyond LeetCode.
              </span>
              <br className="hidden sm:block" />
              Train with AI.
              <br className="hidden sm:block" />
              Get Interview-Ready.
            </h1>
            <p className="mt-6 text-lg text-zinc-300 max-w-2xl mx-auto lg:mx-0">
              AI-powered reviews, real-time execution feedback, mock interviews,
              and skill-based analytics — built for real interviews.
            </p>

            <div className="mt-10 flex gap-4 flex-wrap justify-center lg:justify-start">
              <a
                href="/signup"
                className="group inline-flex items-center gap-2 rounded-lg bg-indigo-600 px-6 py-3 font-medium hover:bg-indigo-500 transition shadow-lg shadow-indigo-500/25"
              >
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
              <a
                href="/demo"
                className="inline-flex items-center gap-2 rounded-lg border border-zinc-700 px-6 py-3 hover:border-zinc-500 transition"
              >
                Try Demo <Play className="h-4 w-4" />
              </a>
            </div>
          </div>

          {/* Right – Code Editor Mockup with cycling snippets */}
          <div className="relative flex items-center justify-center">
            <div className="absolute inset-0 rounded-2xl bg-gradient-to-br from-indigo-500/30 via-fuchsia-500/20 to-cyan-500/30 blur-[60px] scale-125" />

            <div
              className="relative w-full max-w-lg"
              style={{ animation: "float 4s ease-in-out infinite" }}
            >
              <div
                className="relative w-full rounded-2xl bg-zinc-900/80 backdrop-blur-xl shadow-2xl overflow-hidden"
                style={{
                  boxShadow:
                    "0 0 30px rgba(99,102,241,0.15), 0 0 60px rgba(99,102,241,0.08), inset 0 0 0 1px rgba(99,102,241,0.2)",
                }}
              >
                {/* Pulsing glow border */}
                <div
                  className="absolute -inset-[1px] rounded-2xl pointer-events-none"
                  style={{
                    background:
                      "linear-gradient(135deg, rgba(99,102,241,0.5), rgba(168,85,247,0.3), rgba(99,102,241,0.5))",
                    mask: "linear-gradient(#fff 0 0) content-box, linear-gradient(#fff 0 0)",
                    maskComposite: "exclude",
                    WebkitMaskComposite: "xor",
                    padding: "1.5px",
                    animation: "pulse 3s ease-in-out infinite",
                  }}
                />

                {/* Title bar */}
                <div className="flex items-center gap-2 px-5 py-3.5 border-b border-zinc-800/80 bg-zinc-900/90">
                  <span className="h-3 w-3 rounded-full bg-red-500/80" />
                  <span className="h-3 w-3 rounded-full bg-yellow-500/80" />
                  <span className="h-3 w-3 rounded-full bg-green-500/80" />
                  <span className="ml-3 text-xs text-zinc-500 flex items-center gap-1">
                    <Terminal className="h-3 w-3" /> {currentSnippet.file}
                  </span>
                </div>

                {/* Code with fade transition */}
                <div
                  className="p-6 font-mono text-sm leading-relaxed min-h-[260px] transition-opacity duration-300"
                  style={{ opacity: fade ? 1 : 0 }}
                >
                  {currentSnippet.lines.map((line, i) => (
                    <p key={i} className="whitespace-pre">
                      {line.map((token, j) => (
                        <span key={j} className={token.cls || ""}>
                          {token.text}
                        </span>
                      ))}
                    </p>
                  ))}
                </div>

                {/* AI review bar */}
                <div className="border-t border-zinc-800/80 bg-zinc-900/90 px-5 py-3.5 flex items-center gap-2">
                  <span className="relative flex h-2 w-2">
                    <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                    <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                  </span>
                  <span
                    className="text-xs text-emerald-400 transition-opacity duration-300"
                    style={{ opacity: fade ? 1 : 0 }}
                  >
                    {currentSnippet.review}
                  </span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </section>

      {/* ── Features ── */}
      <section id="features" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-semibold mb-14">
          Built for modern interviews
        </h2>

        <div className="grid gap-8 sm:grid-cols-2 lg:grid-cols-3">
          {features.map((f, i) => (
            <FeatureCard key={i} {...f} />
          ))}
        </div>
      </section>

      {/* ── How it works ── */}
      <section id="how" className="relative z-10 mx-auto max-w-7xl px-6 py-24">
        <h2 className="text-3xl md:text-4xl font-semibold mb-16">
          How it works
        </h2>

        <div className="grid gap-6 md:grid-cols-5 relative">
          {/* Connecting dotted line (desktop) */}
          <div
            className="hidden md:block absolute top-1/2 left-[10%] right-[10%] h-[2px] -translate-y-1/2"
            style={{
              backgroundImage:
                "linear-gradient(90deg, rgba(139,92,246,0.5) 6px, transparent 6px)",
              backgroundSize: "18px 2px",
            }}
          />

          {steps.map((step, idx) => (
            <StepCard key={idx} {...step} isLast={idx === 4} />
          ))}
        </div>
      </section>

      {/* ── CTA ── */}
      <section id="cta" className="relative z-10 mx-auto max-w-7xl px-6 py-28">
        {/* Thin gradient border wrapper */}
        <div
          className="rounded-2xl p-[1.5px]"
          style={{
            background: "linear-gradient(135deg, #a855f7, #ec4899, #a855f7)",
          }}
        >
          <div
            className="relative rounded-2xl overflow-hidden"
            style={{
              background:
                "linear-gradient(135deg, #0a0a0f 0%, #1a0533 50%, #0a0a0f 100%)",
            }}
          >
            {/* Glowing orbs – deep purple / magenta */}
            <div
              className="absolute -top-24 -left-24 h-80 w-80 rounded-full blur-3xl"
              style={{ background: "rgba(147,51,234,0.25)" }}
            />
            <div
              className="absolute -bottom-24 -right-24 h-80 w-80 rounded-full blur-3xl"
              style={{ background: "rgba(219,39,119,0.2)" }}
            />
            <div
              className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 h-64 w-64 rounded-full blur-3xl"
              style={{ background: "rgba(126,34,206,0.12)" }}
            />

            {/* Floating particles */}
            <div className="absolute top-10 left-12 h-1.5 w-1.5 rounded-full bg-purple-400/40 animate-pulse" />
            <div className="absolute top-1/3 right-20 h-2 w-2 rounded-full bg-fuchsia-400/30 animate-pulse" style={{ animationDelay: "0.5s" }} />
            <div className="absolute bottom-16 left-1/4 h-2 w-2 rounded-full bg-pink-400/30 animate-pulse" style={{ animationDelay: "1s" }} />
            <div className="absolute bottom-10 right-1/3 h-1.5 w-1.5 rounded-full bg-purple-300/30 animate-pulse" style={{ animationDelay: "1.5s" }} />

            {/* Grid pattern overlay */}
            <div
              className="absolute inset-0 opacity-[0.03]"
              style={{
                backgroundImage:
                  "linear-gradient(rgba(255,255,255,.1) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.1) 1px, transparent 1px)",
                backgroundSize: "40px 40px",
              }}
            />

            <div className="relative p-12 md:p-20 text-center">
              <h3
                className="text-3xl md:text-5xl font-bold max-w-2xl mx-auto leading-tight"
                style={{
                  background: "linear-gradient(to right, #ffffff, #e9d5ff)",
                  WebkitBackgroundClip: "text",
                  WebkitTextFillColor: "transparent",
                  backgroundClip: "text",
                }}
              >
                Stop grinding problems.
                <br />
                Start training for interviews.
              </h3>
              <p className="mt-5 text-zinc-400 text-lg max-w-xl mx-auto">
                Interview-ready &gt; problem-solved. Join thousands of developers
                leveling up with LeetLab's AI-powered platform.
              </p>
              <a
                href="/signup"
                className="group mt-10 inline-flex items-center gap-2 rounded-lg px-8 py-3.5 font-semibold transition-all duration-300 bg-white text-zinc-900 hover:bg-gradient-to-r hover:from-purple-600 hover:to-pink-600 hover:text-white shadow-lg shadow-purple-500/10 hover:shadow-purple-500/30"
              >
                Sign Up Free
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </a>
            </div>
          </div>
        </div>
      </section>

      {/* ── Footer ── */}
      <footer className="relative z-10 border-t border-zinc-800">
        <div className="mx-auto max-w-7xl px-6 py-12">
          <div className="flex flex-col md:flex-row justify-between items-center gap-8">
            <div className="flex flex-col items-center md:items-start gap-3">
              <div className="flex items-center gap-2 font-semibold text-lg">
                <Sparkles className="h-5 w-5 text-indigo-400" />
                <span className="bg-gradient-to-r from-indigo-400 to-fuchsia-400 bg-clip-text text-transparent font-bold">
                  LeetLab
                </span>
              </div>
              <p className="text-sm text-zinc-500">
                © 2026 LeetLab. Built for developers who mean business.
              </p>
            </div>

            <nav className="flex items-center gap-6 text-sm text-zinc-400">
              <a href="#features" className="hover:text-white transition">Features</a>
              <a href="/problems" className="hover:text-white transition">Problems</a>
              <a href="/login" className="hover:text-white transition">Login</a>
            </nav>

            <div className="flex gap-4 text-zinc-400">
              <Github className="h-5 w-5 hover:text-white transition cursor-pointer" />
              <Twitter className="h-5 w-5 hover:text-white transition cursor-pointer" />
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}

/* ── Components ── */

function FeatureCard({
  icon: Icon,
  title,
  desc,
  iconBg,
  iconGlow,
  iconColor,
  cardBg,
  borderHover,
  glowColor,
}) {
  return (
    <div className="relative group">
      {/* Hover glow */}
      <div
        className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-r ${glowColor} opacity-0 blur-md transition duration-500 group-hover:opacity-70`}
      />
      <div
        className={`relative rounded-2xl border border-zinc-800/80 ${cardBg} backdrop-blur-xl p-6 transition duration-300 group-hover:-translate-y-1.5 ${borderHover}`}
      >
        {/* Icon */}
        <div
          className={`flex items-center justify-center h-12 w-12 rounded-xl ${iconBg} ${iconColor} mb-5 shadow-lg ${iconGlow} transition group-hover:scale-110`}
        >
          <Icon className="h-6 w-6" />
        </div>
        <h3 className="font-semibold text-lg text-zinc-100">{title}</h3>
        <p className="mt-2 text-sm text-zinc-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
}

function StepCard({ num, label, numGrad, glowClr, isLast }) {
  return (
    <div className="relative flex flex-col items-center group">
      {/* Mobile connecting arrow */}
      {!isLast && (
        <div className="md:hidden flex justify-center py-2 text-zinc-600">
          <ChevronRight className="h-5 w-5 rotate-90" />
        </div>
      )}

      <div className="relative w-full">
        {/* Hover glow */}
        <div
          className={`absolute -inset-0.5 rounded-2xl bg-gradient-to-br ${glowClr} opacity-0 blur-sm transition duration-500 group-hover:opacity-80`}
        />

        <div className="relative flex flex-col items-center justify-center rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl px-6 py-10 transition duration-300 group-hover:-translate-y-1 group-hover:border-zinc-700">
          {/* Step number */}
          <span
            className={`text-3xl font-black bg-gradient-to-br ${numGrad} bg-clip-text text-transparent mb-3`}
          >
            {num}
          </span>
          <span className="font-medium text-zinc-200 group-hover:text-white transition text-center">
            {label}
          </span>
        </div>
      </div>
    </div>
  );
}

export default LandingPage;
