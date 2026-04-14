import type { SupabaseClient } from "@supabase/supabase-js";
import type { Database } from "./types";

type Client = SupabaseClient<Database>;
type ProfileInsert = Database["public"]["Tables"]["profiles"]["Insert"];

export async function signUpWithEmail(
  client: Client,
  email: string,
  password: string
) {
  return client.auth.signUp({ email, password });
}

export async function signInWithEmail(
  client: Client,
  email: string,
  password: string
) {
  return client.auth.signInWithPassword({ email, password });
}

export async function signOut(client: Client) {
  return client.auth.signOut();
}

export async function getProfile(client: Client, userId: string) {
  return client.from("profiles").select("*").eq("id", userId).single();
}

export async function upsertProfile(
  client: Client,
  profile: ProfileInsert
) {
  return client.from("profiles").upsert(profile as any);
}
