import React, { useEffect, useState } from 'react';
import { X, Plus, Loader } from 'lucide-react';
import { usePlaylistStore } from '../store/usePlaylistStore';

const AddToPlaylistModal = ({ isOpen, onClose, problemId }) => {
    const { playlists, getAllPlaylists, addProblemToPlaylist, isLoading } = usePlaylistStore();
    const [selectedPlaylist, setSelectedPlaylist] = useState('');

    useEffect(() => {
        if (isOpen) {
            getAllPlaylists();
        }
    }, [isOpen]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        if (!selectedPlaylist) return;

        await addProblemToPlaylist(selectedPlaylist, [problemId]);
        onClose();
    };

    if (!isOpen) return null;

    return (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
            <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl w-full max-w-md shadow-2xl">
                <div className="flex justify-between items-center p-4 border-b border-zinc-800">
                    <h3 className="text-xl font-bold">Add to Playlist</h3>
                    <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 transition">
                        <X className="w-5 h-5" />
                    </button>
                </div>

                <form onSubmit={handleSubmit} className="p-6 space-y-4">
                    <div>
                        <label className="text-sm font-medium text-zinc-300 mb-1 block">Select Playlist</label>
                        <select
                            className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
                            value={selectedPlaylist}
                            onChange={(e) => setSelectedPlaylist(e.target.value)}
                            disabled={isLoading}
                        >
                            <option value="">Select a playlist</option>
                            {playlists
                                .filter((p) => p && p._id)
                                .map((playlist) => (
                                    <option key={playlist._id} value={playlist._id}>
                                        {playlist.name}
                                    </option>
                                ))}


                        </select>
                    </div>

                    <div className="flex justify-end gap-2 mt-6">
                        <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500 transition">
                            Cancel
                        </button>
                        <button
                            type="submit"
                            className="flex items-center gap-2 rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition"
                            disabled={!selectedPlaylist || isLoading}
                        >
                            {isLoading ? <Loader className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                            Add to Playlist
                        </button>
                    </div>
                </form>
            </div>
        </div>
    );
};

export default AddToPlaylistModal;