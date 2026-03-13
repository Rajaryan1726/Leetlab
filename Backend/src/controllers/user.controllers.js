import { asyncHandler } from "../utils/async-handler.js";
import crypto from "crypto";
import { User } from "../models/user.models.js";
import { sendMail, emailVerificationMailGenContent, resetPasswordMailGenContent } from "../utils/mail.js";
import { UserRolesEnum, AvailableRolesEnum } from "../utils/constants.js";
import { ApiErrors } from "../utils/api-errors.js";
import {ApiResponse} from "../utils/api-response.js"
import Submission from "../models/submission.models.js";
import { getCloudinary } from "../utils/cloudinary.js";
import fs from "fs";



export const registerUser = asyncHandler(async (req, res) => {
  console.log("🚀 REGISTER HIT", {
    email: req.body.email,
    time: Date.now(),
  });

  const { email, username, password } = req.body;

  // Validate required fields
  if (!email || !username || !password) {
    return res.status(400).json({
      success: false,
      message: "Email, username and password are required.",
    });
  }

  // Check for duplicates
  if (await User.findOne({ email })) {
    return res.status(400).json({
      success: false,
      message: "Email already registered.",
    });
  }

  if (await User.findOne({ username })) {
    return res.status(400).json({
      success: false,
      message: "Username already taken.",
    });
  }

  // Avatar generate
  const avatarUrl = `https://api.dicebear.com/7.x/bottts/svg?seed=${username}`;

  // Create user
  const user = new User({
    email,
    username,
    password,
    avatar: {
      url: avatarUrl,
      localPath: "",
    },
    role: UserRolesEnum.USER,
    isVerified: false,   // make sure schema field matches
  });

  // Generate verification token
  const { unHashedToken, hashedToken, tokenExpiry } =
    user.generateTemporaryToken();

  user.verificationToken = hashedToken;
  user.verificationTokenExpires = tokenExpiry;

  // Save user
  const newUser = await user.save();

  if (!newUser) {
    return res.status(500).json({
      success: false,
      message: "Failed to create user.",
    });
  }

  console.log("🔥 SAVED AVATAR URL:", newUser.avatar.url);

  // Verification URL (frontend route)
  const verifyUrl = `${process.env.VERIFY_EMAIL_URL}/${unHashedToken}`;

  // Mail content
  const mailContent = emailVerificationMailGenContent(
    newUser.username,
    verifyUrl
  );

  // Send email
  try {
    await sendMail({
      email: newUser.email,
      subject: "Verify Your Account",
      MailGencontent: mailContent,
    });
  } catch (err) {
    return res.status(500).json({
      success: false,
      message: "Failed to send verification email.",
    });
  }

  // Final response (NO login here)
  return res.status(201).json({
    success: true,
    message: "Signup successful. Please verify your email before logging in.",
  });
});


export const verifyUser = asyncHandler(async (req, res) => {
 

  const { rawToken } = req.params;

  if (!rawToken) {
    return res.status(400).json({
      success: false,
      message: "Token is required.",
    });
  }

  // Hash the token
  const hashedToken = crypto
    .createHash("sha256")
    .update(rawToken)
    .digest("hex");



  // Find user with valid token (and not expired)
  const user = await User.findOne({
    verificationToken: hashedToken,
    verificationTokenExpires: { $gt: Date.now() },
  });

  // If no user found with token
  if (!user) {
    // Check if already verified
    const alreadyVerifiedUser = await User.findOne({
      isVerified: true,
    });

    if (alreadyVerifiedUser) {
      return res.status(200).json({
        success: true,
        message: "User already verified.",
      });
    }

    return res.status(400).json({
      success: false,
      message: "Invalid or expired verification link.",
    });
  }

  // Verify user
  user.isVerified = true;
  user.verificationToken = undefined;
  user.verificationTokenExpires = undefined;

  await user.save();

  console.log("User verified:", user.email);

  return res.status(200).json({
    success: true,
    message: "Email verified successfully.",
  });
});


export const loginUser = asyncHandler(async(req, res) =>{
  console.log("🔐 LOGIN HIT:", req.body.email);

  const {email, password,} = req.body;

  if(!email || !password ){
    return res.status(400).json({
      message: "All fields are required.",
    })
  }
  // console.log("Input Email:", email.trim().toLowerCase());
  // ✅ CORRECT
const newUser = await User.findOne({ email: email.trim().toLowerCase() });

  console.log("User from DB:", newUser);
  if(!newUser){
    return res.status(400).json({
      message: "Invalid email or password.",
    })
  }

const isPasswordMatched = await newUser.isPasswordCorrect(password);


  if(!isPasswordMatched){
    return res.status(400).json({
      message: "Invalid email or password.",
    })
  }
  
  if(!newUser.isVerified){
    return res.status(400).json({
      message: "Please verify your email.",
    })
  }

  const accessToken = newUser.generateAccessToken();

 const cookieOptions1 = {
            httpOnly: true,
            secure: false,
            maxAge: 24 * 60 * 60 * 1000,
            sameSite: "lax",      
            path: "/",
        };


  
        res.cookie("accessToken", accessToken, cookieOptions1);

        
        const refreshToken = newUser.generateRefreshToken()
        const cookieOptions2 ={
          httpOnly: true,
          secure:false,
          maxAge: 7 * 24 * 60 * 60 * 1000 
        };

        res.cookie("refreshToken", refreshToken, cookieOptions2);



        return res.status(200).json({
  success: true,
  message: "User logged in successfully.",
  user: {
    id: newUser._id,
    username: newUser.username,
    email: newUser.email,
    role: newUser.role,
    avatar: newUser.avatar,
  },
});


});

export const userProfile = asyncHandler(async (req, res) => {
  const user = await User.findById(req.user._id).select("-password");

  if (!user) {
    return res.status(400).json({
      message: "User not found.",
      success: false,
    });
  }

  /* ======================
     STREAK AUTO RESET CHECK
  ====================== */
  if (user.streak?.lastSolvedAt) {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const lastSolved = new Date(user.streak.lastSolvedAt);
    lastSolved.setHours(0, 0, 0, 0);

    const diffDays = Math.floor(
      (today - lastSolved) / (1000 * 60 * 60 * 24)
    );

    // Agar 1 din se zyada gap hai → streak reset
    if (diffDays > 1) {
      user.streak.current = 0;
      await user.save();
    }
  }

  return res.status(200).json({
    success: true,
    user,
  });
});

export const logOutUser = asyncHandler(async (req, res) => {
  res.clearCookie("accessToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  res.clearCookie("refreshToken", {
    httpOnly: true,
    sameSite: "lax",
    secure: false,
    path: "/",
  });

  return res.status(200).json({
    success: true,
    message: "User logged out successfully",
  });
});

export const forgetPasswordRequest = asyncHandler(async(req, res) => {
  const {email} = req.body;
  if(!email){
    console.log("No email.");
    return res.status(400).json({
      message: "Email is required",
    })
    
  }

  const newUser = await User.findOne({email});
  if(!newUser){
    console.log("No user.");
    return res.status(400).json({
      message: "User not found.",
      success: false,
    })

  }

  const token = crypto.randomBytes(32).toString("hex");
  console.log(token);
  newUser.resetPasswordToken = token;
  newUser.resetPasswordTokenExpires = Date.now() + 10 * 60 * 1000;

  await newUser.save();



  const forgetPasswordUrl = `${process.env.RESET_PASSWORD_URL}/${token}`;

   const mailContent = resetPasswordMailGenContent(newUser.username, forgetPasswordUrl);

    await sendMail({
      email: newUser.email,
      subject: "Reset password email sent successfully",
      MailGencontent: mailContent,
    });
    
    return res.status(200).json({
  message: "Reset password email sent.",
  success: true
});

});

export const resetPassword = asyncHandler(async(req, res) => {
  const {token} = req.params;
  const {password} = req.body;

  if(!token){
    return res.status(400).json({
      message: "Token is required.",
      success: false, 
    })
  }

  if(!password){
    return res.status(400).json({
      message: "Password is required.",
      success: false,
    })
  }

  if(password.length < 8){
    return res.status(400).json({
      message: "Password must be atleast 8 characters.",
      success: false,
    })
  }
   const newUser = await User.findOne({
            resetPasswordToken:token,
             resetPasswordTokenExpires:{ $gt: Date.now()}
        })

        if(!newUser){
          return res.status(400).json({
            message: "Invalid or expired token.",
            success: false,
          })
        };
        
        newUser.password = password;
        newUser.resetPasswordToken = null;
        newUser.resetPasswordTokenExpires = null;


        await newUser.save();

        return res.status(200).json({
          message: "Password reset successfully.",
          success: true,
        })

});

export const resendEmailVerification = asyncHandler(async(req, res) => {
   const { email } = req.body;
   const user = await User.findOne({ email });
   
  if(!user){
    throw new ApiErrors (401, "User does not exist." , []);
  };

  if(user.isVerified){
    throw new ApiErrors(400, "User already verified!");
  };

    const { unHashedToken, hashedToken, tokenExpiry } = user.generateTemporaryToken();
            user.verificationToken = hashedToken;
            user.verificationTokenExpires = tokenExpiry;

          await user.save({ validateBeforeSave: false });


        const verifyUrl = `${process.env.VERIFY_EMAIL_URL}/${unHashedToken}`;



        const mailContent = emailVerificationMailGenContent(user.username, verifyUrl);

   try {
    await sendMail({
      email: user.email,
      subject: "Verify Your Account",
      MailGencontent: mailContent,
    });
  } catch (err) {
   return res.status(500).json({
      success: false,
      message: "Failed to send verification email.",
    });
  }

 return res
    .status(200)
    .json(new ApiResponse(200, {}, "Mail has been sent to your mail ID"));
});

export const changeCurrentPassword = asyncHandler(async(req, res) => {
  const {oldPassword, newPassword} = req.body;
  const user =await User.findById(req.user?._id);
  const isPasswordValid = await user.isPasswordCorrect(oldPassword);

  if(!isPasswordValid){
    throw new ApiErrors(401, "Invalid old password.");
  };

   user.password = newPassword;
  await user.save({ validateBeforeSave: false });


  return res
    .status(200)
    .json(new ApiResponse(200, {}, "Password changed successfully"));

});

export const getUserStreak = asyncHandler(async (req, res) => {
  const userId = req.user.id;

  // Sirf ACCEPTED submissions
  const submissions = await Submission.find({
    userId,
    status: { $regex: /^accepted$/i },
  })
    .sort({ createdAt: -1 })
    .select("createdAt");

  if (submissions.length === 0) {
    return res.status(200).json(
      new ApiResponse(200, {
        currentStreak: 0,
        longestStreak: 0,
      })
    );
  }

  // Unique solved days (YYYY-MM-DD)
  const solvedDays = [
    ...new Set(
      submissions.map(
        (s) => new Date(s.createdAt).toISOString().split("T")[0]
      )
    ),
  ];

  let currentStreak = 0;
  let longestStreak = 0;
  let prevDate = null;

  for (const day of solvedDays) {
    const currentDate = new Date(day);

    if (!prevDate) {
      currentStreak = 1;
    } else {
      const diff =
        (prevDate - currentDate) / (1000 * 60 * 60 * 24);

      if (diff === 1) {
        currentStreak++;
      } else {
        longestStreak = Math.max(longestStreak, currentStreak);
        currentStreak = 1;
      }
    }

    prevDate = currentDate;
    longestStreak = Math.max(longestStreak, currentStreak);
  }

  return res.status(200).json(
    new ApiResponse(200, {
      currentStreak,
      longestStreak,
    })
  );
});

export const updateProfile = asyncHandler(async (req, res) => {
  try {
    const userId = req.user._id; // protect middleware se aata hai

    const { name, bio, username } = req.body;

    const user = await User.findById(userId);

    if (!user) {
      return res.status(404).json({ message: "User not found" });
    }

    // update fields

    if (name !== undefined) {
      user.name = name;
    };
    if (username !== undefined) {
      user.username = username;
    };
    if (bio !== undefined) {
      user.bio = bio;
    };
    

    await user.save();

    res.status(200).json({
      success: true,
      user,
      message: "Profile updated successfully",
    });
  } catch (error) {
    res.status(500).json({
      message: "Error updating profile",
      error: error.message,
    });
  }
});

export const oauthCallback = asyncHandler(async (req, res) => {
  try {
    const user = req.user;

    if (!user) {
      return res.redirect(
        `${process.env.CLIENT_URL}/login?error=oauth_failed`
      );
    }

    // Generate tokens
    const accessToken = user.generateAccessToken();
    const refreshToken = user.generateRefreshToken();

    const cookieOptions = {
      httpOnly: true,
      secure: false,
      sameSite: "lax",
      path: "/",
    };

    res.cookie("accessToken", accessToken, {
      ...cookieOptions,
      maxAge: 24 * 60 * 60 * 1000, // 1 day
    });

    res.cookie("refreshToken", refreshToken, {
      ...cookieOptions,
      maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    // Redirect to frontend
    return res.redirect(`${process.env.CLIENT_URL}/oauth-success`);
  } catch (err) {
    console.error("OAuth callback error:", err);
    return res.redirect(`${process.env.CLIENT_URL}/login?error=oauth_failed`);
  }
});

export const updateAvatar = asyncHandler(async (req, res) => {
  const file = req.file;
  if (!file) throw new ApiErrors(400, "No file uploaded");

  const cloudinary = getCloudinary();

  const result = await cloudinary.uploader.upload(file.path, {
    folder: "avatars",
    transformation: [{ width: 200, height: 200, crop: "fill" }],
  });

  try { fs.unlinkSync(file.path); } catch (e) {}

  const user = await User.findByIdAndUpdate(
    req.user._id,
    { avatar: { url: result.secure_url, localPath: "" } },
    { new: true }
  ).select("-password");

  return res.status(200).json(new ApiResponse(200, { user }, "Avatar updated successfully"));
});