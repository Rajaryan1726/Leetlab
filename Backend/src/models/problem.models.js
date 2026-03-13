import mongoose, { Schema } from "mongoose";

const problemSchema = new Schema({
  title: { 
    type: String, 
    required: true 
    },
  description: { 
    type: String, 
    required: true 
},

  difficulty: {
    type: String,
    enum: ["EASY", "MEDIUM", "HARD"],
    required: true
  },

  constraints: { 
    type: [String], 
    default: [] 
},

  examples: [{
    input: String,
    output: String,
    explanation: String,
     _id: false
  }],

  testCases: [{ 
    type: Schema.Types.Mixed 
  }],

  tags: { 
    type: [String], 
    default: [] 
 },

  createdBy: {
    type: Schema.Types.ObjectId,
    ref: "User",
    required: true
  },

  hints: { 
    type: [String], 
    default: [] 
  },
  editorial: { 
    type: String, 
    default: "" 
},

  codeSnippets: [{ 
    type: Schema.Types.Mixed 
}],
  referenceSolutions: [{ 
    type: Schema.Types.Mixed 
}],
codeWrappers: {
  type: Map,
  of: String,
  default: {},
},

}, { timestamps: true });

export const Problem = mongoose.model("Problem", problemSchema);
