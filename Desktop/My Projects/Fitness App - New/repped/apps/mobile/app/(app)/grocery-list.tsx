import { View, Text, ScrollView, Pressable, ActivityIndicator } from "react-native";
import { router } from "expo-router";
import { useState, useEffect } from "react";
import { useAuthStore, generateDailyMealPlan, generateGroceryList } from "@repped/shared";
import type { GroceryItem } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import * as Location from "expo-location";
import { findNearbyGroceryStores, type PlaceResult } from "../../src/lib/places";
import { openMapsUrl, openMaps } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";

const ESTIMATED_PRICES: Record<string, number> = {
  "eggs": 4.99, "chicken breast": 8.99, "ground beef": 7.99, "salmon": 12.99,
  "turkey": 9.99, "tuna": 2.49, "shrimp": 11.99, "tofu": 3.49, "bacon": 6.99,
  "ham": 5.99, "steak": 14.99,
  "greek yogurt": 5.99, "butter": 4.49, "cheese": 4.99, "cream cheese": 3.49,
  "milk": 3.99, "sour cream": 2.99, "cottage cheese": 4.49, "parmesan": 5.99,
  "whole wheat bread": 3.99, "rice": 4.99, "oats": 3.99, "pasta": 2.49,
  "tortilla": 3.49, "quinoa": 5.99, "granola": 4.99,
  "banana": 0.69, "avocado": 1.99, "spinach": 3.49, "broccoli": 2.49,
  "tomato": 1.49, "onion": 0.99, "bell pepper": 1.49, "lettuce": 2.49,
  "lemon": 0.59, "garlic": 0.79, "sweet potato": 1.49, "potato": 0.99,
  "carrot": 1.29, "mixed berries": 4.99, "apple": 1.29,
  "peanut butter": 4.99, "olive oil": 6.99, "honey": 5.99, "salt": 1.49,
  "protein powder": 29.99, "mixed nuts": 8.99, "hummus": 3.99,
};

const getEstimatedPrice = (name: string): number => {
  const lower = name.toLowerCase();
  for (const [key, price] of Object.entries(ESTIMATED_PRICES)) {
    if (lower.includes(key) || key.includes(lower)) return price;
  }
  return 2.99;
};

const categoryLabels: Record<string, string> = {
  produce: "🥬 Produce", protein: "🥩 Protein", dairy: "🧀 Dairy",
  grains: "🌾 Grains", pantry: "🫙 Pantry", frozen: "🧊 Frozen", other: "📦 Other",
};

export default function GroceryListScreen() {
  const session = useAuthStore((s) => s.session);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [storeDeals, setStoreDeals] = useState<PlaceResult[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);

  useEffect(() => { loadGroceryList(); }, []);

  const loadGroceryList = async () => {
    if (!session?.user?.id) return;
    const { data: profile } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    const p = profile as any;
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

    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status === "granted") {
        const pos = await Location.getCurrentPositionAsync({});
        setLocation({ lat: pos.coords.latitude, lng: pos.coords.longitude });
        setDealsLoading(true);
        const deals = await findNearbyGroceryStores(pos.coords.latitude, pos.coords.longitude);
        setStoreDeals(deals);
        setDealsLoading(false);
      }
    } catch {}
  };

  const toggleItem = (key: string) => {
    const next = new Set(checked);
    if (next.has(key)) next.delete(key); else next.add(key);
    setChecked(next);
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#2D2A24" size="large" />
        <Text style={{ color: "#8E8E7A", marginTop: 12 }}>Building your grocery list...</Text>
      </View>
    );
  }

  const total = items.reduce((sum, item) => sum + getEstimatedPrice(item.name), 0);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 64 }}>
          {/* Back */}
          <Pressable onPress={() => router.navigate("/(app)/meals")} style={{ marginBottom: 20 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "600" }}>‹</Text>
            </View>
          </Pressable>

          {/* Header */}
          <Text style={{ color: "#2D2A24", fontSize: 32, fontWeight: "800", marginBottom: 4 }}>Grocery List</Text>
          <Text style={{ color: "#8E8E7A", fontSize: 15, marginBottom: 20 }}>
            {items.length} items for the week — {checked.size} checked off
          </Text>

          {/* Budget tips */}
          <View style={{ borderRadius: 16, padding: 16, marginBottom: 24, backgroundColor: "rgba(52,211,153,0.08)" }}>
            <Text style={{ color: "#34D399", fontSize: 12, fontWeight: "700", letterSpacing: 0.5, marginBottom: 6 }}>SMART SHOPPING TIPS</Text>
            <Text style={{ color: "#2D2A24", fontSize: 13, lineHeight: 20 }}>
              Buy frozen veggies & berries for half the price. Choose store-brand staples. Buy protein in bulk when on sale.
            </Text>
          </View>

          {/* Grocery items by category */}
          {categories.map((cat) => (
            <View key={cat} style={{ marginBottom: 24 }}>
              <Text style={{ color: "#2D2A24", fontSize: 16, fontWeight: "700", marginBottom: 10 }}>
                {categoryLabels[cat] || cat}
              </Text>
              {items.filter((item) => item.category === cat).map((item, i) => {
                const key = `${item.name}_${item.unit}`;
                const isChecked = checked.has(key);
                return (
                  <Pressable
                    key={i}
                    onPress={() => toggleItem(key)}
                    style={[
                      { flexDirection: "row", justifyContent: "space-between", alignItems: "center", borderRadius: 16, paddingHorizontal: 16, paddingVertical: 12, marginBottom: 8 },
                      { backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)", opacity: isChecked ? 0.45 : 1 },
                    ]}
                  >
                    <View style={{ flexDirection: "row", alignItems: "center", flex: 1 }}>
                      <View style={[
                        { width: 24, height: 24, borderRadius: 8, marginRight: 12, alignItems: "center", justifyContent: "center" },
                        { backgroundColor: isChecked ? "#34D399" : "#EDEBE5" },
                      ]}>
                        {isChecked && <Text style={{ color: "#fff", fontSize: 14, fontWeight: "700" }}>✓</Text>}
                      </View>
                      <Text style={[
                        { color: "#2D2A24", fontSize: 15 },
                        isChecked && { textDecorationLine: "line-through" as const, color: "#8E8E7A" },
                      ]}>
                        {item.name}
                      </Text>
                    </View>
                    <View style={{ flexDirection: "row", alignItems: "center", gap: 12 }}>
                      <Text style={{ color: "#8E8E7A", fontSize: 13 }}>{item.amount} {item.unit}</Text>
                      <Text style={{ color: "#34D399", fontSize: 13, fontWeight: "700" }}>${getEstimatedPrice(item.name).toFixed(2)}</Text>
                    </View>
                  </Pressable>
                );
              })}
            </View>
          ))}

          {items.length === 0 && (
            <View style={{ borderRadius: 16, padding: 24, alignItems: "center", backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#8E8E7A", textAlign: "center" }}>No recipes with ingredients found.</Text>
            </View>
          )}

          {/* Estimated total */}
          {items.length > 0 && (
            <View style={{ borderRadius: 16, padding: 20, marginBottom: 32, backgroundColor: "#2D2A24" }}>
              <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center" }}>
                <Text style={{ color: "#F6F5F0", fontSize: 16, fontWeight: "600" }}>Estimated Total</Text>
                <Text style={{ color: "#34D399", fontSize: 24, fontWeight: "800" }}>${total.toFixed(2)}</Text>
              </View>
              <Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 4 }}>Prices are estimates and may vary by store</Text>
              <Text style={{ color: "#34D399", fontSize: 12, marginTop: 2 }}>Save ~15-20% by choosing store brands</Text>
            </View>
          )}

          {/* Nearby stores */}
          <Text style={{ color: "#2D2A24", fontSize: 20, fontWeight: "700", marginBottom: 4 }}>Nearby Stores</Text>
          <Text style={{ color: "#8E8E7A", fontSize: 13, marginBottom: 12 }}>Sorted by distance — nearest first</Text>

          {dealsLoading && (
            <View style={{ borderRadius: 16, padding: 24, alignItems: "center", marginBottom: 16, backgroundColor: "#EDEBE5" }}>
              <ActivityIndicator color="#2D2A24" size="small" />
              <Text style={{ color: "#8E8E7A", fontSize: 13, marginTop: 8 }}>Finding stores nearby...</Text>
            </View>
          )}

          {!dealsLoading && storeDeals.length > 0 && (
            <View style={{ gap: 8, marginBottom: 16 }}>
              {storeDeals.map((store, i) => (
                <Pressable
                  key={i}
                  onPress={() => openMapsUrl(store.mapsUrl)}
                  style={[
                    { borderRadius: 16, padding: 16 },
                    { backgroundColor: i === 0 ? "rgba(52,211,153,0.06)" : "#FFFFFF", borderWidth: 1, borderColor: i === 0 ? "rgba(52,211,153,0.2)" : "rgba(0,0,0,0.04)" },
                  ]}
                >
                  <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" }}>
                    <View style={{ flex: 1, marginRight: 12 }}>
                      <Text style={{ color: "#2D2A24", fontSize: 16, fontWeight: "600" }}>{store.name}</Text>
                      <Text style={{ color: "#8E8E7A", fontSize: 12, marginTop: 2 }} numberOfLines={1}>{store.address}</Text>
                    </View>
                    <View style={{ alignItems: "flex-end" }}>
                      <Text style={{ color: "#2D2A24", fontSize: 15, fontWeight: "700" }}>{store.priceLevel}</Text>
                      <View style={[
                        { paddingHorizontal: 8, paddingVertical: 2, borderRadius: 99, marginTop: 4 },
                        { backgroundColor: store.isOpen ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.1)" },
                      ]}>
                        <Text style={{ color: store.isOpen ? "#34D399" : "#EF4444", fontSize: 11, fontWeight: "600" }}>
                          {store.isOpen ? "Open" : "Closed"}
                        </Text>
                      </View>
                    </View>
                  </View>
                  <View style={{ flexDirection: "row", gap: 12, marginTop: 8 }}>
                    <Text style={{ color: "#8E8E7A", fontSize: 12 }}>⭐ {store.rating}/5</Text>
                    <Text style={{ color: "#8E8E7A", fontSize: 12 }}>📍 {store.distance}</Text>
                  </View>
                  {i === 0 && <Text style={{ color: "#34D399", fontSize: 12, fontWeight: "600", marginTop: 6 }}>Closest to you — Tap for directions</Text>}
                </Pressable>
              ))}
            </View>
          )}

          {!dealsLoading && storeDeals.length === 0 && (
            <Pressable
              onPress={() => openMaps("grocery stores", location?.lat, location?.lng)}
              style={{ backgroundColor: "#2D2A24", borderRadius: 16, paddingVertical: 16, alignItems: "center", marginBottom: 16 }}
            >
              <Text style={{ color: "#F6F5F0", fontSize: 16, fontWeight: "600" }}>Find Stores Near You</Text>
            </Pressable>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
