import mongoose from "mongoose";

const problemSolvedSchema = new mongoose.Schema(
  {
    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    problemId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "Problem",
      required: true,
    },
     solvedAt: {
      type: Date,
      default: Date.now,
    },
  },
  {
    timestamps: true, // createdAt & updatedAt automatically
  }
);

// Equivalent of @@unique([userId, problemId])
problemSolvedSchema.index({ userId: 1, problemId: 1 }, { unique: true });

const ProblemSolved = mongoose.model("ProblemSolved", problemSolvedSchema);

export default ProblemSolved;