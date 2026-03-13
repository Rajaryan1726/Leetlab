import mongoose from "mongoose";

const playlistSchema = new mongoose.Schema(
  {
    name: {
      type: String,
      required: true,
      trim: true,
    },

    description: {
      type: String,
      default: null,
    },

    userId: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
      required: true,
    },

    // Relation: Playlist -> ProblemInPlaylist (1 to many)
   problems: [
  {
    type: mongoose.Schema.Types.ObjectId,
    ref: "Problem",
  },
],

  },
  {
    timestamps: true, // createdAt & updatedAt
  }
);

// Prisma: @@unique([name, userId])
playlistSchema.index({ name: 1, userId: 1 }, { unique: true });

const Playlist = mongoose.model("Playlist", playlistSchema);

export default Playlist;
