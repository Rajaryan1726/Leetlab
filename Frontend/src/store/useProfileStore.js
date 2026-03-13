import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useProfileStore = create((set) => ({
  /* ================= SOLVED PROBLEMS ================= */
  solvedProblems: [],
  solvedCount: 0,
  isSolvedLoading: false,

  fetchSolvedProblems: async () => {
    try {
      set({ isSolvedLoading: true });

      const res = await axiosInstance.get(
        "/problems/problems-solved-by-user"
      );

      const data = res?.data?.data;

      set({
        solvedProblems: data?.problems || [],
        solvedCount: data?.count || 0,
      });
    } catch (error) {
      console.error("Error fetching solved problems", error);
      toast.error("Failed to load solved problems");
    } finally {
      set({ isSolvedLoading: false });
    }
  },

  /* ================= STREAK ================= */
  streak: {
    current: 0,
    longest: 0,
  },
  isStreakLoading: false,

  fetchStreak: async () => {
    try {
      set({ isStreakLoading: true });

      const res = await axiosInstance.get("/auth/streak");

      set({
        streak: {
          current: res.data.data.currentStreak,
          longest: res.data.data.longestStreak,
        },
      });
    } catch (error) {
      console.error("Failed to fetch streak", error);
      toast.error("Failed to load streak");
    } finally {
      set({ isStreakLoading: false });
    }
  },
}));
