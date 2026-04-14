import {
  View, Text, ScrollView, Pressable, ActivityIndicator, Animated, Image,
  StyleSheet, LayoutAnimation, Platform, UIManager,
} from "react-native";
import { router } from "expo-router";
import { useState, useEffect, useRef } from "react";
import { useAuthStore, generateDailyMealPlan, generateGroceryList } from "@repped/shared";
import type { GroceryItem } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import * as Location from "expo-location";
import { findNearbyGroceryStores, type PlaceResult } from "../../src/lib/places";
import { openMapsUrl, openMaps } from "../../src/lib/deeplink";
import { generateSaveTips, getCachedTips, type SaveTip } from "../../src/lib/grocery-tips";
import { LinearGradient } from "expo-linear-gradient";
import * as Clipboard from "expo-clipboard";
import LottieView from "lottie-react-native";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

// ——— Business Logic (unchanged) ———
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

const categoryColors: Record<string, string> = {
  produce: "#34D399", protein: "#EF4444", dairy: "#F59E0B",
  grains: "#6366F1", pantry: "#8E8E7A", frozen: "#60A5FA", other: "#8E8E7A",
};

const categoryNames: Record<string, string> = {
  produce: "Produce", protein: "Protein", dairy: "Dairy",
  grains: "Grains", pantry: "Pantry", frozen: "Frozen", other: "Other",
};

const categoryEmojis: Record<string, string> = {
  produce: "🥬", protein: "🥩", dairy: "🧀",
  grains: "🌾", pantry: "🫙", frozen: "🧊", other: "📦",
};

const getWalkTime = (distanceStr: string): string => {
  const km = distanceStr.includes("km")
    ? parseFloat(distanceStr)
    : parseFloat(distanceStr) / 1000;
  if (isNaN(km)) return "–";
  const minutes = Math.round(km * 12);
  return `${minutes} min`;
};

// ——— Animated Components ———

function MapPin() {
  const bounce = useRef(new Animated.Value(0)).current;
  const radar1 = useRef(new Animated.Value(0)).current;
  const radar2 = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.loop(
      Animated.sequence([
        Animated.timing(bounce, { toValue: -3, duration: 1000, useNativeDriver: true }),
        Animated.timing(bounce, { toValue: 0, duration: 1000, useNativeDriver: true }),
      ])
    ).start();

    const startRadar = (val: Animated.Value, delay: number) => {
      setTimeout(() => {
        Animated.loop(
          Animated.parallel([
            Animated.timing(val, { toValue: 1, duration: 2400, useNativeDriver: true }),
          ])
        ).start();
      }, delay);
    };
    startRadar(radar1, 0);
    startRadar(radar2, 1200);
  }, []);

  const radarStyle = (val: Animated.Value) => ({
    position: "absolute" as const,
    width: 36, height: 36, borderRadius: 18,
    borderWidth: 1.5, borderColor: "rgba(52,211,153,0.3)",
    top: -4, left: -4,
    transform: [{ scale: val.interpolate({ inputRange: [0, 1], outputRange: [0.8, 2.2] }) }],
    opacity: val.interpolate({ inputRange: [0, 1], outputRange: [0.6, 0] }),
  });

  return (
    <View style={{ width: 28, height: 34, alignItems: "center" }}>
      <Animated.View style={radarStyle(radar1)} />
      <Animated.View style={radarStyle(radar2)} />
      <Animated.View style={{ transform: [{ translateY: bounce }] }}>
        <View style={{ width: 28, height: 34, alignItems: "center" }}>
          <View style={{ width: 24, height: 24, borderRadius: 12, backgroundColor: "#34D399", alignItems: "center", justifyContent: "center", zIndex: 2 }}>
            <View style={{ width: 10, height: 10, borderRadius: 5, backgroundColor: "#FFFFFF" }} />
          </View>
          <View style={{ width: 0, height: 0, marginTop: -4, borderLeftWidth: 7, borderRightWidth: 7, borderTopWidth: 10, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: "#34D399" }} />
        </View>
      </Animated.View>
    </View>
  );
}

// ——— Hero Flip Card ———

function HeroFlipCard({
  total,
  itemsCount,
  saveTips,
}: {
  total: number;
  itemsCount: number;
  saveTips: SaveTip[];
}) {
  const flipAnim = useRef(new Animated.Value(0)).current;
  const [flipped, setFlipped] = useState(false);

  const flipToBack = () => {
    setFlipped(true);
    Animated.spring(flipAnim, {
      toValue: 1,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start();
  };

  const flipToFront = () => {
    Animated.spring(flipAnim, {
      toValue: 0,
      friction: 8,
      tension: 60,
      useNativeDriver: true,
    }).start(() => setFlipped(false));
  };

  const frontRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["0deg", "180deg"],
  });

  const backRotate = flipAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["180deg", "360deg"],
  });

  return (
    <View style={s.heroWrap}>
      {/* Front Face */}
      <Animated.View
        style={[
          s.heroCard,
          { transform: [{ perspective: 1000 }, { rotateY: frontRotate }], backfaceVisibility: "hidden" },
        ]}
      >
        <LinearGradient
          colors={["#D4CFC5", "#E8E4DB", "#F2EFE8", "#DDD8CE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        {/* Subtle green glow */}
        <View style={s.heroGlow} />

        {/* Top row */}
        <View style={s.heroTopRow}>
          <Text style={s.heroLabel}>WEEKLY SHOP</Text>
          <Text style={s.heroItemCount}>{itemsCount} items</Text>
        </View>

        {/* Middle */}
        <View style={s.heroMiddle}>
          <View style={{ flex: 1 }}>
            <View style={{ flexDirection: "row", alignItems: "flex-end" }}>
              <Text style={s.heroDollar}>$</Text>
              <Text style={s.heroAmount}>{total.toFixed(2)}</Text>
            </View>
            <Text style={s.heroEstLabel}>estimated total</Text>
          </View>
          <View style={s.heroCartPlaceholder}>
            <LottieView
              source={require("../../assets/shopping-cart.json")}
              autoPlay
              loop
              style={{ width: 100, height: 100 }}
            />
          </View>
        </View>

        {/* Bottom row */}
        <View style={s.heroBottomRow}>
          <View style={{ flex: 1 }} />
          <Pressable onPress={flipToBack} style={s.saveTipsBtn}>
            <Text style={s.saveTipsBtnText}>💡 Save Tips</Text>
          </Pressable>
        </View>
      </Animated.View>

      {/* Back Face */}
      <Animated.View
        style={[
          s.heroCard,
          s.heroCardBack,
          { transform: [{ perspective: 1000 }, { rotateY: backRotate }], backfaceVisibility: "hidden" },
        ]}
        pointerEvents={flipped ? "auto" : "none"}
      >
        <LinearGradient
          colors={["#D4CFC5", "#E8E4DB", "#F2EFE8", "#DDD8CE"]}
          start={{ x: 0, y: 0 }}
          end={{ x: 1, y: 1 }}
          style={StyleSheet.absoluteFill}
        />
        <View style={s.heroGlow} />

        {/* Header */}
        <View style={s.backHeader}>
          <Text style={s.backTitle}>💡 Smart Save Tips</Text>
          <Pressable onPress={flipToFront} style={s.backCloseBtn}>
            <Text style={s.backCloseBtnText}>✕ Close</Text>
          </Pressable>
        </View>

        {/* Tips */}
        <View style={{ marginTop: 10 }}>
          {saveTips.map((tip, i) => (
            <View key={i} style={s.tipRow}>
              <View style={s.tipIconWrap}>
                <Text style={{ fontSize: 10 }}>{tip.icon}</Text>
              </View>
              <View style={{ flex: 1 }}>
                <Text style={s.tipText} numberOfLines={2}>{tip.text}</Text>
                <Text style={s.tipSavings}>{tip.savings}</Text>
              </View>
            </View>
          ))}
        </View>
      </Animated.View>
    </View>
  );
}

// ——— Store Card (glass) ———

function StoreCard({
  store,
  index,
  isClosest,
  expanded,
  onToggle,
  onDirections,
  onCopyAddress,
}: {
  store: PlaceResult;
  index: number;
  isClosest: boolean;
  expanded: boolean;
  onToggle: () => void;
  onDirections: () => void;
  onCopyAddress: () => void;
}) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(10)).current;
  const expandAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.parallel([
      Animated.timing(opacity, { toValue: 1, duration: 400, delay: index * 150, useNativeDriver: true }),
      Animated.timing(translateY, { toValue: 0, duration: 400, delay: index * 150, useNativeDriver: true }),
    ]).start();
  }, []);

  useEffect(() => {
    Animated.timing(expandAnim, {
      toValue: expanded ? 1 : 0,
      duration: 250,
      useNativeDriver: false,
    }).start();
  }, [expanded]);

  const expandHeight = expandAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [0, 58],
  });

  return (
    <Animated.View style={[s.glassCardOuter, { opacity, transform: [{ translateY }] }]}>
      <Pressable onPress={onToggle} style={[s.glassCard, isClosest && s.glassCardClosest]}>
        {/* Top row */}
        <View style={s.gcTopRow}>
          <View style={{ flex: 1 }}>
            <Text style={s.gcName}>{store.name}</Text>
            <Text style={s.gcAddress} numberOfLines={1}>{store.address}</Text>
          </View>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 3 }}>
            <Text style={{ fontSize: 12 }}>⭐</Text>
            <Text style={s.gcRating}>{store.rating}/5</Text>
          </View>
        </View>
        {/* Bottom row */}
        <View style={s.gcBottomRow}>
          <Image source={require("../../assets/walking.png")} style={{ width: 16, height: 16, opacity: 0.75 }} resizeMode="contain" />
          <Text style={[s.gcDist, isClosest && { color: "#34D399" }]}>{store.distance}</Text>
          <View style={{ width: 3, height: 3, borderRadius: 1.5, backgroundColor: "#8E8E7A", opacity: 0.3 }} />
          <Text style={s.gcWalk}>{getWalkTime(store.distance)}</Text>
          <View style={[s.gcBadge, { backgroundColor: store.isOpen ? "rgba(52,211,153,0.1)" : "rgba(239,68,68,0.06)" }]}>
            <Text style={{ fontSize: 11, fontWeight: "700", color: store.isOpen ? "#34D399" : "#EF4444" }}>
              {store.isOpen ? "Open" : "Closed"}
            </Text>
          </View>
        </View>
        {/* Expandable directions */}
        <Animated.View style={[s.gcExpandWrap, { maxHeight: expandHeight }]}>
          <View style={s.gcExpandInner}>
            <Pressable onPress={(e) => { e.stopPropagation(); onDirections(); }} style={s.gcActionBtn}>
              <Text style={{ fontSize: 13 }}>📍</Text>
              <Text style={s.gcActionText}>Get Directions</Text>
            </Pressable>
            <Pressable onPress={(e) => { e.stopPropagation(); onCopyAddress(); }} style={s.gcActionBtn}>
              <Text style={{ fontSize: 13 }}>📋</Text>
              <Text style={s.gcActionText}>Copy Address</Text>
            </Pressable>
          </View>
        </Animated.View>
      </Pressable>
    </Animated.View>
  );
}

// ——— Copy Toast ———

function CopyToast({ visible }: { visible: boolean }) {
  const translateY = useRef(new Animated.Value(-60)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    if (visible) {
      Animated.parallel([
        Animated.timing(translateY, { toValue: 0, duration: 300, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 1, duration: 300, useNativeDriver: true }),
      ]).start();
    } else {
      Animated.parallel([
        Animated.timing(translateY, { toValue: -60, duration: 250, useNativeDriver: true }),
        Animated.timing(opacityAnim, { toValue: 0, duration: 250, useNativeDriver: true }),
      ]).start();
    }
  }, [visible]);

  return (
    <Animated.View style={[s.toast, { transform: [{ translateY }], opacity: opacityAnim }]} pointerEvents="none">
      <Text style={s.toastText}>✓ Copied to clipboard</Text>
    </Animated.View>
  );
}

// ——— Main Screen ———

export default function GroceryListScreen() {
  const session = useAuthStore((s) => s.session);
  const [items, setItems] = useState<GroceryItem[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [checked, setChecked] = useState<Set<string>>(new Set());
  const [loading, setLoading] = useState(true);
  const [location, setLocation] = useState<{ lat: number; lng: number } | null>(null);
  const [storeDeals, setStoreDeals] = useState<PlaceResult[]>([]);
  const [dealsLoading, setDealsLoading] = useState(false);
  const [saveTips, setSaveTips] = useState<SaveTip[]>([]);
  const [toastVisible, setToastVisible] = useState(false);
  const [expandedStoreIdx, setExpandedStoreIdx] = useState<number | null>(null);

  // Load cached tips immediately (instant), then refresh in background
  useEffect(() => {
    getCachedTips().then(setSaveTips);
    loadGroceryList();
  }, []);

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

    // Generate personalized save tips in background (non-blocking)
    const tipsInput = list.items.map((item: any) => ({
      name: item.name,
      price: getEstimatedPrice(item.name),
    }));
    generateSaveTips(tipsInput).then(setSaveTips);

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
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    const next = new Set(checked);
    if (next.has(key)) next.delete(key); else next.add(key);
    setChecked(next);
  };

  const showCopyToast = () => {
    setToastVisible(true);
    setTimeout(() => setToastVisible(false), 2000);
  };

  const copyAddress = async (address: string) => {
    await Clipboard.setStringAsync(address);
    showCopyToast();
  };

  if (loading) {
    return (
      <View style={{ flex: 1, backgroundColor: "#F6F5F0", justifyContent: "center", alignItems: "center" }}>
        <ActivityIndicator color="#2D2A24" size="large" />
        <Text style={{ color: "#8E8E7A", marginTop: 12, fontSize: 13 }}>Building your grocery list...</Text>
      </View>
    );
  }

  const total = items.reduce((sum, item) => sum + getEstimatedPrice(item.name), 0);

  // Compute per-category checked counts
  const getCatItems = (cat: string) => items.filter((item) => item.category === cat);
  const getCatCheckedCount = (cat: string) =>
    getCatItems(cat).filter((item) => checked.has(`${item.name}_${item.unit}`)).length;

  const totalChecked = checked.size;

  // Determine aisle completion status
  const isAisleComplete = (cat: string) => {
    const catItems = getCatItems(cat);
    return catItems.length > 0 && catItems.every((item) => checked.has(`${item.name}_${item.unit}`));
  };

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      {/* Copy Toast */}
      <CopyToast visible={toastVisible} />

      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 60 }}>

        {/* ——— TOP BAR ——— */}
        <View style={s.topBar}>
          <Pressable onPress={() => router.navigate("/(app)/meals")} style={s.backBtn}>
            <Text style={s.backBtnText}>‹</Text>
          </Pressable>
          <Text style={s.topTitle}>Grocery List</Text>
        </View>

        {/* ——— HERO CARD ——— */}
        <HeroFlipCard total={total} itemsCount={items.length} saveTips={saveTips} />

        {/* ——— SHOPPING LIST — STORE ROUTE ——— */}
        <View style={s.routeSection}>
          {/* Section header */}
          <View style={s.routeHeader}>
            <View>
              <Text style={s.routeHeaderLabel}>Shopping List</Text>
              <View style={s.routeAccentLine} />
            </View>
            <Text style={s.routeHeaderMeta}>{totalChecked}/{items.length}</Text>
          </View>

          {/* Vertical trail line */}
          <View style={s.trailLineContainer}>
            <View style={s.trailLine} />

            {categories.map((cat, catIdx) => {
              const catItems = getCatItems(cat);
              const catChecked = getCatCheckedCount(cat);
              const complete = isAisleComplete(cat);
              const isCurrent = !complete && catIdx === categories.findIndex((c) => !isAisleComplete(c));

              return (
                <View key={cat} style={s.aisleBlock}>
                  {/* Waypoint dot */}
                  <View style={s.waypointRow}>
                    <View style={[
                      s.waypointDot,
                      complete && s.waypointDotComplete,
                      isCurrent && s.waypointDotCurrent,
                    ]}>
                      <Text style={{ fontSize: 13 }}>{categoryEmojis[cat] || "📦"}</Text>
                    </View>
                    <View style={s.aisleLabelRow}>
                      <Text style={s.aisleName}>{(categoryNames[cat] || cat).toUpperCase()}</Text>
                      <Text style={s.aisleCount}>{catChecked}/{catItems.length}</Text>
                    </View>
                  </View>

                  {/* Items */}
                  {catItems.map((item, i) => {
                    const key = `${item.name}_${item.unit}`;
                    const isChecked = checked.has(key);
                    return (
                      <Pressable key={i} onPress={() => toggleItem(key)} style={s.itemRow}>
                        <View style={[s.itemCheckbox, isChecked && s.itemCheckboxOn]}>
                          {isChecked && <Text style={s.itemCheckmark}>✓</Text>}
                        </View>
                        <View style={{ flex: 1 }}>
                          <Text
                            style={[s.itemName, isChecked && s.itemNameChecked]}
                            numberOfLines={1}
                          >
                            {item.name}
                          </Text>
                          <Text style={s.itemQty}>{item.amount} {item.unit}</Text>
                        </View>
                        <Text style={[s.itemPrice, isChecked && { opacity: 0.25 }]}>
                          ${getEstimatedPrice(item.name).toFixed(2)}
                        </Text>
                      </Pressable>
                    );
                  })}
                </View>
              );
            })}

            {/* Finish node */}
            {items.length > 0 && (
              <View style={s.finishNode}>
                <View style={s.finishDot}>
                  <Text style={{ fontSize: 13 }}>🛒</Text>
                </View>
                <Text style={s.finishText}>Est. Total  ${total.toFixed(2)}</Text>
              </View>
            )}

            {items.length === 0 && (
              <View style={{ padding: 20, alignItems: "center" }}>
                <Text style={{ color: "#8E8E7A", fontSize: 14 }}>No recipes with ingredients found.</Text>
              </View>
            )}
          </View>
        </View>

        {/* ——— NEARBY STORES — Glass cards ——— */}
        <View style={s.storesSection}>
          <View style={s.storesHeader}>
            <View>
              <Text style={s.storesSectionTitle}>Nearby Stores</Text>
              <View style={s.storesAccent} />
            </View>
            {storeDeals.length > 0 && (
              <Text style={s.storesCount}>{storeDeals.length} found</Text>
            )}
          </View>

          {dealsLoading && (
            <View style={{ paddingVertical: 24, alignItems: "center" }}>
              <ActivityIndicator color="#34D399" size="small" />
              <Text style={{ color: "#8E8E7A", fontSize: 11, marginTop: 6 }}>Finding stores...</Text>
            </View>
          )}

          {!dealsLoading && storeDeals.map((store, i) => (
            <StoreCard
              key={i}
              store={store}
              index={i}
              isClosest={i === 0}
              expanded={expandedStoreIdx === i}
              onToggle={() => setExpandedStoreIdx(expandedStoreIdx === i ? null : i)}
              onDirections={() => openMapsUrl(store.mapsUrl)}
              onCopyAddress={() => copyAddress(store.address)}
            />
          ))}

          {!dealsLoading && storeDeals.length === 0 && (
            <Pressable
              onPress={() => openMaps("grocery stores", location?.lat, location?.lng)}
              style={s.findStoresBtn}
            >
              <Text style={{ color: "#F6F5F0", fontSize: 14, fontWeight: "600" }}>Find Stores Near You</Text>
            </Pressable>
          )}
        </View>

      </ScrollView>
    </View>
  );
}

// ——— Styles ———
const s = StyleSheet.create({
  // Top Bar
  topBar: {
    paddingTop: 58,
    paddingHorizontal: 20,
    paddingBottom: 12,
    flexDirection: "row",
    alignItems: "center",
  },
  backBtn: {
    width: 34, height: 34, borderRadius: 17,
    backgroundColor: "#EDEBE5",
    alignItems: "center", justifyContent: "center",
  },
  backBtnText: { color: "#2D2A24", fontSize: 18, fontWeight: "600", marginTop: -1 },
  topTitle: {
    flex: 1, marginLeft: 12,
    fontSize: 24, fontWeight: "700", color: "#2D2A24",
  },

  // Hero Flip Card
  heroWrap: {
    marginHorizontal: 16,
    marginTop: 4,
    marginBottom: 16,
    height: 170,
  },
  heroCard: {
    position: "absolute",
    top: 0, left: 0, right: 0, bottom: 0,
    borderRadius: 22,
    padding: 14,
    overflow: "hidden",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 6 },
    shadowOpacity: 0.18,
    shadowRadius: 16,
    elevation: 8,
  },
  heroCardBack: {},
  heroGlow: {
    position: "absolute",
    top: -20, right: -15,
    width: 80, height: 80, borderRadius: 40,
    backgroundColor: "rgba(52,211,153,0.05)",
  },
  heroTopRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 2,
  },
  heroLabel: {
    fontSize: 9, fontWeight: "700", letterSpacing: 2,
    color: "#8E8E7A",
    textTransform: "uppercase",
  },
  heroItemCount: {
    fontSize: 10, fontWeight: "600", color: "#8E8E7A",
  },
  heroMiddle: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    marginTop: 2,
  },
  heroDollar: {
    fontSize: 48, fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#2E7D32", opacity: 0.7,
    marginRight: 6,
  },
  heroAmount: {
    fontSize: 42, fontWeight: "400",
    fontFamily: Platform.OS === "ios" ? "Georgia" : "serif",
    color: "#2D2A24",
    letterSpacing: -0.5,
  },
  heroEstLabel: {
    fontSize: 9, color: "#8E8E7A",
    fontWeight: "500", marginTop: 3,
  },
  heroCartPlaceholder: {
    width: 90, height: 90,
    alignItems: "center", justifyContent: "center",
  },
  heroBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "flex-end",
  },
  saveTipsBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 12,
    backgroundColor: "#C8C3B9",
    shadowColor: "#000",
    shadowOffset: { width: 4, height: 4 },
    shadowOpacity: 0.08,
    shadowRadius: 10,
    elevation: 4,
  },
  saveTipsBtnText: {
    fontSize: 9, fontWeight: "700", color: "#2D2A24", letterSpacing: 0.3,
  },

  // Back face
  backHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingBottom: 8,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.04)",
  },
  backTitle: {
    fontSize: 10, fontWeight: "700", letterSpacing: 1.5,
    color: "#2D2A24",
    textTransform: "uppercase",
  },
  backCloseBtn: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 10,
    backgroundColor: "#C8C3B9",
    shadowColor: "#000",
    shadowOffset: { width: 3, height: 3 },
    shadowOpacity: 0.06,
    shadowRadius: 8,
    elevation: 3,
  },
  backCloseBtnText: {
    fontSize: 9, fontWeight: "600", color: "#8E8E7A",
  },
  tipRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 6,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.03)",
    gap: 8,
  },
  tipIconWrap: {
    width: 22, height: 22, borderRadius: 8,
    backgroundColor: "rgba(0,0,0,0.03)",
    alignItems: "center", justifyContent: "center",
    marginTop: 1,
  },
  tipText: {
    fontSize: 10, fontWeight: "500",
    color: "#2D2A24", lineHeight: 14,
  },
  tipSavings: {
    fontSize: 9, fontWeight: "700",
    color: "#2E7D32",
    marginTop: 1,
  },

  // Store Route
  routeSection: {
    paddingHorizontal: 20,
  },
  routeHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  routeHeaderLabel: {
    fontSize: 14, fontWeight: "700",
    color: "#2D2A24", letterSpacing: -0.2,
  },
  routeAccentLine: {
    width: 18, height: 2, backgroundColor: "#34D399",
    borderRadius: 1, opacity: 0.4, marginTop: 4,
  },
  routeHeaderMeta: {
    fontSize: 10, fontWeight: "500", color: "#8E8E7A",
  },

  trailLineContainer: {
    position: "relative",
    paddingLeft: 40,
  },
  trailLine: {
    position: "absolute",
    left: 14, top: 14, bottom: 14,
    width: 2, backgroundColor: "#EDEBE5",
    borderRadius: 1,
  },

  aisleBlock: {
    marginBottom: 8,
  },
  waypointRow: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 4,
  },
  waypointDot: {
    position: "absolute",
    left: -40,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "#EDEBE5",
    alignItems: "center", justifyContent: "center",
    zIndex: 2,
  },
  waypointDotComplete: {
    backgroundColor: "rgba(52,211,153,0.15)",
  },
  waypointDotCurrent: {
    backgroundColor: "rgba(45,42,36,0.1)",
  },
  aisleLabelRow: {
    flexDirection: "row",
    alignItems: "center",
    flex: 1,
  },
  aisleName: {
    fontSize: 10, fontWeight: "700", letterSpacing: 2,
    color: "#8E8E7A",
    textTransform: "uppercase",
  },
  aisleCount: {
    fontSize: 10, fontWeight: "600", color: "#8E8E7A",
    marginLeft: "auto",
  },

  // Item rows
  itemRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 13,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemCheckbox: {
    width: 18, height: 18, borderRadius: 9,
    borderWidth: 1.5, borderColor: "#EDEBE5",
    marginRight: 12,
    alignItems: "center", justifyContent: "center",
  },
  itemCheckboxOn: {
    borderColor: "#34D399",
    backgroundColor: "rgba(52,211,153,0.12)",
  },
  itemCheckmark: { fontSize: 10, color: "#34D399", fontWeight: "700" },
  itemName: {
    fontSize: 14, fontWeight: "500", color: "#2D2A24",
  },
  itemNameChecked: {
    textDecorationLine: "line-through",
    opacity: 0.25,
  },
  itemQty: {
    fontSize: 10, color: "#8E8E7A", marginTop: 1,
  },
  itemPrice: {
    fontSize: 12, fontWeight: "600", color: "#8E8E7A",
    marginLeft: 8,
  },

  // Finish node
  finishNode: {
    flexDirection: "row",
    alignItems: "center",
    marginTop: 12,
    paddingVertical: 10,
  },
  finishDot: {
    position: "absolute",
    left: -40,
    width: 28, height: 28, borderRadius: 14,
    backgroundColor: "rgba(52,211,153,0.15)",
    alignItems: "center", justifyContent: "center",
    zIndex: 2,
  },
  finishText: {
    fontSize: 14, fontWeight: "700", color: "#2D2A24",
  },

  // Nearby Stores
  storesSection: {
    paddingHorizontal: 20,
    paddingTop: 22,
    paddingBottom: 50,
  },
  storesHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 14,
  },
  storesSectionTitle: {
    fontSize: 16, fontWeight: "700", color: "#2D2A24",
    letterSpacing: -0.2,
  },
  storesAccent: {
    width: 18, height: 2, backgroundColor: "#34D399",
    borderRadius: 1, opacity: 0.4, marginTop: 4,
  },
  storesCount: {
    fontSize: 12, fontWeight: "500", color: "#8E8E7A",
  },

  // Glass store cards
  glassCardOuter: {
    marginBottom: 12,
  },
  glassCard: {
    backgroundColor: "rgba(255,255,255,0.5)",
    borderRadius: 18,
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.6)",
    padding: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.04,
    shadowRadius: 8,
    elevation: 2,
  },
  glassCardClosest: {
    backgroundColor: "rgba(52,211,153,0.06)",
  },
  gcTopRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    marginBottom: 10,
  },
  gcName: {
    fontSize: 17, fontWeight: "700", color: "#2D2A24",
    letterSpacing: -0.2,
  },
  gcAddress: {
    fontSize: 12, color: "#8E8E7A", marginTop: 2,
  },
  gcRating: {
    fontSize: 13, fontWeight: "700", color: "#2D2A24",
  },
  gcBottomRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  gcDist: {
    fontSize: 14, fontWeight: "700", color: "#2D2A24",
  },
  gcWalk: {
    fontSize: 13, fontWeight: "500", color: "#8E8E7A",
  },
  gcBadge: {
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 99,
    marginLeft: "auto",
  },

  // Expand area
  gcExpandWrap: {
    overflow: "hidden",
  },
  gcExpandInner: {
    flexDirection: "row",
    gap: 8,
    paddingTop: 10,
    marginTop: 10,
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: "rgba(0,0,0,0.04)",
  },
  gcActionBtn: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: 6,
    paddingVertical: 10,
    paddingHorizontal: 14,
    borderRadius: 14,
    backgroundColor: "rgba(255,255,255,0.5)",
    borderWidth: 1,
    borderColor: "rgba(255,255,255,0.45)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 6,
    elevation: 1,
  },
  gcActionText: {
    fontSize: 12, fontWeight: "600", color: "#2D2A24",
  },

  // Find stores fallback
  findStoresBtn: {
    backgroundColor: "#2D2A24", borderRadius: 16,
    paddingVertical: 16, alignItems: "center", marginTop: 8,
  },

  // Toast
  toast: {
    position: "absolute",
    top: 54, left: 20, right: 20,
    backgroundColor: "#2D2A24",
    borderRadius: 14,
    paddingVertical: 12,
    paddingHorizontal: 20,
    zIndex: 999,
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 12,
    elevation: 10,
  },
  toastText: {
    fontSize: 13, fontWeight: "600", color: "#F6F5F0",
  },
});
