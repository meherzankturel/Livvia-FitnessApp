import { View, Text, ScrollView, Pressable, ActivityIndicator, Modal, RefreshControl, StyleSheet, Animated, LayoutAnimation, Platform, UIManager, Dimensions, Easing } from "react-native";
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
const { width: SCREEN_W } = Dimensions.get("window");
const CARD_W = 280;
const CARD_GAP = 12;
const CARD_SNAP = CARD_W + CARD_GAP;

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

const DISLIKED_MEALS_KEY = "livvia_disliked_meals";

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

// ─── View-based Icons ────────────────────────────────────────────────────────

/** Sun-rays icon for breakfast */
function SunRaysIcon({ size = 20, color = C.bg }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: size * 0.4, height: size * 0.4, borderRadius: size * 0.2, backgroundColor: color }} />
      {[0, 45, 90, 135].map((deg) => (
        <View key={deg} style={{
          position: "absolute", width: 2, height: size * 0.3, backgroundColor: color,
          transform: [{ rotate: `${deg}deg` }, { translateY: -size * 0.15 }], opacity: 0.6,
        }} />
      ))}
    </View>
  );
}

/** Full sun icon for lunch */
function FullSunIcon({ size = 20, color = C.earth }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, borderRadius: size / 2, backgroundColor: color, opacity: 0.2 }} />
  );
}

/** Half circle for snack */
function HalfCircleIcon({ size = 20, color = C.earth }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size / 2, borderTopLeftRadius: size / 2, borderTopRightRadius: size / 2, backgroundColor: color, opacity: 0.2 }} />
  );
}

/** Crescent for dinner */
function CrescentIcon({ size = 20, color = C.bg }: { size?: number; color?: string }) {
  return (
    <View style={{ width: size, height: size, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: size * 0.7, height: size * 0.7, borderRadius: size * 0.35, backgroundColor: color }} />
      <View style={{ position: "absolute", width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275, backgroundColor: "transparent", borderWidth: 0, left: size * 0.3, top: size * 0.05 }}>
        <View style={{ width: size * 0.55, height: size * 0.55, borderRadius: size * 0.275, backgroundColor: color, opacity: 0 }} />
      </View>
    </View>
  );
}

function MealIcon({ index, dark }: { index: number; dark: boolean }) {
  const color = dark ? C.bg : C.earth;
  switch (index) {
    case 0: return <SunRaysIcon size={20} color={color} />;
    case 1: return <FullSunIcon size={20} color={color} />;
    case 3: return <HalfCircleIcon size={20} color={color} />;
    case 2: return <CrescentIcon size={20} color={color} />;
    default: return null;
  }
}

/** Bag icon for grocery */
function BagIcon() {
  return (
    <View style={{ width: 18, height: 18, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 12, height: 10, borderRadius: 3, borderWidth: 1.5, borderColor: C.earth, borderTopWidth: 0 }} />
      <View style={{ position: "absolute", top: 1, width: 8, height: 6, borderRadius: 4, borderWidth: 1.5, borderColor: C.earth, backgroundColor: "transparent" }} />
    </View>
  );
}

/** Cursor icon for tap hint */
function CursorIcon() {
  return (
    <View style={{ width: 12, height: 16, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: 5, borderRightWidth: 5, borderBottomWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: C.rock, transform: [{ rotate: "-30deg" }] }} />
    </View>
  );
}

// ─── Action Icons (View-based) ───────────────────────────────────────────────

function PotIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 16, height: 10, borderRadius: 3, borderWidth: 1.5, borderColor: C.bg, borderTopWidth: 0 }} />
      <View style={{ width: 20, height: 2, backgroundColor: C.bg, borderRadius: 1, marginTop: -1 }} />
      <View style={{ width: 4, height: 4, borderTopWidth: 1.5, borderRightWidth: 1.5, borderColor: C.bg, position: "absolute", top: 0 }} />
    </View>
  );
}

function BookIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 14, height: 16, borderRadius: 2, borderWidth: 1.5, borderColor: C.earth, backgroundColor: "transparent" }} />
      <View style={{ position: "absolute", left: 5, top: 3, width: 1.5, height: 16, backgroundColor: C.earth }} />
    </View>
  );
}

function SwapArrowsIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 14, height: 1.5, backgroundColor: C.earth, position: "absolute", top: 7 }} />
      <View style={{ width: 14, height: 1.5, backgroundColor: C.earth, position: "absolute", top: 13 }} />
      <View style={{ width: 0, height: 0, borderLeftWidth: 4, borderTopWidth: 3, borderBottomWidth: 3, borderLeftColor: C.earth, borderTopColor: "transparent", borderBottomColor: "transparent", position: "absolute", right: 2, top: 4.5 }} />
      <View style={{ width: 0, height: 0, borderRightWidth: 4, borderTopWidth: 3, borderBottomWidth: 3, borderRightColor: C.earth, borderTopColor: "transparent", borderBottomColor: "transparent", position: "absolute", left: 2, top: 10.5 }} />
    </View>
  );
}

function ForkLocationIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 2, height: 14, backgroundColor: C.earth, borderRadius: 1 }} />
      <View style={{ position: "absolute", top: 2, width: 8, height: 1.5, backgroundColor: C.earth, borderRadius: 1 }} />
      <View style={{ position: "absolute", top: 5, width: 6, height: 1.5, backgroundColor: C.earth, borderRadius: 1 }} />
    </View>
  );
}

function XIcon() {
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      <View style={{ width: 14, height: 2, backgroundColor: "#AEAEB2", borderRadius: 1, transform: [{ rotate: "45deg" }] }} />
      <View style={{ width: 14, height: 2, backgroundColor: "#AEAEB2", borderRadius: 1, transform: [{ rotate: "-45deg" }], position: "absolute" }} />
    </View>
  );
}

function LogCheckIcon({ logged }: { logged: boolean }) {
  const color = logged ? C.trail : C.rock;
  return (
    <View style={{ width: 22, height: 22, justifyContent: "center", alignItems: "center" }}>
      {/* Circle */}
      <View style={{
        width: 18, height: 18, borderRadius: 9,
        borderWidth: 2, borderColor: color,
        backgroundColor: logged ? C.trail : "transparent",
        justifyContent: "center", alignItems: "center",
      }}>
        {/* Checkmark lines */}
        <View style={{
          width: 5, height: 2, backgroundColor: logged ? C.bg : color,
          position: "absolute", left: 2, top: 9,
          transform: [{ rotate: "45deg" }], borderRadius: 1,
        }} />
        <View style={{
          width: 9, height: 2, backgroundColor: logged ? C.bg : color,
          position: "absolute", left: 5, top: 8,
          transform: [{ rotate: "-45deg" }], borderRadius: 1,
        }} />
      </View>
    </View>
  );
}

// ─── Main Component ──────────────────────────────────────────────────────────

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

  // Meal logging state
  const [loggedMeals, setLoggedMeals] = useState<Set<number>>(new Set()); // indices of logged slots
  const [loggedTotals, setLoggedTotals] = useState({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });

  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);

  const [showNutritionTips, setShowNutritionTips] = useState(false);

  const [selectedMealIndex, setSelectedMealIndex] = useState(0);
  const [tapHintVisible, setTapHintVisible] = useState(true);

  const [refreshing, setRefreshing] = useState(false);
  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    await loadMealPlan();
    setRefreshing(false);
  }, [dislikedMeals]);

  // --- Animations ---

  // Hero card entrance
  const heroTranslateY = useRef(new Animated.Value(16)).current;
  const heroOpacity = useRef(new Animated.Value(0)).current;

  // Calorie number pop
  const calScale = useRef(new Animated.Value(0.8)).current;
  const calOpacity = useRef(new Animated.Value(0)).current;

  // Macro bars scaleX (3 bars)
  const macroBarAnims = useRef([0, 1, 2].map(() => new Animated.Value(0))).current;

  // Cuisine tiles entrance
  const cuisineTileAnims = useRef(
    Array.from({ length: 10 }, () => ({
      translateY: new Animated.Value(12),
      opacity: new Animated.Value(0),
    }))
  ).current;

  // Meal cards entrance
  const mealCardAnims = useRef([0, 1, 2, 3].map(() => ({
    translateX: new Animated.Value(30),
    opacity: new Animated.Value(0),
  }))).current;

  // Card selection scale + opacity
  const cardScaleAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;
  const cardOpacityAnims = useRef([0, 1, 2, 3].map(() => new Animated.Value(1))).current;

  // Action sheet
  const actionSheetTranslateY = useRef(new Animated.Value(10)).current;
  const actionSheetOpacity = useRef(new Animated.Value(0)).current;

  // Action icons (6 items: Log, Cook, Recipe, Swap, Eat Out, Nah)
  const actionIconAnims = useRef([0, 1, 2, 3, 4, 5].map(() => ({
    translateY: new Animated.Value(8),
    opacity: new Animated.Value(0),
  }))).current;

  // Decorative ring rotation
  const ringRotation = useRef(new Animated.Value(0)).current;

  // Tap hint fade
  const tapHintOpacity = useRef(new Animated.Value(1)).current;

  // Meal card scroll ref
  const mealScrollRef = useRef<ScrollView>(null);

  const macroScale = useRef(new Animated.Value(0.92)).current;
  const macroOpacity = useRef(new Animated.Value(0)).current;

  // Old waypoint anims kept for compatibility
  const wpAnims = useRef([0, 1, 2, 3].map(() => ({
    opacity: new Animated.Value(0),
    translateY: new Animated.Value(20),
  }))).current;

  // Ring rotation loop
  useEffect(() => {
    Animated.loop(
      Animated.timing(ringRotation, {
        toValue: 1,
        duration: 8000,
        easing: Easing.linear,
        useNativeDriver: true,
      })
    ).start();
  }, []);

  // Hero + calorie + macro bar animations on mount
  useEffect(() => {
    if (targets) {
      // Hero entrance
      Animated.parallel([
        Animated.timing(heroTranslateY, { toValue: 0, duration: 500, useNativeDriver: true }),
        Animated.timing(heroOpacity, { toValue: 1, duration: 500, useNativeDriver: true }),
      ]).start();

      // Calorie pop (spring)
      Animated.parallel([
        Animated.spring(calScale, { toValue: 1, damping: 12, stiffness: 200, mass: 0.6, useNativeDriver: true }),
        Animated.timing(calOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();

      // Macro bars stagger
      Animated.stagger(120, macroBarAnims.map((anim) =>
        Animated.spring(anim, { toValue: 1, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: true })
      )).start();

      // Legacy macro strip
      Animated.parallel([
        Animated.spring(macroScale, { toValue: 1, damping: 12, stiffness: 200, mass: 0.6, useNativeDriver: true }),
        Animated.timing(macroOpacity, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    }
  }, [targets]);

  // Cuisine tiles stagger on mount
  useEffect(() => {
    const cuisineKeys = Object.keys(cuisineLabels);
    const anims = cuisineKeys.map((_, i) => {
      if (i >= cuisineTileAnims.length) return Animated.delay(0);
      return Animated.parallel([
        Animated.spring(cuisineTileAnims[i].translateY, { toValue: 0, damping: 14, stiffness: 180, mass: 0.7, useNativeDriver: true }),
        Animated.timing(cuisineTileAnims[i].opacity, { toValue: 1, duration: 250, useNativeDriver: true }),
      ]);
    });
    Animated.stagger(60, anims).start();
  }, []);

  // Meal cards stagger on mount
  useEffect(() => {
    if (slots.length > 0) {
      const animations = slots.map((_, i) =>
        Animated.parallel([
          Animated.spring(mealCardAnims[i].translateX, { toValue: 0, damping: 14, stiffness: 180, mass: 0.7, useNativeDriver: true }),
          Animated.timing(mealCardAnims[i].opacity, { toValue: 1, duration: 300, useNativeDriver: true }),
        ])
      );
      Animated.stagger(80, animations).start();

      // Also trigger action sheet
      animateActionSheet();
    }
  }, [slots.length]);

  // Card selection animations
  useEffect(() => {
    cardScaleAnims.forEach((anim, i) => {
      Animated.spring(anim, {
        toValue: i === selectedMealIndex ? 1.02 : 0.96,
        damping: 14, stiffness: 200, mass: 0.6, useNativeDriver: true,
      }).start();
    });
    cardOpacityAnims.forEach((anim, i) => {
      Animated.timing(anim, {
        toValue: i === selectedMealIndex ? 1 : 0.7,
        duration: 200, useNativeDriver: true,
      }).start();
    });

    // Re-trigger action sheet
    animateActionSheet();
  }, [selectedMealIndex]);

  function animateActionSheet() {
    actionSheetTranslateY.setValue(10);
    actionSheetOpacity.setValue(0);
    Animated.parallel([
      Animated.spring(actionSheetTranslateY, { toValue: 0, damping: 14, stiffness: 180, mass: 0.7, useNativeDriver: true }),
      Animated.timing(actionSheetOpacity, { toValue: 1, duration: 250, useNativeDriver: true }),
    ]).start();

    // Re-stagger action icons
    actionIconAnims.forEach((a) => { a.translateY.setValue(8); a.opacity.setValue(0); });
    Animated.stagger(50, actionIconAnims.map((a) =>
      Animated.parallel([
        Animated.spring(a.translateY, { toValue: 0, damping: 14, stiffness: 180, mass: 0.7, useNativeDriver: true }),
        Animated.timing(a.opacity, { toValue: 1, duration: 200, useNativeDriver: true }),
      ])
    )).start();
  }

  useEffect(() => {
    loadDislikedMeals();
    requestLocation();
  }, []);

  useEffect(() => {
    loadMealPlan();
  }, [dislikedMeals, selectedCuisines, selectedExclusions]);

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
      p.tdee, p.goal, p.weight_kg, p.dietary_preference, selectedExclusions,
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
      selectedExclusions,
      [slot.selected.name, ...slot.alternatives.map(a => a.name), ...dislikedMeals],
      selectedCuisines,
      profile.goal as any
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
        calories: String(meal.calories || 0),
        protein: String(meal.protein_g || 0),
        carbs: String(meal.carbs_g || 0),
        fat: String(meal.fat_g || 0),
        mealType: meal.mealType || "Meal",
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

  // ─── Meal Logging ────────────────────────────────────────────────────────

  const todayStr = new Date().toISOString().split("T")[0]; // "YYYY-MM-DD"

  const fetchTodayLogs = useCallback(async () => {
    if (!session?.user?.id || slots.length === 0) return;
    try {
      const { data } = await supabase
        .from("meal_logs")
        .select("meal_name, meal_type, calories, protein_g, carbs_g, fat_g")
        .eq("user_id", session.user.id)
        .eq("date", todayStr);

      if (!data || data.length === 0) {
        setLoggedMeals(new Set());
        setLoggedTotals({ calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 });
        return;
      }

      // Match logged meals back to slot indices by meal_type + meal_name
      const loggedIndices = new Set<number>();
      let totals = { calories: 0, protein_g: 0, carbs_g: 0, fat_g: 0 };
      for (const log of data) {
        totals.calories += log.calories || 0;
        totals.protein_g += log.protein_g || 0;
        totals.carbs_g += log.carbs_g || 0;
        totals.fat_g += log.fat_g || 0;
        // Find the matching slot
        const slotIdx = slots.findIndex(
          (sl, idx) => CATEGORIES[idx] === log.meal_type && sl.selected.name === log.meal_name
        );
        if (slotIdx >= 0) loggedIndices.add(slotIdx);
      }
      setLoggedMeals(loggedIndices);
      setLoggedTotals(totals);
    } catch {}
  }, [session?.user?.id, slots, todayStr]);

  // Fetch today's logs whenever slots change (new plan loaded)
  useEffect(() => {
    if (slots.length > 0) fetchTodayLogs();
  }, [slots.length, fetchTodayLogs]);

  const toggleLogMeal = async (index: number) => {
    if (!session?.user?.id) return;
    const slot = slots[index];
    const meal = slot.selected;
    const mealType = CATEGORIES[index];
    const isLogged = loggedMeals.has(index);

    if (isLogged) {
      // Un-log: delete from Supabase
      await supabase
        .from("meal_logs")
        .delete()
        .eq("user_id", session.user.id)
        .eq("date", todayStr)
        .eq("meal_type", mealType)
        .eq("meal_name", meal.name);

      const next = new Set(loggedMeals);
      next.delete(index);
      setLoggedMeals(next);
      setLoggedTotals((prev) => ({
        calories: prev.calories - (meal.calories || 0),
        protein_g: prev.protein_g - (meal.protein_g || 0),
        carbs_g: prev.carbs_g - (meal.carbs_g || 0),
        fat_g: prev.fat_g - (meal.fat_g || 0),
      }));
    } else {
      // Log: insert into Supabase
      await supabase.from("meal_logs").insert({
        user_id: session.user.id,
        meal_name: meal.name,
        meal_type: mealType,
        calories: meal.calories || 0,
        protein_g: meal.protein_g || 0,
        carbs_g: meal.carbs_g || 0,
        fat_g: meal.fat_g || 0,
        logged_at: new Date().toISOString(),
        date: todayStr,
      });

      const next = new Set(loggedMeals);
      next.add(index);
      setLoggedMeals(next);
      setLoggedTotals((prev) => ({
        calories: prev.calories + (meal.calories || 0),
        protein_g: prev.protein_g + (meal.protein_g || 0),
        carbs_g: prev.carbs_g + (meal.carbs_g || 0),
        fat_g: prev.fat_g + (meal.fat_g || 0),
      }));
    }
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

  // --- Card selection helpers ---

  const selectCard = (index: number) => {
    setSelectedMealIndex(index);
    if (tapHintVisible) {
      setTapHintVisible(false);
      Animated.timing(tapHintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
    }
    mealScrollRef.current?.scrollTo({ x: index * CARD_SNAP, animated: true });
  };

  const onMealScroll = (e: any) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / CARD_SNAP);
    if (idx >= 0 && idx < slots.length && idx !== selectedMealIndex) {
      setSelectedMealIndex(idx);
      if (tapHintVisible) {
        setTapHintVisible(false);
        Animated.timing(tapHintOpacity, { toValue: 0, duration: 300, useNativeDriver: true }).start();
      }
    }
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
  const selectedSlot = slots[selectedMealIndex];
  const ringSpin = ringRotation.interpolate({ inputRange: [0, 1], outputRange: ["0deg", "360deg"] });

  const proteinPct = Math.min(loggedTotals.protein_g / (targets.protein_g || 1), 1);
  const carbsPct = Math.min(loggedTotals.carbs_g / (targets.carbs_g || 1), 1);
  const fatPct = Math.min(loggedTotals.fat_g / (targets.fat_g || 1), 1);

  const MACRO_DATA = [
    { label: "Protein", value: `${loggedTotals.protein_g} / ${targets.protein_g}g`, pct: proteinPct || 0.03, color: C.trail },
    { label: "Carbs", value: `${loggedTotals.carbs_g} / ${targets.carbs_g}g`, pct: carbsPct || 0.03, color: "rgba(246,245,240,0.2)" },
    { label: "Fat", value: `${loggedTotals.fat_g} / ${targets.fat_g}g`, pct: fatPct || 0.03, color: "rgba(246,245,240,0.12)" },
  ];

  return (
    <View style={s.screen}>
      <TopoBackground />
      <ScrollView
        contentContainerStyle={s.scrollContent}
        refreshControl={<RefreshControl refreshing={refreshing} onRefresh={onRefresh} tintColor={C.trail} />}
        showsVerticalScrollIndicator={false}
      >

        {/* 1. Context Line */}
        <View style={s.contextRow}>
          <Text style={s.contextText}>{dayName.toUpperCase()} · NUTRITION</Text>
        </View>

        {/* 2. Dark Hero Card */}
        <Animated.View style={[s.heroCard, { opacity: heroOpacity, transform: [{ translateY: heroTranslateY }] }]}>
          {/* Decorative ring top-right */}
          <View style={s.heroRingContainer} pointerEvents="none">
            <Animated.View style={[s.heroRingOuter, { transform: [{ rotate: ringSpin }] }]}>
              <View style={s.heroRingInner} />
            </Animated.View>
          </View>

          <Text style={s.heroLabel}>TODAY&apos;S INTAKE</Text>

          <Animated.View style={{ flexDirection: "row", alignItems: "baseline", marginBottom: 16, opacity: calOpacity, transform: [{ scale: calScale }] }}>
            <Animated.Text style={s.heroCalorie}>
              {loggedTotals.calories.toLocaleString()}
            </Animated.Text>
            <Text style={s.heroCalorieTarget}> / {targets.calories.toLocaleString()} cal</Text>
          </Animated.View>

          {/* Macro progress bars */}
          <View style={s.macroBarsContainer}>
            {MACRO_DATA.map((m, i) => (
              <View key={m.label} style={s.macroBarRow}>
                <View style={s.macroBarTrack}>
                  <Animated.View style={[
                    s.macroBarFill,
                    {
                      backgroundColor: m.color,
                      transform: [{ scaleX: macroBarAnims[i] }],
                      width: `${m.pct * 100}%`,
                    },
                  ]} />
                </View>
                <View style={s.macroBarLabels}>
                  <Text style={s.macroBarValue}>{m.value}</Text>
                  <Text style={s.macroBarLabel}>{m.label.toUpperCase()}</Text>
                </View>
              </View>
            ))}
          </View>
        </Animated.View>

        {/* 3. Grocery Link */}
        <Pressable onPress={() => router.push("/(app)/grocery-list" as any)} style={s.groceryLink}>
          <BagIcon />
          <Text style={s.groceryLinkTitle}>Grocery List</Text>
          <Text style={s.groceryLinkMeta}>14 items · ~$45</Text>
          <Text style={s.groceryLinkArrow}>›</Text>
        </Pressable>

        {/* 4. Cuisine Filter Section */}
        <View style={s.cuisineHeader}>
          <Text style={s.cuisineTitle}>Cuisine</Text>
          <Pressable onPress={() => setShowAllergyModal(true)} style={s.allergyPill}>
            <Text style={s.allergyPillText}>Allergies</Text>
          </Pressable>
        </View>

        <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={s.cuisineScroll}>
          {(Object.keys(cuisineLabels) as CuisinePreference[]).map((cuisine, i) => {
            const isActive = selectedCuisines.includes(cuisine);
            const animIdx = Math.min(i, cuisineTileAnims.length - 1);
            return (
              <Animated.View
                key={cuisine}
                style={{
                  opacity: cuisineTileAnims[animIdx].opacity,
                  transform: [{ translateY: cuisineTileAnims[animIdx].translateY }],
                }}
              >
                <Pressable onPress={() => toggleCuisine(cuisine)} style={[s.cuisineTile, isActive && s.cuisineTileActive]}>
                  {isActive && (
                    <View style={s.cuisineCheckBadge}>
                      <Text style={s.cuisineCheckText}>✓</Text>
                    </View>
                  )}
                  <Text style={[s.cuisineFlag, isActive && { transform: [{ scale: 1.15 }] }]}>
                    {cuisineEmojis[cuisine]}
                  </Text>
                  <Text style={[s.cuisineName, isActive && s.cuisineNameActive]}>
                    {cuisineLabels[cuisine]}
                  </Text>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* 5. Horizontal Swipe Meal Cards */}
        <ScrollView
          ref={mealScrollRef}
          horizontal
          showsHorizontalScrollIndicator={false}
          snapToInterval={CARD_SNAP}
          decelerationRate="fast"
          contentContainerStyle={s.mealCardsScroll}
          onMomentumScrollEnd={onMealScroll}
        >
          {slots.map((slot, i) => {
            const isDark = i % 2 === 0;
            return (
              <Animated.View
                key={i}
                style={[
                  {
                    opacity: Animated.multiply(mealCardAnims[i].opacity, cardOpacityAnims[i]),
                    transform: [
                      { translateX: mealCardAnims[i].translateX },
                      { scale: cardScaleAnims[i] },
                    ],
                  },
                ]}
              >
                <Pressable
                  onPress={() => selectCard(i)}
                  style={[
                    s.mealCard,
                    isDark ? s.mealCardDark : s.mealCardLight,
                    i === selectedMealIndex && s.mealCardSelected,
                  ]}
                >
                  {/* Logged checkmark badge */}
                  {loggedMeals.has(i) && (
                    <View style={s.loggedBadge}>
                      <Text style={s.loggedBadgeText}>✓</Text>
                    </View>
                  )}

                  {/* Top row */}
                  <View style={s.mealCardTopRow}>
                    <Text style={[s.mealTimeLabel, isDark && s.mealTimeLabelDark]}>
                      {LABELS[i]} · {MEAL_TIMES[i]}
                    </Text>
                    <MealIcon index={i} dark={isDark} />
                  </View>

                  {/* Meal name pushed to bottom */}
                  <View style={{ flex: 1, justifyContent: "flex-end" }}>
                    <Text style={[s.mealName, isDark && s.mealNameDark]} numberOfLines={2}>
                      {slot.selected.name}
                    </Text>
                  </View>

                  {/* Footer */}
                  <View style={s.mealCardFooter}>
                    <Text style={[s.mealCalNum, isDark && s.mealCalNumDark]}>
                      {slot.selected.calories}
                    </Text>
                    <Text style={[s.mealMacroShort, isDark && s.mealMacroShortDark]}>
                      {slot.selected.protein_g}P · {slot.selected.carbs_g}C · {slot.selected.fat_g}F
                    </Text>
                  </View>
                </Pressable>
              </Animated.View>
            );
          })}
        </ScrollView>

        {/* 6. Dot Indicator */}
        <View style={s.dotRow}>
          {slots.map((_, i) => (
            <Pressable key={i} onPress={() => selectCard(i)}>
              <View style={[s.dot, i === selectedMealIndex && s.dotActive]} />
            </Pressable>
          ))}
        </View>

        {/* 7. Tap Hint */}
        {tapHintVisible && (
          <Animated.View style={[s.tapHintRow, { opacity: tapHintOpacity }]}>
            <CursorIcon />
            <Text style={s.tapHintText}>Tap a meal for options</Text>
          </Animated.View>
        )}

        {/* 8. Action Sheet */}
        <Animated.View style={[s.actionSheet, { opacity: actionSheetOpacity, transform: [{ translateY: actionSheetTranslateY }] }]}>
          <Text style={s.actionSheetName}>{selectedSlot?.selected.name}</Text>
          {selectedSlot?.selected.calories && (
            <Text style={s.actionSheetDesc}>
              {selectedSlot.selected.calories} cal · {selectedSlot.selected.protein_g}g protein · {selectedSlot.selected.carbs_g}g carbs · {selectedSlot.selected.fat_g}g fat
            </Text>
          )}
          <View style={s.actionDivider} />

          <View style={s.actionIconsRow}>
            {[
              {
                label: loggedMeals.has(selectedMealIndex) ? "Logged" : "Log",
                bg: loggedMeals.has(selectedMealIndex) ? "rgba(52,211,153,0.18)" : "rgba(52,211,153,0.08)",
                icon: <LogCheckIcon logged={loggedMeals.has(selectedMealIndex)} />,
                onPress: () => toggleLogMeal(selectedMealIndex),
              },
              { label: "Cook", bg: C.earth, icon: <PotIcon />, onPress: () => toggleMode(selectedMealIndex) },
              { label: "Recipe", bg: C.stone, icon: <BookIcon />, onPress: () => openRecipe(selectedSlot?.selected) },
              { label: "Swap", bg: "rgba(52,211,153,0.12)", icon: <SwapArrowsIcon />, onPress: () => handleRegenerate(selectedMealIndex) },
              { label: "Eat Out", bg: "rgba(245,158,11,0.12)", icon: <ForkLocationIcon />, onPress: () => { toggleMode(selectedMealIndex); } },
              { label: "Nah", bg: "rgba(0,0,0,0.04)", icon: <XIcon />, onPress: () => handleDislike(selectedMealIndex) },
            ].map((action, i) => (
              <Animated.View
                key={action.label}
                style={{
                  opacity: actionIconAnims[i].opacity,
                  transform: [{ translateY: actionIconAnims[i].translateY }],
                  alignItems: "center",
                  flex: 1,
                }}
              >
                <Pressable onPress={action.onPress} style={[s.actionIconBtn, { backgroundColor: action.bg }]}>
                  {action.icon}
                </Pressable>
                <Text style={s.actionIconLabel}>{action.label}</Text>
              </Animated.View>
            ))}
          </View>

          {/* Eat out deals inline */}
          {selectedSlot?.mode === "eatout" && (
            <View style={s.eatOutSection}>
              {selectedSlot.dealsLoading && (
                <View style={s.dealsLoading}>
                  <ActivityIndicator color={C.earth} size="small" />
                  <Text style={s.dealsLoadingText}>Finding deals...</Text>
                </View>
              )}
              {!selectedSlot.dealsLoading && selectedSlot.deals.length > 0 && (
                <>
                  <Text style={s.restaurantsSectionLabel}>Nearby</Text>
                  {selectedSlot.deals.map((place, j) => (
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
                        <Text style={s.restaurantMeta}>Rating: {place.rating}/5</Text>
                        <Text style={s.restaurantMeta}>{place.distance}</Text>
                      </View>
                      {j === 0 && <Text style={s.bestMatch}>Best Match</Text>}
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
              {!selectedSlot.dealsLoading && selectedSlot.deals.length === 0 && !location && (
                <View style={s.noDeals}>
                  <Text style={s.noDealsText}>Enable location to find deals nearby</Text>
                </View>
              )}
              {!selectedSlot.dealsLoading && selectedSlot.deals.length === 0 && location && (
                <Pressable onPress={() => toggleMode(selectedMealIndex)} style={s.noDeals}>
                  <Text style={s.noDealsTextAction}>Tap "Eat Out" again to search</Text>
                </Pressable>
              )}
            </View>
          )}
        </Animated.View>

        {/* 9. Allergy Modal */}
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

      </ScrollView>
    </View>
  );
}

// ─── Styles ──────────────────────────────────────────────────────────────────

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

  // 1. Context Line
  contextRow: {
    paddingHorizontal: 24,
    paddingTop: 64,
    paddingBottom: 12,
  },
  contextText: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: C.rock,
  },

  // 2. Dark Hero Card
  heroCard: {
    backgroundColor: C.earth,
    borderRadius: 24,
    padding: 22,
    marginHorizontal: 24,
    overflow: "hidden",
  },
  heroRingContainer: {
    position: "absolute",
    top: -20,
    right: -20,
    width: 90,
    height: 90,
  },
  heroRingOuter: {
    width: 90,
    height: 90,
    borderRadius: 45,
    borderTopWidth: 2,
    borderRightWidth: 2,
    borderTopColor: C.trail,
    borderRightColor: C.trail,
    borderBottomWidth: 2,
    borderLeftWidth: 2,
    borderBottomColor: "transparent",
    borderLeftColor: "transparent",
    justifyContent: "center",
    alignItems: "center",
  },
  heroRingInner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    borderWidth: 1,
    borderColor: "rgba(246,245,240,0.08)",
  },
  heroLabel: {
    fontSize: 9,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 1,
    color: "rgba(246,245,240,0.4)",
    marginBottom: 4,
  },
  heroCalorie: {
    fontSize: 44,
    fontWeight: "900",
    color: "#F6F5F0",
  },
  heroCalorieTarget: {
    fontSize: 18,
    fontWeight: "600",
    color: "rgba(246,245,240,0.4)",
    marginBottom: 16,
  },
  macroBarsContainer: {
    gap: 10,
  },
  macroBarRow: {},
  macroBarTrack: {
    height: 4,
    borderRadius: 2,
    backgroundColor: "rgba(246,245,240,0.06)",
    overflow: "hidden",
  },
  macroBarFill: {
    height: 4,
    borderRadius: 2,
    transformOrigin: "left center",
  },
  macroBarLabels: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginTop: 4,
  },
  macroBarValue: {
    fontSize: 14,
    fontWeight: "800",
    color: "#F6F5F0",
  },
  macroBarLabel: {
    fontSize: 8,
    fontWeight: "600",
    color: "rgba(246,245,240,0.4)",
    letterSpacing: 0.5,
  },

  // 3. Grocery Link
  groceryLink: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "rgba(45,42,36,0.03)",
    borderWidth: 1,
    borderColor: "rgba(45,42,36,0.04)",
    borderRadius: 16,
    paddingVertical: 12,
    paddingHorizontal: 16,
    marginHorizontal: 24,
    marginTop: 14,
    gap: 10,
  },
  groceryLinkTitle: {
    fontSize: 14,
    fontWeight: "600",
    color: C.earth,
  },
  groceryLinkMeta: {
    fontSize: 11,
    color: C.rock,
    flex: 1,
  },
  groceryLinkArrow: {
    fontSize: 18,
    fontWeight: "600",
    color: C.rock,
  },

  // 4. Cuisine Section
  cuisineHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: 24,
    marginTop: 24,
    marginBottom: 12,
  },
  cuisineTitle: {
    fontSize: 13,
    fontWeight: "700",
    color: C.earth,
  },
  allergyPill: {
    backgroundColor: "rgba(239,68,68,0.08)",
    borderRadius: 100,
    paddingVertical: 5,
    paddingHorizontal: 12,
  },
  allergyPillText: {
    fontSize: 11,
    fontWeight: "600",
    color: "#EF4444",
  },
  cuisineScroll: {
    paddingLeft: 24,
    paddingRight: 12,
    gap: 8,
  },
  cuisineTile: {
    width: 100,
    height: 72,
    borderRadius: 18,
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
    justifyContent: "center",
    alignItems: "center",
    overflow: "visible",
  },
  cuisineTileActive: {
    backgroundColor: C.earth,
    borderColor: C.earth,
  },
  cuisineCheckBadge: {
    position: "absolute",
    top: -4,
    right: -4,
    width: 18,
    height: 18,
    borderRadius: 9,
    backgroundColor: C.trail,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 1,
  },
  cuisineCheckText: {
    fontSize: 10,
    fontWeight: "700",
    color: C.white,
  },
  cuisineFlag: {
    fontSize: 32,
  },
  cuisineName: {
    fontSize: 10,
    fontWeight: "600",
    color: C.earth,
    marginTop: 4,
  },
  cuisineNameActive: {
    color: "#F6F5F0",
  },

  // 5. Meal Cards
  mealCardsScroll: {
    paddingLeft: 24,
    paddingRight: 24,
    paddingTop: 20,
    paddingBottom: 4,
    gap: CARD_GAP,
  },
  mealCard: {
    width: CARD_W,
    minHeight: 190,
    borderRadius: 24,
    padding: 18,
    overflow: "hidden",
  },
  mealCardDark: {
    backgroundColor: C.earth,
  },
  mealCardLight: {
    backgroundColor: C.white,
    borderWidth: 1,
    borderColor: "rgba(0,0,0,0.06)",
  },
  mealCardSelected: {
    borderWidth: 2,
    borderColor: C.trail,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 12,
    elevation: 4,
  },
  loggedBadge: {
    position: "absolute",
    top: 10,
    right: 10,
    width: 22,
    height: 22,
    borderRadius: 11,
    backgroundColor: C.trail,
    justifyContent: "center",
    alignItems: "center",
    zIndex: 10,
  },
  loggedBadgeText: {
    fontSize: 12,
    fontWeight: "700",
    color: C.bg,
  },
  mealCardTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
  },
  mealTimeLabel: {
    fontSize: 10,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: C.rock,
  },
  mealTimeLabelDark: {
    color: "rgba(246,245,240,0.5)",
  },
  mealName: {
    fontSize: 22,
    fontWeight: "700",
    color: C.earth,
  },
  mealNameDark: {
    color: "#F6F5F0",
  },
  mealCardFooter: {
    marginTop: 8,
  },
  mealCalNum: {
    fontSize: 30,
    fontWeight: "800",
    color: C.earth,
  },
  mealCalNumDark: {
    color: "#F6F5F0",
  },
  mealMacroShort: {
    fontSize: 11,
    fontWeight: "500",
    color: C.rock,
    marginTop: 2,
  },
  mealMacroShortDark: {
    color: "rgba(246,245,240,0.4)",
  },

  // 6. Dot Indicator
  dotRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 12,
  },
  dot: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: "rgba(45,42,36,0.15)",
  },
  dotActive: {
    width: 20,
    borderRadius: 10,
    backgroundColor: C.earth,
  },

  // 7. Tap Hint
  tapHintRow: {
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: 6,
    marginTop: 10,
  },
  tapHintText: {
    fontSize: 11,
    color: C.rock,
  },

  // 8. Action Sheet
  actionSheet: {
    backgroundColor: C.white,
    borderRadius: 22,
    padding: 18,
    marginHorizontal: 24,
    marginTop: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  actionSheetName: {
    fontSize: 16,
    fontWeight: "700",
    color: C.earth,
  },
  actionSheetDesc: {
    fontSize: 12,
    color: C.rock,
    marginTop: 4,
  },
  actionDivider: {
    height: 1,
    backgroundColor: "rgba(0,0,0,0.05)",
    marginVertical: 14,
  },
  actionIconsRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  actionIconBtn: {
    width: 44,
    height: 44,
    borderRadius: 14,
    justifyContent: "center",
    alignItems: "center",
  },
  actionIconLabel: {
    fontSize: 9,
    fontWeight: "600",
    color: C.rock,
    marginTop: 6,
  },

  // Eat Out section (in action sheet)
  eatOutSection: {
    marginTop: 14,
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

  // 9. Allergy Modal
  modalBackdrop: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.4)",
    justifyContent: "flex-end",
  },
  modalCard: {
    backgroundColor: "#F6F5F0",
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
    color: "#F6F5F0",
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
    color: "#F6F5F0",
    fontSize: 15,
    fontWeight: "600",
  },
});
