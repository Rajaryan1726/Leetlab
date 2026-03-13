import { useNavigate, useLocation } from "react-router-dom";
import { Mail, ArrowRight, RefreshCw } from "lucide-react";
import axios from "axios";
import toast from "react-hot-toast";

const VerifyInfoPage = () => {
  const navigate = useNavigate();
  const location = useLocation();

  // SignupPage se email aayega
  const email = location.state?.email;

  const handleResendEmail = async () => {
    try {
      if (!email) {
        toast.error("Email not found. Please signup again.");
        return;
      }

      await axios.post(
        "http://localhost:3000/api/v1/auth/resend-email-verification",
        { email }
      );

      toast.success("Verification email sent again!");
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to resend email"
      );
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center relative overflow-hidden antialiased">

      {/* ── Background ── */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_75%_80%,rgba(236,72,153,0.16),transparent_45%)]" />

      {/* Floating orbs */}
      <div className="absolute top-1/4 left-1/4 w-72 h-72 bg-indigo-600/10 rounded-full blur-[120px] animate-pulse" />
      <div className="absolute bottom-1/4 right-1/4 w-64 h-64 bg-pink-600/10 rounded-full blur-[100px] animate-pulse" style={{ animationDelay: "1.5s" }} />
      <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-96 h-96 bg-purple-600/5 rounded-full blur-[140px]" />

      {/* ── Main card ── */}
      <div className="relative z-10 w-full max-w-md mx-6">
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)] overflow-hidden">

          {/* Gradient top line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500" />

          <div className="p-10 sm:p-12 text-center space-y-7">

            {/* ── Mail Icon ── */}
            <div className="flex justify-center">
              <div className="relative">
                {/* Pulsing glow */}
                <div className="absolute -inset-3 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-xl animate-pulse" />
                <div className="relative flex h-20 w-20 items-center justify-center rounded-full bg-gradient-to-br from-indigo-600/20 to-purple-600/20 border border-indigo-500/20">
                  <Mail className="h-9 w-9 text-indigo-400" />
                </div>
              </div>
            </div>

            {/* ── Title ── */}
            <div className="space-y-3">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                Check your email
              </h1>
              <p className="text-sm text-zinc-400 leading-relaxed">
                We've sent you a verification link to
              </p>
              {email && (
                <p className="text-indigo-400 text-sm font-semibold underline underline-offset-4 decoration-indigo-500/40">
                  {email}
                </p>
              )}
            </div>

            {/* ── Buttons ── */}
            <div className="space-y-3 pt-1">
              <button
                onClick={handleResendEmail}
                className="group w-full flex items-center justify-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 py-3 text-sm font-semibold text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 active:scale-[0.98] transition-all"
              >
                <RefreshCw className="h-4 w-4 group-hover:rotate-180 transition-transform duration-500" />
                Resend verification email
              </button>

              <button
                onClick={() => navigate("/login")}
                className="group w-full flex items-center justify-center gap-2 rounded-xl border border-zinc-700 py-3 text-sm font-medium text-zinc-300 hover:border-indigo-500/50 hover:text-white hover:bg-zinc-800/60 transition-all"
              >
                Go to Login
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </button>
            </div>

            <p className="text-xs text-zinc-500 pt-1 leading-relaxed">
              Didn't receive the email? Check your spam folder.
            </p>

          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyInfoPage;
