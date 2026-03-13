import axiosInstance from "./axios";

export const sendAiMessage = async (message) => {
  const res = await axiosInstance.post("/api/v1/ai/chat", {
    message,
  });

  return res.data;
};
