import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const useExecutionStore = create((set) => ({
  runResult: null,    // ✅ Run ka result — submissions list mein nahi jayega
  submission: null,   // ✅ Submit ka result — submissions list mein jayega
  isExecuting: false,
  isSubmitting: false,

  // ✅ RUN — sirf visible test cases
  executeCode: async (source_code, language_id, stdin, expected_outputs, problemId) => {
    const loadingToastId = toast.loading("Running code...");
    try {
      set({ isExecuting: true, runResult: null });

      const res = await axiosInstance.post("/execute", {
        source_code,
        language_id,
        stdin,
        expected_outputs,
        problemId,
        isSubmit: false,
      });

      const result = res?.data?.data;
      if (!result) throw new Error("No result returned from server");

      set({ runResult: result }); // ✅ runResult mein — submission nahi

      if (result.status?.toLowerCase().trim() === "accepted") {
        toast.success("✅ All visible tests passed!", { id: loadingToastId });
      } else {
        toast.error(`❌ ${result.status}`, { id: loadingToastId });
      }
    } catch (error) {
      console.error("Execution error:", error);
      toast.error(error?.response?.data?.message || "Execution failed", { id: loadingToastId });
      set({ runResult: null });
    } finally {
      set({ isExecuting: false });
    }
  },

  // ✅ SUBMIT — saare hidden test cases
  submitCode: async (source_code, language_id, problemId) => {
    const loadingToastId = toast.loading("Submitting code...");
    try {
      set({ isSubmitting: true, submission: null });

      const res = await axiosInstance.post("/execute", {
        source_code,
        language_id,
        stdin: [],
        expected_outputs: [],
        problemId,
        isSubmit: true,
      });

      const submission = res?.data?.data;
      if (!submission) throw new Error("No submission returned from server");

      set({ submission }); // ✅ submission mein — list mein jayega

      if (submission.status?.toLowerCase().trim() === "accepted") {
        toast.success("🎉 Accepted! Problem solved!", { id: loadingToastId });
      } else {
        toast.error(`❌ ${submission.status}`, { id: loadingToastId });
      }
    } catch (error) {
      console.error("Submit error:", error);
      toast.error(error?.response?.data?.message || "Submission failed", { id: loadingToastId });
      set({ submission: null });
    } finally {
      set({ isSubmitting: false });
    }
  },
}));