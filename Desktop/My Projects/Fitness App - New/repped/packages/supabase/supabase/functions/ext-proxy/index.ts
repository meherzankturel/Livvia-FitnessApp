// Edge Function: ext-proxy
//
// Authenticated proxy for the third-party APIs the mobile app used to call directly
// with EXPO_PUBLIC_* keys. Those keys are embedded in the shipped app bundle and are
// trivially extractable, letting anyone run up your Google/Gemini bill. This function
// keeps the keys server-side and only serves requests from a logged-in Revive user.
//
// Security model:
//   1. verify_jwt = true (config.toml) — the gateway rejects requests with no JWT.
//   2. We additionally call auth.getUser() so an anon-key-only caller (the anon key is
//      public) is rejected — it must be a real authenticated user session.
//   3. Keys live in function secrets, never in the client:
//        supabase secrets set GEMINI_API_KEY=...
//        supabase secrets set GOOGLE_PLACES_API_KEY=...
//        supabase secrets set PEXELS_API_KEY=...
//   4. Outbound hosts are hardcoded constants — the client cannot redirect them (no SSRF).
//
// Deploy:  supabase functions deploy ext-proxy
//
// Request:  POST /functions/v1/ext-proxy   (Authorization: Bearer <user JWT> — added
//           automatically by supabase.functions.invoke on the client)
//   { "action": "gemini"  , "payload": { "prompt": "...", "generationConfig": {...} } }
//   { "action": "places-search", "payload": { "textQuery": "...", "lat": 0, "lng": 0, "radius": 5000, "maxResultCount": 6 } }
//   { "action": "pexels"  , "payload": { "query": "..." } }

import { createClient } from "jsr:@supabase/supabase-js@2";

const GEMINI_URL =
  "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";
const PLACES_SEARCH_URL = "https://places.googleapis.com/v1/places:searchText";
const PLACES_HOST = "https://places.googleapis.com/v1/";
const PEXELS_URL = "https://api.pexels.com/v1/search";

// Cap model output so a leaked/abused session can't request huge (expensive) generations.
const MAX_OUTPUT_TOKENS = 4096;

Deno.serve(async (req) => {
  if (req.method !== "POST") return json({ error: "Method not allowed" }, 405);

  // Require a real authenticated user (not just any valid project JWT / the anon key).
  const authHeader = req.headers.get("Authorization") ?? "";
  const supabase = createClient(
    Deno.env.get("SUPABASE_URL")!,
    Deno.env.get("SUPABASE_ANON_KEY")!,
    { global: { headers: { Authorization: authHeader } } }
  );
  const { data: userData, error: userErr } = await supabase.auth.getUser();
  if (userErr || !userData?.user) return json({ error: "unauthorized" }, 401);

  // Per-user rate limit (cost-abuse protection): 30 requests / 60s. State is kept in
  // Postgres via consume_rate_limit() so it holds across all function workers. Fail
  // OPEN on a limiter error so a transient DB hiccup doesn't break the feature.
  const { data: allowed, error: rlErr } = await supabase.rpc("consume_rate_limit", {
    p_limit: 30,
    p_window_seconds: 60,
  });
  if (!rlErr && allowed === false) {
    return json({ error: "Too many requests. Please slow down and try again shortly." }, 429);
  }

  let action: string, payload: Record<string, unknown>;
  try {
    const parsed = await req.json();
    action = parsed.action;
    payload = parsed.payload ?? {};
  } catch {
    return json({ error: "invalid JSON body" }, 400);
  }

  try {
    switch (action) {
      case "gemini":
        return await handleGemini(payload);
      case "places-search":
        return await handlePlacesSearch(payload);
      case "pexels":
        return await handlePexels(payload);
      default:
        return json({ error: `unknown action: ${action}` }, 400);
    }
  } catch (e) {
    return json({ error: e instanceof Error ? e.message : String(e) }, 500);
  }
});

// ─── Gemini ──────────────────────────────────────────────────────────────────
async function handleGemini(payload: Record<string, unknown>): Promise<Response> {
  const key = Deno.env.get("GEMINI_API_KEY");
  if (!key) return json({ error: "GEMINI_API_KEY not configured" }, 500);

  const prompt = typeof payload.prompt === "string" ? payload.prompt : "";
  if (!prompt) return json({ error: "prompt is required" }, 400);

  const cfg = (payload.generationConfig ?? {}) as Record<string, number>;
  const generationConfig = {
    temperature: typeof cfg.temperature === "number" ? cfg.temperature : 0.3,
    maxOutputTokens: Math.min(
      typeof cfg.maxOutputTokens === "number" ? cfg.maxOutputTokens : 1024,
      MAX_OUTPUT_TOKENS
    ),
  };

  const res = await fetch(`${GEMINI_URL}?key=${key}`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ contents: [{ parts: [{ text: prompt }] }], generationConfig }),
  });
  const data = await res.json();
  if (data?.error) return json({ error: data.error.message ?? "gemini error" }, 502);

  const text = data?.candidates?.[0]?.content?.parts?.[0]?.text ?? "";
  return json({ text }, 200);
}

// ─── Google Places (text search + keyless photo resolution) ───────────────────
async function handlePlacesSearch(payload: Record<string, unknown>): Promise<Response> {
  const key = Deno.env.get("GOOGLE_PLACES_API_KEY");
  if (!key) return json({ error: "GOOGLE_PLACES_API_KEY not configured" }, 500);

  const textQuery = typeof payload.textQuery === "string" ? payload.textQuery : "";
  if (!textQuery) return json({ error: "textQuery is required" }, 400);
  const lat = Number(payload.lat);
  const lng = Number(payload.lng);
  const radius = Number(payload.radius) || 5000;
  const maxResultCount = Math.min(Number(payload.maxResultCount) || 6, 20);

  const body: Record<string, unknown> = { textQuery, maxResultCount };
  if (Number.isFinite(lat) && Number.isFinite(lng)) {
    body.locationBias = { circle: { center: { latitude: lat, longitude: lng }, radius } };
  }

  const res = await fetch(PLACES_SEARCH_URL, {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
      "X-Goog-Api-Key": key,
      "X-Goog-FieldMask":
        "places.displayName,places.formattedAddress,places.rating,places.priceLevel,places.currentOpeningHours,places.googleMapsUri,places.photos,places.location",
    },
    body: JSON.stringify(body),
  });
  const data = await res.json();
  if (data?.error) return json({ error: data.error.message ?? "places error" }, 502);

  const places = Array.isArray(data.places) ? data.places : [];

  // Resolve the first photo of each place to a KEYLESS public Google CDN URL so the
  // client never needs the API key to render thumbnails. Best-effort: null on failure
  // (the client already treats photoUri === null as "no thumbnail").
  await Promise.all(
    places.map(async (place: any) => {
      const photoName = place?.photos?.[0]?.name;
      if (!photoName) return;
      try {
        const r = await fetch(
          `${PLACES_HOST}${photoName}/media?maxHeightPx=200&maxWidthPx=300&skipHttpRedirect=true&key=${key}`
        );
        const pj = await r.json();
        place.photoUri = typeof pj?.photoUri === "string" ? pj.photoUri : null;
      } catch {
        place.photoUri = null;
      }
    })
  );

  return json({ places }, 200);
}

// ─── Pexels (returns a public CDN image URL; the key never leaves the server) ──
async function handlePexels(payload: Record<string, unknown>): Promise<Response> {
  const key = Deno.env.get("PEXELS_API_KEY");
  if (!key) return json({ error: "PEXELS_API_KEY not configured" }, 500);

  const query = typeof payload.query === "string" ? payload.query.trim() : "";
  if (!query) return json({ url: null }, 200);

  const res = await fetch(
    `${PEXELS_URL}?query=${encodeURIComponent(query)}&per_page=1&orientation=landscape`,
    { headers: { Authorization: key } }
  );
  if (!res.ok) return json({ url: null }, 200);

  const data = await res.json();
  const url = data?.photos?.[0]?.src?.large ?? null;
  return json({ url }, 200);
}

function json(payload: unknown, status: number): Response {
  return new Response(JSON.stringify(payload), {
    status,
    headers: { "Content-Type": "application/json" },
  });
}
