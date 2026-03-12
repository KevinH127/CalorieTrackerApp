"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [username, setUsername] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ username, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        throw new Error(data.error || "Registration failed");
      }

      // Automatically redirect to login upon success
      router.push("/login");
    } catch (err) {
      setError(err.message || "An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full h-full min-h-[80vh]">
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -left-20 w-40 h-40 bg-teal-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -right-20 w-40 h-40 bg-purple-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-3xl font-bold mb-2 text-center text-white relative z-10">Create Account</h1>
        <p className="text-neutral-400 text-center mb-8 relative z-10">Start tracking your calories today</p>

        {error && (
          <div className="bg-red-500/10 border border-red-500/30 text-red-400 p-3 rounded-xl mb-6 text-sm text-center relative z-10">
            {error}
          </div>
        )}

        <form onSubmit={handleSubmit} className="flex flex-col gap-4 relative z-10">
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Username</label>
            <input
              type="text"
              required
              disabled={loading}
              value={username}
              onChange={(e) => setUsername(e.target.value)}
              className="w-full bg-neutral-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="e.g. john_doe"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium text-neutral-300 mb-1">Password</label>
            <input
              type="password"
              required
              disabled={loading}
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              className="w-full bg-neutral-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-teal-500/50"
              placeholder="Min 6 characters"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-teal-500 to-emerald-600 hover:from-teal-400 hover:to-emerald-500 text-white font-medium py-3 rounded-xl mt-4 flex justify-center items-center transition-all disabled:opacity-50 shadow-lg"
          >
           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign Up"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400 mt-6 relative z-10">
          Already have an account?{" "}
          <Link href="/login" className="text-teal-400 hover:text-teal-300 transition-colors">
            Sign in
          </Link>
        </p>
      </div>
    </div>
  );
}
