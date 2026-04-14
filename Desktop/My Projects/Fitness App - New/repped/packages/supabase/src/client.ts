import { createClient as supabaseCreateClient } from "@supabase/supabase-js";
import type { Database } from "./types";
import type { SupabaseClientOptions } from "@supabase/supabase-js";

export function createClient(
  supabaseUrl: string,
  supabaseAnonKey: string,
  options?: SupabaseClientOptions<"public">
) {
  return supabaseCreateClient<Database>(supabaseUrl, supabaseAnonKey, {
    auth: {
      autoRefreshToken: true,
      persistSession: true,
      detectSessionInUrl: typeof window !== "undefined",
      ...options?.auth,
    },
    ...options,
  });
}
