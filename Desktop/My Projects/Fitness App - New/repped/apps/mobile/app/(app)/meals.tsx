import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, RefreshControl, StyleSheet, Animated, LayoutAnimation, Platform, UIManager } from "react-native";
import { useEffect, useState, useCallback, useRef } from "react";
import { router } from "expo-router";
import { useAuthStore, generateMealPlanWithAlternatives, regenerateSingleMeal, TAKEOUT_GUIDES, getNutritionGuidance, getGuiltFreeStatus, getGuiltFreeDates, cuisineLabels, cuisineEmojis } from "@repped/shared";
import type { Meal, MacroTargets, CuisinePreference } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as Location from "expo-location";
import { findNearbyRestaurants, type PlaceResult } from "../../src/lib/places";
import { theme } from "../../src/lib/styles";
import { TopoBackground, TrailLine } from "../../src/components/terrain";
import { openUberEats, openDoorDash, openMapsUrl } from "../../src/lib/deeplink";

if (Platform.OS === 'android' && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

const C = theme.colors;

const MEAL_EMOJIS = ['🌅', '☀️', '🌙', '🍎'];
const MEAL_TIMES = ['8 AM', '12 PM', '7 PM', '4 PM'];

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

  // --- Animations ---
  const wpAnims = useRef([0, 1, 2, 3].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  const macroScale = useRef(new Animated.Value(0.92)).current;
  const macroOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (slots.length > 0) {
      const animations = slots.map((_, i) =>
        Animated.parallel([
          Animated.spring(wpAnims[i].opacity, { toValue: 1, damping: 12, stiffness: 200, mass: 0.6, useNativeDriver: true }),
          Animated.spring(wpAnims[i].translateY, { toValue: 0, damping: 12, stiffness: 200, mass: 0.6, useNativeDriver: true }),
        ])
      );
      Animated.stagger(80, animations).start();
    }
  }, [slots.length]);

  useEffect(() => {
    if (targets) {
      Animated.parallel([
        Animated.spring(macroScale, { toValue: 1, damping: 12, stiffness: 200, mass: 0.6, useNativeDriver: true }),
        Animated.timing(macroOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [targets]);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
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

  // --- Rendering ---

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

  const dayName = new Date().toLocaleDateString("en-US", { weekday: "long" });

  return (
    <View style={s.screen}>
      <TopoBackground />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.trail} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. HERO */}
        <View style={s.hero}>
          <Text style={s.heroContext}>{dayName.toUpperCase()} · NUTRITION</Text>
          <Text style={s.heroTitle}>Today's Fuel</Text>
        </View>

        {/* 2. COMPACT MACRO STRIP */}
        <Animated.View style={[s.macroStrip, { opacity: macroOpacity, transform: [{ scale: macroScale }] }]}>
          <View style={[s.macroWidget, s.macroWidgetCal]}>
            <Text style={s.macroWidgetNumCal}>{targets.calories}</Text>
            <Text style={s.macroWidgetLabelCal}>CALORIES</Text>
          </View>
          <View style={s.macroWidget}>
            <Text style={s.macroWidgetNum}>{targets.protein_g}g</Text>
            <Text style={s.macroWidgetLabel}>PROTEIN</Text>
          </View>
          <View style={s.macroWidget}>
            <Text style={s.macroWidgetNum}>{targets.carbs_g}g</Text>
            <Text style={s.macroWidgetLabel}>CARBS</Text>
          </View>
          <View style={s.macroWidget}>
            <Text style={s.macroWidgetNum}>{targets.fat_g}g</Text>
            <Text style={s.macroWidgetLabel}>FAT</Text>
          </View>
        </Animated.View>

        {/* 3. CUISINE + ALLERGY ROW */}
        <View style={s.quickRow}>
          <Pressable onPress={() => setShowCuisineSelector(!showCuisineSelector)} style={s.quickPillCuisine}>
            <Text style={s.quickPillCuisineText}>Cuisines ›</Text>
          </Pressable>
          <Pressable onPress={() => setShowAllergyModal(true)} style={s.quickPillAllergy}>
            <Text style={s.quickPillAllergyText}>Allergies ›</Text>
          </Pressable>
        </View>

        {/* Cuisine Selector (expandable) */}
        {showCuisineSelector && (
          <View style={s.cuisineExpanded}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              <View style={s.cuisineRow}>
                {(Object.keys(cuisineLabels) as CuisinePreference[]).map((cuisine) => {
                  const isActive = selectedCuisines.includes(cuisine);
                  return (
                    <Pressable
                      key={cuisine}
                      onPress={() => toggleCuisine(cuisine)}
                      style={[s.cuisinePill, isActive && s.cuisinePillActive]}
                    >
                      <Text style={s.cuisineEmoji}>{cuisineEmojis[cuisine]}</Text>
                      <Text style={[s.cuisinePillText, isActive && s.cuisinePillTextActive]}>
                        {cuisineLabels[cuisine]}
                      </Text>
                    </Pressable>
                  );
                })}
              </View>
            </ScrollView>
          </View>
        )}

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

        {/* 4. TRAIL SECTION */}
        <View style={s.trailSection}>
          <Text style={s.trailSectionTitle}>Daily Route</Text>
          <View style={s.trailContainer}>
            <TrailLine />

            {slots.map((slot, i) => (
              <Animated.View
                key={i}
                style={[
                  s.waypoint,
                  {
                    opacity: wpAnims[i].opacity,
                    transform: [{ translateY: wpAnims[i].translateY }],
                  },
                ]}
              >
                {/* LEFT: dot column */}
                <View style={s.dotColumn}>
                  <View style={[s.dotCircle, i === 0 && s.dotCircleFirst]}>
                    <Text style={s.dotEmoji}>{MEAL_EMOJIS[i]}</Text>
                  </View>
                  <Text style={s.dotTime}>{MEAL_TIMES[i]}</Text>
                </View>

                {/* RIGHT: meal card */}
                <View style={s.mealCard}>
                  {/* Top row */}
                  <View style={s.mealCardTopRow}>
                    <Text style={s.mealCategoryLabel}>{LABELS[i].toUpperCase()}</Text>
                    <Text style={s.mealKcal}>{slot.selected.calories} kcal</Text>
                  </View>

                  {/* Meal name */}
                  <Text style={s.mealName}>{slot.selected.name}</Text>

                  {/* Macro line */}
                  <Text style={s.macroLine}>
                    {slot.selected.protein_g}g P · {slot.selected.carbs_g}g C · {slot.selected.fat_g}g F
                  </Text>

                  {/* MODE TOGGLE */}
                  <View style={s.modeRow}>
                    <Pressable
                      onPress={() => { if (slot.mode !== "cook") toggleMode(i); }}
                      style={[s.modePill, slot.mode === "cook" ? s.modePillCookActive : s.modePillInactive]}
                    >
                      <Text style={[s.modePillText, slot.mode === "cook" ? s.modePillTextCookActive : s.modePillTextInactive]}>Cook</Text>
                    </Pressable>
                    <Pressable
                      onPress={() => { if (slot.mode !== "eatout") toggleMode(i); }}
                      style={[s.modePill, slot.mode === "eatout" ? s.modePillEatActive : s.modePillInactive]}
                    >
                      <Text style={[s.modePillText, slot.mode === "eatout" ? s.modePillTextEatActive : s.modePillTextInactive]}>Eat Out</Text>
                    </Pressable>
                  </View>

                  {/* ACTION PILLS */}
                  <View style={s.actionRow}>
                    {slot.mode === "cook" && (slot.selected as any).recipe && (
                      <Pressable onPress={() => openRecipe(slot.selected)} style={s.actionPillRecipe}>
                        <Text style={s.actionPillRecipeText}>Recipe</Text>
                      </Pressable>
                    )}
                    <Pressable onPress={() => toggleAlts(i)} style={s.actionPillSwap}>
                      <Text style={s.actionPillSwapText}>Swap</Text>
                    </Pressable>
                    <Pressable onPress={() => handleDislike(i)} style={s.actionPillNah}>
                      <Text style={s.actionPillNahText}>Nah</Text>
                    </Pressable>
                  </View>

                  {/* ALTERNATIVES section */}
                  {slot.showAlts && slot.alternatives.length > 0 && (
                    <View style={s.altsContainer}>
                      {slot.alternatives.map((alt, j) => (
                        <Pressable
                          key={j}
                          onPress={() => handlePickAlt(i, j)}
                          style={s.altRow}
                        >
                          <View style={s.altInfo}>
                            <Text style={s.altName}>{alt.name}</Text>
                            <Text style={s.altMeta}>{alt.calories} cal · {alt.protein_g}g P</Text>
                          </View>
                          <Text style={s.altSwapText}>Swap</Text>
                        </Pressable>
                      ))}
                    </View>
                  )}

                  {/* EAT OUT: restaurant deals */}
                  {slot.mode === "eatout" && (
                    <View style={s.eatOutSection}>
                      {slot.dealsLoading && (
                        <View style={s.dealsLoading}>
                          <ActivityIndicator color={C.earth} size="small" />
                          <Text style={s.dealsLoadingText}>Finding deals...</Text>
                        </View>
                      )}

                      {!slot.dealsLoading && slot.deals.length > 0 && (
                        <>
                          <Text style={s.restaurantsSectionLabel}>Nearby</Text>
                          {slot.deals.map((place, j) => (
                            <Pressable
                              key={j}
                              onPress={() => openMapsUrl(place.mapsUrl)}
                              style={[s.restaurantCard, j === 0 && s.restaurantCardTop]}
                            >
                              <View style={s.restaurantTopRow}>
                                <View style={s.restaurantInfo}>
                                  <Text style={s.restaurantName}>{place.name}</Text>
                                  <Text style={s.restaurantAddr} numberOfLines={1}>{place.address}</Text>
                                </View>
                                <View style={s.restaurantRight}>
                                  <Text style={s.restaurantPrice}>{place.priceLevel}</Text>
                                  <View style={[s.openBadge, { backgroundColor: place.isOpen ? "rgba(52,211,153,0.15)" : "rgba(239,68,68,0.12)" }]}>
                                    <Text style={[s.openBadgeText, { color: place.isOpen ? C.trail : "#EF4444" }]}>
                                      {place.isOpen ? "Open" : "Closed"}
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <View style={s.restaurantMetaRow}>
                                <Text style={s.restaurantMeta}>⭐ {place.rating}/5</Text>
                                <Text style={s.restaurantMeta}>📍 {place.distance}</Text>
                              </View>
                              {j === 0 && <Text style={s.bestMatch}>⭐ Best Match</Text>}
                              <View style={s.orderRow}>
                                <Pressable onPress={() => openUberEats(place.name)} style={s.orderBtn}>
                                  <Text style={s.orderBtnText}>UberEats</Text>
                                </Pressable>
                                <Pressable onPress={() => openDoorDash(place.name)} style={s.orderBtn}>
                                  <Text style={s.orderBtnText}>DoorDash</Text>
                                </Pressable>
                                <Pressable onPress={() => openMapsUrl(place.mapsUrl)} style={s.orderBtn}>
                                  <Text style={s.orderBtnText}>Pickup</Text>
                                </Pressable>
                              </View>
                            </Pressable>
                          ))}
                        </>
                      )}

                      {!slot.dealsLoading && slot.deals.length === 0 && !location && (
                        <View style={s.noDeals}>
                          <Text style={s.noDealsText}>Enable location to find deals nearby</Text>
                        </View>
                      )}

                      {!slot.dealsLoading && slot.deals.length === 0 && location && (
                        <Pressable onPress={() => toggleMode(i)} style={s.noDeals}>
                          <Text style={s.noDealsTextAction}>Tap "Eat Out" again to search</Text>
                        </Pressable>
                      )}
                    </View>
                  )}
                </View>
              </Animated.View>
            ))}
          </View>
        </View>

        {/* 5. GROCERY LINK */}
        <Pressable
          onPress={() => router.push("/(app)/grocery-list" as any)}
          style={s.groceryLink}
        >
          <View style={s.groceryLinkInner}>
            <Text style={s.groceryLinkTitle}>Grocery List</Text>
            <Text style={s.groceryLinkMeta}>14 items · ~$45</Text>
          </View>
          <Text style={s.groceryLinkArrow}>→</Text>
        </Pressable>

      </ScrollView>
    </View>
  );
}

const s = StyleSheet.create({
  screen: {
    flex: 1,
    backgroundColor: C.bg,
  },
  scrollContent: {
    paddingBottom: 120,
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

  // 1. HERO
  hero: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 8,
  },
  heroContext: {
    fontSize: 11,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.rock,
    marginBottom: 4,
  },
  heroTitle: {
    fontSize: 24,
    fontWeight: "700",
    color: C.earth,
  },

  // 2. MACRO STRIP
  macroStrip: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    paddingVertical: 16,
  },
  macroWidget: {
    flex: 1,
    backgroundColor: C.stone,
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 10,
    alignItems: "center",
  },
  macroWidgetCal: {
    backgroundColor: C.earth,
  },
  macroWidgetNum: {
    fontSize: 18,
    fontWeight: "800",
    color: C.earth,
  },
  macroWidgetNumCal: {
    fontSize: 18,
    fontWeight: "800",
    color: "#F6F5F0",
  },
  macroWidgetLabel: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: C.rock,
    marginTop: 2,
  },
  macroWidgetLabelCal: {
    fontSize: 8,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.6,
    color: "rgba(246,245,240,0.5)",
    marginTop: 2,
  },

  // 3. CUISINE + ALLERGY ROW
  quickRow: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  quickPillCuisine: {
    backgroundColor: C.stone,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickPillCuisineText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.trail,
  },
  quickPillAllergy: {
    backgroundColor: C.stone,
    borderRadius: 100,
    paddingVertical: 8,
    paddingHorizontal: 14,
  },
  quickPillAllergyText: {
    fontSize: 12,
    fontWeight: "600",
    color: C.rock,
  },
  cuisineExpanded: {
    paddingHorizontal: 24,
    marginBottom: 12,
  },
  cuisineRow: {
    flexDirection: "row",
    gap: 8,
  },
  cuisinePill: {
    paddingHorizontal: 14,
    paddingVertical: 8,
    borderRadius: 100,
    flexDirection: "row",
    alignItems: "center",
    gap: 4,
    backgroundColor: C.stone,
  },
  cuisinePillActive: {
    backgroundColor: C.earth,
  },
  cuisineEmoji: {
    fontSize: 13,
  },
  cuisinePillText: {
    color: C.earth,
    fontSize: 13,
    fontWeight: "600",
  },
  cuisinePillTextActive: {
    color: C.bg,
  },

  // MODAL
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

  // 4. TRAIL SECTION
  trailSection: {
    paddingHorizontal: 24,
    paddingVertical: 8,
  },
  trailSectionTitle: {
    fontSize: 14,
    fontWeight: "700",
    color: C.earth,
    marginBottom: 16,
  },
  trailContainer: {
    position: "relative",
  },

  // WAYPOINT
  waypoint: {
    flexDirection: "row",
    gap: 14,
    marginBottom: 14,
  },
  dotColumn: {
    width: 28,
    paddingTop: 14,
    alignItems: "center",
  },
  dotCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    borderWidth: 2,
    borderColor: "#DDD9CE",
    backgroundColor: C.bg,
    justifyContent: "center",
    alignItems: "center",
  },
  dotCircleFirst: {
    borderColor: C.trail,
    backgroundColor: "rgba(52,211,153,0.06)",
  },
  dotEmoji: {
    fontSize: 10,
  },
  dotTime: {
    fontSize: 7,
    color: C.rock,
    marginTop: 4,
    fontWeight: "600",
  },

  // MEAL CARD
  mealCard: {
    flex: 1,
    backgroundColor: "#FFFFFF",
    borderRadius: 20,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    padding: 16,
    overflow: "hidden",
  },
  mealCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealCategoryLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.8,
    color: C.rock,
  },
  mealKcal: {
    fontSize: 14,
    fontWeight: "700",
    color: C.earth,
  },
  mealName: {
    fontSize: 15,
    fontWeight: "600",
    color: C.earth,
    marginTop: 6,
  },
  macroLine: {
    fontSize: 11,
    color: C.rock,
    marginTop: 4,
  },

  // MODE TOGGLE
  modeRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  modePill: {
    borderRadius: 100,
    paddingVertical: 6,
    paddingHorizontal: 12,
  },
  modePillCookActive: {
    backgroundColor: C.earth,
  },
  modePillEatActive: {
    backgroundColor: "#F59E0B",
  },
  modePillInactive: {
    backgroundColor: C.stone,
  },
  modePillText: {
    fontSize: 10,
    fontWeight: "600",
  },
  modePillTextCookActive: {
    color: C.bg,
  },
  modePillTextEatActive: {
    color: C.earth,
  },
  modePillTextInactive: {
    color: C.rock,
  },

  // ACTION PILLS
  actionRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 8,
  },
  actionPillRecipe: {
    backgroundColor: C.stone,
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  actionPillRecipeText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.earth,
  },
  actionPillSwap: {
    backgroundColor: "rgba(52,211,153,0.08)",
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  actionPillSwapText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.trail,
  },
  actionPillNah: {
    backgroundColor: "rgba(0,0,0,0.03)",
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  actionPillNahText: {
    fontSize: 10,
    fontWeight: "600",
    color: "#AEAEB2",
  },

  // ALTERNATIVES
  altsContainer: {
    backgroundColor: C.stone,
    borderRadius: 14,
    padding: 10,
    marginTop: 10,
    gap: 6,
  },
  altRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 6,
    paddingHorizontal: 4,
  },
  altInfo: {
    flex: 1,
  },
  altName: {
    fontSize: 13,
    fontWeight: "600",
    color: C.earth,
  },
  altMeta: {
    fontSize: 11,
    color: C.rock,
    marginTop: 2,
  },
  altSwapText: {
    fontSize: 10,
    fontWeight: "600",
    color: C.trail,
  },

  // EAT OUT
  eatOutSection: {
    marginTop: 10,
  },
  dealsLoading: {
    backgroundColor: C.stone,
    borderRadius: 14,
    padding: 20,
    alignItems: "center",
  },
  dealsLoadingText: {
    color: C.rock,
    fontSize: 11,
    marginTop: 6,
  },
  restaurantsSectionLabel: {
    color: C.rock,
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    marginBottom: 6,
  },
  restaurantCard: {
    backgroundColor: C.white,
    borderRadius: 14,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.04)",
    padding: 12,
    marginBottom: 6,
  },
  restaurantCardTop: {
    borderColor: C.trail,
    borderWidth: 1,
    backgroundColor: "rgba(52,211,153,0.05)",
  },
  restaurantTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 4,
  },
  restaurantInfo: {
    flex: 1,
    marginRight: 12,
  },
  restaurantRight: {
    alignItems: "flex-end",
  },
  restaurantName: {
    color: C.earth,
    fontSize: 14,
    fontWeight: "600",
  },
  restaurantAddr: {
    color: C.rock,
    fontSize: 11,
    marginTop: 2,
  },
  restaurantPrice: {
    color: C.earth,
    fontSize: 14,
    fontWeight: "700",
  },
  openBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 100,
    marginTop: 4,
  },
  openBadgeText: {
    fontSize: 10,
    fontWeight: "600",
  },
  restaurantMetaRow: {
    flexDirection: "row",
    gap: 12,
    marginTop: 4,
  },
  restaurantMeta: {
    color: C.rock,
    fontSize: 10,
  },
  bestMatch: {
    color: C.trail,
    fontSize: 11,
    fontWeight: "600",
    marginTop: 6,
  },
  orderRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 10,
  },
  orderBtn: {
    flex: 1,
    backgroundColor: C.earth,
    borderRadius: 10,
    paddingVertical: 7,
    alignItems: "center",
  },
  orderBtnText: {
    color: C.bg,
    fontSize: 11,
    fontWeight: "600",
  },
  noDeals: {
    backgroundColor: C.stone,
    borderRadius: 14,
    padding: 14,
    alignItems: "center",
  },
  noDealsText: {
    color: C.rock,
    fontSize: 11,
  },
  noDealsTextAction: {
    color: C.earth,
    fontSize: 11,
    fontWeight: "500",
  },

  // 5. GROCERY LINK
  groceryLink: {
    backgroundColor: C.earth,
    borderRadius: 18,
    padding: 16,
    marginHorizontal: 24,
    marginTop: 8,
    marginBottom: 40,
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  groceryLinkInner: {
    flex: 1,
  },
  groceryLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.bg,
  },
  groceryLinkMeta: {
    fontSize: 11,
    color: "rgba(246,245,240,0.4)",
    marginTop: 2,
  },
  groceryLinkArrow: {
    fontSize: 18,
    fontWeight: "600",
    color: C.bg,
    marginLeft: 12,
  },
});
