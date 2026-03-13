import {
  submitBatch,
  getLanguageNameById,
  pollBatchResults,
} from "../db/judge0.db.js";
import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrors } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import Submission from "../models/submission.models.js";
import ProblemSolved from "../models/problemSolved.models.js";
import TestCaseResult from "../models/testCases.models.js";
import { SubmissionStatusEnum } from "../utils/constants.js";
import { Problem } from "../models/problem.models.js";
import { User } from "../models/user.models.js";
import mongoose from "mongoose";

const injectWrapper = (userCode, wrapper) => {
  if (!wrapper) return userCode;
  return wrapper.replace("{{USER_CODE}}", userCode);
};

export const executeCode = asyncHandler(async (req, res) => {
  const {
    source_code,
    language_id,
    stdin,
    expected_outputs,
    problemId,
    isSubmit = false,
  } = req.body;

  const userId = req.user.id;

  /* FETCH PROBLEM */
  const problem = await Problem.findById(problemId).lean();
  if (!problem) throw new ApiErrors(404, "Problem not found");

  /* RUN vs SUBMIT — test cases decide karo */
  let finalStdin;
  let finalExpectedOutputs;

  if (isSubmit) {
    finalStdin = problem.testCases.map(tc => tc.input);
    finalExpectedOutputs = problem.testCases.map(tc => tc.output);
  } else {
    finalStdin = stdin;
    finalExpectedOutputs = expected_outputs;
  }

  /* VALIDATION */
  if (
    !Array.isArray(finalStdin) ||
    finalStdin.length === 0 ||
    !Array.isArray(finalExpectedOutputs) ||
    finalExpectedOutputs.length !== finalStdin.length
  ) {
    throw new ApiErrors(400, "Invalid test cases");
  }

  /* WRAPPER INJECT */
  const languageName = getLanguageNameById(language_id)?.toLowerCase();
  const languageNameUpper = languageName?.toUpperCase();

  const wrapper =
    problem.codeWrappers?.[languageNameUpper] ||
    problem.codeWrappers?.[languageName] ||
    null;

  const fullCode = injectWrapper(source_code, wrapper);

  /* PREPARE BATCH */
  const submissions = finalStdin.map((input) => ({
    source_code: fullCode,
    language_id,
    stdin: input,
  }));

  const submitResponse = await submitBatch(submissions);
  const tokens = submitResponse.map((r) => r.token);

  /* POLL RESULTS */
  const results = await pollBatchResults(tokens);

  /* ANALYZE RESULTS */
  let allPassed = true;

  const detailedResults = results.map((result, i) => {
    const stdout = result.stdout?.trim() ?? "";
    const expected_output = finalExpectedOutputs[i]?.trim() ?? "";
    const passed = stdout === expected_output;
    if (!passed) allPassed = false;

    return {
      testcase: i + 1,
      passed,
      stdout,
      expected_output,
      stderr: result.stderr || null,
      compile_output: result.compile_output || null,
      status: result.status.description,
      memory: result.memory ? `${result.memory} KB` : null,
      time: result.time ? `${result.time} s` : null,
    };
  });

  /* ✅ RUN MODE — DB mein save mat karo, seedha result return karo */
  if (!isSubmit) {
    const runResponse = {
      status: allPassed ? "Accepted" : "Wrong Answer",
      testCases: detailedResults.map((r) => ({
        testCase: r.testcase,
        passed: r.passed,
        stdout: r.stdout ?? null,
        expected: r.expected_output,
        stderr: r.stderr ?? null,
        compileOutput: r.compile_output ?? null,
        status: r.status,
        memory: r.memory ?? null,
        time: r.time ?? null,
      })),
      memory: JSON.stringify(detailedResults.map(r => r.memory).filter(Boolean)),
      time: JSON.stringify(detailedResults.map(r => r.time).filter(Boolean)),
    };

    return res.status(200).json(
      new ApiResponse(200, runResponse, "Code executed successfully")
    );
  }

  /* ✅ SUBMIT MODE — DB mein save karo */
  const stdoutArr = detailedResults.map(r => r.stdout ?? "");
  const stderrArr = detailedResults.map(r => r.stderr).filter(Boolean);
  const compileOutputArr = detailedResults.map(r => r.compile_output).filter(Boolean);
  const memoryArr = detailedResults.map(r => r.memory).filter(Boolean);
  const timeArr = detailedResults.map(r => r.time).filter(Boolean);

  const submission = await Submission.create({
    userId,
    problemId: new mongoose.Types.ObjectId(problemId),
    sourceCode: source_code,
    language: getLanguageNameById(language_id),
    stdin: finalStdin.join("\n"),
    stdout: stdoutArr.length ? JSON.stringify(stdoutArr) : null,
    stderr: stderrArr.length ? JSON.stringify(stderrArr) : null,
    compileOutput: compileOutputArr.length ? JSON.stringify(compileOutputArr) : null,
    status: allPassed ? SubmissionStatusEnum.ACCEPTED : SubmissionStatusEnum.WRONG_ANSWER,
    memory: memoryArr.length ? JSON.stringify(memoryArr) : null,
    time: timeArr.length ? JSON.stringify(timeArr) : null,
  });

  /* STREAK + SOLVED — sirf Submit + allPassed */
  if (allPassed) {
    await ProblemSolved.findOneAndUpdate(
      { userId, problemId },
      { $setOnInsert: { userId, problemId } },
      { upsert: true, new: true }
    );

    await Problem.findByIdAndUpdate(problemId, {
      $addToSet: { solvedBy: { userId } }
    });

    const user = await User.findById(userId);
    if (user) {
      const today = new Date();
      today.setHours(0, 0, 0, 0);

      const lastSolved = user.streak?.lastSolvedAt
        ? new Date(user.streak.lastSolvedAt)
        : null;

      if (!lastSolved) {
        user.streak.current = 1;
      } else {
        lastSolved.setHours(0, 0, 0, 0);
        const diffDays = Math.floor((today - lastSolved) / (1000 * 60 * 60 * 24));
        if (diffDays === 1) user.streak.current += 1;
        else if (diffDays > 1) user.streak.current = 1;
      }

      if (user.streak.current > user.streak.longest) {
        user.streak.longest = user.streak.current;
      }

      user.streak.lastSolvedAt = new Date();
      await user.save();
    }
  }

  /* SAVE TEST CASE RESULTS */
  const testCaseResults = detailedResults.map((r) => ({
    submissionId: submission._id,
    testCase: r.testcase,
    passed: r.passed,
    stdout: r.stdout ?? null,
    expected: r.expected_output,
    stderr: r.stderr ?? null,
    compileOutput: r.compile_output ?? null,
    status: r.status,
    memory: r.memory ?? null,
    time: r.time ?? null,
  }));

  const insertedTestCases = await TestCaseResult.insertMany(testCaseResults);
  submission.testCases = insertedTestCases.map(tc => tc._id);
  await submission.save();

  const submissionWithTestCases = await Submission
    .findById(submission._id)
    .populate("testCases");

  return res.status(200).json(
    new ApiResponse(200, submissionWithTestCases, "Code submitted successfully")
  );
});