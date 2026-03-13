import React, { useEffect } from "react";
import { Routes, Route, Navigate } from "react-router-dom";
import { Toaster } from "react-hot-toast";
import { Loader2 } from "lucide-react";

import { useAuthStore } from "./store/useAuthStore";
import Layout from "./layout/Layout";

import LandingPage from "./page/LandingPage";
import HomePage from "./page/HomePage";
import LoginPage from "./page/LoginPage";
import SignUpPage from "./page/SignUpPage";
import VerifyUser from "./page/VerifyUserPage";
import VerifyInfoPage from "./page/VerifyInfoPage";

import AdminRoute from "./components/AdminRoute";
import AddProblem from "./page/AddProblem";
import ProblemPage from "./page/ProblemPage";
import ProfilePage from "./page/ProfilePage";
import PlaylistDetailPage from "./page/PlaylistDetailPage";
import AiPage from "./page/AiPage";
import EditProblemPage from "./page/EditProblemPage";
import ForgotPasswordPage from "./page/ForgetPasswordPage";
import ResetPasswordPage from "./page/ResetPasswordPage";
import UploadPage from "./page/UploadPage";
import MockInterviewPage from "./page/MockInterviewPage";

const App = () => {
  const { authUser, checkAuth, isCheckingAuth } = useAuthStore();

  useEffect(() => {
    const timer = setTimeout(() => {
      checkAuth();
    }, 300);

    return () => clearTimeout(timer);
  }, [checkAuth]);

  // Loader while checking auth
  if (isCheckingAuth && !authUser) {
    return (
      <div className="flex items-center justify-center h-screen">
        <Loader2 className="size-10 animate-spin" />
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen">
      <Toaster />

      <Routes>
        {/* LANDING */}
        <Route
          path="/"
          element={authUser ? <Navigate to="/dashboard" /> : <LandingPage />}
        />

        {/* AUTH ROUTES */}
        <Route
          path="/login"
          element={!authUser ? <LoginPage /> : <Navigate to="/dashboard" />}
        />

        <Route
          path="/signup"
          element={!authUser ? <SignUpPage /> : <Navigate to="/dashboard" />}
        />

        {/* AFTER SIGNUP PAGE */}
        <Route path="/verify-info" element={<VerifyInfoPage />} />

        {/* EMAIL VERIFY */}
        <Route path="/verify/:token" element={<VerifyUser />} />

        <Route path="/forgot-password" element={<ForgotPasswordPage />} />
        <Route path="/reset-password/:token" element={<ResetPasswordPage />} />

        {/* PROTECTED ROUTES */}
        <Route element={authUser ? <Layout /> : <Navigate to="/" />}>
          <Route path="/dashboard" element={<HomePage />} />
          <Route path="/profile" element={<ProfilePage user={authUser} />} />
          <Route path="/ai" element={<AiPage />} />
          <Route path="/playlist/:playlistId" element={<PlaylistDetailPage />} />
          <Route path="/mock-interview" element={<MockInterviewPage />} />

          {/* PROBLEM PAGE FOR ALL LOGGED-IN USERS */}
          <Route path="/problem/:id" element={<ProblemPage />} />
           <Route path="/upload-resume" element={<UploadPage />} />
        </Route>

        {/* ADMIN ROUTES */}
        <Route element={<AdminRoute />}>
          <Route
            path="/add-problem"
            element={authUser ? <AddProblem /> : <Navigate to="/" />}
          />
          <Route
            path="/edit-problem/:id"
            element={authUser ? <EditProblemPage /> : <Navigate to="/" />}
          />
        </Route>
      </Routes>
    </div>
  );
};

export default App;
