"use client";

import { useState, useRef, useEffect } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { User, LogOut, ChevronDown, Settings } from "lucide-react";

interface ProfileDropdownProps {
  user: any;
}

export default function ProfileDropdown({ user }: ProfileDropdownProps) {
  const [open, setOpen] = useState(false);
  const ref = useRef<HTMLDivElement>(null);
  const router = useRouter();

  useEffect(() => {
    function handleClickOutside(e: MouseEvent) {
      if (ref.current && !ref.current.contains(e.target as Node)) {
        setOpen(false);
      }
    }
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  const handleLogout = () => {
    localStorage.removeItem("token");
    localStorage.removeItem("user");
    router.push("/");
  };

  const initial = user?.name ? user.name.charAt(0).toUpperCase() : "U";

  return (
    <div ref={ref} className="relative">
      <button
        onClick={() => setOpen(!open)}
        className="flex items-center gap-2 group focus:outline-none"
        aria-label="User menu"
      >
        <div className="w-10 h-10 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-lg shadow-[0_0_15px_rgba(245,158,11,0.5)] transition-all group-hover:scale-105 group-hover:shadow-[0_0_25px_rgba(245,158,11,0.7)] border-2 border-amber-400/30 overflow-hidden">
          {user?.profilePicUrl ? <img src={user.profilePicUrl} alt="User" className="w-full h-full object-cover" /> : initial}
        </div>
        <ChevronDown
          size={16}
          className={`text-slate-400 transition-transform duration-300 ${open ? "rotate-180 text-amber-400" : ""}`}
        />
      </button>

      {/* Dropdown Panel */}
      <div
        className={`absolute right-0 top-full mt-3 w-64 bg-slate-900/95 backdrop-blur-2xl border border-white/10 rounded-2xl shadow-[0_25px_50px_rgba(0,0,0,0.8)] z-[999] overflow-hidden transition-all duration-300 origin-top-right
          ${open ? "opacity-100 scale-100 translate-y-0 pointer-events-auto" : "opacity-0 scale-95 -translate-y-2 pointer-events-none"}`}
      >
        {/* User Info Header */}
        <div className="p-4 border-b border-white/10 bg-gradient-to-r from-amber-600/10 to-transparent">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-xl bg-gradient-to-tr from-amber-600 to-amber-400 flex items-center justify-center text-slate-950 font-black text-xl shadow-lg shrink-0 overflow-hidden">
              {user?.profilePicUrl ? <img src={user.profilePicUrl} alt="User" className="w-full h-full object-cover" /> : initial}
            </div>
            <div className="min-w-0">
              <p className="font-bold text-white truncate">{user?.name || "Traveler"}</p>
              <p className="text-xs text-slate-400 truncate">{user?.email || ""}</p>
            </div>
          </div>
        </div>

        {/* Menu Items */}
        <div className="p-2">
          <button
            onClick={() => {
              setOpen(false);
              router.push("/profile");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all group/item text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-amber-500/10 text-amber-500 flex items-center justify-center group-hover/item:bg-amber-500/20 transition-colors">
              <User size={16} />
            </div>
            <div>
              <p className="font-semibold text-sm">My Profile</p>
              <p className="text-xs text-slate-500">Edit personal info</p>
            </div>
          </button>

          <button
            onClick={() => {
              setOpen(false);
              router.push("/dashboard");
            }}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-300 hover:text-white hover:bg-white/5 transition-all group/item text-left"
          >
            <div className="w-8 h-8 rounded-lg bg-teal-500/10 text-teal-500 flex items-center justify-center group-hover/item:bg-teal-500/20 transition-colors">
              <Settings size={16} />
            </div>
            <div>
              <p className="font-semibold text-sm">Dashboard</p>
              <p className="text-xs text-slate-500">View saved trips</p>
            </div>
          </button>
        </div>

        {/* Logout */}
        <div className="p-2 border-t border-white/10">
          <button
            onClick={handleLogout}
            className="w-full flex items-center gap-3 px-4 py-3 rounded-xl text-slate-400 hover:text-red-400 hover:bg-red-950/40 transition-all group/logout"
          >
            <div className="w-8 h-8 rounded-lg bg-red-500/10 text-red-500 flex items-center justify-center group-hover/logout:bg-red-500/20 transition-colors">
              <LogOut size={16} />
            </div>
            <p className="font-semibold text-sm">Log Out</p>
          </button>
        </div>
      </div>
    </div>
  );
}
