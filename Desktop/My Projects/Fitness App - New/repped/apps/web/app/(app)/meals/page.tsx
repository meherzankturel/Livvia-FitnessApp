"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../src/lib/supabase";
import { generateMealPlanWithAlternatives, regenerateSingleMeal, TAKEOUT_GUIDES } from "@repped/shared";
import type { Meal, MacroTargets } from "@repped/shared";
import Link from "next/link";

interface MealSlot {
  selected: Meal & { recipe?: any };
  alternatives: (Meal & { recipe?: any })[];
  category: string;
  mode: "cook" | "eatout";
  showAlts: boolean;
  showRecipe: boolean;
}

const LABELS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CATEGORIES = ["breakfast", "lunch", "dinner", "snack"];

export default function Meals() {
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [targets, setTargets] = useState<MacroTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  useEffect(() => { loadMealPlan(); }, []);

  const loadMealPlan = async () => {
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;
    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const p = data as any;
    setProfile(p);
    if (!p?.tdee) { setLoading(false); return; }

    const plan = generateMealPlanWithAlternatives(p.tdee, p.goal, p.weight_kg, p.dietary_preference, p.food_exclusions || []);
    setTargets(plan.targets);
    setSlots(plan.slots.map((s, i) => ({
      selected: s.selected as any, alternatives: s.alternatives as any[],
      category: CATEGORIES[i], mode: "cook", showAlts: false, showRecipe: false,
    })));
    setLoading(false);
  };

  const handleRegenerate = (index: number) => {
    if (!profile || !targets) return;
    const slot = slots[index];
    const newMeal = regenerateSingleMeal(
      slot.category as any, targets.calories * [0.25, 0.35, 0.30, 0.10][index],
      profile.dietary_preference, profile.food_exclusions || [],
      [slot.selected.name, ...slot.alternatives.map((a: any) => a.name)]
    );
    const updated = [...slots];
    updated[index] = { ...updated[index], selected: newMeal as any, showRecipe: false };
    setSlots(updated);
  };

  const handlePickAlt = (slotIdx: number, altIdx: number) => {
    const updated = [...slots];
    const slot = updated[slotIdx];
    const picked = slot.alternatives[altIdx];
    slot.alternatives[altIdx] = slot.selected;
    slot.selected = picked;
    slot.showRecipe = false;
    setSlots(updated);
  };

  const toggleMode = (i: number) => {
    const updated = [...slots];
    updated[i] = { ...updated[i], mode: updated[i].mode === "cook" ? "eatout" : "cook", showRecipe: false };
    setSlots(updated);
  };

  const toggleAlts = (i: number) => {
    const updated = [...slots];
    updated[i] = { ...updated[i], showAlts: !updated[i].showAlts };
    setSlots(updated);
  };

  const toggleRecipe = (i: number) => {
    const updated = [...slots];
    updated[i] = { ...updated[i], showRecipe: !updated[i].showRecipe };
    setSlots(updated);
  };

  const getTakeoutSuggestions = (category: string) => {
    return TAKEOUT_GUIDES.flatMap(g =>
      g.items.filter(item => item.meal_type === category).map(item => ({ restaurant: g.restaurant, ...item }))
    ).slice(0, 3);
  };

  if (loading) return <main className="flex items-center justify-center min-h-screen bg-black"><div className="text-gray-400">Loading...</div></main>;
  if (!targets || slots.length === 0) return <main className="flex flex-col items-center justify-center min-h-screen px-6 bg-black"><h1 className="text-white text-2xl font-bold mb-2">No Meal Plan</h1><p className="text-gray-400">Complete onboarding to get meal suggestions.</p></main>;

  return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32 bg-black min-h-screen">
      <div className="flex justify-between items-center mb-1">
        <p className="text-gray-400 text-base">Today&apos;s Nutrition</p>
        <Link href="/meals/grocery-list" className="text-[#0090ff] text-sm font-medium hover:underline">
          🛒 Grocery List
        </Link>
      </div>
      <h1 className="text-white text-3xl font-bold mb-6">Meals</h1>

      {/* Daily Macro Targets */}
      <div className="bg-gray-900 rounded-2xl p-5 mb-6">
        <p className="text-gray-400 text-sm mb-3">Daily Targets</p>
        <div className="flex justify-between">
          <div className="text-center"><p className="text-white text-xl font-bold">{targets.calories}</p><p className="text-gray-500 text-xs">Calories</p></div>
          <div className="text-center"><p className="text-[#0090ff] text-xl font-bold">{targets.protein_g}g</p><p className="text-gray-500 text-xs">Protein</p></div>
          <div className="text-center"><p className="text-yellow-400 text-xl font-bold">{targets.carbs_g}g</p><p className="text-gray-500 text-xs">Carbs</p></div>
          <div className="text-center"><p className="text-orange-400 text-xl font-bold">{targets.fat_g}g</p><p className="text-gray-500 text-xs">Fat</p></div>
        </div>
      </div>

      {/* Meal Slots */}
      <div className="space-y-4">
        {slots.map((slot, i) => (
          <div key={i} className="bg-gray-900 rounded-2xl p-5">
            {/* Header: label, mode toggle, regenerate */}
            <div className="flex justify-between items-center mb-1">
              <span className="text-gray-500 text-xs uppercase tracking-wider">{LABELS[i]}</span>
              <div className="flex gap-3 items-center">
                <button
                  onClick={() => toggleMode(i)}
                  className={`text-xs px-2.5 py-1 rounded-full border transition-colors ${
                    slot.mode === "cook"
                      ? "border-[#0090ff] text-[#0090ff]"
                      : "border-orange-400 text-orange-400"
                  }`}
                >
                  {slot.mode === "cook" ? "🍳 Cook" : "🛍 Eat Out"}
                </button>
                <button onClick={() => handleRegenerate(i)} className="text-[#0090ff] text-sm hover:opacity-80 transition-opacity" title="Regenerate meal">🔄</button>
              </div>
            </div>

            {/* Meal info */}
            <h3 className="text-white text-lg font-semibold mb-1">{slot.selected.name}</h3>
            <p className="text-gray-400 text-sm mb-3">{slot.selected.description}</p>
            <div className="flex gap-4 text-gray-500 text-sm mb-3">
              <span>{slot.selected.calories} cal</span>
              <span>{slot.selected.protein_g}g P</span>
              <span>{slot.selected.carbs_g}g C</span>
              <span>{slot.selected.fat_g}g F</span>
            </div>

            {/* Cook mode: View Recipe toggle */}
            {slot.mode === "cook" && (slot.selected as any).recipe && (
              <div className="mb-3">
                <button
                  onClick={() => toggleRecipe(i)}
                  className="text-[#0090ff] text-sm font-medium hover:underline transition-colors"
                >
                  {slot.showRecipe ? "▲ Hide Recipe" : "📖 View Recipe"}
                </button>

                {slot.showRecipe && (
                  <div className="bg-gray-800 rounded-xl p-4 mt-2 space-y-3">
                    {/* Prep & Cook time */}
                    <div className="flex gap-4 text-gray-400 text-xs">
                      <span>⏱ Prep: {(slot.selected as any).recipe.prep_time_min} min</span>
                      <span>🔥 Cook: {(slot.selected as any).recipe.cook_time_min} min</span>
                    </div>

                    {/* Ingredients */}
                    <div>
                      <p className="text-gray-300 text-sm font-semibold mb-2">Ingredients</p>
                      <div className="space-y-1">
                        {((slot.selected as any).recipe.ingredients || []).map((ing: any, j: number) => (
                          <div key={j} className="flex justify-between text-xs">
                            <span className="text-gray-300">{ing.name}</span>
                            <span className="text-gray-500">{ing.amount} {ing.unit}</span>
                          </div>
                        ))}
                      </div>
                    </div>

                    {/* Steps */}
                    {((slot.selected as any).recipe.steps || []).length > 0 && (
                      <div>
                        <p className="text-gray-300 text-sm font-semibold mb-2">Steps</p>
                        <ol className="space-y-2">
                          {((slot.selected as any).recipe.steps || []).map((step: string, j: number) => (
                            <li key={j} className="flex gap-2 text-xs">
                              <span className="text-[#0090ff] font-bold shrink-0">{j + 1}.</span>
                              <span className="text-gray-300">{step}</span>
                            </li>
                          ))}
                        </ol>
                      </div>
                    )}
                  </div>
                )}
              </div>
            )}

            {/* Eat Out mode: Takeout suggestions + Google Maps */}
            {slot.mode === "eatout" && (
              <div className="mb-3">
                <div className="space-y-2 mb-3">
                  {getTakeoutSuggestions(slot.category).map((t, j) => (
                    <div key={j} className="bg-gray-800 rounded-xl p-3">
                      <p className="text-[#0090ff] text-sm font-semibold">{t.restaurant}</p>
                      <p className="text-gray-300 text-sm">{t.name}</p>
                      <p className="text-gray-500 text-xs mt-1">{t.customization}</p>
                      <p className="text-gray-600 text-xs mt-1">{t.estimated_calories} cal | {t.estimated_protein_g}g P</p>
                    </div>
                  ))}
                </div>
                <a href={`https://www.google.com/maps/search/${encodeURIComponent(slot.selected.name + " restaurant best deals")}`}
                  target="_blank" rel="noopener noreferrer"
                  className="block w-full bg-gray-800 hover:bg-gray-700 rounded-xl py-3 text-center text-[#0090ff] text-sm font-semibold transition-colors mb-2">
                  📍 Find &quot;{slot.selected.name}&quot; Nearby
                </a>
                <div className="flex gap-2">
                  <a href={`https://www.ubereats.com/search?q=${encodeURIComponent(slot.selected.name)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-green-900/40 border border-green-800 rounded-xl py-2 text-center text-green-400 text-xs font-semibold hover:bg-green-900/60 transition-colors">
                    🟢 UberEats
                  </a>
                  <a href={`https://www.doordash.com/search/store/${encodeURIComponent(slot.selected.name)}`}
                    target="_blank" rel="noopener noreferrer"
                    className="flex-1 bg-red-900/40 border border-red-800 rounded-xl py-2 text-center text-red-400 text-xs font-semibold hover:bg-red-900/60 transition-colors">
                    🔴 DoorDash
                  </a>
                </div>
              </div>
            )}

            {/* See alternatives */}
            <button onClick={() => toggleAlts(i)} className="text-gray-500 text-sm hover:text-gray-300 transition-colors">
              {slot.showAlts ? "▲ Hide alternatives" : "▼ See alternatives"}
            </button>
            {slot.showAlts && slot.alternatives.length > 0 && (
              <div className="mt-3 space-y-2">
                {slot.alternatives.map((alt, j) => (
                  <button key={j} onClick={() => handlePickAlt(i, j)} className="w-full bg-gray-800 rounded-xl p-3 flex justify-between items-center text-left hover:bg-gray-750 transition-colors">
                    <div>
                      <p className="text-gray-300 text-sm font-semibold">{alt.name}</p>
                      <p className="text-gray-500 text-xs">{alt.calories} cal | {alt.protein_g}g P</p>
                    </div>
                    <span className="text-[#0090ff] text-xs font-medium">Swap</span>
                  </button>
                ))}
              </div>
            )}
          </div>
        ))}
      </div>
    </main>
  );
}
