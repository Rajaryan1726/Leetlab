import React, { useState } from "react";
import axios from "axios";
import toast from "react-hot-toast";
import { Loader2, Lock, Eye, EyeOff } from "lucide-react";

const ChangePasswordModal = ({ onClose }) => {
  const [oldPassword, setOldPassword] = useState("");
  const [newPassword, setNewPassword] = useState("");
  const [loading, setLoading] = useState(false);

  // 👇 password visibility states
  const [showOldPassword, setShowOldPassword] = useState(false);
  const [showNewPassword, setShowNewPassword] = useState(false);

  const handleChangePassword = async () => {
    if (!oldPassword || !newPassword) {
      toast.error("All fields are required");
      return;
    }

    try {
      setLoading(true);

      await axios.post(
        "http://localhost:3000/api/v1/auth/changepassword",
        { oldPassword, newPassword },
        { withCredentials: true }
      );

      toast.success("Password changed successfully");
      onClose();
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to change password"
      );
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60 backdrop-blur-sm">

      {/* Card */}
      <div className="relative w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl space-y-5">

        <h2 className="text-lg font-semibold text-center">
          Change Password
        </h2>

        {/* Old Password */}
        <div>
          <label className="text-sm text-zinc-400">Old Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

            <input
              type={showOldPassword ? "text" : "password"}
              value={oldPassword}
              onChange={(e) => setOldPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-10 py-2.5 text-sm outline-none focus:border-indigo-500"
              placeholder="Enter old password"
            />

            <button
              type="button"
              onClick={() => setShowOldPassword(!showOldPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showOldPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* New Password */}
        <div>
          <label className="text-sm text-zinc-400">New Password</label>
          <div className="relative mt-1">
            <Lock className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />

            <input
              type={showNewPassword ? "text" : "password"}
              value={newPassword}
              onChange={(e) => setNewPassword(e.target.value)}
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-10 py-2.5 text-sm outline-none focus:border-indigo-500"
              placeholder="Enter new password"
            />

            <button
              type="button"
              onClick={() => setShowNewPassword(!showNewPassword)}
              className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-500 hover:text-zinc-300"
            >
              {showNewPassword ? <EyeOff size={16} /> : <Eye size={16} />}
            </button>
          </div>
        </div>

        {/* Buttons */}
        <div className="flex gap-3 pt-2">
          <button
            onClick={onClose}
            className="w-full rounded-lg border border-zinc-700 py-2.5 text-sm font-medium hover:border-zinc-500 transition"
          >
            Cancel
          </button>

          <button
            onClick={handleChangePassword}
            disabled={loading}
            className="w-full flex items-center justify-center gap-2 rounded-lg bg-indigo-600 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition disabled:opacity-70"
          >
            {loading && <Loader2 className="h-4 w-4 animate-spin" />}
            Update
          </button>
        </div>
      </div>
    </div>
  );
};

export default ChangePasswordModal;
