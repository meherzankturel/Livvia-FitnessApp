"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";

export default function Settings() {
  const [profile, setProfile] = useState<any>(null);
  const [email, setEmail] = useState("");
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProfile();
  }, []);

  const loadProfile = async () => {
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user;
    if (!user) { window.location.href = "/"; return; }
    setEmail(user.email ?? "");
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    setProfile(data);
    setLoading(false);
  };

  const handleSignOut = async () => {
    await supabase.auth.signOut();
    window.location.href = "/";
  };

  const handleRegenerate = async () => {
    window.location.href = "/today";
  };

  if (loading) {
    return <main className="flex items-center justify-center min-h-screen"><div className="text-gray-400">Loading...</div></main>;
  }

  const formatLabel = (s: string) => s?.replace(/_/g, " ").replace(/\b\w/g, c => c.toUpperCase()) ?? "\u2014";

  return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32">
      <h1 className="text-white text-3xl font-bold mb-6">Settings</h1>

      {profile && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-6">
          <p className="text-gray-500 text-xs uppercase mb-3">Your Profile</p>
          <div className="space-y-2">
            <div className="flex justify-between"><span className="text-gray-400">Email</span><span className="text-white">{email}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Age</span><span className="text-white">{profile.age}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Weight</span><span className="text-white">{profile.weight_kg} kg</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Goal</span><span className="text-white">{formatLabel(profile.goal)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Equipment</span><span className="text-white">{formatLabel(profile.equipment)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Days/Week</span><span className="text-white">{profile.days_per_week}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">Experience</span><span className="text-white">{formatLabel(profile.training_history)}</span></div>
            <div className="flex justify-between"><span className="text-gray-400">TDEE</span><span className="text-white">{profile.tdee ? `${Math.round(profile.tdee)} cal` : "\u2014"}</span></div>
          </div>
        </div>
      )}

      <div className="space-y-3 mb-6">
        <a href="/today" className="block bg-gray-900 rounded-2xl p-5 hover:bg-gray-800 transition-colors">
          <p className="text-white text-lg font-semibold">Regenerate Workout Plan</p>
          <p className="text-gray-500 text-sm mt-1">Get a fresh set of exercises</p>
        </a>
      </div>

      {!profile && (
        <div className="bg-gray-900 rounded-2xl p-5 mb-6 text-center">
          <p className="text-gray-400 mb-3">You haven't completed onboarding yet.</p>
          <a href="/onboarding" className="text-[#0090ff] font-semibold">Complete Onboarding</a>
        </div>
      )}

      <button
        onClick={handleSignOut}
        className="w-full border border-red-900 rounded-2xl py-4 text-red-400 text-lg hover:bg-red-900/20 transition-colors"
      >
        Sign Out
      </button>
    </main>
  );
}
