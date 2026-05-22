import AsyncStorage from "@react-native-async-storage/async-storage";
import { callProxy } from "./ai-proxy";

// ─── Smart Grocery Tips ─────────────────────────────────────────────────────
// Generates personalized shopping & nutrition tips from the grocery list
// using Gemini AI (via the authenticated ext-proxy Edge Function — no embedded key).
// Cached for 24 hours so the card flip is instant.
//
// Tips are globally relevant — no currency, no region-specific pricing.

const CACHE_KEY = "grocery_save_tips";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours

export interface SaveTip {
  icon: string;
  text: string;
  detail: string;
}

// ─── Curated fallback tips (globally applicable, no currency) ───────────────
const FALLBACK_TIPS: SaveTip[] = [
  { icon: "🥦", text: "Buy seasonal produce", detail: "In-season fruits & vegetables are fresher and more affordable everywhere" },
  { icon: "📦", text: "Buy grains & lentils in bulk", detail: "Rice, oats, and lentils last months and cost less per kg when bought in larger packs" },
  { icon: "🍗", text: "Prep proteins in batches", detail: "Cook chicken or tofu for 2-3 days at once — saves time and reduces waste" },
  { icon: "🧊", text: "Freeze what you won't use", detail: "Bread, berries, and cooked rice freeze well — use within the week to cut waste" },
  { icon: "🥚", text: "Eggs are your best value protein", detail: "High protein, versatile, and among the most affordable protein sources globally" },
];

/** Pick 3 random tips from the pool to keep it fresh */
function pickFallbackTips(): SaveTip[] {
  const shuffled = [...FALLBACK_TIPS].sort(() => Math.random() - 0.5);
  return shuffled.slice(0, 3);
}

// ─── Get cached tips (instant) ───────────────────────────────────────────────
export async function getCachedTips(): Promise<SaveTip[]> {
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
        return parsed.tips;
      }
    }
  } catch {}
  return pickFallbackTips();
}

// ─── Generate personalized tips from Gemini (background) ─────────────────────
export async function generateSaveTips(
  items: { name: string; price: number }[]
): Promise<SaveTip[]> {
  const fallback = pickFallbackTips();
  if (items.length === 0) return fallback;

  // Build a fingerprint of the current list so tips refresh when meals change
  const listSummary = items
    .slice(0, 20)
    .map((i) => i.name)
    .join(", ");
  const listHash = listSummary.length.toString() + "_" + items.length;

  // Check cache — only use if same grocery list and still fresh
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS && parsed.listHash === listHash) {
        return parsed.tips;
      }
    }
  } catch {}

  const prompt = `You are a smart grocery shopping assistant for a global fitness app. Given this weekly grocery list:
${listSummary}

Generate exactly 3 helpful shopping tips. Each tip must:
- Be specific to items in this list (reference actual ingredients)
- Be globally applicable (no specific currencies, no region-specific stores)
- Focus on: reducing waste, smart shopping, meal prep efficiency, or nutrition optimization
- Be practical and actionable

Respond ONLY in this exact JSON format, no other text:
[
  {"icon": "single emoji", "text": "Short title (under 6 words)", "detail": "One sentence explanation (under 20 words)"},
  {"icon": "single emoji", "text": "Short title (under 6 words)", "detail": "One sentence explanation (under 20 words)"},
  {"icon": "single emoji", "text": "Short title (under 6 words)", "detail": "One sentence explanation (under 20 words)"}
]`;

  try {
    const result = await callProxy<{ text: string }>("gemini", {
      prompt,
      generationConfig: { temperature: 0.4, maxOutputTokens: 300 },
    });
    const text = result?.text || "";

    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return fallback;

    const tips: SaveTip[] = JSON.parse(jsonMatch[0]);

    if (!Array.isArray(tips) || tips.length < 1 || !tips[0].icon || !tips[0].text || !tips[0].detail) {
      return fallback;
    }

    const validTips = tips.slice(0, 3);

    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ tips: validTips, timestamp: Date.now(), listHash })
    );

    return validTips;
  } catch {
    return fallback;
  }
}

// ─── Clear cached tips ──────────────────────────────────────────────────────
export async function clearTipsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {}
}
