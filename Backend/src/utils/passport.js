import dotenv from "dotenv";
dotenv.config({ path: "./.env" });
import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { Strategy as GitHubStrategy } from "passport-github2";
import { User } from "../models/user.models.js";
import { UserRolesEnum } from "./constants.js";

/* ================= GOOGLE STRATEGY ================= */
passport.use(
  new GoogleStrategy(
    {
      clientID: process.env.GOOGLE_CLIENT_ID,
      clientSecret: process.env.GOOGLE_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/google/callback`,
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        let user = await User.findOne({ email: profile.emails[0].value });

        if (user) {
          // Already exists — just return
          return done(null, user);
        }

        // New user — create
        user = await User.create({
          email: profile.emails[0].value,
          username: profile.emails[0].value.split("@")[0] + "_" + Date.now(),
          name: profile.displayName,
          password: Math.random().toString(36).slice(-12) + "Aa1!", // random strong password
          avatar: {
            url: profile.photos[0]?.value || "https://placehold.co/600x400",
            localPath: "",
          },
          isVerified: true, // Google already verified email
          role: UserRolesEnum.USER,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

/* ================= GITHUB STRATEGY ================= */
passport.use(
  new GitHubStrategy(
    {
      clientID: process.env.GITHUB_CLIENT_ID,
      clientSecret: process.env.GITHUB_CLIENT_SECRET,
      callbackURL: `${process.env.BASE_URL}/api/v1/auth/github/callback`,
      scope: ["user:email"],
    },
    async (accessToken, refreshToken, profile, done) => {
      try {
        const email =
          profile.emails?.[0]?.value ||
          `${profile.username}@github.com`;

        let user = await User.findOne({ email });

        if (user) {
          return done(null, user);
        }

        user = await User.create({
          email,
          username: profile.username + "_" + Date.now(),
          name: profile.displayName || profile.username,
          password: Math.random().toString(36).slice(-12) + "Aa1!",
          avatar: {
            url: profile.photos?.[0]?.value || "https://placehold.co/600x400",
            localPath: "",
          },
          isVerified: true,
          role: UserRolesEnum.USER,
        });

        return done(null, user);
      } catch (err) {
        return done(err, null);
      }
    }
  )
);

passport.serializeUser((user, done) => done(null, user._id));
passport.deserializeUser(async (id, done) => {
  try {
    const user = await User.findById(id);
    done(null, user);
  } catch (err) {
    done(err, null);
  }
});

export default passport;