import mongoose from "mongoose";
import { SubmissionStatusEnum } from "../utils/constants.js";

const submissionSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
      index: true,
    },

    sourceCode: {
      type: mongoose.Schema.Types.Mixed, // for JSON
      required: true,
    },

    language: {
      type: String,
      required: true,
    },

    stdin: {
      type: String,
      default: null,
    },

    stdout: {
      type: String,
      default: null,
    },

    stderr: {
      type: String,
      default: null,
    },

    compileOutput: {
      type: String,
      default: null,
    },

    status: {
    type: String,
    enum: SubmissionStatusEnum,
    required: true,
    index: true,
  },

    memory: {
      type: String,
      default: null,
    },

    time: {
      type: String,
      default: null,
    },
    testCases: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "TestCaseResult",
  }
],

  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Optional useful indexes
submissionSchema.index({ userId: 1, problemId: 1 });
submissionSchema.index({ createdAt: -1 });

const Submission = mongoose.model("Submission", submissionSchema);

export default Submission;
