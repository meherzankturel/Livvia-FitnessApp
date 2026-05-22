/**
 * Thin client for the `ext-proxy` Edge Function.
 *
 * All third-party API keys (Gemini, Google Places, Pexels) live server-side now.
 * The app calls this proxy instead of hitting those APIs directly with embedded keys.
 * supabase.functions.invoke automatically attaches the signed-in user's JWT, which the
 * function verifies — so only authenticated users can spend our API quota.
 */
import { supabase } from "./supabase";

type ProxyAction = "gemini" | "places-search" | "pexels";

export async function callProxy<T>(
  action: ProxyAction,
  payload: Record<string, unknown>
): Promise<T | null> {
  try {
    const { data, error } = await supabase.functions.invoke("ext-proxy", {
      body: { action, payload },
    });
    if (error) {
      console.warn(`[ext-proxy:${action}] ${error.message}`);
      return null;
    }
    return data as T;
  } catch (e) {
    console.warn(`[ext-proxy:${action}] ${e instanceof Error ? e.message : String(e)}`);
    return null;
  }
}
