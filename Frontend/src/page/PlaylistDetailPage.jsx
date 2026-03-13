import React, { useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { usePlaylistStore } from "../store/usePlaylistStore";

const PlaylistDetailPage = () => {
  const { playlistId } = useParams();

  const {
    currentPlaylist,
    getPlaylistDetails,
    isLoading,
  } = usePlaylistStore();

  useEffect(() => {
    getPlaylistDetails(playlistId);
  }, [playlistId, getPlaylistDetails]);

  if (isLoading || !currentPlaylist) {
    return (
      <div className="min-h-screen flex items-center justify-center text-gray-400">
        Loading playlist...
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-black text-gray-200 p-8">
      <div className="max-w-5xl mx-auto space-y-6">

        {/* HEADER */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h1 className="text-2xl font-semibold">
            {currentPlaylist.name}
          </h1>

          {currentPlaylist.description && (
            <p className="text-sm text-gray-400 mt-2">
              {currentPlaylist.description}
            </p>
          )}
        </div>

        {/* PROBLEMS */}
        <div className="bg-neutral-900 rounded-2xl p-6 border border-white/10">
          <h2 className="text-lg font-semibold mb-4">
            Problems in this playlist
          </h2>

          {currentPlaylist.problems.length === 0 ? (
            <p className="text-gray-400">
              No valid problems in this playlist.
            </p>
          ) : (
            <div className="space-y-3">
              {currentPlaylist.problems.map((p) => (
                <Link
                  to={`/problem/${p.problemId}`}
                  key={p.problemId}
                  className="flex justify-between items-center bg-neutral-800 p-4 rounded-xl hover:bg-neutral-700 transition"
                >
                  <span className="font-medium">
                    {p.title}
                  </span>

                  <span
                    className={`text-sm font-semibold ${p.difficulty === "EASY"
                      ? "text-green-400"
                      : p.difficulty === "MEDIUM"
                        ? "text-yellow-400"
                        : "text-red-400"
                      }`}
                  >
                    {p.difficulty}
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>

      </div>
    </div>
  );
};

export default PlaylistDetailPage;
