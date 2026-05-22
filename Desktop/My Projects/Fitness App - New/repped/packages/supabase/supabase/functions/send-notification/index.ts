// Edge Function: send-notification
//
// Sends a push notification to one user's devices via the Expo Push API.
// The sender name shown on the phone is the app's name ("Revive") automatically.
//
// This is a SERVER-TO-SERVER function (DB webhook / pg_cron / your backend). It can
// push to ANY user_id, so it MUST NOT be reachable by end-user clients. Two layers
// protect it:
//   1. verify_jwt = true (pinned in config.toml) — rejects requests with no valid JWT.
//   2. A shared secret header — the caller must present `x-internal-secret` matching
//      the INTERNAL_FN_SECRET function secret. This stops any authenticated end user
//      from spoofing notifications to other users (the IDOR this guard closes).
//
// Invoke:
//   POST /functions/v1/send-notification
//   Headers: { "x-internal-secret": "<INTERNAL_FN_SECRET>" }
//   Body:    { "user_id": "<uuid>", "title": "Time to train 💪", "body": "Your push day is ready" }
//
// Set the secret once:  supabase secrets set INTERNAL_FN_SECRET=$(openssl rand -hex 32)
// Deploy:               supabase functions deploy send-notification
// (SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY are injected by Supabase automatically.)

import { createClient } from "jsr:@supabase/supabase-js@2";

const EXPO_PUSH_URL = "https://exp.host/--/api/v2/push/send";

Deno.serve(async (req) => {
  if (req.method !== "POST") {
    return new Response("Method not allowed", { status: 405 });
  }

  // Authorization: only trusted server callers holding the shared secret may invoke
  // this function, because it can target an arbitrary user_id. Use a constant-time
  // comparison so the check can't be probed via timing.
  const expectedSecret = Deno.env.get("INTERNAL_FN_SECRET");
  const providedSecret = req.headers.get("x-internal-secret") ?? "";
  if (!expectedSecret || !timingSafeEqual(providedSecret, expectedSecret)) {
    return json({ error: "unauthorized" }, 401);
  }

  try {
    const { user_id, title, body, data } = await req.json();
    if (!user_id || !title || !body) {
      return json({ error: "user_id, title and body are required" }, 400);
    }

    const supabase = createClient(
      Deno.env.get("SUPABASE_URL")!,
      Deno.env.get("SUPABASE_SERVICE_ROLE_KEY")!
    );

    const { data: tokens, error } = await supabase
      .from("push_tokens")
      .select("expo_token")
      .eq("user_id", user_id);

    if (error) return json({ error: error.message }, 500);
    if (!tokens || tokens.length === 0) {
      return json({ sent: 0, message: "No registered devices for this user" }, 200);
    }

    // One Expo message per device token.
    const messages = tokens.map((t) => ({
      to: t.expo_token,
      sound: "default",
      title,
      body,
      data: data ?? {},
    }));

    const expoRes = await fetch(EXPO_PUSH_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(messages),
    });

    const result = await expoRes.json();
    return json({ sent: messages.length, expo: result }, 200);
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}

/** Length-independent constant-time string comparison to avoid timing leaks. */
function timingSafeEqual(a: string, b: string): boolean {
  const enc = new TextEncoder();
  const ab = enc.encode(a);
  const bb = enc.encode(b);
  // Compare against the longer length so the loop time doesn't reveal length.
  const len = Math.max(ab.length, bb.length);
  let mismatch = ab.length ^ bb.length;
  for (let i = 0; i < len; i++) {
    mismatch |= (ab[i] ?? 0) ^ (bb[i] ?? 0);
  }
  return mismatch === 0;
}
