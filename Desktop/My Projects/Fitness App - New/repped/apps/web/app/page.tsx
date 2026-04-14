"use client";

import { useState, useEffect } from "react";
import { useRouter } from "next/navigation";
import { supabase } from "../src/lib/supabase";

export default function Home() {
  const router = useRouter();
  const [mode, setMode] = useState<"signin" | "signup">("signin");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState<string | null>(null);

  useEffect(() => {
    // Use getSession (reads from local storage, instant) not getUser (network call)
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user) {
        routeUser(session.user.id);
      }
    });
  }, []);

  const routeUser = async (userId: string) => {
    const { data } = await supabase.from("profiles")
      .select("onboarding_completed").eq("id", userId).single();
    router.replace((data as any)?.onboarding_completed ? "/today" : "/onboarding");
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setError(null);
    setSuccess(null);

    if (mode === "signup") {
      const { error } = await supabase.auth.signUp({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      else setSuccess("Check your email to confirm your account.");
      setLoading(false);
    } else {
      const { data, error } = await supabase.auth.signInWithPassword({ email, password });
      if (error) { setError(error.message); setLoading(false); }
      else if (data.user) {
        await routeUser(data.user.id);
      }
    }
  };

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6">
      <h1 className="text-white text-5xl font-bold mb-2">Livvia</h1>
      <p className="text-gray-400 text-xl mb-12">Your workout, simplified.</p>

      <form onSubmit={handleSubmit} className="w-full max-w-sm space-y-4">
        <input type="email" placeholder="Email" value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="w-full bg-gray-900 text-white text-lg rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#0090ff] placeholder:text-gray-600" />
        <input type="password" placeholder={mode === "signup" ? "Password (6+ characters)" : "Password"}
          value={password} onChange={(e) => setPassword(e.target.value)}
          className="w-full bg-gray-900 text-white text-lg rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#0090ff] placeholder:text-gray-600" />

        {error && <p className="text-red-400 text-center text-sm">{error}</p>}
        {success && <p className="text-green-400 text-center text-sm">{success}</p>}

        <button type="submit" disabled={loading || !email || password.length < 6}
          className="w-full bg-[#0090ff] hover:bg-[#0070dd] disabled:bg-gray-800 disabled:text-gray-600 text-white rounded-2xl py-4 text-lg font-semibold transition-colors">
          {loading ? "Signing in..." : mode === "signin" ? "Sign In" : "Create Account"}
        </button>

        <button type="button"
          onClick={() => { setMode(mode === "signin" ? "signup" : "signin"); setError(null); setSuccess(null); }}
          className="w-full text-gray-400 text-sm py-2">
          {mode === "signin" ? "Don't have an account? Sign Up" : "Already have an account? Sign In"}
        </button>
      </form>
    </main>
  );
}
