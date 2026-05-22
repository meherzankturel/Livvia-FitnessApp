// Gemini is called through the authenticated `ext-proxy` Edge Function — the API key
// lives server-side and is never shipped in the app bundle.
import { callProxy } from "./ai-proxy";

export interface DealResult {
  restaurant: string;
  dish: string;
  price: string;
  deliveryFee: string;
  estimatedTotal: string;
  platform: string; // "UberEats" | "DoorDash" | "Restaurant" | "Pickup"
  orderUrl: string;
  rating: string;
  estimatedTime: string;
  type: "delivery" | "pickup";
}

export async function findBestDeals(
  mealName: string,
  lat: number,
  lng: number,
  dietaryPreference?: string
): Promise<DealResult[]> {
  const dietNote = dietaryPreference && dietaryPreference !== "no_preference"
    ? `\n\nIMPORTANT: The user follows a ${dietaryPreference} diet. ALL suggestions must be ${dietaryPreference}-friendly. Do NOT suggest any non-${dietaryPreference} dishes. Only show restaurants and dishes that strictly match this dietary requirement.`
    : "";

  const prompt = `You are a food deal finder assistant. Find the best restaurant deals for "${mealName}" near coordinates ${lat}, ${lng}.${dietNote}

Return EXACTLY a JSON array (no markdown, no explanation, just the array) with 4-6 options. Each object must have:
{
  "restaurant": "Restaurant Name",
  "dish": "Specific dish name that matches or is similar to ${mealName}",
  "price": "$X.XX",
  "deliveryFee": "$X.XX or Free",
  "estimatedTotal": "$X.XX (price + delivery fee)",
  "platform": "UberEats" or "DoorDash" or "Pickup" or "Restaurant Direct",
  "orderUrl": "https://www.ubereats.com/search?q=QUERY" or "https://www.doordash.com/search/store/QUERY" or Google Maps URL for pickup,
  "rating": "4.5/5",
  "estimatedTime": "25-35 min",
  "type": "delivery" or "pickup"
}

Include a mix of:
- 2 delivery options (UberEats/DoorDash with realistic fees)
- 2 pickup options (no delivery fee, cheaper)
- Prioritize best value (lowest total cost)
- Use real restaurant chains and local restaurant types common in that area
- For orderUrl: use UberEats search URL for UberEats, DoorDash search URL for DoorDash, Google Maps for pickup

Sort by estimatedTotal ascending (cheapest first).
Return ONLY the JSON array, nothing else.`;

  try {
    const result = await callProxy<{ text: string }>("gemini", {
      prompt,
      generationConfig: { temperature: 0.3, maxOutputTokens: 2048 },
    });

    const text = result?.text ?? "";
    if (!text) return [];

    // Extract JSON from response (handle markdown code blocks)
    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }

    // Handle truncated JSON — find the last complete object
    if (!jsonStr.endsWith("]")) {
      const lastBrace = jsonStr.lastIndexOf("}");
      if (lastBrace > 0) {
        jsonStr = jsonStr.substring(0, lastBrace + 1) + "]";
      }
    }

    // Ensure it starts with [
    if (!jsonStr.startsWith("[")) {
      const firstBracket = jsonStr.indexOf("[");
      if (firstBracket >= 0) {
        jsonStr = jsonStr.substring(firstBracket);
      } else {
        return [];
      }
    }

    const results: DealResult[] = JSON.parse(jsonStr);
    return results;
  } catch (error) {
    console.warn("Gemini deal search failed:", error);
    return [];
  }
}

export async function findGroceryDeals(
  items: string[],
  lat: number,
  lng: number
): Promise<{ store: string; estimatedTotal: string; savings: string; distance: string; url: string }[]> {
  if (items.length === 0) return [];

  const itemList = items.slice(0, 15).join(", ");

  const prompt = `Find the best grocery stores near coordinates ${lat}, ${lng} to buy these items: ${itemList}.

Return EXACTLY a JSON array (no markdown, no explanation) with 3-4 stores. Each object:
{
  "store": "Store Name (e.g., Walmart, Costco, Trader Joe's, local store)",
  "estimatedTotal": "$XX.XX for all items",
  "savings": "Save $X.XX vs average" or "Best price",
  "distance": "X.X miles away",
  "url": "Google Maps URL: https://www.google.com/maps/search/STORE+NAME/@${lat},${lng},14z"
}

Sort by estimatedTotal ascending. Return ONLY the JSON array.`;

  try {
    const result = await callProxy<{ text: string }>("gemini", {
      prompt,
      generationConfig: { temperature: 0.3, maxOutputTokens: 1024 },
    });

    const text = result?.text ?? "";
    if (!text) return [];

    let jsonStr = text.trim();
    if (jsonStr.startsWith("```")) {
      jsonStr = jsonStr.replace(/```json?\n?/g, "").replace(/```/g, "").trim();
    }
    if (!jsonStr.endsWith("]")) {
      const lastBrace = jsonStr.lastIndexOf("}");
      if (lastBrace > 0) jsonStr = jsonStr.substring(0, lastBrace + 1) + "]";
    }
    if (!jsonStr.startsWith("[")) {
      const idx = jsonStr.indexOf("[");
      if (idx >= 0) jsonStr = jsonStr.substring(idx);
      else return [];
    }

    return JSON.parse(jsonStr);
  } catch (error) {
    console.warn("Gemini grocery search failed:", error);
    return [];
  }
}
