import React, { useState, useEffect, useRef, useCallback } from "react";
import { useForm } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { Link } from "react-router-dom";
import {
  Code,
  Eye,
  EyeOff,
  Loader2,
  Lock,
  Mail,
  ArrowRight,
  Sparkles,
  Terminal,
  Zap,
  Bot,
  Users,
} from "lucide-react";
import { z } from "zod";
import { useAuthStore } from "../store/useAuthStore";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

/* ── Keyframes ── */
const pageStyles = `
@keyframes fadeInUp {
  from { opacity: 0; transform: translateY(24px); }
  to   { opacity: 1; transform: translateY(0); }
}
@keyframes shimmer {
  0%   { background-position: -200% 0; }
  100% { background-position: 200% 0; }
}
@keyframes float {
  0%, 100% { transform: translateY(0); }
  50%      { transform: translateY(-12px); }
}
@keyframes blink {
  0%, 100% { opacity: 1; }
  50%      { opacity: 0; }
}
.animate-fadeInUp {
  animation: fadeInUp 0.6s ease-out both;
}
.animate-fadeInUp-delay-1 {
  animation: fadeInUp 0.6s ease-out 0.15s both;
}
`;

/* ── Code Snippets for typewriter ── */
const codeSnippets = [
  {
    file: "two_sum.py",
    code: `def two_sum(nums, target):
    seen = {}
    for i, n in enumerate(nums):
        comp = target - n
        if comp in seen:
            return [seen[comp], i]
        seen[n] = i`,
    review: "O(n) time · O(n) space ✓",
  },
  {
    file: "binary_search.py",
    code: `def binary_search(arr, target):
    lo, hi = 0, len(arr) - 1
    while lo <= hi:
        mid = (lo + hi) // 2
        if arr[mid] == target:
            return mid
        elif arr[mid] < target:
            lo = mid + 1
        else:
            hi = mid - 1
    return -1`,
    review: "O(log n) time · O(1) space ✓",
  },
  {
    file: "valid_parens.js",
    code: `function isValid(s) {
  const stack = [];
  const map = {')':'(', ']':'[', '}':'{'};
  for (const c of s) {
    if (c in map) {
      if (stack.pop() !== map[c])
        return false;
    } else stack.push(c);
  }
  return stack.length === 0;
}`,
    review: "O(n) time · O(n) space ✓",
  },
];

/* ── Schema ── */
const LoginSchema = z.object({
  email: z.string().email("Enter a valid email"),
  password: z.string().min(6, "Password must be at least 6 characters"),
});

/* ── Typewriter Hook ── */
function useTypewriter(snippets, typingSpeed = 22, pauseBetween = 2000) {
  const [snippetIdx, setSnippetIdx] = useState(0);
  const [displayedText, setDisplayedText] = useState("");
  const [fade, setFade] = useState(true);
  const charIdx = useRef(0);
  const timerRef = useRef(null);

  const typeNext = useCallback(() => {
    const full = snippets[snippetIdx].code;
    if (charIdx.current < full.length) {
      charIdx.current++;
      setDisplayedText(full.slice(0, charIdx.current));
      timerRef.current = setTimeout(typeNext, typingSpeed);
    } else {
      timerRef.current = setTimeout(() => {
        setFade(false);
        setTimeout(() => {
          setSnippetIdx((prev) => (prev + 1) % snippets.length);
          charIdx.current = 0;
          setDisplayedText("");
          setFade(true);
        }, 400);
      }, pauseBetween);
    }
  }, [snippetIdx, snippets, typingSpeed, pauseBetween]);

  useEffect(() => {
    charIdx.current = 0;
    setDisplayedText("");
    timerRef.current = setTimeout(typeNext, 300);
    return () => clearTimeout(timerRef.current);
  }, [snippetIdx, typeNext]);

  return { displayedText, snippet: snippets[snippetIdx], fade };
}

/* ═══════════════════════════════════════════════
   LOGIN PAGE
   ═══════════════════════════════════════════════ */
const LoginPage = () => {
  const { isLoggingIn, login } = useAuthStore();
  const [showPassword, setShowPassword] = useState(false);
  const { displayedText, snippet, fade } = useTypewriter(codeSnippets);

  const {
    register,
    handleSubmit,
    formState: { errors },
  } = useForm({ resolver: zodResolver(LoginSchema) });

  const onSubmit = async (data) => {
    try {
      await login(data);
    } catch (error) {
      console.error("Login failed", error);
    }
  };

  const handleGoogleLogin = () => {
    window.location.href = `${BASE_URL}/api/v1/auth/google`;
  };

  const handleGithubLogin = () => {
    window.location.href = `${BASE_URL}/api/v1/auth/github`;
  };

  return (
    <div
      className="min-h-screen text-zinc-100 antialiased relative overflow-hidden"
      style={{
        background: "radial-gradient(ellipse at top left, #1e1040 0%, #0a0a0f 60%)",
      }}
    >
      <style>{pageStyles}</style>

      {/* ── Background layers ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(139,92,246,0.10),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.08),transparent_45%)]" />
      <div
        className="absolute inset-0 opacity-[0.03]"
        style={{
          backgroundImage:
            "linear-gradient(rgba(255,255,255,.08) 1px, transparent 1px), linear-gradient(90deg, rgba(255,255,255,.08) 1px, transparent 1px)",
          backgroundSize: "48px 48px",
        }}
      />

      <div className="relative min-h-screen flex flex-col">
        {/* ===== TWO-COLUMN GRID ===== */}
        <div className="flex-1 grid grid-cols-1 lg:grid-cols-2 items-stretch gap-6 px-12 py-8 max-w-[1200px] mx-auto w-full min-h-screen">
          {/* ═══════ LEFT — LOGIN FORM ═══════ */}
          <div className="flex flex-col justify-center items-center lg:items-end animate-fadeInUp min-h-full">
            <div className="relative w-full max-w-xl">
              <div className="relative rounded-2xl border border-white/5 bg-[#1a1625]/80 backdrop-blur-xl py-12 px-10 shadow-2xl space-y-6">
                {/* ── Logo + Brand ── */}
                <div className="flex items-center gap-3 mb-6">
                  <div className="flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-violet-700 to-violet-600 shadow-lg shadow-violet-600/15">
                    <Sparkles className="h-5 w-5 text-white" />
                  </div>
                  <div>
                    <h1 className="text-xl font-bold bg-gradient-to-r from-zinc-200 to-violet-300 bg-clip-text text-transparent">
                      LeetLab
                    </h1>
                    <p className="text-[11px] text-zinc-500 -mt-0.5">
                      Interview-ready platform
                    </p>
                  </div>
                </div>

                {/* ── Heading ── */}
                <div>
                  <h2 className="text-2xl font-semibold">Welcome back</h2>
                </div>

                {/* ── Form ── */}
                <form onSubmit={handleSubmit(onSubmit)} className="space-y-5">
                  {/* Email */}
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Email
                    </label>
                    <div className="relative mt-1.5">
                      <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type="email"
                        {...register("email")}
                        placeholder="you@example.com"
                        className={`w-full rounded-lg border bg-zinc-950/80 px-11 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 ${errors.email
                          ? "border-red-500"
                          : "border-zinc-800 hover:border-zinc-700"
                          }`}
                      />
                    </div>
                    {errors.email && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {errors.email.message}
                      </p>
                    )}
                  </div>

                  {/* Password */}
                  <div>
                    <label className="text-sm font-medium text-zinc-300">
                      Password
                    </label>
                    <div className="relative mt-1.5">
                      <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
                      <input
                        type={showPassword ? "text" : "password"}
                        {...register("password")}
                        placeholder="••••••••"
                        className={`w-full rounded-lg border bg-zinc-950/80 px-11 py-3 text-sm outline-none transition-all duration-200 focus:border-violet-500/60 focus:ring-1 focus:ring-violet-500/30 ${errors.password
                          ? "border-red-500"
                          : "border-zinc-800 hover:border-zinc-700"
                          }`}
                      />
                      <button
                        type="button"
                        onClick={() => setShowPassword(!showPassword)}
                        className="absolute right-4 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300 transition"
                      >
                        {showPassword ? (
                          <EyeOff size={16} />
                        ) : (
                          <Eye size={16} />
                        )}
                      </button>
                    </div>
                    {errors.password && (
                      <p className="text-red-400 text-xs mt-1.5">
                        {errors.password.message}
                      </p>
                    )}
                    <div className="flex justify-end mt-3">
                      <Link
                        to="/forgot-password"
                        className="text-violet-400 text-xs hover:text-violet-300 transition"
                      >
                        Forgot password?
                      </Link>
                    </div>
                  </div>

                  {/* Submit */}
                  <button
                    type="submit"
                    disabled={isLoggingIn}
                    className="signup-btn group relative w-full flex items-center justify-center gap-2 rounded-lg py-3 text-sm font-semibold text-white overflow-hidden transition-all duration-300 disabled:opacity-70 shadow-lg shadow-violet-600/15 hover:shadow-violet-600/25"
                    style={{
                      background:
                        "linear-gradient(135deg, #6d28d9 0%, #7c3aed 50%, #6d28d9 100%)",
                      backgroundSize: "200% auto",
                    }}
                  >
                    <style>{`
                      .signup-btn:hover {
                        background-position: right center !important;
                        filter: brightness(1.1);
                      }
                    `}</style>
                    <span className="relative flex items-center gap-2">
                      {isLoggingIn ? (
                        <>
                          <Loader2 className="animate-spin" size={16} />{" "}
                          Signing in…
                        </>
                      ) : (
                        <>
                          Sign in{" "}
                          <ArrowRight
                            size={16}
                            className="transition-transform duration-200 group-hover:translate-x-1"
                          />
                        </>
                      )}
                    </span>
                  </button>
                </form>

                {/* ── Don't have account ── */}
                <p className="text-center text-sm text-zinc-400">
                  Don&apos;t have an account?{" "}
                  <Link
                    to="/signup"
                    className="text-violet-400 hover:text-violet-300 font-medium transition"
                  >
                    Sign up
                  </Link>
                </p>

                {/* ── OR divider ── */}
                <div className="flex items-center gap-4">
                  <div className="flex-1 border-t border-white/10" />
                  <span className="text-xs text-gray-500/70 uppercase tracking-wider select-none">
                    or continue with
                  </span>
                  <div className="flex-1 border-t border-white/10" />
                </div>

                {/* ── Social Buttons ── */}
                <div className="grid grid-cols-2 gap-3">
                  {/* Google */}
                  <button
                    onClick={handleGoogleLogin}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4">
                      <path
                        d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"
                        fill="#4285F4"
                      />
                      <path
                        d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"
                        fill="#34A853"
                      />
                      <path
                        d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"
                        fill="#FBBC05"
                      />
                      <path
                        d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"
                        fill="#EA4335"
                      />
                    </svg>
                    Google
                  </button>

                  {/* GitHub */}
                  <button
                    onClick={handleGithubLogin}
                    className="flex items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm text-zinc-300 transition-all duration-200 hover:bg-white/10 hover:-translate-y-0.5 hover:shadow-lg hover:shadow-black/20"
                  >
                    <svg viewBox="0 0 24 24" className="h-4 w-4 fill-white">
                      <path d="M12 0C5.37 0 0 5.37 0 12c0 5.31 3.435 9.795 8.205 11.385.6.105.825-.255.825-.57 0-.285-.015-1.23-.015-2.235-3.015.555-3.795-.735-4.035-1.41-.135-.345-.72-1.41-1.23-1.695-.42-.225-1.02-.78-.015-.795.945-.015 1.62.87 1.845 1.23 1.08 1.815 2.805 1.305 3.495.99.105-.78.42-1.305.765-1.605-2.67-.3-5.46-1.335-5.46-5.925 0-1.305.465-2.385 1.23-3.225-.12-.3-.54-1.53.12-3.18 0 0 1.005-.315 3.3 1.23.96-.27 1.98-.405 3-.405s2.04.135 3 .405c2.295-1.56 3.3-1.23 3.3-1.23.66 1.65.24 2.88.12 3.18.765.84 1.23 1.905 1.23 3.225 0 4.605-2.805 5.625-5.475 5.925.435.375.81 1.095.81 2.22 0 1.605-.015 2.895-.015 3.3 0 .315.225.69.825.57A12.02 12.02 0 0 0 24 12c0-6.63-5.37-12-12-12z" />
                    </svg>
                    GitHub
                  </button>
                </div>
              </div>
            </div>
          </div>

          {/* ═══════ RIGHT — CODE ANIMATION PANEL ═══════ */}
          <div className="hidden lg:flex flex-col justify-center self-stretch animate-fadeInUp-delay-1">
            <div className="relative w-full max-w-xl self-stretch flex flex-col">
              {/* Subtle glow */}
              <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-l from-violet-500/15 via-fuchsia-500/10 to-transparent blur-sm" />

              <div className="relative flex-1 rounded-2xl overflow-hidden border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl flex flex-col justify-center pt-8 pb-8 px-10">
                {/* Background floating icons + code symbols */}
                <div className="absolute inset-0 overflow-hidden pointer-events-none">
                  <Code className="absolute top-[10%] left-[15%] h-8 w-8 text-violet-500/10 animate-pulse" />
                  <Terminal className="absolute top-[60%] left-[80%] h-10 w-10 text-fuchsia-500/10 animate-pulse" style={{ animationDelay: "0.5s" }} />
                  <Sparkles className="absolute top-[80%] left-[20%] h-7 w-7 text-purple-500/10 animate-pulse" style={{ animationDelay: "1s" }} />

                  {/* Floating code symbols */}
                  <span
                    className="absolute top-[18%] left-[72%] text-violet-500/[0.04] text-4xl font-mono font-bold select-none"
                    style={{ animation: "float 6s ease-in-out infinite" }}
                  >
                    {"{ }"}
                  </span>
                  <span
                    className="absolute top-[45%] left-[12%] text-fuchsia-500/[0.04] text-3xl font-mono font-bold select-none"
                    style={{ animation: "float 7s ease-in-out 1s infinite" }}
                  >
                    {"</>"}
                  </span>
                  <span
                    className="absolute top-[75%] left-[65%] text-purple-500/[0.04] text-3xl font-mono font-bold select-none"
                    style={{ animation: "float 8s ease-in-out 2s infinite" }}
                  >
                    {"=>"}
                  </span>
                </div>

                {/* ── Code editor card ── */}
                <div
                  className="relative z-10"
                  style={{ animation: "float 5s ease-in-out infinite" }}
                >
                  <div
                    className="rounded-xl overflow-hidden shadow-2xl"
                    style={{
                      boxShadow:
                        "0 0 40px rgba(139,92,246,0.12), 0 0 80px rgba(139,92,246,0.06), inset 0 0 0 1px rgba(139,92,246,0.15)",
                    }}
                  >
                    {/* Title bar */}
                    <div className="flex items-center gap-2 px-4 py-3 border-b border-zinc-800/80 bg-zinc-900/95">
                      <span className="h-3 w-3 rounded-full bg-red-500/70" />
                      <span className="h-3 w-3 rounded-full bg-yellow-500/70" />
                      <span className="h-3 w-3 rounded-full bg-green-500/70" />
                      <span
                        className="ml-3 text-xs text-zinc-500 flex items-center gap-1 transition-opacity duration-300"
                        style={{ opacity: fade ? 1 : 0 }}
                      >
                        <Terminal className="h-3 w-3" /> {snippet.file}
                      </span>
                    </div>

                    {/* Code with typewriter effect */}
                    <div
                      className="p-5 font-mono text-[13px] leading-relaxed bg-zinc-950/60 min-h-[180px] transition-opacity duration-400"
                      style={{ opacity: fade ? 1 : 0 }}
                    >
                      <pre className="text-emerald-400/90 whitespace-pre-wrap">
                        {displayedText}
                        <span
                          className="inline-block w-[2px] h-[14px] bg-violet-400 ml-0.5 align-middle"
                          style={{ animation: "blink 1s step-end infinite" }}
                        />
                      </pre>
                    </div>

                    {/* AI review bar */}
                    <div className="border-t border-zinc-800/80 bg-zinc-900/95 px-4 py-3 flex items-center gap-2">
                      <span className="relative flex h-2 w-2">
                        <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-emerald-400 opacity-75" />
                        <span className="relative inline-flex rounded-full h-2 w-2 bg-emerald-500" />
                      </span>
                      <span
                        className="text-xs text-emerald-400 transition-opacity duration-300"
                        style={{ opacity: fade ? 1 : 0 }}
                      >
                        AI Review: Optimal — {snippet.review}
                      </span>
                    </div>
                  </div>
                </div>

                {/* ── Stats Row ── */}
                <div className="relative z-10 mt-8 flex justify-center">
                  <div className="flex items-center gap-4 text-sm text-gray-400 bg-white/5 rounded-full px-6 py-2 border border-white/10">
                    <span className="flex items-center gap-1.5">
                      <Code className="h-3.5 w-3.5 text-violet-400" />
                      150+ Problems
                    </span>
                    <span className="w-px h-4 bg-zinc-700" />
                    <span className="flex items-center gap-1.5">
                      <Zap className="h-3.5 w-3.5 text-violet-400" />
                      Real-time Judge
                    </span>
                    <span className="w-px h-4 bg-zinc-700" />
                    <span className="flex items-center gap-1.5">
                      <Bot className="h-3.5 w-3.5 text-violet-400" />
                      AI Feedback
                    </span>
                  </div>
                </div>

                {/* ── Branding ── */}
                <div className="relative z-10 mt-6 text-center">
                  <h2 className="text-3xl font-bold text-violet-400">
                    LeetLab
                  </h2>
                  <p className="text-sm text-zinc-400 mt-1">
                    Interview-ready. Not just problem-solved.
                  </p>
                </div>

                {/* ── Social proof badge ── */}
                <div className="relative z-10 mt-4 flex justify-center">
                  <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full border border-zinc-800 bg-zinc-900/80 backdrop-blur text-xs text-zinc-400">
                    <Users className="h-3.5 w-3.5 text-violet-400" />
                    <span>Trusted by developers worldwide</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default LoginPage;