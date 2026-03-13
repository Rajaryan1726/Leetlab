import React, { useState, useMemo } from "react";
import { useAuthStore } from "../store/useAuthStore";
import { Link, useNavigate } from "react-router-dom";
import {
  Bookmark,
  PencilIcon,
  TrashIcon,
  Plus,
  Search,
  CheckCircle2,
  Circle,
  ChevronLeft,
  ChevronRight,
} from "lucide-react";
import { useActions } from "../store/useActions";
import AddToPlaylistModal from "./AddToPlaylistModal";
import CreatePlaylistModal from "./CreatePlaylistModal";
import { usePlaylistStore } from "../store/usePlaylistStore";
import toast from "react-hot-toast";

/* ── Difficulty config ── */
const DIFF = {
  EASY: {
    label: "Easy",
    text: "text-emerald-400",
    bg: "bg-emerald-500/10",
    border: "border-emerald-500/20",
    glow: "shadow-[0_0_8px_rgba(16,185,129,0.25)]",
    dot: "bg-emerald-400",
  },
  MEDIUM: {
    label: "Medium",
    text: "text-amber-400",
    bg: "bg-amber-500/10",
    border: "border-amber-500/20",
    glow: "shadow-[0_0_8px_rgba(245,158,11,0.25)]",
    dot: "bg-amber-400",
  },
  HARD: {
    label: "Hard",
    text: "text-rose-400",
    bg: "bg-rose-500/10",
    border: "border-rose-500/20",
    glow: "shadow-[0_0_8px_rgba(244,63,94,0.25)]",
    dot: "bg-rose-400",
  },
};

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

/* ── Row accent border color ── */
const rowAccent = {
  EASY: "border-l-emerald-500",
  MEDIUM: "border-l-amber-500",
  HARD: "border-l-rose-500",
};

const ProblemsTable = ({ problems }) => {
  const { authUser } = useAuthStore();
  const { onDeleteProblem } = useActions();
  const { createPlaylist } = usePlaylistStore();
  const navigate = useNavigate();

  const [search, setSearch] = useState("");
  const [difficulty, setDifficulty] = useState("ALL");
  const [selectedTag, setSelectedTag] = useState("ALL");
  const [currentPage, setCurrentPage] = useState(1);
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isAddToPlaylistModalOpen, setIsAddToPlaylistModalOpen] = useState(false);
  const [selectedProblemId, setSelectedProblemId] = useState(null);

  const allTags = useMemo(() => {
    const set = new Set();
    problems?.forEach((p) => p.tags?.forEach((t) => set.add(t)));
    return Array.from(set);
  }, [problems]);

  const filteredProblems = useMemo(() => {
    return (problems || [])
      .filter((p) => p.title.toLowerCase().includes(search.toLowerCase()))
      .filter((p) => (difficulty === "ALL" ? true : p.difficulty === difficulty))
      .filter((p) => (selectedTag === "ALL" ? true : p.tags?.includes(selectedTag)));
  }, [problems, search, difficulty, selectedTag]);

  const itemsPerPage = 5;
  const totalPages = Math.ceil(filteredProblems.length / itemsPerPage);
  const paginatedProblems = filteredProblems.slice(
    (currentPage - 1) * itemsPerPage,
    currentPage * itemsPerPage
  );

  return (
    <div className="w-full max-w-6xl mx-auto mt-10">

      {/* ── HEADER ── */}
      <div className="flex items-center justify-between mb-8 px-2">
        <div>
          <h2 className="text-2xl font-bold tracking-tight bg-gradient-to-r from-indigo-400 to-purple-400 bg-clip-text text-transparent">Problems</h2>
          <p className="text-sm text-zinc-500 mt-1">{filteredProblems.length} problems found</p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="group flex items-center gap-2 rounded-xl bg-indigo-600 px-5 py-2.5 text-sm font-medium text-white hover:bg-indigo-500 transition-all shadow-lg shadow-indigo-600/20 hover:shadow-indigo-500/30"
        >
          <Plus className="h-4 w-4 transition-transform group-hover:rotate-90" />
          Create Playlist
        </button>
      </div>

      {/* ── FILTERS ── */}
      <div className="flex flex-wrap gap-3 mb-6 px-2">
        <div className="relative flex-1 min-w-[200px]">
          <Search className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-zinc-500" />
          <input
            type="text"
            placeholder="Search problems…"
            value={search}
            onChange={(e) => { setSearch(e.target.value); setCurrentPage(1); }}
            className="w-full rounded-xl border border-zinc-800 bg-zinc-900/80 pl-10 pr-4 py-2.5 text-sm text-zinc-200 placeholder-zinc-500 outline-none focus:border-indigo-500/50 focus:ring-1 focus:ring-indigo-500/20 transition"
          />
        </div>
        <select
          value={difficulty}
          onChange={(e) => { setDifficulty(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-indigo-500/50 transition cursor-pointer"
        >
          <option value="ALL">All Difficulties</option>
          <option value="EASY">Easy</option>
          <option value="MEDIUM">Medium</option>
          <option value="HARD">Hard</option>
        </select>
        <select
          value={selectedTag}
          onChange={(e) => { setSelectedTag(e.target.value); setCurrentPage(1); }}
          className="rounded-xl border border-zinc-800 bg-zinc-900/80 px-4 py-2.5 text-sm text-zinc-300 outline-none focus:border-indigo-500/50 transition cursor-pointer"
        >
          <option value="ALL">All Tags</option>
          {allTags.map((tag) => (
            <option key={tag} value={tag}>{tag}</option>
          ))}
        </select>
      </div>

      {/* ── TABLE ── */}
      <div className="rounded-2xl border border-zinc-800/80 overflow-hidden bg-zinc-900/40">

        {/* Table Header */}
        <div className="grid grid-cols-[48px_1fr_1fr_130px_160px] gap-2 px-6 py-3.5 text-xs font-semibold uppercase tracking-wider text-zinc-500 bg-gradient-to-r from-zinc-900 via-zinc-900/95 to-zinc-900 border-b border-zinc-800/80">
          <span>Status</span>
          <span>Title</span>
          <span>Tags</span>
          <span>Difficulty</span>
          <span>Actions</span>
        </div>

        {/* Rows */}
        <div className="divide-y divide-zinc-800/50">
          {paginatedProblems.length === 0 ? (
            <div className="px-6 py-16 text-center text-sm text-zinc-500">
              No problems match your filters.
            </div>
          ) : (
            paginatedProblems.map((problem) => {
              const isSolved = problem.solvedBy?.some(
                (u) => String(u.userId) === String(authUser?._id)
              );
              const diff = DIFF[problem.difficulty] || DIFF.EASY;
              const accent = rowAccent[problem.difficulty] || "border-l-zinc-800";

              return (
                <div
                  key={problem._id}
                  className={`group grid grid-cols-[48px_1fr_1fr_130px_160px] gap-2 items-center px-6 py-4 border-l-2 transition-all duration-200
                    ${isSolved ? "border-l-emerald-500/60" : `${accent} border-l-transparent`}
                    hover:bg-zinc-800/30 hover:border-l-2 hover:${accent}`}
                >
                  {/* Solved */}
                  <div className="flex items-center justify-center">
                    {isSolved ? (
                      <div className="relative">
                        <CheckCircle2 className="h-5 w-5 text-emerald-400 drop-shadow-[0_0_6px_rgba(16,185,129,0.5)]" />
                      </div>
                    ) : (
                      <Circle className="h-5 w-5 text-zinc-700 group-hover:text-zinc-500 transition" />
                    )}
                  </div>

                  {/* Title */}
                  <div className="min-w-0">
                    <Link
                      to={`/problem/${problem._id}`}
                      className="font-medium text-zinc-200 hover:text-white transition truncate block group-hover:text-indigo-400"
                    >
                      {problem.title}
                    </Link>
                  </div>

                  {/* Tags */}
                  <div className="flex flex-wrap gap-1.5">
                    {problem.tags?.slice(0, 3).map((t, i) => {
                      const tc = getTagColor(t);
                      return (
                        <span
                          key={i}
                          className={`inline-flex items-center rounded-md border px-2 py-0.5 text-[11px] font-medium ${tc.bg} ${tc.text} ${tc.border}`}
                        >
                          {t}
                        </span>
                      );
                    })}
                    {problem.tags?.length > 3 && (
                      <span className="text-[11px] text-zinc-500 px-1">+{problem.tags.length - 3}</span>
                    )}
                  </div>

                  {/* Difficulty */}
                  <div>
                    <span
                      className={`inline-flex items-center gap-1.5 rounded-lg border px-3 py-1 text-xs font-semibold ${diff.bg} ${diff.text} ${diff.border} ${diff.glow}`}
                    >
                      <span className={`w-1.5 h-1.5 rounded-full ${diff.dot}`} />
                      {diff.label}
                    </span>
                  </div>

                  {/* Actions */}
                  <div className="flex items-center gap-2">
                    {authUser?.role === "admin" && (
                      <>
                        <button
                          onClick={() => {
                            toast(
                              (t) => (
                                <div className="flex flex-col gap-3 rounded-xl border border-zinc-700 bg-zinc-900 p-4 shadow-xl">
                                  <span className="text-sm text-zinc-200">Delete this problem?</span>
                                  <div className="flex justify-end gap-2">
                                    <button
                                      onClick={() => toast.dismiss(t.id)}
                                      className="px-3 py-1.5 text-xs font-medium rounded-md border border-zinc-700 text-zinc-300 hover:bg-zinc-800 transition"
                                    >
                                      Cancel
                                    </button>
                                    <button
                                      onClick={async () => {
                                        try {
                                          await onDeleteProblem(problem._id);
                                          toast.dismiss(t.id);
                                          toast.success("Problem deleted");
                                        } catch {
                                          toast.dismiss(t.id);
                                          toast.error("Delete failed");
                                        }
                                      }}
                                      className="px-3 py-1.5 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded-md transition"
                                    >
                                      Delete
                                    </button>
                                  </div>
                                </div>
                              ),
                              { duration: 4000, style: { background: "transparent", boxShadow: "none", padding: 0 } }
                            );
                          }}
                          className="rounded-lg border border-transparent p-2 text-rose-400 hover:bg-rose-500/15 hover:border-rose-500/30 hover:scale-110 transition-all duration-200"
                          title="Delete"
                        >
                          <TrashIcon className="h-4 w-4" />
                        </button>

                        <button
                          onClick={() => navigate(`/edit-problem/${problem._id}`)}
                          className="rounded-lg border border-transparent p-2 text-amber-400 hover:bg-amber-500/15 hover:border-amber-500/30 hover:scale-110 transition-all duration-200"
                          title="Edit"
                        >
                          <PencilIcon className="h-4 w-4" />
                        </button>
                      </>
                    )}

                    <button
                      onClick={() => {
                        setSelectedProblemId(problem._id);
                        setIsAddToPlaylistModalOpen(true);
                      }}
                      className="flex items-center gap-1.5 rounded-lg border border-transparent px-3 py-2 text-xs font-medium text-indigo-400 hover:bg-indigo-500/15 hover:border-indigo-500/30 hover:scale-110 transition-all duration-200"
                      title="Save to Playlist"
                    >
                      <Bookmark className="h-4 w-4" />
                      Save
                    </button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </div>

      {/* ── PAGINATION ── */}
      {totalPages > 1 && (
        <div className="flex items-center justify-between mt-6 px-2">
          <p className="text-xs text-zinc-500">
            Showing {(currentPage - 1) * itemsPerPage + 1}–{Math.min(currentPage * itemsPerPage, filteredProblems.length)} of {filteredProblems.length}
          </p>
          <div className="flex items-center gap-1">
            <button
              disabled={currentPage === 1}
              onClick={() => setCurrentPage((p) => p - 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronLeft className="h-4 w-4" />
            </button>

            {Array.from({ length: totalPages }, (_, i) => i + 1).map((page) => (
              <button
                key={page}
                onClick={() => setCurrentPage(page)}
                className={`flex items-center justify-center h-9 w-9 rounded-lg text-sm font-medium transition
                  ${page === currentPage
                    ? "bg-indigo-600 text-white shadow-lg shadow-indigo-600/20"
                    : "border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200"
                  }`}
              >
                {page}
              </button>
            ))}

            <button
              disabled={currentPage === totalPages}
              onClick={() => setCurrentPage((p) => p + 1)}
              className="flex items-center justify-center h-9 w-9 rounded-lg border border-zinc-800 text-zinc-400 hover:bg-zinc-800 hover:text-zinc-200 transition disabled:opacity-30 disabled:cursor-not-allowed"
            >
              <ChevronRight className="h-4 w-4" />
            </button>
          </div>
        </div>
      )}

      <CreatePlaylistModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSubmit={createPlaylist}
      />
      <AddToPlaylistModal
        isOpen={isAddToPlaylistModalOpen}
        onClose={() => setIsAddToPlaylistModalOpen(false)}
        problemId={selectedProblemId}
      />
    </div>
  );
};

export default ProblemsTable;
