import { create } from "zustand";
import { uploadResumeAPI } from "../api/upload.api";

export const useUploadStore = create((set) => ({
  loading: false,
  url: null,
  analysis: null,
  error: null,

  uploadResume: async (file) => {
    try {
      set({ loading: true, error: null });

      const res = await uploadResumeAPI(file);
      console.log("FULL API RESPONSE:", res);

      const finalUrl = res?.url || null;
      const finalAnalysis = res?.analysis || null;

      // ✅ Resume text sessionStorage mein save karo (MockInterviewPage use karega)
      if (res?.text) {
        sessionStorage.setItem("resumeText", res.text);
      }

      console.log("FINAL URL:", finalUrl);
      console.log("FINAL ANALYSIS:", finalAnalysis);

      set({
        loading: false,
        url: finalUrl,
        analysis: finalAnalysis,
      });

      return res;
    } catch (err) {
      set({
        loading: false,
        error: err.message || "Upload failed",
      });
      throw err;
    }
  },
}));