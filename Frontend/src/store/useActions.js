import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";
import { useProblemStore } from "./useProblemStore";

export const useActions = create((set) => ({
  isDeletingProblem: false,
  isUpdatingProblem: false,

  onDeleteProblem: async (id) => {
    try {
      set({ isDeletingProblem: true });

      const res = await axiosInstance.delete(`/problems/deleteproblem/${id}`);

      // realtime remove
      useProblemStore.setState((state) => ({
        problems: state.problems.filter((p) => p._id !== id),
      }));

      toast.success(res.data.message || "Problem deleted");
    } catch (error) {
      toast.error("Error deleting problem");
    } finally {
      set({ isDeletingProblem: false });
    }
  },

  // ✅ UPDATE PROBLEM
  onUpdateProblem: async (id, updatedData) => {
    try {
      set({ isUpdatingProblem: true });

      const res = await axiosInstance.put(
        `/problems/updateproblem/${id}`,
        updatedData
      );

      const updatedProblem = res.data.problem;

      // realtime update
      useProblemStore.setState((state) => ({
        problems: state.problems.map((p) =>
          p._id === id ? updatedProblem : p
        ),
      }));

      toast.success("Problem updated successfully");
      return updatedProblem;
    } catch (error) {
      toast.error("Error updating problem");
      throw error;
    } finally {
      set({ isUpdatingProblem: false });
    }
  },
}));
