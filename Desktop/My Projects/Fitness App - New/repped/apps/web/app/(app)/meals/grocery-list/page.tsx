"use client";

import { useEffect, useState } from "react";
import { supabase } from "../../../../src/lib/supabase";
import { generateDailyMealPlan, generateGroceryList } from "@repped/shared";
import type { GroceryItem } from "@repped/shared";
import Link from "next/link";

export default function GroceryListPage() {
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);

  useEffect(() => { loadGroceryList(); }, []);

  const loadGroceryList = async () => {
    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) return;

    const { data } = await supabase.from("profiles").select("*").eq("id", user.id).single();
    const p = data as any;
    if (!p?.tdee) { setLoading(false); return; }

    const weekMeals: any[] = [];
    for (let i = 0; i < 7; i++) {
      const plan = generateDailyMealPlan(p.tdee, p.goal, p.weight_kg, p.dietary_preference, p.food_exclusions || []);
      weekMeals.push(...plan.meals);
    }

    const list = generateGroceryList(weekMeals);
    setItems(list.items);
    setCategories(list.categories);
    setLoading(false);
  };

  const toggleItem = (key: string) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key);
    else next.add(key);
    setChecked(next);
  };

  const categoryLabels: Record<string, string> = {
    produce: "🥬 Produce", protein: "🥩 Protein", dairy: "🧀 Dairy",
    grains: "🌾 Grains", pantry: "🫙 Pantry", frozen: "🧊 Frozen", other: "📦 Other",
  };

  if (loading) return <main className="flex items-center justify-center min-h-screen"><div className="text-gray-400">Building your grocery list...</div></main>;

  return (
    <main className="max-w-lg mx-auto px-6 pt-16 pb-32">
      <Link href="/meals" className="text-[#0090ff] text-sm mb-4 block">← Back to Meals</Link>
      <h1 className="text-white text-3xl font-bold mb-2">Grocery List</h1>
      <p className="text-gray-500 text-base mb-6">{items.length} items for the week — {checked.size} checked off</p>

      {categories.map((cat) => (
        <div key={cat} className="mb-6">
          <h3 className="text-gray-400 text-base font-semibold mb-3">{categoryLabels[cat] || cat}</h3>
          {items.filter((item) => item.category === cat).map((item, i) => {
            const key = `${item.name}_${item.unit}`;
            const isChecked = checked.has(key);
            return (
              <button key={i} onClick={() => toggleItem(key)}
                className={`w-full flex justify-between items-center bg-gray-900 rounded-xl px-4 py-3 mb-2 text-left transition-opacity ${isChecked ? "opacity-40" : ""}`}>
                <div className="flex items-center flex-1">
                  <span className="text-lg mr-3">{isChecked ? "✅" : "⬜"}</span>
                  <span className={`text-gray-300 text-base ${isChecked ? "line-through" : ""}`}>{item.name}</span>
                </div>
                <span className="text-gray-500 text-sm">{item.amount} {item.unit}</span>
              </button>
            );
          })}
        </div>
      ))}

      {items.length === 0 && (
        <div className="bg-gray-900 rounded-2xl p-6 text-center">
          <p className="text-gray-500">No recipes with ingredients found yet. Recipes are being added progressively.</p>
        </div>
      )}

      <a href="https://maps.google.com/maps?q=grocery+stores+near+me" target="_blank" rel="noopener noreferrer"
        className="block w-full bg-gray-900 hover:bg-gray-800 rounded-2xl py-4 text-center text-[#0090ff] font-semibold transition-colors mt-6">
        📍 Find Grocery Stores Nearby
      </a>
    </main>
  );
}
