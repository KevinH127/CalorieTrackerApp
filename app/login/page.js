"use client";

import { useState } from "react";
import { signIn } from "next-auth/react";
import { useRouter } from "next/navigation";
import Link from "next/link";
import { Loader2 } from "lucide-react";

export default function LoginPage() {
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
      const result = await signIn("credentials", {
        username,
        password,
        redirect: false,
      });

      if (result?.error) {
        setError("Invalid username or password.");
      } else {
        router.push("/");
        router.refresh(); // Refresh layout to show updated session
      }
    } catch (err) {
      setError("An unexpected error occurred.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex-1 flex items-center justify-center p-4 w-full h-full min-h-[80vh]">
      <div className="max-w-md w-full bg-neutral-900/80 backdrop-blur-xl border border-white/10 p-8 rounded-3xl shadow-2xl relative overflow-hidden">
        <div className="absolute -top-20 -right-20 w-40 h-40 bg-emerald-500/20 blur-[80px] rounded-full pointer-events-none" />
        <div className="absolute -bottom-20 -left-20 w-40 h-40 bg-blue-500/20 blur-[80px] rounded-full pointer-events-none" />
        
        <h1 className="text-3xl font-bold mb-2 text-center text-white relative z-10">Welcome Back</h1>
        <p className="text-neutral-400 text-center mb-8 relative z-10">Login to your Calorie Tracker</p>

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
              className="w-full bg-neutral-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
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
              className="w-full bg-neutral-800/80 border border-white/10 rounded-xl px-4 py-3 text-white focus:outline-none focus:ring-2 focus:ring-emerald-500/50"
              placeholder="••••••••"
            />
          </div>

          <button
            type="submit"
            disabled={loading || !username || !password}
            className="w-full bg-gradient-to-r from-emerald-500 to-teal-600 hover:from-emerald-400 hover:to-teal-500 text-white font-medium py-3 rounded-xl mt-4 flex justify-center items-center transition-all disabled:opacity-50 shadow-lg"
          >
           {loading ? <Loader2 className="w-5 h-5 animate-spin" /> : "Sign In"}
          </button>
        </form>

        <p className="text-center text-sm text-neutral-400 mt-6 relative z-10">
          Don't have an account?{" "}
          <Link href="/register" className="text-emerald-400 hover:text-emerald-300 transition-colors">
            Sign up
          </Link>
        </p>
      </div>
    </div>
  );
}
