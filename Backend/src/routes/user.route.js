import express from 'express';
import passport from '../utils/passport.js';
import {
  userRegistrationValidator,
  userResetForgottenPasswordValidator,
  userLoginValidator,
  userChangeCurrentPasswordValidator,
  userForgotPasswordValidator,
} from "../validators/index.js";
import { verifyJWT } from "../middlewares/loggedin.middleware.js";
import { validate } from '../middlewares/validaor.middleware.js';
import {
  registerUser,
  loginUser,
  verifyUser,
  userProfile,
  logOutUser,
  forgetPasswordRequest,
  resetPassword,
  resendEmailVerification,
  changeCurrentPassword,
  getUserStreak,
  updateProfile,
   oauthCallback,
  updateAvatar,
} from '../controllers/user.controllers.js';
import multer from "multer";

const router = express.Router();

/* ================= EXISTING ROUTES ================= */
router.route("/register").post(userRegistrationValidator(), validate, registerUser);
router.route("/verify/:rawToken").get(verifyUser);
router.route("/login").post(userLoginValidator(), validate, loginUser);
router.route("/profile").get(verifyJWT, userProfile);
router.route("/logout").post(verifyJWT, logOutUser);
router.route("/forgetpassword").post(userForgotPasswordValidator(), validate, forgetPasswordRequest);
router.route("/resetpassword/:token").post(userResetForgottenPasswordValidator(), validate, resetPassword);
router.route("/resend-email-verification").post(resendEmailVerification);
router.route("/changepassword").post(verifyJWT, userChangeCurrentPasswordValidator(), validate, changeCurrentPassword);
router.route("/streak").get(verifyJWT, getUserStreak);
router.route("/update-profile").put(verifyJWT, updateProfile);

/* ================= GOOGLE OAUTH ================= */
router.get(
  "/google",
  passport.authenticate("google", { scope: ["profile", "email"] })
);

router.get(
  "/google/callback",
  passport.authenticate("google", { session: false, failureRedirect: "/login" }),
  oauthCallback
);

/* ================= GITHUB OAUTH ================= */
router.get(
  "/github",
  passport.authenticate("github", { scope: ["user:email"] })
);

router.get(
  "/github/callback",
  passport.authenticate("github", { session: false, failureRedirect: "/login" }),
  oauthCallback
);


const upload = multer({ dest: "public/temp/" });

router.route("/update-avatar").post(verifyJWT, upload.single("avatar"), updateAvatar);

export default router;