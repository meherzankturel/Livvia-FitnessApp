import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, RefreshControl, StyleSheet } from "react-native";
import { useEffect, useState, useCallback } from "react";
import { router } from "expo-router";
import { useAuthStore, generateMealPlanWithAlternatives, regenerateSingleMeal, TAKEOUT_GUIDES, getNutritionGuidance, getGuiltFreeStatus, getGuiltFreeDates, cuisineLabels, cuisineEmojis } from "@repped/shared";
import type { Meal, MacroTargets, CuisinePreference } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { findNearbyRestaurants, type PlaceResult } from "../../src/lib/places";
import { theme } from "../../src/lib/styles";
import { TopoBackground } from "../../src/components/terrain";
import { openUberEats, openDoorDash, openMapsUrl } from "../../src/lib/deeplink";

const C = theme.colors;

interface MealSlot {
  selected: Meal & { recipe?: any };
  alternatives: (Meal & { recipe?: any })[];
  category: string;
  mode: "cook" | "eatout";
  showAlts: boolean;
  deals: PlaceResult[];
  dealsLoading: boolean;
}

const LABELS = ["Breakfast", "Lunch", "Dinner", "Snack"];
const CATEGORIES = ["breakfast", "lunch", "dinner", "snack"];

const COMMON_ALLERGENS = [
  "Dairy", "Gluten", "Nuts", "Shellfish", "Soy", "Eggs", "Peanuts", "Fish",
];

const DISLIKED_MEALS_KEY = "repped_disliked_meals";

function getRestaurantSearchQuery(mealName: string, category: string): string {
  const lower = mealName.toLowerCase();
  if (lower.includes("tofu") || lower.includes("vegan")) return "vegan restaurant";
  if (lower.includes("sushi") || lower.includes("salmon")) return "sushi restaurant";
  if (lower.includes("chicken")) return "healthy chicken restaurant";
  if (lower.includes("steak") || lower.includes("beef")) return "steak restaurant";
  if (lower.includes("pasta") || lower.includes("italian")) return "italian restaurant";
  if (lower.includes("salad")) return "salad restaurant healthy";
  if (lower.includes("burrito") || lower.includes("mexican")) return "mexican restaurant";
  if (lower.includes("curry") || lower.includes("indian")) return "indian restaurant";
  if (lower.includes("rice") || lower.includes("stir") || lower.includes("asian")) return "asian restaurant";
  if (lower.includes("egg") || lower.includes("omelette") || lower.includes("pancake")) return "breakfast restaurant";
  if (lower.includes("smoothie") || lower.includes("bowl")) return "smoothie bowl cafe";
  if (lower.includes("sandwich") || lower.includes("wrap")) return "sandwich shop";
  if (lower.includes("fish") || lower.includes("cod") || lower.includes("tuna")) return "seafood restaurant";
  if (lower.includes("protein") || lower.includes("shake")) return "juice bar protein";
  if (category === "breakfast") return "healthy breakfast restaurant";
  if (category === "snack") return "healthy snack cafe";
  return "healthy food restaurant";
}

export default function Meals() {
  const session = useAuthStore((s) => s.session);
  const [slots, setSlots] = useState<MealSlot[]>([]);
  const [targets, setTargets] = useState<MacroTargets | null>(null);
  const [loading, setLoading] = useState(true);
  const [profile, setProfile] = useState<any>(null);

  const [showAllergyModal, setShowAllergyModal] = useState(false);
  const [selectedExclusions, setSelectedExclusions] = useState<string[]>([]);

  const [selectedCuisines, setSelectedCuisines] = useState<string[]>(["american"]);
  const [showCuisineSelector, setShowCuisineSelector] = useState(false);

  const [activeCategory, setActiveCategory] = useState(0);

  const [dislikedMeals, setDislikedMeals] = useState<string[]>([]);

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [showNutritionTips, setShowNutritionTips] = useState(false);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMealPlan();
    setRefreshing(false);
  }, [dislikedMeals]);

  useEffect(() => {
    loadDislikedMeals();
    requestLocation();
  }, []);

  useEffect(() => {
    loadMealPlan();
  }, [dislikedMeals, selectedCuisines]);

  const requestLocation = async () => {
    try {
      const { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") return;
      const loc = await Location.getCurrentPositionAsync({});
      setLocation({ lat: loc.coords.latitude, lng: loc.coords.longitude });
    } catch {}
  };

  const loadDislikedMeals = async () => {
    try {
      const stored = await AsyncStorage.getItem(DISLIKED_MEALS_KEY);
      if (stored) setDislikedMeals(JSON.parse(stored));
    } catch {}
  };

  const saveDislikedMeals = async (meals: string[]) => {
    try {
      await AsyncStorage.setItem(DISLIKED_MEALS_KEY, JSON.stringify(meals));
    } catch {}
  };

  const loadMealPlan = async () => {
    if (!session?.user?.id) return;
    setLoading(true);

    const { data } = await supabase.from("profiles").select("*").eq("id", session.user.id).single();
    const p = data as any;
    setProfile(p);
    setSelectedExclusions(p?.food_exclusions || []);
    if (!p?.tdee) { setLoading(false); return; }

    const plan = generateMealPlanWithAlternatives(
      p.tdee, p.goal, p.weight_kg, p.dietary_preference, p.food_exclusions || [],
      dislikedMeals, selectedCuisines
    );

    setTargets(plan.targets);
    setSlots(plan.slots.map((s, i) => ({
      selected: s.selected as any,
      alternatives: s.alternatives as any[],
      category: CATEGORIES[i],
      mode: "cook",
      showAlts: false,
      deals: [],
      dealsLoading: false,
    })));
    setLoading(false);
  };

  const handleRegenerate = (index: number) => {
    if (!profile || !targets) return;
    const slot = slots[index];
    const newMeal = regenerateSingleMeal(
      slot.category as any,
      targets.calories * [0.25, 0.35, 0.30, 0.10][index],
      profile.dietary_preference,
      profile.food_exclusions || [],
      [slot.selected.name, ...slot.alternatives.map(a => a.name), ...dislikedMeals],
      selectedCuisines
    );
    const updated = [...slots];
    updated[index] = { ...updated[index], selected: newMeal as any };
    setSlots(updated);
  };

  const handleDislike = async (index: number) => {
    const mealName = slots[index].selected.name;
    const updatedDisliked = [...dislikedMeals, mealName];
    setDislikedMeals(updatedDisliked);
    await saveDislikedMeals(updatedDisliked);
    handleRegenerate(index);
  };

  const handlePickAlt = (slotIdx: number, altIdx: number) => {
    const updated = [...slots];
    const slot = updated[slotIdx];
    const picked = slot.alternatives[altIdx];
    slot.alternatives[altIdx] = slot.selected;
    slot.selected = picked;
    setSlots(updated);
  };

  const toggleMode = async (index: number) => {
    const updated = [...slots];
    const newMode = updated[index].mode === "cook" ? "eatout" : "cook";
    updated[index] = { ...updated[index], mode: newMode as any };
    setSlots(updated);

    if (newMode === "eatout" && updated[index].deals.length === 0 && location) {
      const updatedWithLoading = [...updated];
      updatedWithLoading[index] = { ...updatedWithLoading[index], dealsLoading: true };
      setSlots(updatedWithLoading);

      const mealName = updated[index].selected.name;
      const searchQuery = getRestaurantSearchQuery(mealName, CATEGORIES[index]);
      const deals = await findNearbyRestaurants(searchQuery, location.lat, location.lng, profile?.dietary_preference);
      const final = [...updatedWithLoading];
      final[index] = { ...final[index], deals, dealsLoading: false };
      setSlots(final);
    }
  };

  const toggleAlts = (index: number) => {
    const updated = [...slots];
    updated[index] = { ...updated[index], showAlts: !updated[index].showAlts };
    setSlots(updated);
  };

  const openRecipe = (meal: any) => {
    if (!meal.recipe) return;
    router.push({
      pathname: "/(app)/recipe" as any,
      params: {
        name: meal.name,
        ingredients: JSON.stringify(meal.recipe.ingredients),
        steps: JSON.stringify(meal.recipe.steps),
        prepTime: String(meal.recipe.prep_time_min),
        cookTime: String(meal.recipe.cook_time_min),
      },
    });
  };

  const getTakeoutSuggestions = (category: string) => {
    return TAKEOUT_GUIDES.flatMap(g =>
      g.items
        .filter(item => item.meal_type === category)
        .map(item => ({ restaurant: g.restaurant, ...item }))
    ).slice(0, 3);
  };

  const toggleCuisine = (cuisine: string) => {
    setSelectedCuisines((prev) =>
      prev.includes(cuisine) ? prev.filter((c) => c !== cuisine) : [...prev, cuisine]
    );
  };

  const toggleExclusion = (allergen: string) => {
    const lower = allergen.toLowerCase();
    setSelectedExclusions((prev) =>
      prev.includes(lower) ? prev.filter((e) => e !== lower) : [...prev, lower]
    );
  };

  const saveExclusions = async () => {
    if (!session?.user?.id) return;
    await supabase.from("profiles").update({ food_exclusions: selectedExclusions }).eq("id", session.user.id);
    setShowAllergyModal(false);
    loadMealPlan();
  };

  const getRestaurantUrl = (mealName: string) => {
    const query = encodeURIComponent(mealName + " restaurant best deals");
    if (location) {
      return `https://www.google.com/maps/search/${query}/@${location.lat},${location.lng},14z`;
    }
    return `https://www.google.com/maps/search/${query}`;
  };

  const getDeliveryUrl = (mealName: string, platform: "ubereats" | "doordash") => {
    const query = encodeURIComponent(mealName);
    if (platform === "ubereats") {
      return `https://www.ubereats.com/search?q=${query}`;
    }
    return `https://www.doordash.com/search/store/${query}`;
  };

  if (loading) {
    return (
      <View style={s.centered}>
        <ActivityIndicator size="large" color={C.earth} />
      </View>
    );
  }

  if (!targets || slots.length === 0) {
    return (
      <View style={s.centeredPadded}>
        <Text style={s.emptyTitle}>No Meal Plan</Text>
        <Text style={s.emptySubtitle}>Complete onboarding to get meal suggestions.</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={s.screen}
      contentContainerStyle={{ paddingBottom: 120 }}
      refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.earth} />}
    >
      <TopoBackground />

      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerDate}>
          {new Date().toLocaleDateString("en-US", { weekday: "long", month: "short", day: "numeric" })}
        </Text>
        <Text style={s.headerTitle}>Meals</Text>
        <Text style={s.headerSubtitle}>Stay healthy with good nutrition</Text>
      </View>

      <View style={s.content}>
        {/* Grocery List button */}
        <Pressable
          onPress={() => router.push("/(app)/grocery-list" as any)}
          style={s.groceryBtn}
        >
          <Text style={s.groceryBtnText}>Grocery List</Text>
          <Text style={s.groceryBtnArrow}>View →</Text>
        </Pressable>

        {/* Allergies & Dislikes */}
        <Pressable
          onPress={() => setShowAllergyModal(true)}
          style={s.allergyBtn}
        >
          <View style={{ flex: 1 }}>
            <Text style={s.cardTitle}>Allergies & Dislikes</Text>
            <Text style={s.cardSubtitle}>
              {selectedExclusions.length > 0
                ? selectedExclusions.map((e) => e.charAt(0).toUpperCase() + e.slice(1)).join(", ")
                : "None selected — tap to set"}
            </Text>
          </View>
          <Text style={s.chevron}>▶</Text>
        </Pressable>

        {/* Allergy Modal */}
        <Modal visible={showAllergyModal} animationType="slide" transparent>
          <View style={s.modalBackdrop}>
            <View style={s.modalCard}>
              <View style={s.modalHeader}>
                <Text style={s.modalTitle}>Allergies & Dislikes</Text>
                <Pressable onPress={() => setShowAllergyModal(false)}>
                  <Text style={s.modalCancel}>Cancel</Text>
                </Pressable>
              </View>
              <Text style={s.modalHint}>
                Select items to exclude from your meal plan.
              </Text>
              <View style={s.pillRow}>
                {COMMON_ALLERGENS.map((allergen) => {
                  const isSelected = selectedExclusions.includes(allergen.toLowerCase());
                  return (
                    <Pressable
                      key={allergen}
                      onPress={() => toggleExclusion(allergen)}
                      style={[s.pill, isSelected ? s.pillActive : s.pillInactive]}
                    >
                      <Text style={[s.pillText, isSelected ? s.pillTextActive : s.pillTextInactive]}>
                        {isSelected ? "✕ " : ""}{allergen}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
              <Pressable onPress={saveExclusions} style={s.confirmBtn}>
                <Text style={s.confirmBtnText}>Save & Regenerate Meals</Text>
              </Pressable>
            </View>
          </View>
        </Modal>

        {/* Macro Summary */}
        <View style={s.macroCard}>
          <Text style={s.macroLabel}>Daily Targets</Text>
          <View style={s.macroRow}>
            <View style={s.macroItem}>
              <Text style={s.macroCalNumber}>{targets.calories}</Text>
              <Text style={s.macroItemLabel}>Calories</Text>
            </View>
            <View style={s.macroItem}>
              <Text style={s.macroNumber}>{targets.protein_g}g</Text>
              <Text style={s.macroItemLabel}>Protein</Text>
            </View>
            <View style={s.macroItem}>
              <Text style={s.macroNumber}>{targets.carbs_g}g</Text>
              <Text style={s.macroItemLabel}>Carbs</Text>
            </View>
            <View style={s.macroItem}>
              <Text style={s.macroNumber}>{targets.fat_g}g</Text>
              <Text style={s.macroItemLabel}>Fat</Text>
            </View>
          </View>
        </View>

        {/* Guilt-Free Meal Countdown */}
        {profile?.goal && (() => {
          const now = new Date();
          const dates = getGuiltFreeDates(now.getFullYear(), now.getMonth() + 1);
          const status = getGuiltFreeStatus(now, dates, 0);
          return (
            <View style={[s.guiltCard, status.isGuiltFreeDay && s.guiltCardActive]}>
              {status.isGuiltFreeDay ? (
                <>
                  <Text style={s.guiltDayTitle}>Today's a Guilt-Free day!</Text>
                  <Text style={s.guiltDayBody}>{status.message}</Text>
                  {status.tip && <Text style={s.guiltDayTip}>{status.tip}</Text>}
                </>
              ) : (
                <>
                  <View style={s.guiltRow}>
                    <Text style={s.cardTitle}>Guilt-Free Meals</Text>
                    <Text style={s.rockText}>{status.remaining} left this month</Text>
                  </View>
                  {status.daysUntilNext !== null && status.daysUntilNext > 0 && (
                    <Text style={s.guiltNext}>
                      Next one in {status.daysUntilNext} {status.daysUntilNext === 1 ? "day" : "days"}
                    </Text>
                  )}
                  <Text style={s.rockText}>{status.message}</Text>
                </>
              )}
            </View>
          );
        })()}

        {/* Nutrition Guidance */}
        {profile?.goal && (
          <Pressable
            onPress={() => setShowNutritionTips(!showNutritionTips)}
            style={s.nutritionCard}
          >
            <View style={s.nutritionHeader}>
              <Text style={s.cardTitle}>Nutrition Guide</Text>
              <Text style={s.rockText}>{showNutritionTips ? "▲" : "▼"}</Text>
            </View>
            {!showNutritionTips && (
              <Text style={s.rockText}>
                {getNutritionGuidance(profile.goal).headline}
              </Text>
            )}
            {showNutritionTips && (() => {
              const guidance = getNutritionGuidance(profile.goal);
              const plateProportions = profile.goal === "lose_fat"
                ? { veggies: 5, protein: 3, carbs: 2 }
                : profile.goal === "build_muscle"
                ? { veggies: 2, protein: 3, carbs: 5 }
                : { veggies: 3, protein: 3, carbs: 3 };
              return (
                <View style={{ marginTop: 16 }}>
                  <View style={{ marginBottom: 16 }}>
                    <View style={s.plateBar}>
                      <View style={[s.plateSegVeggies, { flex: plateProportions.veggies }]}>
                        <Text style={s.plateSegText}>VEGGIES</Text>
                      </View>
                      <View style={[s.plateSegProtein, { flex: plateProportions.protein }]}>
                        <Text style={s.plateSegText}>PROTEIN</Text>
                      </View>
                      <View style={[s.plateSegCarbs, { flex: plateProportions.carbs }]}>
                        <Text style={s.plateSegText}>CARBS</Text>
                      </View>
                    </View>
                    <Text style={s.rockTextXs}>{guidance.plateMethod.description}</Text>
                  </View>

                  <View style={s.ruleBox}>
                    <Text style={s.ruleTitle}>THE 85/15 RULE</Text>
                    <Text style={s.rockText}>Eat well 85% of the time. Enjoy the other 15% guilt-free.</Text>
                  </View>

                  <View style={{ gap: 8 }}>
                    {guidance.principles.slice(0, 3).map((p, i) => (
                      <View key={i} style={{ flexDirection: "row", gap: 8 }}>
                        <Text style={{ color: C.trail }}>·</Text>
                        <Text style={[s.rockText, { flex: 1, lineHeight: 20 }]}>{p}</Text>
                      </View>
                    ))}
                  </View>
                </View>
              );
            })()}
          </Pressable>
        )}

        {/* Cuisine Selector */}
        <View style={{ marginBottom: 16 }}>
          <Text style={s.sectionLabel}>Cuisine</Text>
          <ScrollView horizontal showsHorizontalScrollIndicator={false} style={{ marginHorizontal: -20, paddingHorizontal: 20 }}>
            <View style={{ flexDirection: "row", gap: 8 }}>
              {(Object.keys(cuisineLabels) as CuisinePreference[]).map((cuisine) => {
                const isActive = selectedCuisines.includes(cuisine);
                return (
                  <Pressable
                    key={cuisine}
                    onPress={() => toggleCuisine(cuisine)}
                    style={[s.cuisinePill, { backgroundColor: isActive ? C.earth : C.stone }]}
                  >
                    <Text style={{ fontSize: 13 }}>{cuisineEmojis[cuisine]}</Text>
                    <Text style={{ color: isActive ? C.bg : C.earth, fontSize: 13, fontWeight: "600" }}>
                      {cuisineLabels[cuisine]}
                    </Text>
                  </Pressable>
                );
              })}
            </View>
          </ScrollView>
        </View>

        {/* Meal Category Tabs */}
        <View style={{ flexDirection: "row", gap: 8, marginBottom: 20 }}>
          {["All", ...LABELS].map((label, i) => {
            const isActive = activeCategory === i;
            return (
              <Pressable
                key={label}
                onPress={() => setActiveCategory(i)}
                style={[s.tabPill, { backgroundColor: isActive ? C.earth : C.stone }]}
              >
                <Text style={{ color: isActive ? C.bg : C.rock, fontSize: 13, fontWeight: "600" }}>{label}</Text>
              </Pressable>
            );
          })}
        </View>

        {/* Meal Cards */}
        <View style={{ gap: 12 }}>
          {slots.filter((_, i) => activeCategory === 0 || i === activeCategory - 1).map((slot, filteredIdx) => {
            const i = activeCategory === 0 ? filteredIdx : activeCategory - 1;
            return (
              <View key={i} style={s.mealCard}>
                {/* Header */}
                <View style={s.mealCardHeader}>
                  <Text style={s.mealCategoryLabel}>{LABELS[i]}</Text>
                  <View style={{ flexDirection: "row", gap: 8 }}>
                    {/* Cook / Eat Out toggle */}
                    <Pressable
                      onPress={() => toggleMode(i)}
                      style={[s.modePill, { backgroundColor: slot.mode === "cook" ? C.earth : C.stone }]}
                    >
                      <Text style={{ color: slot.mode === "cook" ? C.bg : C.rock, fontSize: 12, fontWeight: "600" }}>
                        {slot.mode === "cook" ? "🍳 Cook" : "🛍 Eat Out"}
                      </Text>
                    </Pressable>
                    <Pressable onPress={() => handleDislike(i)} style={s.dislikeBtn}>
                      <Text style={s.dislikeBtnText}>👎</Text>
                    </Pressable>
                    <Pressable onPress={() => handleRegenerate(i)}>
                      <Text style={{ fontSize: 14 }}>🔄</Text>
                    </Pressable>
                  </View>
                </View>

                {/* Selected meal */}
                {(slot.selected as any).cuisine && (
                  <View style={{ flexDirection: "row", alignItems: "center", gap: 4, marginBottom: 4 }}>
                    <Text style={{ fontSize: 11 }}>{cuisineEmojis[(slot.selected as any).cuisine as CuisinePreference] || ""}</Text>
                    <Text style={s.cuisineTag}>{cuisineLabels[(slot.selected as any).cuisine as CuisinePreference] || ""}</Text>
                  </View>
                )}
                <Text style={s.mealName}>{slot.selected.name}</Text>
                <Text style={s.mealDesc}>{slot.selected.description}</Text>
                <View style={{ flexDirection: "row", gap: 16, marginBottom: 12 }}>
                  <Text style={s.macroChip}>{slot.selected.calories} cal</Text>
                  <Text style={s.macroChip}>{slot.selected.protein_g}g P</Text>
                  <Text style={s.macroChip}>{slot.selected.carbs_g}g C</Text>
                  <Text style={s.macroChip}>{slot.selected.fat_g}g F</Text>
                </View>

                {/* Cook mode — Recipe button */}
                {slot.mode === "cook" && (slot.selected as any).recipe && (
                  <Pressable onPress={() => openRecipe(slot.selected)} style={s.recipeBtn}>
                    <Text style={s.recipeBtnText}>📖 View Recipe</Text>
                  </Pressable>
                )}

                {/* Eat Out mode — Nearby restaurants */}
                {slot.mode === "eatout" && (
                  <View style={{ marginBottom: 12 }}>
                    {slot.dealsLoading && (
                      <View style={s.dealsLoading}>
                        <ActivityIndicator color={C.earth} size="small" />
                        <Text style={[s.rockText, { marginTop: 8 }]}>Finding best deals for "{slot.selected.name}"...</Text>
                      </View>
                    )}

                    {!slot.dealsLoading && slot.deals.length > 0 && (
                      <>
                        <Text style={s.restaurantsSectionLabel}>Restaurants Near You</Text>
                        {slot.deals.map((place, j) => (
                          <Pressable
                            key={j}
                            onPress={() => openMapsUrl(place.mapsUrl)}
                            style={[s.restaurantCard, j === 0 && s.restaurantCardTop]}
                          >
                            <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 4 }}>
                              <View style={{ flex: 1, marginRight: 12 }}>
                                <Text style={s.restaurantName}>{place.name}</Text>
                                <Text style={s.restaurantAddr} numberOfLines={1}>{place.address}</Text>
                              </View>
                              <View style={{ alignItems: "flex-end" }}>
                                <Text style={s.restaurantPrice}>{place.priceLevel}</Text>
                                <View style={[s.openBadge, { backgroundColor: place.isOpen ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.12)" }]}>
                                  <Text style={{ color: place.isOpen ? C.trail : "#EF4444", fontSize: 10, fontWeight: "600" }}>
                                    {place.isOpen ? "Open Now" : "Closed"}
                                  </Text>
                                </View>
                              </View>
                            </View>
                            <View style={{ flexDirection: "row", gap: 12, marginTop: 4 }}>
                              <Text style={s.rockTextXs}>⭐ {place.rating}/5</Text>
                              <Text style={s.rockTextXs}>📍 {place.distance}</Text>
                            </View>
                            {j === 0 && <Text style={s.bestMatch}>⭐ Best Match — Tap for directions</Text>}

                            <View style={{ flexDirection: "row", gap: 8, marginTop: 12 }}>
                              <Pressable
                                onPress={() => openUberEats(place.name)}
                                style={s.orderBtn}
                              >
                                <Text style={s.orderBtnText}>UberEats</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => openDoorDash(place.name)}
                                style={s.orderBtn}
                              >
                                <Text style={s.orderBtnText}>DoorDash</Text>
                              </Pressable>
                              <Pressable
                                onPress={() => openMapsUrl(place.mapsUrl)}
                                style={s.orderBtn}
                              >
                                <Text style={s.orderBtnText}>Pickup</Text>
                              </Pressable>
                            </View>
                          </Pressable>
                        ))}
                      </>
                    )}

                    {!slot.dealsLoading && slot.deals.length === 0 && !location && (
                      <View style={s.noDeals}>
                        <Text style={s.rockText}>Enable location to find deals nearby</Text>
                      </View>
                    )}

                    {!slot.dealsLoading && slot.deals.length === 0 && location && (
                      <Pressable onPress={() => toggleMode(i)} style={s.noDeals}>
                        <Text style={[s.rockText, { color: C.earth }]}>Tap "Eat Out" again to search for deals</Text>
                      </Pressable>
                    )}
                  </View>
                )}

                {/* Alternatives */}
                <Pressable onPress={() => toggleAlts(i)}>
                  <Text style={s.altsToggle}>
                    {slot.showAlts ? "▲ Hide alternatives" : "▼ See alternatives"}
                  </Text>
                </Pressable>
                {slot.showAlts && slot.alternatives.length > 0 && (
                  <View style={{ marginTop: 12, gap: 8 }}>
                    {slot.alternatives.map((alt, j) => (
                      <Pressable
                        key={j}
                        onPress={() => handlePickAlt(i, j)}
                        style={s.altCard}
                      >
                        <View style={{ flex: 1 }}>
                          <View style={{ flexDirection: "row", alignItems: "center", gap: 8 }}>
                            <Text style={s.altName}>{alt.name}</Text>
                            {(alt as any).cuisine && (
                              <Text style={{ fontSize: 10 }}>{cuisineEmojis[(alt as any).cuisine as CuisinePreference] || ""}</Text>
                            )}
                          </View>
                          <Text style={s.altMeta}>{alt.calories} cal | {alt.protein_g}g P</Text>
                        </View>
                        <Text style={s.swapText}>Swap</Text>
                      </Pressable>
                    ))}
                  </View>
                )}
              </View>
            );
          })}
        </View>

        {/* Footer tip */}
        <View style={s.footerCard}>
          <Text style={s.rockText}>
            Tap 🔄 to regenerate any meal. Toggle 🍳/🛍 for cooking or eating out. Hit your protein target first — that matters most.
          </Text>
        </View>
      </View>
    </ScrollView>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  centered: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  centeredPadded: {
    flex: 1,
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: 24,
  },
  emptyTitle: {
    color: C.earth,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 8,
  },
  emptySubtitle: {
    color: C.rock,
    textAlign: "center",
  },
  header: {
    paddingHorizontal: 20,
    paddingTop: 64,
    paddingBottom: 12,
  },
  headerDate: {
    color: C.rock,
    fontSize: 13,
    marginBottom: 4,
  },
  headerTitle: {
    color: C.earth,
    fontSize: 24,
    fontWeight: "700",
    marginBottom: 4,
  },
  headerSubtitle: {
    color: C.rock,
    fontSize: 14,
  },
  content: {
    paddingHorizontal: 20,
  },
  // Grocery
  groceryBtn: {
    backgroundColor: C.earth,
    borderRadius: 20,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groceryBtnText: {
    color: C.bg,
    fontSize: 15,
    fontWeight: "600",
  },
  groceryBtnArrow: {
    color: C.bg,
    fontSize: 14,
    fontWeight: "600",
  },
  // Allergy
  allergyBtn: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    paddingHorizontal: 16,
    paddingVertical: 16,
    marginBottom: 16,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  chevron: {
    color: C.rock,
    fontSize: 14,
  },
  // Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: C.bg,
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    paddingHorizontal: 24,
    paddingTop: 24,
    paddingBottom: 48,
  },
  modalHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 24,
  },
  modalTitle: {
    color: C.earth,
    fontSize: 20,
    fontWeight: "700",
  },
  modalCancel: {
    color: C.rock,
    fontSize: 15,
  },
  modalHint: {
    color: C.rock,
    fontSize: 13,
    marginBottom: 16,
  },
  pillRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 12,
    marginBottom: 24,
  },
  pill: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 100,
  },
  pillActive: {
    backgroundColor: C.earth,
  },
  pillInactive: {
    backgroundColor: C.stone,
  },
  pillText: {
    fontSize: 13,
    fontWeight: "500",
  },
  pillTextActive: {
    color: C.bg,
  },
  pillTextInactive: {
    color: C.earth,
  },
  confirmBtn: {
    backgroundColor: C.earth,
    borderRadius: 14,
    paddingVertical: 14,
    alignItems: "center",
  },
  confirmBtnText: {
    color: C.bg,
    fontSize: 15,
    fontWeight: "600",
  },
  // Macro card
  macroCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 24,
  },
  macroLabel: {
    color: C.rock,
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    marginBottom: 12,
  },
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  macroItem: {
    alignItems: "center",
  },
  macroCalNumber: {
    color: C.trail,
    fontSize: 20,
    fontWeight: "700",
  },
  macroNumber: {
    color: C.earth,
    fontSize: 20,
    fontWeight: "700",
  },
  macroItemLabel: {
    color: C.rock,
    fontSize: 12,
    marginTop: 2,
  },
  // Guilt-free card
  guiltCard: {
    backgroundColor: C.stone,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  guiltCardActive: {
    backgroundColor: "rgba(250,204,21,0.1)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.3)",
  },
  guiltDayTitle: {
    color: "#CA8A04",
    fontSize: 16,
    fontWeight: "700",
    marginBottom: 4,
  },
  guiltDayBody: {
    color: C.earth,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: 8,
  },
  guiltDayTip: {
    color: C.rock,
    fontSize: 12,
    fontStyle: "italic",
  },
  guiltRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  guiltNext: {
    color: C.trail,
    fontSize: 13,
    marginBottom: 8,
  },
  // Nutrition card
  nutritionCard: {
    backgroundColor: C.stone,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  nutritionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  // Plate bar
  plateBar: {
    flexDirection: "row",
    borderRadius: 10,
    overflow: "hidden",
    height: 32,
    marginBottom: 8,
  },
  plateSegVeggies: {
    backgroundColor: "#166534",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  plateSegProtein: {
    backgroundColor: "#0369A1",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  plateSegCarbs: {
    backgroundColor: "#A16207",
    justifyContent: "center",
    paddingHorizontal: 8,
  },
  plateSegText: {
    color: "#FFFFFF",
    fontSize: 10,
    fontWeight: "700",
  },
  ruleBox: {
    backgroundColor: "rgba(250,204,21,0.08)",
    borderWidth: 1,
    borderColor: "rgba(250,204,21,0.2)",
    borderRadius: 10,
    padding: 12,
    marginBottom: 16,
  },
  ruleTitle: {
    color: "#CA8A04",
    fontSize: 11,
    fontWeight: "700",
    marginBottom: 4,
  },
  // Cuisine selector
  sectionLabel: {
    color: C.rock,
    fontSize: 12,
    fontWeight: "600",
    marginBottom: 8,
    letterSpacing: 0.5,
    textTransform: "uppercase",
  },
  cuisinePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
  },
  tabPill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
  },
  // Meal card
  mealCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 20,
    marginBottom: 12,
  },
  mealCardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 4,
  },
  mealCategoryLabel: {
    color: C.rock,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
  },
  modePill: {
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 100,
  },
  dislikeBtn: {
    backgroundColor: C.stone,
    borderRadius: 100,
    paddingHorizontal: 8,
    paddingVertical: 4,
  },
  dislikeBtnText: {
    fontSize: 13,
  },
  cuisineTag: {
    color: C.rock,
    fontSize: 11,
    fontWeight: "500",
  },
  mealName: {
    color: C.earth,
    fontSize: 16,
    fontWeight: "600",
    marginBottom: 4,
  },
  mealDesc: {
    color: C.rock,
    fontSize: 13,
    marginBottom: 12,
  },
  macroChip: {
    color: C.rock,
    fontSize: 13,
  },
  // Recipe button
  recipeBtn: {
    backgroundColor: C.earth,
    borderRadius: 14,
    paddingVertical: 8,
    alignItems: "center",
    marginBottom: 12,
  },
  recipeBtnText: {
    color: C.bg,
    fontSize: 13,
    fontWeight: "600",
  },
  // Restaurant deals
  dealsLoading: {
    backgroundColor: C.stone,
    borderRadius: 14,
    padding: 24,
    alignItems: "center",
    marginBottom: 8,
  },
  restaurantsSectionLabel: {
    color: C.rock,
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 8,
  },
  restaurantCard: {
    backgroundColor: C.white,
    borderRadius: 16,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginBottom: 8,
  },
  restaurantCardTop: {
    borderColor: C.trail,
    borderWidth: 1,
    backgroundColor: "rgba(52,211,153,0.05)",
  },
  restaurantName: {
    color: C.earth,
    fontSize: 15,
    fontWeight: "600",
  },
  restaurantAddr: {
    color: C.rock,
    fontSize: 12,
    marginTop: 2,
  },
  restaurantPrice: {
    color: C.earth,
    fontSize: 15,
    fontWeight: "700",
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginTop: 4,
  },
  bestMatch: {
    color: C.trail,
    fontSize: 12,
    fontWeight: "600",
    marginTop: 8,
  },
  orderBtn: {
    flex: 1,
    backgroundColor: C.earth,
    borderRadius: 10,
    paddingVertical: 8,
    alignItems: "center",
  },
  orderBtnText: {
    color: C.bg,
    fontSize: 12,
    fontWeight: "600",
  },
  noDeals: {
    backgroundColor: C.stone,
    borderRadius: 14,
    padding: 16,
    alignItems: "center",
    marginBottom: 8,
  },
  // Alternatives
  altsToggle: {
    color: C.rock,
    fontSize: 13,
  },
  altCard: {
    backgroundColor: C.stone,
    borderRadius: 16,
    padding: 12,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  altName: {
    color: C.earth,
    fontSize: 13,
    fontWeight: "600",
  },
  altMeta: {
    color: C.rock,
    fontSize: 12,
    marginTop: 2,
  },
  swapText: {
    color: C.earth,
    fontSize: 12,
    fontWeight: "600",
  },
  // Footer
  footerCard: {
    backgroundColor: C.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: C.border,
    padding: 16,
    marginTop: 24,
  },
  // Typography helpers
  cardTitle: {
    color: C.earth,
    fontSize: 15,
    fontWeight: "600",
  },
  cardSubtitle: {
    color: C.rock,
    fontSize: 13,
    marginTop: 4,
  },
  rockText: {
    color: C.rock,
    fontSize: 13,
  },
  rockTextXs: {
    color: C.rock,
    fontSize: 11,
  },
});
