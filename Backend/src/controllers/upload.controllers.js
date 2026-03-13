import fs from "fs";
import { getDocument } from "pdfjs-dist/legacy/build/pdf.mjs";
import { getCloudinary } from "../utils/cloudinary.js";
import { ApiResponse } from "../utils/api-response.js";
import { ApiErrors } from "../utils/api-errors.js";
import { asyncHandler } from "../utils/async-handler.js";

/* ================= PDF TEXT EXTRACT FUNCTION ================= */
const extractTextFromPDF = async (filePath) => {
  try {
    const data = new Uint8Array(fs.readFileSync(filePath));
    const pdf = await getDocument({ data }).promise;
    let text = "";
    for (let i = 1; i <= pdf.numPages; i++) {
      const page = await pdf.getPage(i);
      const content = await page.getTextContent();
      const strings = content.items.map((item) => item.str);
      text += strings.join(" ") + "\n";
    }
    return text;
  } catch (error) {
    console.error("PDF extract error:", error.message);
    return "";
  }
};

/* ================= CONTROLLER ================= */
export const uploadResume = asyncHandler(async (req, res) => {
  const file = req.file;

  if (!file) {
    throw new ApiErrors(400, "No file uploaded ❌");
  }

  /* ===== 1. Extract Text ===== */
  const extractedText = await extractTextFromPDF(file.path);

  /* ===== 2. Upload to Cloudinary ===== */
  const cloudinary = getCloudinary();

  const result = await cloudinary.uploader.upload(file.path, {
    resource_type: "raw",
    folder: "resumes",
    public_id: `resume_${Date.now()}.pdf`,
    type: "upload",
    access_mode: "public",
  });

  /* ===== 3. Delete Local File ===== */
  try {
    fs.unlinkSync(file.path);
  } catch (error) {
    console.error("Local file delete error:", error.message);
  }

  /* ===== 4. Generate Signed URL (1 week valid) ===== */
  const signedUrl = cloudinary.url(result.public_id, {
    resource_type: "raw",
    type: "upload",
    secure: true,
    sign_url: true,
    expires_at: Math.floor(Date.now() / 1000) + 60 * 60 * 24 * 7, // 7 days
  });

  /* ===== 5. Response ===== */
  return res.status(200).json(
    new ApiResponse(
      200,
      {
        url: signedUrl,
        public_id: result.public_id,
        text: extractedText,
      },
      "Resume uploaded successfully ✅"
    )
  );
});