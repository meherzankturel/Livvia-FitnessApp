import AsyncStorage from "@react-native-async-storage/async-storage";

// ─── Smart Grocery Save Tips ─────────────────────────────────────────────────
// Pre-generates personalized savings tips using Gemini AI when the grocery
// list loads. Cached so the card flip is instant — no loading spinner.
//
// Flow: Grocery list loads → generateSaveTips() fires in background →
//       Tips cached in AsyncStorage → Card flip reads from cache (instant)

const GEMINI_API_KEY = process.env.EXPO_PUBLIC_GEMINI_API_KEY || "";
const CACHE_KEY = "grocery_save_tips";
const CACHE_EXPIRY_MS = 24 * 60 * 60 * 1000; // 24 hours (tips refresh daily)

export interface SaveTip {
  icon: string;
  text: string;
  savings: string;
}

// Default tips shown while real ones load (or if Gemini fails)
const FALLBACK_TIPS: SaveTip[] = [
  { icon: "🥦", text: "Buy seasonal produce for lower prices", savings: "Save ~$2-4" },
  { icon: "🧊", text: "Frozen proteins are cheaper than fresh", savings: "Save ~$3-5" },
  { icon: "📦", text: "Buy grains & staples in bulk", savings: "Save ~$2-3" },
];

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
  return FALLBACK_TIPS;
}

// ─── Generate personalized tips from Gemini (background) ─────────────────────
export async function generateSaveTips(
  items: { name: string; price: number }[]
): Promise<SaveTip[]> {
  if (!GEMINI_API_KEY || items.length === 0) return FALLBACK_TIPS;

  // Check cache first — don't re-generate if fresh
  try {
    const cached = await AsyncStorage.getItem(CACHE_KEY);
    if (cached) {
      const parsed = JSON.parse(cached);
      if (Date.now() - parsed.timestamp < CACHE_EXPIRY_MS) {
        return parsed.tips;
      }
    }
  } catch {}

  // Build the grocery list summary for Gemini
  const listSummary = items
    .slice(0, 20) // Limit to 20 items to keep prompt short
    .map((i) => `${i.name}: $${i.price.toFixed(2)}`)
    .join(", ");

  const totalCost = items.reduce((sum, i) => sum + i.price, 0);

  const prompt = `You are a smart grocery savings assistant. Given this grocery list (total ~$${totalCost.toFixed(0)}):
${listSummary}

Generate exactly 3 money-saving tips. Each tip must:
- Be specific to items in this list
- Be under 8 words
- Include a realistic savings estimate

Respond ONLY in this exact JSON format, no other text:
[
  {"icon": "emoji", "text": "tip text here", "savings": "Save ~$X.XX"},
  {"icon": "emoji", "text": "tip text here", "savings": "Save ~$X.XX"},
  {"icon": "emoji", "text": "tip text here", "savings": "Save ~$X.XX"}
]`;

  try {
    const response = await fetch(
      `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent?key=${GEMINI_API_KEY}`,
      {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          contents: [{ parts: [{ text: prompt }] }],
          generationConfig: {
            temperature: 0.3,
            maxOutputTokens: 200,
          },
        }),
      }
    );

    if (!response.ok) return FALLBACK_TIPS;

    const data = await response.json();
    const text =
      data?.candidates?.[0]?.content?.parts?.[0]?.text || "";

    // Extract JSON from response (handle markdown code blocks)
    const jsonMatch = text.match(/\[[\s\S]*\]/);
    if (!jsonMatch) return FALLBACK_TIPS;

    const tips: SaveTip[] = JSON.parse(jsonMatch[0]);

    // Validate structure
    if (
      !Array.isArray(tips) ||
      tips.length < 1 ||
      !tips[0].icon ||
      !tips[0].text ||
      !tips[0].savings
    ) {
      return FALLBACK_TIPS;
    }

    // Cache the tips
    await AsyncStorage.setItem(
      CACHE_KEY,
      JSON.stringify({ tips: tips.slice(0, 3), timestamp: Date.now() })
    );

    return tips.slice(0, 3);
  } catch {
    return FALLBACK_TIPS;
  }
}

// ─── Clear cached tips (e.g., when grocery list changes) ─────────────────────
export async function clearTipsCache(): Promise<void> {
  try {
    await AsyncStorage.removeItem(CACHE_KEY);
  } catch {}
}
