import React, { useState, useRef } from "react";
import toast from "react-hot-toast";
import { Camera } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { axiosInstance } from "../lib/axios";

const EditProfileModal = ({ onClose }) => {
  const { authUser, setAuthUser } = useAuthStore();
  const [bio, setBio] = useState(authUser?.bio || "");
  const [username, setUsername] = useState(authUser?.username || "");
  const [loading, setLoading] = useState(false);
  const [avatarPreview, setAvatarPreview] = useState(authUser?.avatar?.url || null);
  const [avatarFile, setAvatarFile] = useState(null);
  const fileInputRef = useRef(null);

  const handleAvatarChange = (e) => {
    const file = e.target.files[0];
    if (!file) return;
    setAvatarFile(file);
    setAvatarPreview(URL.createObjectURL(file));
  };

  const handleSave = async () => {
    try {
      setLoading(true);

      // 1. Avatar upload (agar naya file select kiya)
      if (avatarFile) {
        const formData = new FormData();
        formData.append("avatar", avatarFile);
        const avatarRes = await axiosInstance.post("/auth/update-avatar", formData, {
          headers: { "Content-Type": "multipart/form-data" },
        });
        setAuthUser(avatarRes.data.data.user);
      }

      // 2. Profile update (username + bio)
      const res = await axiosInstance.put("/auth/update-profile", { username, bio });
      setAuthUser(res.data.user);

      toast.success("Profile updated successfully");
      onClose();
    } catch (error) {
      toast.error(error.response?.data?.message || "Failed to update profile");
    } finally {
      setLoading(false);
    }
  };

  const defaultAvatar = `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser?.username || "guest"}`;

  return (
    <div className="fixed inset-0 flex items-center justify-center bg-black/60 backdrop-blur-sm z-50">
      <div className="w-full max-w-md rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl p-6 shadow-2xl">
        <h2 className="text-lg font-semibold text-zinc-100 mb-6">Edit Profile</h2>

        {/* Avatar Upload */}
        <div className="flex justify-center mb-6">
          <div className="relative group cursor-pointer" onClick={() => fileInputRef.current?.click()}>
            <img
              src={avatarPreview || defaultAvatar}
              alt="avatar"
              className="w-24 h-24 rounded-full object-cover border-2 border-zinc-700 group-hover:border-indigo-500 transition"
            />
            <div className="absolute inset-0 rounded-full bg-black/50 opacity-0 group-hover:opacity-100 transition flex items-center justify-center">
              <Camera className="w-6 h-6 text-white" />
            </div>
            <input
              ref={fileInputRef}
              type="file"
              accept="image/*"
              className="hidden"
              onChange={handleAvatarChange}
            />
          </div>
        </div>
        <p className="text-center text-xs text-zinc-500 -mt-4 mb-5">Click avatar to change</p>

        {/* Username */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">Username</label>
          <input
            type="text"
            placeholder="Enter your username"
            value={username}
            onChange={(e) => setUsername(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
          />
        </div>

        {/* Bio */}
        <div className="mb-4">
          <label className="block text-sm text-zinc-400 mb-1">Bio</label>
          <textarea
            rows={3}
            placeholder="Tell something about yourself..."
            value={bio}
            onChange={(e) => setBio(e.target.value)}
            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 resize-none"
          />
        </div>

        {/* Buttons */}
        <div className="flex justify-end gap-3 mt-6">
          <button
            onClick={onClose}
            className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500 transition"
          >
            Cancel
          </button>
          <button
            onClick={handleSave}
            disabled={loading}
            className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition disabled:opacity-50"
          >
            {loading ? "Saving..." : "Save"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default EditProfileModal;