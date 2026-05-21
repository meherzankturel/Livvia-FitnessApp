import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, ScrollView } from "react-native";

// ─── Helper functions (exported for use in screens) ───────────────────────────

/** Returns a human-readable date range string for the current week, e.g. "Apr 14 – Apr 20" */
export function formatHeaderDate(): string {
  const { start, end } = getWeekBounds();
  const opts: Intl.DateTimeFormatOptions = { month: "short", day: "numeric" };
  return `${start.toLocaleDateString("en-US", opts)} – ${end.toLocaleDateString("en-US", opts)}`;
}

/** Returns 0=Mon … 6=Sun index for today */
export function getTodayIndex(): number {
  const day = new Date().getDay(); // 0=Sun, 1=Mon, …, 6=Sat
  return day === 0 ? 6 : day - 1;
}

/** Returns the Monday and Sunday bounding this week */
export function getWeekBounds(): { start: Date; end: Date } {
  const today = new Date();
  const day = today.getDay(); // 0=Sun
  const diff = day === 0 ? -6 : 1 - day; // days back to Monday
  const start = new Date(today);
  start.setDate(today.getDate() + diff);
  start.setHours(0, 0, 0, 0);
  const end = new Date(start);
  end.setDate(start.getDate() + 6);
  end.setHours(23, 59, 59, 999);
  return { start, end };
}

// ─── Constants ─────────────────────────────────────────────────────────────────

const DAY_LABELS = ["MON", "TUE", "WED", "THU", "FRI", "SAT", "SUN"];

// ─── Component ─────────────────────────────────────────────────────────────────

interface Props {
  completedDays: Set<number>; // 0=Mon … 6=Sun
  selectedDay: number;
  onSelectDay: (day: number) => void;
}

export default function DayStrip({ completedDays, selectedDay, onSelectDay }: Props) {
  const todayIdx = getTodayIndex();
  const { start } = getWeekBounds();

  return (
    <ScrollView
      horizontal
      showsHorizontalScrollIndicator={false}
      contentContainerStyle={styles.row}
    >
      {DAY_LABELS.map((label, idx) => {
        const isSelected = idx === selectedDay;
        const isCompleted = completedDays.has(idx);
        const isFuture = idx > todayIdx;

        // Compute the date number for this day in the current week
        const date = new Date(start);
        date.setDate(start.getDate() + idx);
        const dateNum = date.getDate();

        return (
          <TouchableOpacity
            key={label}
            onPress={() => onSelectDay(idx)}
            style={[
              styles.pill,
              isSelected && styles.pillSelected,
              !isSelected && isCompleted && styles.pillCompleted,
              isFuture && !isSelected && styles.pillFuture,
            ]}
            activeOpacity={0.7}
          >
            <Text
              style={[
                styles.dayLabel,
                isSelected && styles.dayLabelSelected,
                !isSelected && isFuture && styles.textFuture,
              ]}
            >
              {label}
            </Text>
            <Text
              style={[
                styles.dateNumber,
                isSelected && styles.dateNumberSelected,
                !isSelected && isFuture && styles.textFuture,
              ]}
            >
              {dateNum}
            </Text>
          </TouchableOpacity>
        );
      })}
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 8,
    paddingHorizontal: 16,
    paddingVertical: 4,
  },
  pill: {
    width: 52,
    height: 70,
    borderRadius: 16,
    backgroundColor: "#fff",
    borderWidth: 1.5,
    borderColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 8,
    gap: 2,
  },
  pillSelected: {
    backgroundColor: "#1a1a1a",
    borderColor: "#1a1a1a",
  },
  pillCompleted: {
    borderColor: "#2DB877",
  },
  pillFuture: {
    opacity: 0.45,
  },
  dayLabel: {
    fontSize: 10,
    fontWeight: "600",
    color: "#888",
    letterSpacing: 0.5,
  },
  dayLabelSelected: {
    color: "rgba(255,255,255,0.7)",
  },
  dateNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  dateNumberSelected: {
    color: "#fff",
  },
  textFuture: {
    color: "#999",
  },
});
