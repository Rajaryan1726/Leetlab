import { useParams, useNavigate } from "react-router-dom";
import { useEffect, useState } from "react";
import axios from "axios";
import { Loader2, CheckCircle2, XCircle, Mail, ArrowRight } from "lucide-react";

const VerifyUser = () => {
  const { token } = useParams();
  const navigate = useNavigate();
  const [status, setStatus] = useState("loading"); // loading | success | error
  const [message, setMessage] = useState("");

  useEffect(() => {
    const verifyEmail = async () => {
      try {
        await axios.get(
          `http://localhost:3000/api/v1/auth/verify/${token}`
        );

        setStatus("success");
        setMessage("Your account is ready.");

        // redirect after 3 seconds
        setTimeout(() => {
          navigate("/login");
        }, 3000);

      } catch (error) {
        setStatus("error");
        setMessage(
          error.response?.data?.message || "Failed to verify email. The link may be invalid or expired."
        );
      }
    };

    verifyEmail();
  }, [token, navigate]);

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.16),transparent_45%)]" />

      {/* Main card */}
      <div className="relative z-10 w-full max-w-md mx-6">
        {/* Glassmorphism card with gradient border */}
        <div className="relative">
          <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/40 to-cyan-500/40 blur-sm" />

          <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-10 shadow-2xl">

            {/* Loading State */}
            {status === "loading" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-indigo-500/10">
                    <Loader2 className="h-8 w-8 text-indigo-400 animate-spin" />
                  </div>
                </div>
                <div>
                  <h1 className="text-2xl font-semibold">Verifying your email...</h1>
                  <p className="text-sm text-zinc-400 mt-2">Please wait while we confirm your account.</p>
                </div>
              </div>
            )}

            {/* Success State */}
            {status === "success" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-emerald-500/10 animate-in zoom-in duration-300">
                    <CheckCircle2 className="h-8 w-8 text-emerald-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold">Email verified successfully</h1>
                  <p className="text-sm text-zinc-400">{message}</p>
                </div>

                <button
                  onClick={() => navigate("/login")}
                  className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition"
                >
                  Go to Login
                  <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                </button>

                <p className="text-xs text-zinc-500">
                  Redirecting automatically in 3 seconds...
                </p>
              </div>
            )}

            {/* Error State */}
            {status === "error" && (
              <div className="text-center space-y-6">
                <div className="flex justify-center">
                  <div className="flex h-16 w-16 items-center justify-center rounded-full bg-red-500/10 animate-in zoom-in duration-300">
                    <XCircle className="h-8 w-8 text-red-400" />
                  </div>
                </div>
                <div className="space-y-2">
                  <h1 className="text-2xl font-semibold text-red-400">Verification failed</h1>
                  <p className="text-sm text-zinc-400">{message}</p>
                </div>

                <div className="space-y-3">
                  <button
                    onClick={() => navigate("/login")}
                    className="group w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition"
                  >
                    Go to Login
                    <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
                  </button>

                  <button
                    onClick={() => navigate("/signup")}
                    className="w-full flex items-center justify-center gap-2 rounded-lg border border-zinc-700 py-2.5 text-sm hover:bg-zinc-800 transition"
                  >
                    <Mail className="h-4 w-4" />
                    Resend verification email
                  </button>
                </div>
              </div>
            )}

          </div>
        </div>
      </div>
    </div>
  );
};

export default VerifyUser;
