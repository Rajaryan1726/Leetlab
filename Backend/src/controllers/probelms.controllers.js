import { Problem } from "../models/problem.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrors } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import { submitBatch, pollBatchResults, getJudge0LanguageId } from "../db/judge0.db.js";
import mongoose from "mongoose";
import ProblemSolved from "../models/problemSolved.models.js";

export const createProblem = asyncHandler(async (req, res) => {
  const {
    title,
    description,
    difficulty,
    constraints,
    examples,
    testCases,
    tags,
    hints,
    editorial,
    codeSnippets,
    codeWrappers,        // ✅ ADD — yeh missing tha
    referenceSolutions
  } = req.body;

  // =====================
  // BASIC VALIDATIONS
  // =====================
  if (!title || !description || !difficulty) {
    throw new ApiErrors(400, "Title, description, and difficulty are required.");
  }

  if (!referenceSolutions || Object.keys(referenceSolutions).length === 0) {
    throw new ApiErrors(400, "Reference solutions are required.");
  }

  if (!Array.isArray(testCases) || testCases.length === 0) {
    throw new ApiErrors(400, "Test cases are required.");
  }

  // =====================
  // NORMALIZE EXAMPLES
  // =====================
  let safeExamples = [];
  if (examples && typeof examples === "object") {
    safeExamples = Object.values(examples).map(ex => ({
      input: ex?.input || "",
      output: ex?.output || "",
      explanation: ex?.explanation || "",
    }));
  }

  // =====================
  // VALIDATE SOLUTIONS ON JUDGE0
  // =====================
  for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
    const languageId = getJudge0LanguageId(language);

    if (!languageId) {
      throw new ApiErrors(400, `Language ${language} is not supported`);
    }

    const submissions = testCases.map(({ input, output }) => ({
      language_id: languageId,
      source_code: solutionCode,
      stdin: input,
      expected_output: output,
    }));

    const submissionResults = await submitBatch(submissions);
    const tokens = submissionResults.map(res => res.token);
    const results = await pollBatchResults(tokens);

    for (let i = 0; i < results.length; i++) {
      if (results[i].status.id !== 3) {
        throw new ApiErrors(
          400,
          `Testcase ${i + 1} failed for language ${language}`
        );
      }
    }
  }

  // =====================
  // CREATE PROBLEM
  // =====================
  const newProblem = new Problem({
    title,
    description,
    difficulty,
    constraints,
    examples: safeExamples,
    testCases,
    tags,
    hints,
    editorial,
    codeSnippets,
    codeWrappers: codeWrappers || {},   // ✅ ADD — save karo DB mein
    referenceSolutions,
    createdBy: req.user._id,
  });

  const savedProblem = await newProblem.save();

  console.log("✅ Problem created with codeWrappers:", savedProblem.codeWrappers);

  return res.status(201).json(
    new ApiResponse(201, savedProblem, "Problem created successfully.")
  );
});


export const getAllProblems = asyncHandler(async (req, res) => {
  const problems = await Problem.aggregate([
    {
      $lookup: {
        from: "problemsolveds",
        localField: "_id",
        foreignField: "problemId",
        as: "solvedBy",
      },
    },
    {
      $addFields: {
        solvedBy: {
          $filter: {
            input: "$solvedBy",
            as: "sol",
            cond: { $eq: ["$$sol.userId", req.user._id] },
          },
        },
      },
    },
  ]);

  if (!problems || problems.length === 0) {
    throw new ApiErrors(404, "No problem found");
  }

  return res.status(200)
    .json(new ApiResponse(200, problems, "Problems fetched successfully"));
});

export const getProblemById = asyncHandler(async (req, res) => {
  const { problemid } = req.params;
  const problem = await Problem.findById(problemid);

  if (!problem) {
    throw new ApiErrors(404, "Problem not found");
  }

  return res.status(200)
    .json(new ApiResponse(200, problem, "Problem fetched successfully"));
});

export const updateProblem = asyncHandler(async (req, res) => {
  const { problemid } = req.params;

  const {
    title,
    description,
    difficulty,
    constraints,
    examples,
    testCases,
    tags,
    hints,
    editorial,
    codeSnippets,
    codeWrappers,        // ✅ ADD
    referenceSolutions
  } = req.body;

  const existingProblem = await Problem.findById(problemid);
  if (!existingProblem) {
    throw new ApiErrors(404, "Problem not found");
  }

  const finalTestCases = testCases || existingProblem.testCases;

  // NORMALIZE EXAMPLES
  let safeExamples;
  if (examples && typeof examples === "object") {
    safeExamples = Object.values(examples)
      .filter(ex => ex?.input && ex?.output)
      .map(ex => ({
        input: ex.input,
        output: ex.output,
        explanation: ex.explanation || "",
      }));
  }

  // VALIDATE REFERENCE SOLUTIONS
  if (referenceSolutions && Object.keys(referenceSolutions).length > 0) {
    if (!finalTestCases || finalTestCases.length === 0) {
      throw new ApiErrors(400, "Testcases are required to validate reference solutions");
    }

    for (const [language, solutionCode] of Object.entries(referenceSolutions)) {
      const languageId = getJudge0LanguageId(language);
      if (!languageId) {
        throw new ApiErrors(400, `Language ${language} is not supported`);
      }

      const submissions = finalTestCases.map(({ input, output }) => ({
        language_id: languageId,
        source_code: solutionCode,
        stdin: input,
        expected_output: output,
      }));

      const submissionResults = await submitBatch(submissions);
      const tokens = submissionResults.map(res => res.token);
      const results = await pollBatchResults(tokens);

      for (let i = 0; i < results.length; i++) {
        if (results[i].status.id !== 3) {
          throw new ApiErrors(400, `Testcase ${i + 1} failed for language ${language}`);
        }
      }
    }
  }

  // BUILD UPDATE OBJECT
  const updatedData = {};
  if (title) updatedData.title = title;
  if (description) updatedData.description = description;
  if (difficulty) updatedData.difficulty = difficulty;
  if (constraints) updatedData.constraints = constraints;
  if (safeExamples !== undefined) updatedData.examples = safeExamples;
  if (testCases) updatedData.testCases = testCases;
  if (tags) updatedData.tags = tags;
  if (hints) updatedData.hints = hints;
  if (editorial) updatedData.editorial = editorial;
  if (codeSnippets) updatedData.codeSnippets = codeSnippets;
  if (codeWrappers) updatedData.codeWrappers = codeWrappers;  // ✅ ADD
  if (referenceSolutions) updatedData.referenceSolutions = referenceSolutions;

  const updatedProblem = await Problem.findByIdAndUpdate(
    problemid,
    updatedData,
    { new: true, runValidators: true }
  );

  return res.status(200).json(
    new ApiResponse(200, updatedProblem, "Problem updated successfully.")
  );
});

export const deleteProblem = asyncHandler(async (req, res) => {
  const { problemid } = req.params;
  const problem = await Problem.findByIdAndDelete(problemid);

  if (!problem) {
    throw new ApiErrors(404, "Problem not found.");
  }

  return res.status(200)
    .json(new ApiResponse(200, null, "Problem deleted successfully."));
});

export const getAllProblemsSolvedByUser = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized. User not authenticated.");
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  const problems = await ProblemSolved.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId)
      }
    },
    {
      $lookup: {
        from: "problems",
        localField: "problemId",
        foreignField: "_id",
        as: "problem"
      }
    },
    { $unwind: "$problem" },
    {
      $project: {
        _id: "$problem._id",
        title: "$problem.title",
        difficulty: "$problem.difficulty",
        tags: "$problem.tags",
        description: "$problem.description",
        solvedAt: "$solvedAt",
        createdAt: "$problem.createdAt"
      }
    },
    { $sort: { solvedAt: -1 } }
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      { count: problems.length, problems },
      problems.length ? "Solved problems fetched successfully" : "No problems solved yet"
    )
  );
});