/**
 * Meal history — read-only review of past nutrition logs.
 *
 * Layout:
 *   - SectionList grouped by month (e.g. "MAY 2026")
 *   - Sticky month headers with on-track count per month
 *   - Day rows render compactly; tap-to-expand shows individual meals
 *   - Cursor-pagination on date column — onEndReached fetches older logs
 *   - Floating ↑ scroll-to-top button after scrolling past the first screen
 *
 * Status badges per day vs daily calorie target (TDEE × goal factor):
 *   - on_track  — total within ±10% of target
 *   - under     — < 90% of target
 *   - over      — > 110% of target
 */

import { View, Text, Pressable, SectionList, ActivityIndicator, Animated, type NativeSyntheticEvent, type NativeScrollEvent } from "react-native";
import { useEffect, useState, useCallback, useMemo, useRef } from "react";
import { router } from "expo-router";
import { useAuthStore, GOAL_CALORIE_FRACTION } from "@repped/shared";
import type { Goal } from "@repped/shared";
import { supabase } from "../../src/lib/supabase";
import { BackButton } from "../../src/components/BackButton";
import { TopoBackground } from "../../src/components/terrain";

const C = {
  earth: "#2D2A24",
  sand: "#F6F5F0",
  trail: "#34D399",
  rock: "#8E8E7A",
  stone: "#EDEBE5",
  amber: "#F59E0B",
  red: "#EF4444",
};

const PAGE_SIZE = 200;

type MealLog = {
  meal_name: string;
  meal_type: "breakfast" | "lunch" | "dinner" | "snack";
  calories: number;
  protein_g: number;
  carbs_g: number;
  fat_g: number;
  date: string;
  logged_at: string;
};

type DayBucket = {
  date: string;
  totalCalories: number;
  totalProtein: number;
  totalCarbs: number;
  totalFat: number;
  meals: MealLog[];
};

type Status = "on_track" | "under" | "over";

function dayStatus(totalKcal: number, target: number): Status {
  if (target <= 0) return "on_track";
  const pct = totalKcal / target;
  if (pct < 0.9) return "under";
  if (pct > 1.1) return "over";
  return "on_track";
}

function statusVisual(s: Status): { color: string; label: string; bg: string } {
  switch (s) {
    case "on_track": return { color: "#0E8757",        label: "✓ On track", bg: "rgba(52,211,153,0.12)" };
    case "under":    return { color: "#B45309",        label: "⚠ Under",     bg: "rgba(245,158,11,0.12)" };
    case "over":     return { color: "#B91C1C",        label: "⚠ Over",      bg: "rgba(239,68,68,0.12)" };
  }
}

function formatDayHeader(dateStr: string): string {
  const d = new Date(dateStr + "T00:00:00");
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const yesterday = new Date(today);
  yesterday.setDate(today.getDate() - 1);

  if (d.toDateString() === today.toDateString()) return "Today";
  if (d.toDateString() === yesterday.toDateString()) return "Yesterday";
  return d.toLocaleDateString("en-US", { weekday: "short", month: "short", day: "numeric" });
}

function mealTypeLabel(t: MealLog["meal_type"]): string {
  return t.charAt(0).toUpperCase() + t.slice(1);
}

export default function MealHistory() {
  const session = useAuthStore((s) => s.session);

  // Profile-derived daily calorie target
  const [target, setTarget] = useState<number>(0);

  // Paged log buckets
  const [buckets, setBuckets] = useState<DayBucket[]>([]);
  const [cursorDate, setCursorDate] = useState<string | null>(null);  // oldest date seen so far
  const [hasMore, setHasMore] = useState(true);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [expandedDates, setExpandedDates] = useState<Set<string>>(new Set());

  // Scroll-to-top button — fades in after scrolling past the first screen
  const listRef = useRef<SectionList<DayBucket>>(null);
  const scrollTopOpacity = useRef(new Animated.Value(0)).current;
  const scrollTopVisibleRef = useRef(false);

  // ── Initial load: profile + first page ────────────────────────────────────
  useEffect(() => {
    if (!session?.user?.id) return;
    (async () => {
      // Profile for target
      const { data: profile } = await (supabase
        .from("profiles")
        .select("tdee, goal")
        .eq("id", session.user.id)
        .single() as any);
      if (profile) {
        const tdee = (profile as any).tdee || 0;
        const goal = ((profile as any).goal as Goal) || "maintain";
        const factor = 1 + (GOAL_CALORIE_FRACTION[goal] ?? 0);
        setTarget(Math.round(tdee * factor));
      }
      await loadMore(true);
      setLoading(false);
    })();
  }, [session?.user?.id]);

  const loadMore = useCallback(async (initial = false) => {
    if (!session?.user?.id) return;
    if (!initial && (loadingMore || !hasMore)) return;
    setLoadingMore(true);
    try {
      let q = supabase
        .from("meal_logs")
        .select("meal_name, meal_type, calories, protein_g, carbs_g, fat_g, date, logged_at")
        .eq("user_id", session.user.id)
        .order("date", { ascending: false })
        .order("logged_at", { ascending: false })
        .limit(PAGE_SIZE);
      if (!initial && cursorDate) {
        // Cursor: fetch strictly older than the oldest date in current buckets
        q = q.lt("date", cursorDate);
      }
      const { data } = await (q as any);
      const rows = (data as MealLog[] | null) || [];
      if (rows.length === 0) {
        setHasMore(false);
        return;
      }
      // Group into day buckets
      const map = new Map<string, DayBucket>();
      // Seed with existing buckets so additional rows can merge if needed
      if (!initial) {
        for (const b of buckets) map.set(b.date, { ...b, meals: [...b.meals] });
      }
      for (const r of rows) {
        const key = r.date;
        let bucket = map.get(key);
        if (!bucket) {
          bucket = {
            date: key,
            totalCalories: 0,
            totalProtein: 0,
            totalCarbs: 0,
            totalFat: 0,
            meals: [],
          };
          map.set(key, bucket);
        }
        bucket.meals.push(r);
        bucket.totalCalories += r.calories || 0;
        bucket.totalProtein += r.protein_g || 0;
        bucket.totalCarbs += r.carbs_g || 0;
        bucket.totalFat += r.fat_g || 0;
      }
      // Sort buckets desc by date
      const sorted = Array.from(map.values()).sort((a, b) => (a.date < b.date ? 1 : -1));
      // New cursor = the oldest date in the latest batch (so next call fetches strictly older)
      const newCursor = rows[rows.length - 1].date;
      setCursorDate(newCursor);
      setBuckets(sorted);
      if (rows.length < PAGE_SIZE) setHasMore(false);
    } finally {
      setLoadingMore(false);
    }
  }, [session?.user?.id, cursorDate, hasMore, loadingMore, buckets]);

  const toggleExpand = (date: string) => {
    setExpandedDates((prev) => {
      const next = new Set(prev);
      if (next.has(date)) next.delete(date);
      else next.add(date);
      return next;
    });
  };

  const renderDayRow = useCallback(({ item }: { item: DayBucket }) => {
    const status = dayStatus(item.totalCalories, target);
    const vis = statusVisual(status);
    const expanded = expandedDates.has(item.date);
    return (
      <View style={{ marginHorizontal: 24, marginBottom: 12, backgroundColor: "#FFFFFF", borderRadius: 18, borderWidth: 1, borderColor: "rgba(0,0,0,0.05)", overflow: "hidden" }}>
        <Pressable
          onPress={() => toggleExpand(item.date)}
          style={{ padding: 16 }}
        >
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
            <Text style={{ fontSize: 14, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth }}>
              {formatDayHeader(item.date)}
            </Text>
            <View style={{ backgroundColor: vis.bg, paddingHorizontal: 10, paddingVertical: 4, borderRadius: 100 }}>
              <Text style={{ fontSize: 11, fontWeight: "700", color: vis.color }}>{vis.label}</Text>
            </View>
          </View>
          <View style={{ flexDirection: "row", alignItems: "baseline", gap: 6, marginBottom: 6 }}>
            <Text style={{ fontSize: 22, fontFamily: "Quicksand_700Bold", fontWeight: "800", color: C.earth }}>
              {item.totalCalories.toLocaleString()}
            </Text>
            <Text style={{ fontSize: 12, color: C.rock, fontWeight: "600" }}>
              {target > 0 ? `/ ${target.toLocaleString()} cal` : "cal"}
            </Text>
          </View>
          <View style={{ flexDirection: "row", gap: 14 }}>
            <Text style={{ fontSize: 12, color: C.rock }}>
              <Text style={{ fontFamily: "Quicksand_700Bold", fontWeight: "700", color: "#EF4444" }}>{item.totalProtein}g</Text> P
            </Text>
            <Text style={{ fontSize: 12, color: C.rock }}>
              <Text style={{ fontWeight: "700", color: "#F59E0B" }}>{item.totalCarbs}g</Text> C
            </Text>
            <Text style={{ fontSize: 12, color: C.rock }}>
              <Text style={{ fontWeight: "700", color: "#6366F1" }}>{item.totalFat}g</Text> F
            </Text>
            <Text style={{ fontSize: 11, color: C.rock, marginLeft: "auto" }}>
              {item.meals.length} meal{item.meals.length === 1 ? "" : "s"} {expanded ? "▴" : "▾"}
            </Text>
          </View>
        </Pressable>
        {expanded && (
          <View style={{ borderTopWidth: 1, borderTopColor: "rgba(0,0,0,0.06)", paddingHorizontal: 16, paddingTop: 12, paddingBottom: 8 }}>
            {item.meals.map((m, i) => (
              <View key={`${m.meal_name}-${m.logged_at}-${i}`} style={{ marginBottom: 10 }}>
                <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "baseline", marginBottom: 2 }}>
                  <Text style={{ fontSize: 11, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.rock, textTransform: "uppercase", letterSpacing: 0.6 }}>
                    {mealTypeLabel(m.meal_type)}
                  </Text>
                  <Text style={{ fontSize: 12, fontWeight: "700", color: C.earth }}>{m.calories} cal</Text>
                </View>
                <Text style={{ fontSize: 13, color: C.earth, marginBottom: 2 }}>{m.meal_name}</Text>
                <Text style={{ fontSize: 11, color: C.rock }}>
                  {m.protein_g}P · {m.carbs_g}C · {m.fat_g}F
                </Text>
              </View>
            ))}
          </View>
        )}
      </View>
    );
  }, [target, expandedDates]);

  const listFooter = useMemo(() => {
    if (loadingMore) {
      return (
        <View style={{ paddingVertical: 16, alignItems: "center" }}>
          <ActivityIndicator color={C.earth} />
        </View>
      );
    }
    if (!hasMore && buckets.length > 0) {
      return (
        <Text style={{ textAlign: "center", color: C.rock, fontSize: 12, paddingVertical: 24 }}>
          That's all the history we have for you.
        </Text>
      );
    }
    return <View style={{ height: 24 }} />;
  }, [loadingMore, hasMore, buckets.length]);

  // Group day buckets into month sections for the SectionList — order
  // preserved (newest month first) because buckets is already sorted desc.
  const sections = useMemo(() => {
    const order: string[] = [];
    const map = new Map<string, DayBucket[]>();
    for (const b of buckets) {
      const dt = new Date(b.date + "T00:00:00");
      const key = dt.toLocaleDateString("en-US", { month: "long", year: "numeric" }).toUpperCase();
      if (!map.has(key)) {
        map.set(key, []);
        order.push(key);
      }
      map.get(key)!.push(b);
    }
    return order.map((title) => ({ title, data: map.get(title)! }));
  }, [buckets]);

  const renderSectionHeader = useCallback((info: any) => {
    const section = info.section as { title: string; data: DayBucket[] };
    const onTrack = section.data.filter((d) => dayStatus(d.totalCalories, target) === "on_track").length;
    return (
      <View style={{
        backgroundColor: C.sand,
        paddingHorizontal: 24,
        paddingTop: 14,
        paddingBottom: 8,
        flexDirection: "row",
        justifyContent: "space-between",
        alignItems: "center",
        borderBottomWidth: 0.5,
        borderBottomColor: "rgba(45,42,36,0.08)",
      }}>
        <Text style={{ fontSize: 11, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth, letterSpacing: 1.2 }}>
          {section.title}
        </Text>
        <Text style={{ fontSize: 11, color: C.rock, fontWeight: "500" }}>
          <Text style={{ color: C.earth, fontWeight: "700" }}>{onTrack}</Text> on track of {section.data.length} days
        </Text>
      </View>
    );
  }, [target]);

  const handleScroll = useCallback((e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const y = e.nativeEvent.contentOffset.y;
    const shouldShow = y > 240;
    if (shouldShow !== scrollTopVisibleRef.current) {
      scrollTopVisibleRef.current = shouldShow;
      Animated.timing(scrollTopOpacity, {
        toValue: shouldShow ? 1 : 0,
        duration: 200,
        useNativeDriver: true,
      }).start();
    }
  }, [scrollTopOpacity]);

  const scrollToTop = useCallback(() => {
    if (sections.length > 0) {
      listRef.current?.scrollToLocation({ sectionIndex: 0, itemIndex: 0, animated: true, viewPosition: 0 });
    }
  }, [sections.length]);

  return (
    <View style={{ flex: 1, backgroundColor: C.sand }}>
      <TopoBackground />
      {/* Header */}
      <View style={{ paddingTop: 56, paddingBottom: 8, paddingHorizontal: 24, flexDirection: "row", alignItems: "center", gap: 12 }}>
        <BackButton onPress={() => router.replace("/(app)/progress" as any)} />
        <Text style={{ fontSize: 22, fontFamily: "Quicksand_700Bold", fontWeight: "800", color: C.earth }}>Nutrition History</Text>
      </View>

      {loading ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center" }}>
          <ActivityIndicator color={C.earth} />
        </View>
      ) : buckets.length === 0 ? (
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingHorizontal: 32 }}>
          <Text style={{ fontSize: 48, marginBottom: 12 }}>🍽️</Text>
          <Text style={{ fontSize: 16, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth, marginBottom: 6, textAlign: "center" }}>
            No logged meals yet
          </Text>
          <Text style={{ fontSize: 13, color: C.rock, textAlign: "center", lineHeight: 18 }}>
            Tap "Log" on a meal in the Meals tab to start tracking your intake.
          </Text>
        </View>
      ) : (
        <>
          <SectionList
            ref={listRef}
            sections={sections}
            keyExtractor={(item) => item.date}
            renderItem={renderDayRow}
            renderSectionHeader={renderSectionHeader}
            stickySectionHeadersEnabled
            onEndReached={() => loadMore()}
            onEndReachedThreshold={0.4}
            ListFooterComponent={listFooter}
            contentContainerStyle={{ paddingBottom: 32 }}
            showsVerticalScrollIndicator={false}
            onScroll={handleScroll}
            scrollEventThrottle={64}
            // Day rows have variable expanded height — sticky header math
            // can stutter without this hint. Recovery from layout errors.
            onScrollToIndexFailed={(info) => {
              setTimeout(() => {
                listRef.current?.scrollToLocation({
                  sectionIndex: 0,
                  itemIndex: Math.min(info.highestMeasuredFrameIndex, info.index),
                  animated: true,
                  viewPosition: 0,
                });
              }, 100);
            }}
          />
          {/* Floating scroll-to-top button — fades in after scroll */}
          <Animated.View
            pointerEvents={scrollTopVisibleRef.current ? "auto" : "none"}
            style={{
              position: "absolute",
              right: 24,
              bottom: 24,
              opacity: scrollTopOpacity,
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 6 },
              shadowOpacity: 0.25,
              shadowRadius: 12,
              elevation: 6,
            }}
          >
            <Pressable
              onPress={scrollToTop}
              style={{
                width: 44,
                height: 44,
                borderRadius: 22,
                backgroundColor: C.earth,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text style={{ color: C.sand, fontSize: 18, fontFamily: "Quicksand_700Bold", fontWeight: "700" }}>↑</Text>
            </Pressable>
          </Animated.View>
        </>
      )}
    </View>
  );
}
