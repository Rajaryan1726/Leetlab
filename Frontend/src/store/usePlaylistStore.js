import { create } from "zustand";
import { axiosInstance } from "../lib/axios";
import toast from "react-hot-toast";

export const usePlaylistStore = create((set, get) => ({
  playlists: [],
  currentPlaylist: null,
  playlistCount: 0,
  isLoading: false,

  // CREATE
  createPlaylist: async (playlistData) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.post(
        "/playlists/create-playlist",
        playlistData
      );

      set((state) => ({
        playlists: [...state.playlists, res.data.data],
        playlistCount: state.playlistCount + 1,
      }));

      toast.success("Playlist created successfully");
      return res.data.data;
    } catch (error) {
      toast.error(
        error.response?.data?.message || "Failed to create playlist"
      );
      throw error;
    } finally {
      set({ isLoading: false });
    }
  },

  // GET ALL (Profile page)
  getAllPlaylists: async () => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get("/playlists");

      set({
        playlists: res.data.data.playLists || [],
        playlistCount: res.data.data.count || 0,
      });
    } catch (error) {
      toast.error("Failed to fetch playlists");
    } finally {
      set({ isLoading: false });
    }
  },

  // GET ONE
  getPlaylistDetails: async (playlistId) => {
    try {
      set({ isLoading: true });

      const res = await axiosInstance.get(
        `/playlists/${playlistId}`
      );

      set({ currentPlaylist: res.data.data });
    } catch (error) {
      toast.error("Failed to fetch playlist details");
    } finally {
      set({ isLoading: false });
    }
  },

  // ADD PROBLEM
  addProblemToPlaylist: async (playlistId, problemIds) => {
    try {
      set({ isLoading: true });

      await axiosInstance.post(
        `/playlists/${playlistId}/add-problem`,
        { problemIds }
      );

      toast.success("Problem added to playlist");

      if (get().currentPlaylist?._id === playlistId) {
        await get().getPlaylistDetails(playlistId);
      }
    } catch (error) {
      toast.error("Failed to add problem to playlist");
    } finally {
      set({ isLoading: false });
    }
  },

  // REMOVE PROBLEM
  removeProblemFromPlaylist: async (playlistId, problemIds) => {
    try {
      set({ isLoading: true });

      await axiosInstance.delete(
        `/playlists/${playlistId}/remove-problem`,
        { data: { problemIds } }
      );

      toast.success("Problem removed from playlist");

      if (get().currentPlaylist?._id === playlistId) {
        await get().getPlaylistDetails(playlistId);
      }
    } catch (error) {
      toast.error("Failed to remove problem from playlist");
    } finally {
      set({ isLoading: false });
    }
  },

  // DELETE
  deletePlaylist: async (playlistId) => {
    try {
      set({ isLoading: true });

      await axiosInstance.delete(
        `/playlists/${playlistId}`
      );

      set((state) => ({
        playlists: state.playlists.filter(
          (p) => p._id !== playlistId
        ),
        playlistCount: Math.max(state.playlistCount - 1, 0),
      }));

      toast.success("Playlist deleted successfully");
    } catch (error) {
      toast.error("Failed to delete playlist");
    } finally {
      set({ isLoading: false });
    }
  },
}));
