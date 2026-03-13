import { asyncHandler } from "../utils/async-handler.js";
import { ApiErrors } from "../utils/api-errors.js";
import { ApiResponse } from "../utils/api-response.js";
import Playlist from "../models/playlist.models.js";
import mongoose from "mongoose";
import { Problem } from "../models/problem.models.js";


export const createPlaylist = asyncHandler(async (req, res) => {
  const { name, description } = req.body;

  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  const userId = req.user.id;

  if (!name || !name.trim()) {
    throw new ApiErrors(400, "Playlist name is required");
  }

  if (name.trim().length < 3) {
    throw new ApiErrors(400, "Playlist name must be at least 3 characters long");
  }

  const existingPlaylist = await Playlist.findOne({
    userId,
    name: name.trim(),
  });

  if (existingPlaylist) {
    throw new ApiErrors(409, "Playlist with this name already exists");
  }

  const playlist = await Playlist.create({
    name: name.trim(),
    description: description?.trim() || null,
    userId,
    problems: [],
  });

  return res.status(201).json(
    new ApiResponse(201, playlist, "Playlist created successfully")
  );
});


export const getAllPlayListDetails = asyncHandler(async (req, res) => {
  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  const playLists = await Playlist.aggregate([
    {
      $match: {
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    // Unwind problems array (keep playlists with no problems)
    {
      $unwind: {
        path: "$problems",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Join with problems collection
    {
      $lookup: {
        from: "problems",
        localField: "problems",
        foreignField: "_id",
        as: "problemDetails",
      },
    },

    // ✅ Single unwind with preserveNullAndEmptyArrays: true (no double unwind)
    {
      $unwind: {
        path: "$problemDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    // Regroup playlists
    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        userId: { $first: "$userId" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        problems: {
          $push: {
            $cond: {
              if: { $ifNull: ["$problemDetails._id", false] },
              then: {
                problemId: "$problemDetails._id",
                title: "$problemDetails.title",
                difficulty: "$problemDetails.difficulty",
              },
              else: "$$REMOVE",
            },
          },
        },
      },
    },

    // Sort playlists (latest first)
    {
      $sort: { createdAt: -1 },
    },
  ]);

  return res.status(200).json(
    new ApiResponse(
      200,
      {
        count: playLists.length,
        playLists,
      },
      playLists.length ? "Playlists fetched successfully" : "No playlists found"
    )
  );
});


export const getPlayListDetails = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiErrors(400, "Invalid playlistId");
  }

  const playList = await Playlist.aggregate([
    {
      $match: {
        _id: new mongoose.Types.ObjectId(playlistId),
        userId: new mongoose.Types.ObjectId(userId),
      },
    },

    {
      $unwind: {
        path: "$problems",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $lookup: {
        from: "problems",
        localField: "problems",
        foreignField: "_id",
        as: "problemDetails",
      },
    },

    // ✅ Single unwind with preserveNullAndEmptyArrays: true (no double unwind)
    {
      $unwind: {
        path: "$problemDetails",
        preserveNullAndEmptyArrays: true,
      },
    },

    {
      $group: {
        _id: "$_id",
        name: { $first: "$name" },
        description: { $first: "$description" },
        userId: { $first: "$userId" },
        createdAt: { $first: "$createdAt" },
        updatedAt: { $first: "$updatedAt" },
        problems: {
          $push: {
            $cond: {
              if: { $ifNull: ["$problemDetails._id", false] },
              then: {
                problemId: "$problemDetails._id",
                title: "$problemDetails.title",
                difficulty: "$problemDetails.difficulty",
                description: "$problemDetails.description",
              },
              else: "$$REMOVE",
            },
          },
        },
      },
    },
  ]);

  if (!playList.length) {
    throw new ApiErrors(404, "Playlist not found");
  }

  return res.status(200).json(
    new ApiResponse(200, playList[0], "Playlist fetched successfully")
  );
});


export const updatePlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { name, description } = req.body;

  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiErrors(400, "Invalid playlistId");
  }

  const updateData = {};

  if (name !== undefined) {
    if (!name.trim()) {
      throw new ApiErrors(400, "Playlist name cannot be empty");
    }
    if (name.trim().length < 3) {
      throw new ApiErrors(400, "Playlist name must be at least 3 characters long");
    }
    updateData.name = name.trim();
  }

  if (description !== undefined) {
    updateData.description = description?.trim() || null;
  }

  if (!Object.keys(updateData).length) {
    throw new ApiErrors(400, "Nothing to update");
  }

  if (updateData.name) {
    const existingPlaylist = await Playlist.findOne({
      userId,
      name: updateData.name,
      _id: { $ne: playlistId },
    });

    if (existingPlaylist) {
      throw new ApiErrors(409, "Playlist with this name already exists");
    }
  }

  const updatedPlaylist = await Playlist.findOneAndUpdate(
    { _id: playlistId, userId },
    { $set: updateData },
    { new: true }
  );

  if (!updatedPlaylist) {
    throw new ApiErrors(404, "Playlist not found");
  }

  return res.status(200).json(
    new ApiResponse(200, updatedPlaylist, "Playlist updated successfully")
  );
});


export const addProblemToPlaylist = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;
  const { problemIds } = req.body;

  if (!req.user?.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiErrors(400, "Invalid playlistId");
  }

  if (!Array.isArray(problemIds) || !problemIds.length) {
    throw new ApiErrors(400, "problemIds must be a non-empty array");
  }

  const userId = req.user.id;

  // ✅ Deduplicate and validate, then convert to ObjectIds immediately
  const validProblemIds = [...new Set(problemIds)]
    .filter((id) => mongoose.Types.ObjectId.isValid(id))
    .map((id) => new mongoose.Types.ObjectId(id)); // ✅ Convert to ObjectId (fixes lookup mismatch)

  if (!validProblemIds.length) {
    throw new ApiErrors(400, "No valid problemIds provided");
  }

  const playlist = await Playlist.findOne({
    _id: playlistId,
    userId,
  });

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found or access denied");
  }

  const existingProblemIds = playlist.problems.map((id) => id.toString());

  const newProblemIds = validProblemIds.filter(
    (id) => !existingProblemIds.includes(id.toString())
  );

  if (!newProblemIds.length) {
    throw new ApiErrors(409, "All problems already exist in playlist");
  }

  const existingProblemsCount = await Problem.countDocuments({
    _id: { $in: newProblemIds },
  });

  if (existingProblemsCount !== newProblemIds.length) {
    throw new ApiErrors(400, "One or more problemIds are invalid");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    {
      $addToSet: {
        problems: { $each: newProblemIds }, // ✅ Saving as ObjectIds
      },
    },
    { new: true }
  );

  return res.status(201).json(
    new ApiResponse(
      201,
      {
        addedCount: newProblemIds.length,
        problems: updatedPlaylist.problems,
      },
      "Problems added to playlist successfully"
    )
  );
});


export const deletePlayList = asyncHandler(async (req, res) => {
  const { playlistId } = req.params;

  if (!req.user || !req.user.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  const userId = req.user.id;

  if (!mongoose.Types.ObjectId.isValid(userId)) {
    throw new ApiErrors(400, "Invalid userId");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiErrors(400, "Invalid playlistId");
  }

  const deletedPlaylist = await Playlist.findOneAndDelete({
    _id: playlistId,
    userId,
  });

  if (!deletedPlaylist) {
    throw new ApiErrors(404, "Playlist not found or access denied");
  }

  return res.status(200).json(
    new ApiResponse(200, deletedPlaylist, "Playlist deleted successfully")
  );
});


export const removeProblemFromPlaylist = asyncHandler(async (req, res) => {
  const { playlistId, problemId } = req.params;

  if (!req.user?.id) {
    throw new ApiErrors(401, "Unauthorized");
  }

  if (!mongoose.Types.ObjectId.isValid(playlistId)) {
    throw new ApiErrors(400, "Invalid playlistId");
  }

  if (!mongoose.Types.ObjectId.isValid(problemId)) {
    throw new ApiErrors(400, "Invalid problemId");
  }

  const userId = req.user.id;

  const playlist = await Playlist.findOne({ _id: playlistId, userId });

  if (!playlist) {
    throw new ApiErrors(404, "Playlist not found or access denied");
  }

  const updatedPlaylist = await Playlist.findByIdAndUpdate(
    playlistId,
    { $pull: { problems: new mongoose.Types.ObjectId(problemId) } },
    { new: true }
  );

  return res.status(200).json(
    new ApiResponse(
      200,
      updatedPlaylist,
      "Problem removed from playlist successfully"
    )
  );
});