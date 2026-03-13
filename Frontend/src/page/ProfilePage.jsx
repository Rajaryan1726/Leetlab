import React, { useEffect, useState, useRef } from "react";
import {
  Code2,
  BookOpen,
  List,
  Flame,
  User,
  ArrowRight,
  UploadCloud,
  Pencil,
  Tag,
  Globe,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { Link, useNavigate } from "react-router-dom";
import toast from "react-hot-toast";
import { User as UserIcon } from "lucide-react";
import CalendarHeatmap from "react-calendar-heatmap";
import "react-calendar-heatmap/dist/styles.css";

import { useProfileStore } from "../store/useProfileStore";
import { useSubmissionStore } from "../store/useSubmissionStore";
import { usePlaylistStore } from "../store/usePlaylistStore";
import ChangePasswordModal from "../components/ChangePasswordModal";
import EditProfileModal from "../components/EditProfileModal";

/* ── Tag color palette ── */
const TAG_COLORS = [
  { bg: "bg-indigo-500/10", text: "text-indigo-400", border: "border-indigo-500/20" },
  { bg: "bg-cyan-500/10", text: "text-cyan-400", border: "border-cyan-500/20" },
  { bg: "bg-violet-500/10", text: "text-violet-400", border: "border-violet-500/20" },
  { bg: "bg-pink-500/10", text: "text-pink-400", border: "border-pink-500/20" },
  { bg: "bg-teal-500/10", text: "text-teal-400", border: "border-teal-500/20" },
  { bg: "bg-orange-500/10", text: "text-orange-400", border: "border-orange-500/20" },
  { bg: "bg-blue-500/10", text: "text-blue-400", border: "border-blue-500/20" },
  { bg: "bg-fuchsia-500/10", text: "text-fuchsia-400", border: "border-fuchsia-500/20" },
];

const getTagColor = (tag) => {
  let hash = 0;
  for (let i = 0; i < tag.length; i++) hash = tag.charCodeAt(i) + ((hash << 5) - hash);
  return TAG_COLORS[Math.abs(hash) % TAG_COLORS.length];
};

const ProfilePage = ({ user }) => {
  const navigate = useNavigate();

  const [showMenu, setShowMenu] = useState(false);
  const [showChangePassword, setShowChangePassword] = useState(false);
  const [showEditProfile, setShowEditProfile] = useState(false);
  const dropdownRef = useRef(null);
  const buttonRef = useRef(null);
  const [dropdownPos, setDropdownPos] = useState({ top: 0, right: 0 });

  // Calculate dropdown position when opening
  const handleToggleMenu = () => {
    if (!showMenu && buttonRef.current) {
      const rect = buttonRef.current.getBoundingClientRect();
      setDropdownPos({
        top: rect.bottom + window.scrollY + 8,
        right: window.innerWidth - rect.right,
      });
    }
    setShowMenu(!showMenu);
  };

  // Close dropdown on outside click
  useEffect(() => {
    const handleClickOutside = (e) => {
      if (
        dropdownRef.current && !dropdownRef.current.contains(e.target) &&
        buttonRef.current && !buttonRef.current.contains(e.target)
      ) {
        setShowMenu(false);
      }
    };
    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const {
    solvedProblems,
    solvedCount,
    fetchSolvedProblems,
    isSolvedLoading,
    streak,
    fetchStreak,
    isStreakLoading,
  } = useProfileStore();

  const {
    submissions,
    pagination,
    getUserSubmissionsPaginated,
    isLoading: submissionsLoading,
  } = useSubmissionStore();

  const {
    playlists,
    playlistCount,
    getAllPlaylists,
    isLoading: playlistsLoading,
  } = usePlaylistStore();

  useEffect(() => {
    fetchSolvedProblems();
    fetchStreak();
    getUserSubmissionsPaginated(1);
    getAllPlaylists();
  }, [fetchSolvedProblems, fetchStreak, getUserSubmissionsPaginated, getAllPlaylists]);

  if (!user) {
    return (
      <div className="flex items-center justify-center h-screen text-zinc-400">
        Loading profile...
      </div>
    );
  }

  const initials = user.username
    ? user.username.slice(0, 2).toUpperCase()
    : "U";

  // ───────────── Activity Heatmap ─────────────
  const activityMap = {};
  submissions.forEach((s) => {
    const date = new Date(s.createdAt).toISOString().slice(0, 10);
    activityMap[date] = (activityMap[date] || 0) + 1;
  });
  const heatmapData = Object.keys(activityMap).map((date) => ({
    date,
    count: activityMap[date],
  }));

  // ───────────── Languages Used ─────────────
  const languageMap = {};
  submissions.forEach((s) => {
    if (s.language) {
      languageMap[s.language] = (languageMap[s.language] || 0) + 1;
    }
  });
  const languagesUsed = Object.entries(languageMap).sort((a, b) => b[1] - a[1]);

  // ───────────── Tags Used ─────────────
  const tagMap = {};
  solvedProblems.forEach((p) => {
    if (Array.isArray(p.tags)) {
      p.tags.forEach((tag) => {
        tagMap[tag] = (tagMap[tag] || 0) + 1;
      });
    }
  });
  const tagsUsed = Object.entries(tagMap).sort((a, b) => b[1] - a[1]);
  const maxTagCount = tagsUsed[0]?.[1] || 1;

  // ───────────── Difficulty ─────────────
  const easyCount = solvedProblems.filter((p) => p.difficulty === "EASY").length;
  const mediumCount = solvedProblems.filter((p) => p.difficulty === "MEDIUM").length;
  const hardCount = solvedProblems.filter((p) => p.difficulty === "HARD").length;

  // ───────────── Acceptance Rate ─────────────
  const acceptedCount = submissions.filter((s) => s.status?.toLowerCase() === "accepted").length;
  const totalSubmissions = pagination?.totalSubmissions || 0;
  const acceptanceRate = totalSubmissions > 0 ? Math.round((acceptedCount / totalSubmissions) * 100) : 0;

  return (
    <div className="min-h-screen bg-zinc-950 text-zinc-100 antialiased relative overflow-hidden">
      {/* Background */}
      <div className="absolute inset-0 bg-[radial-gradient(circle_at_25%_20%,rgba(99,102,241,0.16),transparent_45%),radial-gradient(circle_at_75%_75%,rgba(236,72,153,0.14),transparent_45%)]" />

      {/* FIXED DROPDOWN PORTAL — rendered at root level, never clipped */}
      {showMenu && (
        <div
          ref={dropdownRef}
          style={{
            position: "fixed",
            top: dropdownPos.top,
            right: dropdownPos.right,
            zIndex: 99999,
            background: "linear-gradient(135deg, #1e1b4b, #1a1a2e)",
            border: "1px solid rgba(99,102,241,0.2)",
            borderRadius: "14px",
            padding: "6px",
            boxShadow: "0 25px 60px rgba(0,0,0,0.6), 0 0 0 1px rgba(255,255,255,0.05)",
            minWidth: "200px",
          }}
        >
          <button
            onClick={() => { setShowMenu(false); setShowEditProfile(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "14px",
              color: "#d4d4d8",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4d4d8"; }}
          >
            <Pencil style={{ width: 15, height: 15, color: "#818cf8" }} />
            Edit Profile
          </button>
          <button
            onClick={() => { setShowMenu(false); setShowChangePassword(true); }}
            style={{
              display: "flex",
              alignItems: "center",
              gap: "10px",
              width: "100%",
              textAlign: "left",
              padding: "10px 14px",
              borderRadius: "10px",
              fontSize: "14px",
              color: "#d4d4d8",
              background: "transparent",
              border: "none",
              cursor: "pointer",
              transition: "all 0.15s",
            }}
            onMouseEnter={e => { e.currentTarget.style.background = "rgba(99,102,241,0.15)"; e.currentTarget.style.color = "#fff"; }}
            onMouseLeave={e => { e.currentTarget.style.background = "transparent"; e.currentTarget.style.color = "#d4d4d8"; }}
          >
            <UserIcon style={{ width: 15, height: 15, color: "#818cf8" }} />
            Change Password
          </button>
        </div>
      )}

      <div className="relative z-10 max-w-7xl mx-auto px-6 py-8 space-y-8">

        {/* ===== HEADER ===== */}
        {/* FIX: removed overflow-hidden so dropdown is not clipped */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-8 shadow-[0_30px_80px_-30px_rgba(0,0,0,0.9)]">
          {/* Decorative top gradient line */}
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 rounded-t-2xl" />

          <div className="flex items-center gap-8">
            {/* Avatar with gradient ring + glow */}
            <div className="relative shrink-0">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-br from-indigo-500/30 via-purple-500/30 to-pink-500/30 blur-xl animate-pulse" />
              <div className="relative rounded-full p-[3px] bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500">
                {user.avatar?.url && !user.avatar.url.includes("placehold") ? (
                  <img
                    src={user.avatar.url}
                    alt="avatar"
                    className="w-24 h-24 rounded-full object-cover border-2 border-zinc-950"
                  />
                ) : (
                  <div className="w-24 h-24 rounded-full bg-zinc-950 flex items-center justify-center text-3xl font-bold bg-gradient-to-br from-indigo-600 to-fuchsia-600 text-white">
                    {initials}
                  </div>
                )}
              </div>
              <div className="absolute bottom-1 right-1 w-4 h-4 rounded-full border-2 border-zinc-950 bg-emerald-500 shadow-[0_0_8px_rgba(16,185,129,0.6)]" />
            </div>

            {/* User Info */}
            <div className="flex-1 min-w-0">
              <h1 className="text-3xl font-extrabold tracking-tight bg-gradient-to-r from-white via-zinc-200 to-zinc-400 bg-clip-text text-transparent">
                {user.username}
              </h1>
              <p className="text-sm text-zinc-500 mt-1 font-medium">{user.email}</p>
              {user.bio && (
                <p className="text-sm text-zinc-400 mt-2.5 max-w-xl leading-relaxed">{user.bio}</p>
              )}
            </div>

            {/* Buttons */}
            <div className="flex items-center gap-3 shrink-0">
              <button
                onClick={() => navigate("/upload-resume")}
                className="group flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-semibold bg-gradient-to-r from-indigo-600 to-purple-600 text-white shadow-lg shadow-indigo-600/25 hover:shadow-indigo-500/40 hover:from-indigo-500 hover:to-purple-500 active:scale-95 transition-all"
              >
                <UploadCloud className="h-4 w-4 group-hover:-translate-y-0.5 transition-transform" />
                Upload Resume
              </button>

              {/* Edit Profile Button — ref attached here for position calculation */}
              <button
                ref={buttonRef}
                onClick={handleToggleMenu}
                className="flex items-center gap-2 px-5 py-2.5 rounded-xl text-sm font-medium border border-zinc-700 bg-zinc-800/60 text-zinc-300 hover:border-indigo-500/50 hover:text-white hover:bg-zinc-800 transition-all"
              >
                <Pencil className="h-4 w-4" />
                Edit Profile
              </button>
            </div>
          </div>
        </div>

        {/* ===== STATS ===== */}
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-5 gap-4">
          <StatCard icon={Code2} label="Solved" value={solvedCount} accent="indigo" />
          <StatCard icon={BookOpen} label="Submissions" value={pagination?.totalSubmissions ?? "—"} accent="teal" />
          <StatCard icon={List} label="Playlists" value={playlistCount ?? 0} accent="violet" />
          <StatCard
            icon={Flame}
            label="Streak"
            value={isStreakLoading ? "—" : `${streak.current} days`}
            subText={!isStreakLoading && streak.longest > 0 ? `Longest: ${streak.longest} days` : null}
            accent="orange"
          />
          <StatCard
            icon={UserIcon}
            label="Acceptance"
            value={`${acceptanceRate}%`}
            subText={`${acceptedCount} accepted`}
            accent="emerald"
          />
        </div>

        {/* ===== ACTIVITY ===== */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-500/10">
                <Flame className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Activity</h2>
                <p className="text-xs text-zinc-500">Your submission history over the past year</p>
              </div>
            </div>
            <span className="text-xs text-zinc-500 font-medium">
              {new Date(new Date().setFullYear(new Date().getFullYear() - 1)).toLocaleDateString("en-US", { month: "short", year: "numeric" })}
              {" — "}
              {new Date().toLocaleDateString("en-US", { month: "short", year: "numeric" })}
            </span>
          </div>
          <div className="heatmap-container overflow-x-auto pb-2 -mx-2 px-2">
            <div className="min-w-[700px]">
              <CalendarHeatmap
                startDate={new Date(new Date().setFullYear(new Date().getFullYear() - 1))}
                endDate={new Date()}
                values={heatmapData}
                classForValue={(value) => {
                  if (!value) return "color-empty";
                  if (value.count >= 4) return "color-github-4";
                  if (value.count >= 3) return "color-github-3";
                  if (value.count >= 2) return "color-github-2";
                  return "color-github-1";
                }}
                titleForValue={(value) => {
                  if (!value || !value.date) return "";
                  const date = new Date(value.date);
                  const formattedDate = date.toLocaleDateString("en-US", {
                    weekday: "short", month: "short", day: "numeric", year: "numeric",
                  });
                  return `${formattedDate}: ${value.count || 0} submission${(value.count || 0) !== 1 ? "s" : ""}`;
                }}
                showWeekdayLabels={true}
              />
            </div>
            <div className="flex items-center justify-between mt-5 pt-4 border-t border-zinc-800/60">
              <span className="text-xs text-zinc-500 font-medium">Contribution activity</span>
              <div className="flex items-center gap-2 text-xs text-zinc-400">
                <span className="font-medium">Less</span>
                <div className="flex gap-1">
                  <div className="w-3.5 h-3.5 rounded-[3px] bg-zinc-800 border border-zinc-700" />
                  <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: "#312e81" }} />
                  <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: "#4f46e5" }} />
                  <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: "#6366f1" }} />
                  <div className="w-3.5 h-3.5 rounded-[3px]" style={{ backgroundColor: "#a78bfa" }} />
                </div>
                <span className="font-medium">More</span>
              </div>
            </div>
          </div>
        </div>

        {/* ===== DIFFICULTY + LANGUAGES ===== */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] h-full">
            <h2 className="text-xl font-semibold mb-6">Solved by Difficulty</h2>
            <div className="space-y-5">
              <DiffBar label="Easy" count={easyCount} total={solvedCount} color="bg-emerald-500" textClass="text-emerald-400" />
              <DiffBar label="Medium" count={mediumCount} total={solvedCount} color="bg-amber-500" textClass="text-amber-400" />
              <DiffBar label="Hard" count={hardCount} total={solvedCount} color="bg-rose-500" textClass="text-rose-400" />
            </div>
          </div>
          <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] h-full">
            <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
              <Globe className="h-5 w-5 text-indigo-400" />
              Languages Used
            </h2>
            {languagesUsed.length === 0 ? (
              <p className="text-zinc-400">No submissions yet.</p>
            ) : (
              <div className="space-y-4">
                {languagesUsed.map(([lang, count]) => (
                  <div key={lang} className="space-y-2">
                    <div className="flex justify-between">
                      <span className="font-medium text-zinc-200 capitalize">{lang}</span>
                      <span className="text-sm text-zinc-400">{count} submission{count !== 1 ? "s" : ""}</span>
                    </div>
                    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
                      <div className="h-full rounded-full bg-indigo-500 transition-all duration-500" style={{ width: `${(count / submissions.length) * 100}%` }} />
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>

        {/* ===== TAGS ===== */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <Tag className="h-5 w-5 text-cyan-400" />
            Skills Breakdown
          </h2>
          {tagsUsed.length === 0 ? (
            <p className="text-zinc-400">Solve problems to see your skill breakdown.</p>
          ) : (
            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              {tagsUsed.map(([tag, count]) => (
                <div key={tag} className="space-y-1.5">
                  <div className="flex justify-between items-center">
                    <span className="text-sm font-medium text-zinc-200">{tag}</span>
                    <span className="bg-zinc-800/80 px-2 py-0.5 rounded text-xs text-zinc-400">{count} solved</span>
                  </div>
                  <div className="h-2 w-full rounded-full bg-zinc-800 overflow-hidden">
                    <div className="h-full rounded-full bg-cyan-500 transition-all duration-500" style={{ width: `${(count / maxTagCount) * 100}%` }} />
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* ===== SOLVED PROBLEMS ===== */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-indigo-500 via-purple-500 to-pink-500 opacity-60" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-indigo-500/10">
                <Code2 className="h-5 w-5 text-indigo-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Solved Problems</h2>
                <p className="text-xs text-zinc-500">{solvedProblems.length} problems completed</p>
              </div>
            </div>
          </div>
          {isSolvedLoading ? (
            <p className="text-zinc-400">Loading solved problems...</p>
          ) : solvedProblems.length === 0 ? (
            <div className="text-center py-10">
              <Code2 className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No problems solved yet.</p>
            </div>
          ) : (
            <div className="space-y-2">
              {solvedProblems.map((problem) => {
                const diffConfig = problem.difficulty === "EASY"
                  ? { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_8px_rgba(16,185,129,0.25)]", accent: "hover:border-l-emerald-500", dot: "bg-emerald-400" }
                  : problem.difficulty === "MEDIUM"
                    ? { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_8px_rgba(245,158,11,0.25)]", accent: "hover:border-l-amber-500", dot: "bg-amber-400" }
                    : { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-[0_0_8px_rgba(244,63,94,0.25)]", accent: "hover:border-l-rose-500", dot: "bg-rose-400" };
                return (
                  <Link key={problem._id} to={`/problem/${problem._id}`} className={`group flex items-center justify-between rounded-xl border-l-2 border-l-transparent ${diffConfig.accent} bg-zinc-800/30 hover:bg-zinc-800/60 px-5 py-4 transition-all duration-200 hover:-translate-y-0.5`}>
                    <div className="min-w-0 flex-1">
                      <span className="font-medium text-zinc-200 group-hover:text-white transition">{problem.title}</span>
                      {Array.isArray(problem.tags) && problem.tags.length > 0 && (
                        <div className="flex flex-wrap gap-1.5 mt-2">
                          {problem.tags.slice(0, 3).map((t) => {
                            const tc = getTagColor(t);
                            return <span key={t} className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tc.bg} ${tc.text} ${tc.border}`}>{t}</span>;
                          })}
                          {problem.tags.length > 3 && <span className="text-[11px] text-zinc-500 px-1">+{problem.tags.length - 3}</span>}
                        </div>
                      )}
                    </div>
                    <div className="flex items-center gap-3 shrink-0 ml-4">
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${diffConfig.bg} ${diffConfig.text} ${diffConfig.border} ${diffConfig.glow}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${diffConfig.dot}`} />
                        {problem.difficulty === "EASY" ? "Easy" : problem.difficulty === "MEDIUM" ? "Medium" : "Hard"}
                      </span>
                      <ArrowRight className="h-4 w-4 text-zinc-600 opacity-0 -translate-x-2 group-hover:opacity-100 group-hover:translate-x-0 group-hover:text-zinc-400 transition-all duration-200" />
                    </div>
                  </Link>
                );
              })}
            </div>
          )}
        </div>

        {/* ===== SUBMISSIONS ===== */}
        <div className="relative rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-6 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] overflow-hidden">
          <div className="absolute top-0 left-0 right-0 h-[2px] bg-gradient-to-r from-teal-500 via-cyan-500 to-blue-500 opacity-60" />
          <div className="flex items-center justify-between mb-6">
            <div className="flex items-center gap-3">
              <div className="flex items-center justify-center h-9 w-9 rounded-xl bg-teal-500/10">
                <BookOpen className="h-5 w-5 text-teal-400" />
              </div>
              <div>
                <h2 className="text-lg font-bold text-white">Recent Submissions</h2>
                <p className="text-xs text-zinc-500">{pagination?.totalSubmissions || 0} total submissions</p>
              </div>
            </div>
          </div>
          {submissionsLoading ? (
            <p className="text-zinc-400">Loading submissions...</p>
          ) : submissions.length === 0 ? (
            <div className="text-center py-10">
              <BookOpen className="h-10 w-10 text-zinc-700 mx-auto mb-3" />
              <p className="text-zinc-500">No submissions yet.</p>
            </div>
          ) : (
            <>
              <div className="space-y-2">
                {submissions.map((s) => {
                  const isAccepted = s.status?.toLowerCase() === "accepted";
                  const isWrong = s.status?.toLowerCase() === "wrong answer";
                  const statusConfig = isAccepted
                    ? { text: "text-emerald-400", bg: "bg-emerald-500/10", border: "border-emerald-500/20", glow: "shadow-[0_0_8px_rgba(16,185,129,0.2)]", accent: "hover:border-l-emerald-500" }
                    : isWrong
                      ? { text: "text-rose-400", bg: "bg-rose-500/10", border: "border-rose-500/20", glow: "shadow-[0_0_8px_rgba(244,63,94,0.2)]", accent: "hover:border-l-rose-500" }
                      : { text: "text-amber-400", bg: "bg-amber-500/10", border: "border-amber-500/20", glow: "shadow-[0_0_8px_rgba(245,158,11,0.2)]", accent: "hover:border-l-amber-500" };
                  return (
                    <div key={s._id} className={`group flex items-center justify-between rounded-xl border-l-2 border-l-transparent ${statusConfig.accent} bg-zinc-800/30 hover:bg-zinc-800/60 px-5 py-4 transition-all duration-200`}>
                      <div className="min-w-0 flex-1">
                        <p className="font-medium text-zinc-200 group-hover:text-white transition">{s.problemId?.title || "Deleted Problem"}</p>
                        <div className="flex items-center gap-2 mt-1.5">
                          {s.language && (
                            <span className="inline-flex items-center rounded-md border border-indigo-500/20 bg-indigo-500/10 px-2 py-0.5 text-[11px] font-medium text-indigo-400 capitalize">{s.language}</span>
                          )}
                          <span className="text-xs text-zinc-500">
                            {new Date(s.createdAt).toLocaleDateString("en-US", { month: "short", day: "numeric", year: "numeric" })}
                            {" · "}
                            {new Date(s.createdAt).toLocaleTimeString("en-US", { hour: "2-digit", minute: "2-digit" })}
                          </span>
                        </div>
                      </div>
                      <span className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1.5 text-xs font-semibold shrink-0 ml-4 ${statusConfig.bg} ${statusConfig.text} ${statusConfig.border} ${statusConfig.glow}`}>
                        <span className={`w-1.5 h-1.5 rounded-full ${isAccepted ? "bg-emerald-400" : isWrong ? "bg-rose-400" : "bg-amber-400"}`} />
                        {s.status}
                      </span>
                    </div>
                  );
                })}
              </div>
              {pagination && pagination.totalPages > 1 && (
                <div className="flex items-center justify-between mt-6 pt-4 border-t border-zinc-800/60">
                  <p className="text-xs text-zinc-500 font-medium">Page {pagination.currentPage} of {pagination.totalPages}</p>
                  <div className="flex items-center gap-1">
                    <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed" disabled={pagination.currentPage === 1} onClick={() => getUserSubmissionsPaginated(pagination.currentPage - 1)}>
                      <ChevronLeft className="h-4 w-4" />
                    </button>
                    <span className="flex items-center justify-center h-9 min-w-[36px] rounded-lg bg-indigo-600 text-white text-sm font-medium shadow-lg shadow-indigo-600/20">{pagination.currentPage}</span>
                    <button className="flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed" disabled={pagination.currentPage === pagination.totalPages} onClick={() => getUserSubmissionsPaginated(pagination.currentPage + 1)}>
                      <ChevronRight className="h-4 w-4" />
                    </button>
                  </div>
                </div>
              )}
            </>
          )}
        </div>

        {/* ===== PLAYLISTS ===== */}
        <div className="rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl p-5 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)]">
          <h2 className="text-xl font-semibold mb-6 flex items-center gap-2">
            <List className="h-5 w-5 text-indigo-400" />
            Your Playlists
          </h2>
          {playlistsLoading ? (
            <p className="text-zinc-400">Loading playlists...</p>
          ) : playlists.length === 0 ? (
            <p className="text-zinc-400">No playlists created yet.</p>
          ) : (
            <div className="space-y-3">
              {playlists.map((pl) => (
                <Link key={pl._id} to={`/playlist/${pl._id}`} className="group flex justify-between items-center bg-zinc-800/40 rounded-xl px-5 py-4 hover:bg-zinc-800/70 transition">
                  <div>
                    <p className="font-medium text-zinc-200 group-hover:text-indigo-400 transition">{pl.name}</p>
                    {pl.description && <p className="text-xs text-zinc-500 mt-1">{pl.description}</p>}
                  </div>
                  <div className="flex items-center gap-3">
                    <span className="text-sm text-zinc-400">{pl.problems?.length || 0} problems</span>
                    <ArrowRight className="h-4 w-4 text-zinc-500 group-hover:text-indigo-400 group-hover:translate-x-1 transition-all" />
                  </div>
                </Link>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Modals */}
      {showChangePassword && <ChangePasswordModal onClose={() => setShowChangePassword(false)} />}
      {showEditProfile && <EditProfileModal onClose={() => setShowEditProfile(false)} />}
    </div>
  );
};

/* ─── Difficulty Progress Bar ─── */
const DiffBar = ({ label, count, total, color, textClass }) => (
  <div className="space-y-2.5">
    <div className="flex items-center justify-between">
      <span className={`text-base font-bold ${textClass}`}>{label}</span>
      <span className="text-sm font-medium text-zinc-400">{count}</span>
    </div>
    <div className="h-3 w-full rounded-full bg-zinc-800 overflow-hidden">
      <div className={`h-full rounded-full ${color} transition-all duration-500 ease-out`} style={{ width: total > 0 ? `${(count / total) * 100}%` : "0%" }} />
    </div>
  </div>
);

/* ─── Accent Config ─── */
const ACCENT = {
  indigo: { icon: "text-indigo-400", iconBg: "bg-indigo-500/10", border: "hover:border-indigo-500/30", glow: "hover:shadow-[0_8px_30px_-5px_rgba(99,102,241,0.3)]", gradient: "from-indigo-400 to-indigo-600", tint: "bg-gradient-to-br from-indigo-500/[0.07] via-transparent to-transparent" },
  teal: { icon: "text-teal-400", iconBg: "bg-teal-500/10", border: "hover:border-teal-500/30", glow: "hover:shadow-[0_8px_30px_-5px_rgba(20,184,166,0.3)]", gradient: "from-teal-400 to-teal-600", tint: "bg-gradient-to-br from-teal-500/[0.07] via-transparent to-transparent" },
  violet: { icon: "text-violet-400", iconBg: "bg-violet-500/10", border: "hover:border-violet-500/30", glow: "hover:shadow-[0_8px_30px_-5px_rgba(139,92,246,0.3)]", gradient: "from-violet-400 to-violet-600", tint: "bg-gradient-to-br from-violet-500/[0.07] via-transparent to-transparent" },
  orange: { icon: "text-orange-400", iconBg: "bg-orange-500/10", border: "hover:border-orange-500/30", glow: "hover:shadow-[0_8px_30px_-5px_rgba(249,115,22,0.3)]", gradient: "from-orange-400 to-orange-600", tint: "bg-gradient-to-br from-orange-500/[0.07] via-transparent to-transparent" },
  emerald: { icon: "text-emerald-400", iconBg: "bg-emerald-500/10", border: "hover:border-emerald-500/30", glow: "hover:shadow-[0_8px_30px_-5px_rgba(16,185,129,0.3)]", gradient: "from-emerald-400 to-emerald-600", tint: "bg-gradient-to-br from-emerald-500/[0.07] via-transparent to-transparent" },
};

/* ─── Stat Card ─── */
const StatCard = ({ icon: Icon, label, value, subText, accent = "indigo" }) => {
  const a = ACCENT[accent] || ACCENT.indigo;
  return (
    <div className={`group relative h-32 flex flex-col justify-between rounded-2xl border border-zinc-800 bg-zinc-900/70 backdrop-blur-xl px-5 py-4 shadow-[0_10px_40px_-15px_rgba(0,0,0,0.7)] transition-all duration-300 hover:-translate-y-1 ${a.border} ${a.glow} overflow-hidden cursor-default`}>
      <div className={`absolute inset-0 ${a.tint} opacity-0 group-hover:opacity-100 transition-opacity duration-500`} />
      <div className="relative">
        <div className="flex items-center gap-3">
          <div className={`flex items-center justify-center h-9 w-9 rounded-xl ${a.iconBg} shrink-0 transition-transform group-hover:scale-110`}>
            <Icon className={`h-5 w-5 ${a.icon}`} />
          </div>
          <p className="text-sm text-zinc-400 leading-tight font-medium">{label}</p>
        </div>
      </div>
      <div className="relative">
        <p className={`text-2xl font-extrabold leading-none bg-gradient-to-r ${a.gradient} bg-clip-text text-transparent`}>{value}</p>
        {subText && <p className="text-xs text-zinc-500 mt-1 leading-tight">{subText}</p>}
      </div>
    </div>
  );
};

export default ProfilePage;