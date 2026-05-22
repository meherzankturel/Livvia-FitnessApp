import { useEffect, useMemo, useRef, useState } from "react";
import {
  Modal,
  View,
  Text,
  Pressable,
  ScrollView,
  NativeSyntheticEvent,
  NativeScrollEvent,
} from "react-native";
import { MIN_AGE, MAX_AGE } from "@repped/shared";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
};

const ROW_H = 40;
const VISIBLE_ROWS = 5;
const PICKER_H = ROW_H * VISIBLE_ROWS;

const MONTHS = [
  "Jan", "Feb", "Mar", "Apr", "May", "Jun",
  "Jul", "Aug", "Sep", "Oct", "Nov", "Dec",
];

function daysInMonth(year: number, monthIndex: number): number {
  return new Date(year, monthIndex + 1, 0).getDate();
}

interface WheelProps {
  values: (string | number)[];
  selectedIndex: number;
  onChange: (index: number) => void;
  width: number;
}

function Wheel({ values, selectedIndex, onChange, width }: WheelProps) {
  const scrollRef = useRef<ScrollView>(null);
  const lastIndex = useRef(selectedIndex);

  useEffect(() => {
    if (scrollRef.current) {
      scrollRef.current.scrollTo({ y: selectedIndex * ROW_H, animated: false });
    }
  }, []);

  useEffect(() => {
    if (selectedIndex !== lastIndex.current && scrollRef.current) {
      scrollRef.current.scrollTo({ y: selectedIndex * ROW_H, animated: true });
      lastIndex.current = selectedIndex;
    }
  }, [selectedIndex]);

  const handleMomentumEnd = (e: NativeSyntheticEvent<NativeScrollEvent>) => {
    const idx = Math.round(e.nativeEvent.contentOffset.y / ROW_H);
    const clamped = Math.max(0, Math.min(values.length - 1, idx));
    if (clamped !== lastIndex.current) {
      lastIndex.current = clamped;
      onChange(clamped);
    }
  };

  return (
    <View style={{ width, height: PICKER_H }}>
      <ScrollView
        ref={scrollRef}
        showsVerticalScrollIndicator={false}
        snapToInterval={ROW_H}
        decelerationRate="fast"
        onMomentumScrollEnd={handleMomentumEnd}
        contentContainerStyle={{ paddingVertical: ROW_H * 2 }}
      >
        {values.map((v, i) => {
          const isSelected = i === selectedIndex;
          return (
            <View
              key={i}
              style={{
                height: ROW_H,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              <Text
                style={{
                  fontSize: isSelected ? 18 : 16,
                  fontWeight: isSelected ? "800" : "500",
                  color: isSelected ? C.earth : C.rock,
                }}
              >
                {v}
              </Text>
            </View>
          );
        })}
      </ScrollView>
    </View>
  );
}

interface DOBPickerProps {
  visible: boolean;
  value: string | null;
  onCancel: () => void;
  onConfirm: (iso: string) => void;
}

export function DOBPicker({ visible, value, onCancel, onConfirm }: DOBPickerProps) {
  const now = new Date();
  const minYear = now.getFullYear() - MAX_AGE;
  const maxYear = now.getFullYear() - MIN_AGE;

  const years = useMemo(() => {
    const arr: number[] = [];
    for (let y = maxYear; y >= minYear; y--) arr.push(y);
    return arr;
  }, [minYear, maxYear]);

  // Defaults: 25 years ago, June 15. Parse `value` if present.
  const parseInitial = () => {
    if (value && /^\d{4}-\d{2}-\d{2}$/.test(value)) {
      const [y, m, d] = value.split("-").map((s) => parseInt(s, 10));
      return { y, m: m - 1, d };
    }
    return { y: now.getFullYear() - 25, m: 5, d: 15 };
  };

  const [{ y, m, d }, setParts] = useState(parseInitial);

  useEffect(() => {
    if (visible) setParts(parseInitial());
  }, [visible, value]);

  // Clamp day if month/year change makes it invalid.
  useEffect(() => {
    const max = daysInMonth(y, m);
    if (d > max) setParts((p) => ({ ...p, d: max }));
  }, [y, m]);

  const monthIdx = m;
  const yearIdx = years.indexOf(y);
  const dayCount = daysInMonth(y, m);
  const days = useMemo(() => Array.from({ length: dayCount }, (_, i) => i + 1), [dayCount]);

  const handleConfirm = () => {
    const iso = `${y}-${String(m + 1).padStart(2, "0")}-${String(d).padStart(2, "0")}`;
    onConfirm(iso);
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "flex-end" }}>
        <View
          style={{
            backgroundColor: C.bg,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 8,
            paddingBottom: 32,
          }}
        >
          {/* Handle */}
          <View
            style={{
              alignSelf: "center",
              width: 36,
              height: 4,
              borderRadius: 2,
              backgroundColor: C.stone,
              marginBottom: 12,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              paddingHorizontal: 20,
              paddingBottom: 16,
            }}
          >
            <Pressable onPress={onCancel} hitSlop={12}>
              <Text style={{ fontSize: 15, color: C.rock, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>Cancel</Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.earth }}>
              Date of Birth
            </Text>
            <Pressable onPress={handleConfirm} hitSlop={12}>
              <Text style={{ fontSize: 15, color: C.earth, fontWeight: "800" }}>Done</Text>
            </Pressable>
          </View>

          {/* Wheels with center selection band */}
          <View style={{ position: "relative", paddingHorizontal: 20 }}>
            <View
              pointerEvents="none"
              style={{
                position: "absolute",
                left: 20,
                right: 20,
                top: ROW_H * 2,
                height: ROW_H,
                backgroundColor: C.stone,
                borderRadius: 12,
              }}
            />
            <View style={{ flexDirection: "row", justifyContent: "space-between" }}>
              <Wheel
                values={MONTHS}
                selectedIndex={monthIdx}
                onChange={(i) => setParts((p) => ({ ...p, m: i }))}
                width={100}
              />
              <Wheel
                values={days}
                selectedIndex={d - 1}
                onChange={(i) => setParts((p) => ({ ...p, d: i + 1 }))}
                width={70}
              />
              <Wheel
                values={years}
                selectedIndex={Math.max(0, yearIdx)}
                onChange={(i) => setParts((p) => ({ ...p, y: years[i] }))}
                width={100}
              />
            </View>
          </View>
        </View>
      </View>
    </Modal>
  );
}
