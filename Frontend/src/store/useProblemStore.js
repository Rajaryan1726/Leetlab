import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import { toast } from "react-hot-toast";

export const useProblemStore = create((set) => ({
  problems: [],
  problem: null,
  solvedProblems: [],
  isProblemsLoading: false,
  isProblemLoading: false,

 getAllProblems: async () => {
  try {
    set({ isProblemsLoading: true });

    const res = await axiosInstance.get("/problems/all-problems");

    set({
      problems: Array.isArray(res.data?.data)
        ? res.data.data
        : [],
    });
  } catch (error) {
    console.log("Error getting all problems", error);

    toast.error(
      error?.response?.data?.message || "Error in getting problems"
    );

    // 👇 SAFETY fallback
    set({ problems: [] });
  } finally {
    set({ isProblemsLoading: false });
  }
},


  getProblemById: async (id) => {
    try {
      set({ isProblemLoading: true });

      const res = await axiosInstance.get(`/problems/getproblembyid/${id}`);

      
   set({ problem: res.data.data });
    toast.success(res.data.message);

    } catch (error) {
      console.log("Error getting all problems", error);
      toast.error("Error in getting problems");
    } finally {
      set({ isProblemLoading: false });
    }
  },

  getSolvedProblemByUser: async () => {
    try {
      const res = await axiosInstance.get("/problems/get-solved-problem");

      set({ solvedProblems: res.data.problems });
    } catch (error) {
      console.log("Error getting solved problems", error);
      toast.error("Error getting solved problems");
    }
  }

  
}));