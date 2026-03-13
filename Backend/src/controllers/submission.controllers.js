import Submission from "../models/submission.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrors } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import mongoose from "mongoose";

export const getAllSubmission = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // pagination params
  const page = parseInt(req.query.page) || 1;
  const limit = 5; // ✅ FIXED: max 5 per page
  const skip = (page - 1) * limit;

  const [submissions, totalSubmissions] = await Promise.all([
    Submission.find({ userId })
      .populate("problemId", "title difficulty")
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(limit),

    Submission.countDocuments({ userId }),
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        submissions,
        pagination: {
          totalSubmissions,
          currentPage: page,
          totalPages: Math.ceil(totalSubmissions / limit),
          limit,
        },
      },
      "User submissions fetched successfully"
    )
  );
});




export const getSubmissionsForProblem = asyncHandler(async (req, res) => {
  const userId = req.user.id;
  const { problemId } = req.params;

  // 🔐 validations
  if (!problemId) {
    throw new ApiErrors(400, "problemId is required");
  }

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiErrors(400, "Invalid problemId");
  }

  const submissions = await Submission.find({
    userId,
    problemId,
  }).sort({ createdAt: -1 });

  return res.status(200).json(
    new ApiResponse(
      200,
      submissions,
      "Submissions for problem fetched successfully"
    )
  );
});


export const getAllSubmissionsForProblem = asyncHandler(async (req, res) => {
  const { problemId } = req.params;

  if (!problemId) {
    throw new ApiErrors(400, "problemId is required");
  };

if (!mongoose.Types.ObjectId.isValid(problemId)) {
  throw new ApiErrors(400, "Invalid problemId");
}


  const count = await Submission.countDocuments({ problemId });

  return res.status(200).json(
    new ApiResponse(
      200,
      { count },
      "Total submissions for problem fetched successfully",
      
    )
  );
});
