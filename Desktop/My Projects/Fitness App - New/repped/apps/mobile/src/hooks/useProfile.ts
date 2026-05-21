import { useCallback, useEffect, useState } from "react";
import { useAuthStore } from "@repped/shared";
import { supabase } from "../lib/supabase";

export interface AccountProfile {
  id: string;
  display_name: string | null;
  avatar_url: string | null;
  date_of_birth: string | null;
  sex: "male" | "female" | null;
  weight_kg: number | null;
  height_cm: number | null;
  goal: string | null;
  target_weight_kg: number | null;
  training_history: string | null;
  equipment: string | null;
  days_per_week: number | null;
  activity_level: string | null;
  dietary_preference: string | null;
  meat_preferences: string[] | null;
  food_exclusions: string[] | null;
  cuisine_preferences: string[] | null;
  current_injuries: { key: string; severity: string; since: string }[] | null;
}

/**
 * Loads the current user's profile and exposes save helpers for the Account flow.
 * Each save helper updates Supabase, then re-pulls the profile so consumers see the latest.
 */
export function useProfile() {
  const session = useAuthStore((s) => s.session);
  const userId = session?.user?.id;
  const userEmail = session?.user?.email;

  const [profile, setProfile] = useState<AccountProfile | null>(null);
  const [loading, setLoading] = useState(true);

  const load = useCallback(async () => {
    if (!userId) return;
    setLoading(true);
    const { data } = await (supabase
      .from("profiles")
      .select("*")
      .eq("id", userId)
      .single() as any);
    setProfile((data as AccountProfile) ?? null);
    setLoading(false);
  }, [userId]);

  useEffect(() => {
    load();
  }, [load]);

  /** Patches the profile row and refreshes local state. Returns the update error or null. */
  const updateProfile = useCallback(
    async (patch: Partial<AccountProfile>): Promise<Error | null> => {
      if (!userId) return new Error("Not signed in");
      const { error } = await ((supabase.from("profiles") as any)
        .update(patch)
        .eq("id", userId));
      if (error) return error;
      await load();
      return null;
    },
    [userId, load]
  );

  return {
    profile,
    userEmail: userEmail ?? "",
    userId,
    loading,
    reload: load,
    updateProfile,
  };
}
