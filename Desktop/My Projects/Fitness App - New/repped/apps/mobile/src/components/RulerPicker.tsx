import { View, Text, ScrollView, Pressable, NativeSyntheticEvent, NativeScrollEvent } from "react-native";
import { useRef, useState, useEffect, useCallback } from "react";

const TICK_W = 8;
const TICK_GAP = 0;
const TICK_STEP = TICK_W + TICK_GAP;

interface RulerPickerProps {
  label: string;
  min: number;
  max: number;
  initial: number;
  unit: string;
  altUnit?: string;
  altMin?: number;
  altMax?: number;
  altInitial?: number;
  convertToAlt?: (val: number) => number;
  convertFromAlt?: (val: number) => number;
  onValueChange: (value: number) => void;
}

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

export function RulerPicker({
  label, min, max, initial, unit,
  altUnit, altMin, altMax, altInitial,
  convertToAlt, convertFromAlt,
  onValueChange,
}: RulerPickerProps) {
  const [useAlt, setUseAlt] = useState(false);
  const [value, setValue] = useState(initial);
  const scrollRef = useRef<ScrollView>(null);
  const isScrolling = useRef(false);

  const activeMin = useAlt && altMin != null ? altMin : min;
  const activeMax = useAlt && altMax != null ? altMax : max;
  const activeUnit = useAlt && altUnit ? altUnit : unit;
  const totalTicks = activeMax - activeMin;

  // Scroll to a specific value
  const scrollToValue = useCallback((val: number) => {
    const idx = val - activeMin;
    scrollRef.current?.scrollTo({ x: idx * TICK_STEP, animated: false });
  }, [activeMin]);

  // Initial scroll
  useEffect(() => {
    const initVal = useAlt && altInitial != null ? altInitial : initial;
    setTimeout(() => scrollToValue(initVal), 50);
  }, [useAlt]);

  // Handle scroll end — snap to nearest tick
  const handleScrollEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TICK_STEP);
    const val = Math.max(activeMin, Math.min(activeMax, activeMin + idx));
    setValue(val);

    // Convert back to primary unit for the callback
    if (useAlt && convertFromAlt) {
      onValueChange(convertFromAlt(val));
    } else {
      onValueChange(val);
    }
  };

  // Handle live scroll — update display value
  const handleScroll = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const x = e.nativeEvent.contentOffset.x;
    const idx = Math.round(x / TICK_STEP);
    const val = Math.max(activeMin, Math.min(activeMax, activeMin + idx));
    setValue(val);
  };

  // Toggle unit
  const toggleUnit = (toAlt: boolean) => {
    if (toAlt === useAlt) return;
    setUseAlt(toAlt);
  };

  // Build tick marks
  const ticks: { value: number; type: "major" | "half" | "minor" }[] = [];
  for (let v = activeMin; v <= activeMax; v++) {
    if (v % 10 === 0) ticks.push({ value: v, type: "major" });
    else if (v % 5 === 0) ticks.push({ value: v, type: "half" });
    else ticks.push({ value: v, type: "minor" });
  }

  const tickHeight = { major: 24, half: 16, minor: 10 };
  const tickWidth = { major: 2, half: 1.5, minor: 1 };
  const tickOpacity = { major: 0.3, half: 0.2, minor: 0.12 };

  return (
    <View style={{ marginBottom: 16 }}>
      {/* Header: label + unit toggle */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 8 }}>
        <Text style={{ fontSize: 12, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.rock, textTransform: "uppercase", letterSpacing: 0.8 }}>
          {label}
        </Text>
        {altUnit && (
          <View style={{ flexDirection: "row", backgroundColor: C.stone, borderRadius: 100, padding: 2 }}>
            <Pressable onPress={() => toggleUnit(true)} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, backgroundColor: useAlt ? C.earth : "transparent" }}>
              <Text style={{ fontSize: 10, fontWeight: "700", color: useAlt ? C.bg : C.rock }}>{altUnit}</Text>
            </Pressable>
            <Pressable onPress={() => toggleUnit(false)} style={{ paddingHorizontal: 10, paddingVertical: 3, borderRadius: 100, backgroundColor: !useAlt ? C.earth : "transparent" }}>
              <Text style={{ fontSize: 10, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: !useAlt ? C.bg : C.rock }}>{unit}</Text>
            </Pressable>
          </View>
        )}
      </View>

      {/* Ruler card */}
      <View style={{ backgroundColor: C.stone, borderRadius: 14, paddingVertical: 10, overflow: "hidden" }}>
        {/* Big value display */}
        <Text style={{ textAlign: "center", fontSize: 26, fontFamily: "Quicksand_700Bold", fontWeight: "800", color: C.earth, letterSpacing: -0.5 }}>
          {value}<Text style={{ fontSize: 12, fontWeight: "600", color: C.rock }}> {activeUnit}</Text>
        </Text>

        {/* Ruler track */}
        <View style={{ height: 42, position: "relative", marginTop: 4 }}>
          {/* Center indicator */}
          <View style={{ position: "absolute", top: 0, left: "50%", marginLeft: -1, width: 2, height: 28, backgroundColor: C.earth, borderRadius: 1, zIndex: 3 }} />

          {/* Fade edges */}
          <View style={{ position: "absolute", top: 0, left: 0, width: 40, height: 42, zIndex: 2 }} pointerEvents="none">
            <View style={{ flex: 1, backgroundColor: C.stone, opacity: 0.9 }} />
          </View>
          <View style={{ position: "absolute", top: 0, right: 0, width: 40, height: 42, zIndex: 2 }} pointerEvents="none">
            <View style={{ flex: 1, backgroundColor: C.stone, opacity: 0.9 }} />
          </View>

          <ScrollView
            ref={scrollRef}
            horizontal
            showsHorizontalScrollIndicator={false}
            snapToInterval={TICK_STEP}
            decelerationRate="fast"
            onMomentumScrollEnd={handleScrollEnd}
            onScroll={handleScroll}
            scrollEventThrottle={16}
            contentContainerStyle={{ paddingHorizontal: "50%" }}
          >
            {ticks.map((tick, i) => (
              <View key={i} style={{ width: TICK_W, alignItems: "center", justifyContent: "flex-end", height: 38 }}>
                <View style={{
                  width: tickWidth[tick.type],
                  height: tickHeight[tick.type],
                  backgroundColor: `rgba(45,42,36,${tickOpacity[tick.type]})`,
                  borderRadius: 1,
                }} />
                {(tick.type === "major" || tick.type === "half") && (
                  <Text style={{ fontSize: 7, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.rock, marginTop: 1 }}>
                    {tick.value}
                  </Text>
                )}
              </View>
            ))}
          </ScrollView>
        </View>
      </View>
    </View>
  );
}
