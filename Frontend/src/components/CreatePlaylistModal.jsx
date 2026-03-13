import React from 'react'
import { useForm } from "react-hook-form";
import { X } from "lucide-react";
const CreatePlaylistModal = ({ isOpen, onClose, onSubmit }) => {
  const { register, handleSubmit, formState: { errors }, reset } = useForm();

  const handleFormSubmit = async (data) => {
    await onSubmit(data);
    reset()
    onClose()
  }

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/60 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="rounded-2xl border border-zinc-800 bg-zinc-900/95 backdrop-blur-xl w-full max-w-md shadow-2xl">
        <div className="flex justify-between items-center p-4 border-b border-zinc-800">
          <h3 className="text-xl font-bold">Create New Playlist</h3>
          <button onClick={onClose} className="p-2 rounded-full hover:bg-zinc-800 transition">
            <X className="w-5 h-5" />
          </button>
        </div>

        <form onSubmit={handleSubmit(handleFormSubmit)} className="p-6 space-y-4">
          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Playlist Name</label>
            <input
              type="text"
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500"
              placeholder="Enter playlist name"
              {...register('name', { required: 'Playlist name is required' })}
            />
            {errors.name && (
              <p className="text-xs text-red-400 mt-1">{errors.name.message}</p>
            )}
          </div>

          <div>
            <label className="text-sm font-medium text-zinc-300 mb-1 block">Description</label>
            <textarea
              className="w-full rounded-lg border border-zinc-700 bg-zinc-950 px-4 py-2.5 text-sm outline-none focus:border-indigo-500 h-24 resize-none"
              placeholder="Enter playlist description"
              {...register('description')}
            />
          </div>

          <div className="flex justify-end gap-2 mt-6">
            <button type="button" onClick={onClose} className="rounded-lg border border-zinc-700 px-4 py-2 text-sm font-medium hover:border-zinc-500 transition">
              Cancel
            </button>
            <button type="submit" className="rounded-lg bg-indigo-600 px-4 py-2 text-sm font-medium text-white hover:bg-indigo-500 transition">
              Create Playlist
            </button>
          </div>
        </form>
      </div>
    </div>
  )
}

export default CreatePlaylistModal