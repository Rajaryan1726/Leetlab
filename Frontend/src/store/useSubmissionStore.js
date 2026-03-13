import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useSubmissionStore = create((set) => ({
  // ================== STATE ==================
  isLoading: false,

  submissions: [],
  submission: null,

  submissionCount: null, // per-problem count
  pagination: null,      // ✅ NEW (profile pagination)

  // ================== ACTIONS ==================

  // 🔹 OLD: get ALL submissions (no pagination) – keep as-is
  getAllSubmissions: async () => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        "/submission/get-all-submissions"
      );

      set({ submissions: res.data.data || [] });
      toast.success(res.data.message);
    } catch (error) {
      console.log("Error getting all submissions", error);
      toast.error("Error getting all submissions");
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 OLD: get submissions for a specific problem – keep as-is
  getSubmissionForProblem: async (problemId) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-submission/${problemId}`
      );

      set({ submissions: res.data.data || [] });
    } catch (error) {
      console.log("Error getting submissions for problem", error);
      toast.error("Error getting submissions for problem");
    } finally {
      set({ isLoading: false });
    }
  },

  // 🔹 OLD: get submission count for a problem – keep as-is
  getSubmissionCountForProblem: async (problemId) => {
    try {
      const res = await axiosInstance.get(
        `/submission/get-submissions-count/${problemId}`
      );

      set({ submissionCount: res.data.data.count });
    } catch (error) {
      console.log("Error getting submission count for problem", error);
      toast.error("Error getting submission count for problem");
    }
  },

  // ✅ NEW: PAGINATED submissions (Profile page)
  getUserSubmissionsPaginated: async (page = 1, limit = 20) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        `/submission/get-all-submissions?page=${page}&limit=${limit}`
      );

      const data = res.data.data;

      set({
        submissions: data?.submissions || [],
        pagination: data?.pagination || null,
      });
    } catch (error) {
      console.log("Error getting paginated submissions", error);
      toast.error("Error getting submissions");
    } finally {
      set({ isLoading: false });
    }
  },
}));
