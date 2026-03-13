import React from "react";
import { User, Code, LogOut, Bot, Terminal } from "lucide-react";
import { useAuthStore } from "../store/useAuthStore";
import { Link } from "react-router-dom";
import LogoutButton from "./LogoutButton";

const Navbar = () => {
  const { authUser } = useAuthStore();

  return (
    <nav className="sticky top-0 z-50 w-full">
      {/* Glass background layer */}
      <div className="absolute inset-0 bg-zinc-950/70 backdrop-blur-2xl" />
      {/* Bottom gradient border */}
      <div className="absolute bottom-0 left-0 right-0 h-[1px] bg-gradient-to-r from-transparent via-indigo-500/40 to-transparent" />

      <div className="relative mx-auto max-w-7xl px-6 py-3">
        <div className="flex w-full items-center justify-between">

          {/* LEFT – Logo */}
          <Link to="/" className="flex items-center gap-3 group">
            {/* Glowing icon container */}
            <div className="relative">
              <div className="absolute -inset-1 rounded-xl bg-gradient-to-br from-indigo-500/20 to-purple-500/20 blur-md opacity-0 group-hover:opacity-100 transition-opacity duration-500" />
              <div className="relative flex items-center justify-center h-10 w-10 rounded-xl bg-gradient-to-br from-indigo-500/10 to-purple-500/10 border border-indigo-500/20 group-hover:border-indigo-500/40 transition-all duration-300 group-hover:shadow-[0_0_20px_rgba(99,102,241,0.15)]">
                <Terminal className="h-5 w-5 text-indigo-400 group-hover:text-indigo-300 transition-colors" />
              </div>
            </div>
            <div className="hidden md:flex items-center gap-1.5">
              <span className="text-xl font-extrabold tracking-tight bg-gradient-to-r from-white via-indigo-200 to-purple-400 bg-clip-text text-transparent">
                Leetlab
              </span>
              <span className="relative flex h-2 w-2 ml-0.5">
                <span className="absolute inline-flex h-full w-full rounded-full bg-indigo-400 opacity-75 animate-ping" />
                <span className="relative inline-flex h-2 w-2 rounded-full bg-indigo-500" />
              </span>
            </div>
          </Link>

          {/* RIGHT – Nav items */}
          <div className="flex items-center gap-4">
            {/* Avatar dropdown */}
            <div className="dropdown dropdown-end">
              <label tabIndex={0} className="cursor-pointer">
                <div className="group relative">
                  {/* Gradient ring – visible on hover */}
                  <div className="absolute -inset-[3px] rounded-full bg-gradient-to-br from-indigo-500 via-purple-500 to-pink-500 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
                  <div className="relative w-10 h-10 rounded-full border-2 border-zinc-700 overflow-hidden bg-zinc-900 group-hover:border-transparent transition-all duration-300">
                    <img
                      src={
                        authUser?.avatar?.url ||
                        `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser?.username || "guest"}`
                      }
                      alt="User Avatar"
                      className="w-full h-full object-cover"
                    />
                  </div>
                </div>
              </label>

              {/* Dropdown menu */}
              <ul className="menu dropdown-content mt-4 z-[100] w-64 rounded-2xl border border-zinc-800/80 bg-zinc-900/95 backdrop-blur-2xl p-2 shadow-[0_20px_60px_-15px_rgba(0,0,0,0.8)] space-y-0.5">
                {/* User Info Header */}
                <li className="pointer-events-none mb-1">
                  <div className="flex items-center gap-3 rounded-xl bg-gradient-to-br from-indigo-500/[0.07] to-purple-500/[0.07] border border-zinc-800/50 p-3">
                    <div className="relative shrink-0">
                      <div className="w-10 h-10 rounded-full border-2 border-zinc-700/50 overflow-hidden">
                        <img
                          src={
                            authUser?.image ||
                            `https://api.dicebear.com/7.x/bottts/svg?seed=${authUser?.username || "guest"}`
                          }
                          alt="User Avatar"
                          className="w-full h-full object-cover"
                        />
                      </div>
                    </div>
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-semibold text-zinc-100 truncate">
                        {authUser?.name}
                      </p>
                      <p className="text-xs text-zinc-500 truncate">
                        {authUser?.email}
                      </p>
                    </div>
                  </div>
                </li>

                <div className="mx-2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-1" />

                <li>
                  <Link
                    to="/profile"
                    className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-all duration-200 hover:bg-zinc-800/60 hover:text-white"
                  >
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800/60 group-hover/item:bg-indigo-500/10 transition">
                      <User className="w-4 h-4 group-hover/item:text-indigo-400 transition" />
                    </div>
                    <span className="font-medium">My Profile</span>
                  </Link>
                </li>

                {authUser?.role === "admin" && (
                  <li>
                    <Link
                      to="/add-problem"
                      className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-all duration-200 hover:bg-zinc-800/60 hover:text-white"
                    >
                      <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800/60 group-hover/item:bg-indigo-500/10 transition">
                        <Code className="w-4 h-4 group-hover/item:text-indigo-400 transition" />
                      </div>
                      <span className="font-medium">Add Problem</span>
                    </Link>
                  </li>
                )}

                <div className="mx-2 h-px bg-gradient-to-r from-transparent via-zinc-800 to-transparent my-1" />

                <li>
                  <LogoutButton className="group/item flex items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-zinc-400 transition-all duration-200 hover:bg-rose-500/[0.08] hover:text-rose-400 w-full">
                    <div className="flex items-center justify-center h-8 w-8 rounded-lg bg-zinc-800/60 group-hover/item:bg-rose-500/10 transition">
                      <LogOut className="w-4 h-4 group-hover/item:text-rose-400 transition" />
                    </div>
                    <span className="font-medium">Logout</span>
                  </LogoutButton>
                </li>
              </ul>
            </div>
          </div>
        </div>
      </div>
    </nav>
  );
};

export default Navbar;
