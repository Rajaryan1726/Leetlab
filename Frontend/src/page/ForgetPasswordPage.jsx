import { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Mail, ArrowRight, Loader2 } from "lucide-react";

const ForgotPasswordPage = () => {
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();

    if (!email) {
      toast.error("Please enter your email");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3000/api/v1/auth/forgetpassword",
        { email }
      );

      toast.success("Reset link sent to your email");

    } catch (error) {
      toast.error(
        error.response?.data?.message || "Something went wrong"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 flex items-center justify-center relative overflow-hidden">
      {/* Background glow */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_30%_20%,rgba(99,102,241,0.18),transparent_45%),radial-gradient(circle_at_70%_80%,rgba(236,72,153,0.16),transparent_45%)]" />

      <div className="relative z-10 w-full max-w-md mx-6">
        {/* Gradient border */}
        <div className="absolute -inset-[1px] rounded-2xl bg-gradient-to-r from-indigo-500/40 via-fuchsia-500/40 to-cyan-500/40 blur-sm" />

        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/80 backdrop-blur-xl p-8 shadow-2xl space-y-6">

          <h1 className="text-2xl font-semibold text-center">
            Forgot Password
          </h1>

          <p className="text-sm text-zinc-400 text-center">
            Enter your email and we'll send you a reset link.
          </p>

          <form onSubmit={handleSubmit} className="space-y-4">
            <div className="relative">
              <Mail className="absolute left-3 top-3 h-4 w-4 text-zinc-500" />
              <input
                type="email"
                placeholder="you@example.com"
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-10 py-2.5 text-sm outline-none focus:border-indigo-500"
              />
            </div>

            <button
              type="submit"
              disabled={loading}
              className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-semibold hover:bg-indigo-500 transition disabled:opacity-70"
            >
              {loading ? (
                <>
                  <Loader2 className="animate-spin" size={16} />
                  Sending...
                </>
              ) : (
                <>
                  Send Reset Link
                  <ArrowRight size={16} />
                </>
              )}
            </button>
          </form>

        </div>
      </div>
    </div>
  );
};

export default ForgotPasswordPage;
