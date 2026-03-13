import jwt from "jsonwebtoken";
import { ApiErrors } from "../utils/api-errors.js";
import { User } from "../models/user.models.js";
import { asyncHandler } from "../utils/async-handler.js";
import mongoose from "mongoose";

export const verifyJWT = asyncHandler(async (req, res, next) => {
  console.log("🍪 Cookies:", req.cookies, "Time:", Date.now());

  const accessToken =
    req.cookies?.accessToken ||
    req.header("Authorization")?.replace("Bearer ", "");

  console.log("Access Token found?:", !!accessToken);

  if (!accessToken) {
    return res.status(401).json({
      success: false,
      message: "Not logged in",
    });
  }

  const decodedToken = jwt.verify(
    accessToken,
    process.env.ACCESS_TOKEN_SECRET
  );

  // 👇 USER FETCH
  const user = await User.findById(decodedToken._id).select(
    "-password -refreshToken"
  );

  if (!user) {
    return res.status(401).json({
      success: false,
      message: "User not found",
    });
  }

  // 🔥🔥🔥 YAHAN LOG KARO
  req.user = user;

  console.log("✅ AUTHENTICATED USER:", {
    id: req.user._id,
    email: req.user.email,
    username: req.user.username,
  });

  next();
});


export const isLoggedIn = asyncHandler( async (req, res, next) => {
  try {
   
    const accessToken = req.cookies?.accessToken || req.header("Authorization")?.replace("Bearer ", "");
    console.log("Access Token found?:", !!accessToken);

    if (!accessToken) {
    throw new ApiErrors(401, "Unauthorized request.");
    }

    const decodedToken = jwt.verify(accessToken, process.env.ACCESS_TOKEN_SECRET);
    console.log("Decoded Token Data:", decodedToken);

    const user = await User.findById(decodedToken?._id).select("-password -refreshToken -emailVerificationToken -emailVerificationExpiry");

    if(!user){
      throw new ApiErrors(401, "Invalid Access token.");
    }

    req.user = user;
    next();
  } catch (error) {
  next();
}});

export const checkAdmin = asyncHandler(async (req, res, next) => {
  const userId = req.user._id;

  const user = await User.findById(userId).select("role");

  if (!user) {
    throw new ApiErrors(401, "User not found or unauthorized");
  }

  if (user.role !== "admin") {
    throw new ApiErrors(403, "Access denied. Admins only.");
  }

  next();
});
