"use client";

import { useSession, signOut } from "next-auth/react";
import Link from "next/link";
import { LogOut, User } from "lucide-react";

export function NavBar() {
  const { data: session, status } = useSession();

  if (status === "loading") return <div className="h-16" />; // Placeholder

  return (
    <nav className="w-full flex items-center justify-between py-4 px-6 mb-8 border-b border-white/5 bg-neutral-900/30 backdrop-blur-md">
      <Link href="/" className="font-bold text-xl tracking-tight hidden sm:block">
        <span className="bg-gradient-to-r from-emerald-400 to-blue-500 bg-clip-text text-transparent">
          Calorie
        </span>
        <span className="text-white">Tracker</span>
      </Link>

      {session?.user ? (
        <div className="flex flex-1 sm:flex-none items-center justify-between sm:justify-end gap-x-6 w-full sm:w-auto">
          <div className="flex gap-4 items-center font-medium pr-4 sm:pr-0 border-r border-white/10 sm:border-r-0">
            <Link href="/" className="text-neutral-300 hover:text-white transition-colors text-sm">
              Today
            </Link>
            <Link href="/history" className="text-neutral-300 hover:text-white transition-colors text-sm">
              History
            </Link>
          </div>
          <div className="flex items-center gap-4">
            <div className="flex items-center gap-2 text-sm text-neutral-300 bg-neutral-800/50 py-2 px-4 rounded-full border border-white/5 shadow-inner">
              <User className="w-4 h-4 text-emerald-400" />
              <span className="hidden sm:inline">Logged in as </span>
              <span className="font-medium text-white">{session.user.username}</span>
            </div>
          
          <button
            onClick={() => signOut({ callbackUrl: "/login" })}
            className="p-2 text-neutral-400 hover:text-white hover:bg-neutral-800 rounded-full transition-colors group"
            title="Sign Out"
          >
            <LogOut className="w-5 h-5 group-hover:text-red-400 transition-colors" />
          </button>
          </div>
        </div>
      ) : (
        <div className="flex gap-4">
           <Link href="/login" className="text-sm font-medium text-neutral-300 hover:text-white transition-colors py-2">
             Sign In
           </Link>
           <Link href="/register" className="text-sm font-medium bg-emerald-500 hover:bg-emerald-400 text-white px-4 py-2 rounded-xl transition-colors shadow-lg shadow-emerald-500/20">
             Sign Up
           </Link>
        </div>
      )}
    </nav>
  );
}
