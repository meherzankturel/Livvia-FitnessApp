import {
  View,
  Text,
  ScrollView,
  Pressable,
  Animated,
  StyleSheet,
  Dimensions,
  Image,
} from "react-native";
import { LinearGradient } from "expo-linear-gradient";
import { router, useLocalSearchParams } from "expo-router";
import { useRef, useEffect, useState } from "react";
import { openYouTube } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";
import { getDishImageUrl, getDishImageUrlAsync, getDishImageSource } from "../../src/lib/dish-images";
import type { ImageSourcePropType } from "react-native";

// ── Palette ──
const C = {
  earth: "#2D2A24",
  sand: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
  stone: "#EDEBE5",
};

const { width: SCREEN_W } = Dimensions.get("window");

// ── Macro Ring Component ──
// Uses border trick: colored borders on some sides, transparent on others
// ~75% = top + right + bottom colored, left transparent
// ~50% = top + right colored, bottom + left transparent
function MacroRing({
  value,
  label,
  fill,
}: {
  value: string;
  label: string;
  fill: "75" | "50";
}) {
  const colored = C.trail;
  const track = "rgba(142,142,122,0.15)";

  const borderColors =
    fill === "75"
      ? {
          borderTopColor: colored,
          borderRightColor: colored,
          borderBottomColor: colored,
          borderLeftColor: track,
        }
      : {
          borderTopColor: colored,
          borderRightColor: colored,
          borderBottomColor: track,
          borderLeftColor: track,
        };

  return (
    <View style={s.macroCol}>
      <View style={s.macroRingOuter}>
        {/* Track */}
        <View style={s.macroRingTrack} />
        {/* Fill */}
        <View style={[s.macroRingFill, borderColors]} />
        {/* Center value */}
        <View style={s.macroRingCenter}>
          <Text style={s.macroValue}>{value}</Text>
        </View>
      </View>
      <Text style={s.macroLabel}>{label}</Text>
    </View>
  );
}

export default function Recipe() {
  // ── Params ──
  const params = useLocalSearchParams<{
    name: string;
    ingredients: string;
    steps: string;
    prepTime: string;
    cookTime: string;
    calories: string;
    protein: string;
    carbs: string;
    fat: string;
    mealType: string;
  }>();

  const ingredients: { name: string; amount: string; unit?: string }[] = params.ingredients
    ? JSON.parse(params.ingredients)
    : [];
  const steps: string[] = params.steps ? JSON.parse(params.steps) : [];
  const mealType = (params.mealType || "Breakfast").toUpperCase();

  // ── Dish image — local bundled AI image > Pexels CDN URL > async fallback ──
  const dishName = params.name || "";
  const staticSource = getDishImageSource(dishName);
  const [dishSource, setDishSource] = useState<ImageSourcePropType | null>(staticSource);

  useEffect(() => {
    // If we already resolved either a local bundle or a remote URL, done.
    if (staticSource) {
      setDishSource(staticSource);
      return;
    }
    // Truly unknown dish — try async Pexels fetch as last resort
    (async () => {
      const url = await getDishImageUrlAsync(dishName);
      if (url) setDishSource({ uri: url });
    })();
  }, [dishName]);

  // ── Animations ──
  const cardY = useRef(new Animated.Value(20)).current;
  const cardOp = useRef(new Animated.Value(0)).current;
  const ingredientOps = useRef(ingredients.map(() => new Animated.Value(0))).current;
  const stepOps = useRef(steps.map(() => new Animated.Value(0))).current;

  useEffect(() => {
    // Card fade up
    Animated.parallel([
      Animated.timing(cardY, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }),
      Animated.timing(cardOp, {
        toValue: 1,
        duration: 400,
        useNativeDriver: true,
      }),
    ]).start();

    // Ingredient rows stagger
    ingredientOps.forEach((op, i) => {
      Animated.timing(op, {
        toValue: 1,
        duration: 300,
        delay: 400 + i * 40,
        useNativeDriver: true,
      }).start();
    });

    // Step rows stagger
    stepOps.forEach((op, i) => {
      Animated.timing(op, {
        toValue: 1,
        duration: 300,
        delay: 500 + i * 40,
        useNativeDriver: true,
      }).start();
    });
  }, []);

  // Dot filler string
  const dots = "·".repeat(80);

  return (
    <View style={s.root}>
      <TopoBackground />
      <ScrollView
        style={{ flex: 1 }}
        contentContainerStyle={{ paddingBottom: 120 }}
        showsVerticalScrollIndicator={false}
      >
        {/* ── TOP: Hero Image Zone ── */}
        <View style={s.heroZone}>
          {/* HD dish image (local bundle or cache) or gradient fallback */}
          {dishSource ? (
            <Image
              source={dishSource}
              style={s.heroImage}
              resizeMode="cover"
            />
          ) : (
            <>
              <View style={s.heroGradBase} />
              <View style={s.heroGradOverlay1} />
              <View style={s.heroGradOverlay2} />
              {[0, 1, 2, 3, 4].map((i) => (
                <View
                  key={i}
                  style={[
                    s.topoLine,
                    {
                      top: 40 + i * 45,
                      left: -30 + i * 15,
                      width: SCREEN_W * 0.7,
                      transform: [{ rotate: `${-8 + i * 3}deg` }],
                    },
                  ]}
                />
              ))}
            </>
          )}
          {/* Darkening gradient at bottom of image */}
          <LinearGradient
            colors={["transparent", "rgba(0,0,0,0.05)", "rgba(0,0,0,0.2)", "rgba(0,0,0,0.35)"]}
            locations={[0, 0.3, 0.7, 1]}
            style={s.heroDarkGrad}
          />
          {/* Sand fade — image dissolves into sand at the very bottom */}
          <LinearGradient
            colors={["transparent", "rgba(246,245,240,0.4)", "rgba(246,245,240,0.85)", "#F6F5F0"]}
            locations={[0, 0.3, 0.7, 1]}
            style={s.heroSandGrad}
          />

          {/* Back button */}
          <Pressable
            onPress={() => router.navigate("/(app)/meals")}
            style={s.backBtn}
            hitSlop={12}
          >
            <Text style={s.backIcon}>‹</Text>
          </Pressable>

          {/* Video button - top right */}
          <Pressable
            onPress={() =>
              openYouTube((params.name || "recipe") + " recipe easy")
            }
            style={s.videoBtn}
          >
            <View style={s.videoDot}>
              <View style={s.playTriangle} />
            </View>
          </Pressable>
        </View>

        {/* ── Floating Recipe Card ── */}
        <Animated.View
          style={[
            s.floatingCard,
            {
              opacity: cardOp,
              transform: [{ translateY: cardY }],
            },
          ]}
        >
          {/* Warm gradient card background */}
          <LinearGradient
            colors={["#D8D3C9", "#E9E5DC", "#F4F1EA", "#DFD9CF"]}
            locations={[0, 0.3, 0.65, 1]}
            start={{ x: 0, y: 0 }}
            end={{ x: 1, y: 1 }}
            style={StyleSheet.absoluteFillObject}
          />

          {/* Meal type badge */}
          <View style={s.mealBadge}>
            <Text style={s.mealBadgeText}>{mealType}</Text>
          </View>

          {/* Recipe name */}
          <Text style={s.recipeName}>{params.name || "Recipe"}</Text>

          {/* 4 Macro rings */}
          <View style={s.macroRow}>
            <MacroRing
              value={params.calories || "0"}
              label="CALORIES"
              fill="75"
            />
            <MacroRing
              value={`${params.protein || "0"}g`}
              label="PROTEIN"
              fill="50"
            />
            <MacroRing
              value={`${params.carbs || "0"}g`}
              label="CARBS"
              fill="75"
            />
            <MacroRing
              value={`${params.fat || "0"}g`}
              label="FAT"
              fill="50"
            />
          </View>
        </Animated.View>

        {/* ── MIDDLE: Ingredients ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>INGREDIENTS</Text>
              <View style={s.accentLine} />
            </View>
            <Text style={s.sectionCount}>{ingredients.length} items</Text>
          </View>

          {ingredients.map((ing, i) => (
            <Animated.View
              key={i}
              style={[s.ingRow, { opacity: ingredientOps[i] || 1 }]}
            >
              <Text style={s.ingName}>{ing.name}</Text>
              <Text style={s.ingDots} numberOfLines={1}>
                {dots}
              </Text>
              <Text style={s.ingAmount}>
                {ing.amount}
                {ing.unit ? ` ${ing.unit}` : ""}
              </Text>
            </Animated.View>
          ))}
        </View>

        {/* ── BOTTOM: Steps ── */}
        <View style={s.section}>
          <View style={s.sectionHeader}>
            <View>
              <Text style={s.sectionTitle}>STEPS</Text>
              <View style={s.accentLine} />
            </View>
            <Text style={s.sectionCount}>{steps.length} steps</Text>
          </View>

          {steps.map((step, i) => {
            const stepNum = String(i + 1).padStart(2, "0");
            const estMin = Math.max(2, Math.ceil(step.length / 40));
            return (
              <Animated.View
                key={i}
                style={[s.stepRow, { opacity: stepOps[i] || 1 }]}
              >
                {/* Step number */}
                <View style={s.stepNumWrap}>
                  <Text style={s.stepNum} numberOfLines={1}>{stepNum}</Text>
                </View>

                {/* Step text + time pill */}
                <View style={s.stepContent}>
                  <Text style={s.stepText}>{step}</Text>
                  <View style={s.timePill}>
                    <Text style={s.timePillText}>⏱ ~{estMin} min</Text>
                  </View>
                </View>
              </Animated.View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

// ── Styles ──
const s = StyleSheet.create({
  root: { flex: 1, backgroundColor: C.sand },

  // Hero image zone
  heroZone: {
    height: 320,
    width: "100%",
    overflow: "visible",
    position: "relative",
    backgroundColor: C.earth,
  },
  heroImage: {
    position: "absolute",
    top: 0,
    left: 0,
    right: 0,
    height: 320,
  },
  // Darkening gradient over bottom half of image
  heroDarkGrad: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 200,
  },
  // Sand fade at very bottom — image dissolves into sand
  heroSandGrad: {
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
    height: 100,
  },
  heroGradBase: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.earth,
  },
  heroGradOverlay1: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(142,142,122,0.12)",
    top: "50%",
  },
  heroGradOverlay2: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(237,235,229,0.06)",
    top: "75%",
  },
  topoLine: {
    position: "absolute",
    height: 1,
    backgroundColor: "rgba(246,245,240,0.06)",
    borderRadius: 1,
  },

  // Back button
  backBtn: {
    position: "absolute",
    top: 58,
    left: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: C.stone,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  backIcon: {
    color: C.earth,
    fontSize: 20,
    fontWeight: "600",
    marginTop: -1,
  },

  // Video button
  videoBtn: {
    position: "absolute",
    top: 58,
    right: 20,
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "rgba(52,211,153,0.15)",
    alignItems: "center",
    justifyContent: "center",
    zIndex: 10,
  },
  videoDot: {
    alignItems: "center",
    justifyContent: "center",
  },
  playTriangle: {
    width: 0,
    height: 0,
    borderLeftWidth: 8,
    borderTopWidth: 5,
    borderBottomWidth: 5,
    borderLeftColor: C.trail,
    borderTopColor: "transparent",
    borderBottomColor: "transparent",
    marginLeft: 2,
  },

  // Floating card — overlaps the hero image
  floatingCard: {
    marginTop: -44,
    marginHorizontal: 18,
    zIndex: 5,
    borderRadius: 22,
    padding: 22,
    overflow: "hidden",
    backgroundColor: "#E9E5DC",
    // Shadow
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 8 },
    shadowOpacity: 0.12,
    shadowRadius: 24,
    elevation: 12,
  },

  // Meal badge
  mealBadge: {
    alignSelf: "center",
    paddingHorizontal: 12,
    paddingVertical: 3,
    borderRadius: 10,
    backgroundColor: "rgba(45,42,36,0.06)",
    marginBottom: 10,
  },
  mealBadgeText: {
    fontSize: 9,
    fontWeight: "700",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: C.rock,
    textAlign: "center",
  },

  // Recipe name
  recipeName: {
    fontSize: 24,
    fontWeight: "800",
    color: C.earth,
    textAlign: "center",
    letterSpacing: -0.3,
    marginBottom: 20,
  },

  // Macro rings
  macroRow: {
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
  },
  macroCol: {
    alignItems: "center",
    gap: 6,
  },
  macroRingOuter: {
    width: 56,
    height: 56,
    alignItems: "center",
    justifyContent: "center",
  },
  macroRingTrack: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
    borderColor: "rgba(142,142,122,0.15)",
  },
  macroRingFill: {
    position: "absolute",
    width: 56,
    height: 56,
    borderRadius: 28,
    borderWidth: 4,
  },
  macroRingCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  macroValue: {
    fontSize: 13,
    fontWeight: "800",
    color: C.earth,
  },
  macroLabel: {
    fontSize: 7,
    fontWeight: "600",
    textTransform: "uppercase",
    letterSpacing: 0.5,
    color: C.rock,
  },

  // Sections
  section: {
    paddingTop: 28,
    paddingHorizontal: 24,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  sectionTitle: {
    fontSize: 11,
    fontWeight: "800",
    textTransform: "uppercase",
    letterSpacing: 2.5,
    color: C.earth,
  },
  accentLine: {
    width: 20,
    height: 2,
    backgroundColor: C.trail,
    opacity: 0.4,
    borderRadius: 1,
    marginTop: 6,
  },
  sectionCount: {
    fontSize: 10,
    color: C.rock,
    fontWeight: "500",
  },

  // Ingredient rows
  ingRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingVertical: 10,
  },
  ingName: {
    fontSize: 14,
    fontWeight: "500",
    color: C.earth,
  },
  ingDots: {
    flex: 1,
    fontSize: 12,
    color: C.rock,
    opacity: 0.2,
    marginHorizontal: 6,
    overflow: "hidden",
  },
  ingAmount: {
    fontSize: 13,
    fontWeight: "600",
    color: C.rock,
    minWidth: 50,
    textAlign: "right",
  },

  // Step rows
  stepRow: {
    flexDirection: "row",
    alignItems: "flex-start",
    paddingVertical: 14,
  },
  stepNumWrap: {
    width: 54,
    marginRight: 12,
    flexShrink: 0,
  },
  stepNum: {
    fontSize: 32,
    fontWeight: "800",
    color: "rgba(142,142,122,0.5)",
    letterSpacing: -1,
    lineHeight: 36,
  },
  stepContent: {
    flex: 1,
    paddingTop: 4,
  },
  stepText: {
    fontSize: 15,
    fontWeight: "400",
    color: C.earth,
    lineHeight: 15 * 1.7,
  },
  timePill: {
    alignSelf: "flex-start",
    marginTop: 8,
    paddingHorizontal: 10,
    paddingVertical: 4,
    borderRadius: 10,
    backgroundColor: "rgba(45,42,36,0.05)",
  },
  timePillText: {
    fontSize: 9,
    fontWeight: "600",
    color: C.rock,
  },
});
