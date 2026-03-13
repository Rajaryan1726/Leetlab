import axios from "axios";

const BASE_URL = import.meta.env.VITE_API_BASE_URL;

export const uploadResumeAPI = async (file) => {
  const formData = new FormData();
  formData.append("resume", file);

  // 🔹 Step 1: Upload resume
  const res = await fetch(`${BASE_URL}/api/v1/upload/resume`, {
    method: "POST",
    body: formData,
  });

  let data;
  try {
    data = await res.json();
  } catch (err) {
    const text = await res.text();
    console.error("RAW RESPONSE:", text);
    throw new Error("Server returned invalid JSON");
  }

  if (!res.ok) {
    throw new Error(data?.message || data?.data?.message || "Upload failed");
  }

  // 🔥 Step 2: Extract text
  const extractedText = data.data?.text;

  if (!extractedText || extractedText.trim() === "") {
    throw new Error("Could not extract text from PDF. Please upload a text-based PDF.");
  }

  // 🔹 Step 3: AI analyze call
  let aiRes;
  try {
    aiRes = await axios.post(
      `${BASE_URL}/api/v1/resume/analyze`,
      { resumeText: extractedText }
    );
  } catch (err) {
    console.error("AI analyze error:", err?.response?.data || err?.message);
    throw new Error(err?.response?.data?.message || "AI analysis failed. Please try again.");
  }

  if (!aiRes?.data?.analysis) {
    throw new Error("AI analysis returned empty response.");
  }

  // sessionStorage mein save karo for mock interview
  sessionStorage.setItem("resumeText", extractedText);

  // 🔥 Final return
  return {
    url: data.data?.url,
    public_id: data.data?.public_id,
    analysis: aiRes.data.analysis,
    text: extractedText,
  };
};