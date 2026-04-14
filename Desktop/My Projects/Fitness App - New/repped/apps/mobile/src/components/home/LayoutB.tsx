/**
 * Layout B: Livvia Home — inspired by Kinetic's structure.
 * Light theme. Bold workout title with accent bar. Week dates. Stat columns on exercises.
 */
import { View, Text, Pressable } from "react-native";
import tw from "../../lib/tw";

interface Props {
  greeting: string;
  date: string;
  focus: string;
  exerciseCount: number;
  dayOfWeek: number;
  completionPct: number;
  streak: number;
  hasWellnessLog: boolean;
  onStartWorkout: () => void;
  onSkipDay: () => void;
  onWellnessCheck: () => void;
}

const WEEK = ["M", "T", "W", "T", "F", "S", "S"];

function getWeekDates(): number[] {
  const now = new Date();
  const dayIdx = now.getDay() === 0 ? 6 : now.getDay() - 1; // Monday = 0
  const monday = new Date(now);
  monday.setDate(now.getDate() - dayIdx);
  return Array.from({ length: 7 }, (_, i) => {
    const d = new Date(monday);
    d.setDate(monday.getDate() + i);
    return d.getDate();
  });
}

export default function LayoutB({
  greeting, date, focus, exerciseCount, dayOfWeek,
  completionPct, streak, hasWellnessLog,
  onStartWorkout, onSkipDay, onWellnessCheck,
}: Props) {
  const weekDates = getWeekDates();
  const now = new Date();
  const monthName = now.toLocaleDateString("en-US", { month: "long" }).toUpperCase();
  const weekNum = String(Math.ceil(now.getDate() / 7)).padStart(2, "0");

  return (
    <View>
      {/* ─── Weekly Momentum ─── */}
      <Text style={{
        color: "#AEAEB2", fontSize: 10, fontWeight: "700",
        letterSpacing: 2, textTransform: "uppercase", marginBottom: 6,
      }}>
        Weekly Momentum
      </Text>
      <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "flex-end", marginBottom: 20 }}>
        <Text style={{ color: "#1C1C1E", fontSize: 26, fontWeight: "800", letterSpacing: -0.5 }}>
          {monthName} Week {weekNum}
        </Text>
        <Text style={{ color: "#6366F1", fontSize: 22, fontWeight: "800" }}>{Math.round(completionPct)}%</Text>
      </View>

      {/* ─── Week Row with Dates ─── */}
      <View style={{ flexDirection: "row", justifyContent: "space-between", marginBottom: 32, paddingHorizontal: 2 }}>
        {WEEK.map((day, i) => {
          const done = i < dayOfWeek - 1;
          const today = i === dayOfWeek - 1;
          const future = i > dayOfWeek - 1;
          return (
            <View key={i} style={{ alignItems: "center" }}>
              <Text style={{ color: "#AEAEB2", fontSize: 11, fontWeight: "500", marginBottom: 6 }}>{day}</Text>
              <View style={{
                width: 40, height: 40, borderRadius: 12,
                alignItems: "center", justifyContent: "center",
                backgroundColor: today ? "#6366F1" : done ? "transparent" : "#F2F2F7",
                borderWidth: done ? 2 : 0,
                borderColor: done ? "#6366F1" : "transparent",
              }}>
                {done ? (
                  <Text style={{ color: "#6366F1", fontSize: 14, fontWeight: "700" }}>✓</Text>
                ) : (
                  <Text style={{
                    color: today ? "#fff" : future ? "#C7C7CC" : "#1C1C1E",
                    fontSize: 14, fontWeight: today ? "700" : "500",
                  }}>
                    {weekDates[i]}
                  </Text>
                )}
              </View>
            </View>
          );
        })}
      </View>

      {/* ─── Workout Title with Accent Bar ─── */}
      <View style={{ flexDirection: "row", marginBottom: 24 }}>
        <View style={{ width: 4, backgroundColor: "#6366F1", borderRadius: 2, marginRight: 14 }} />
        <View style={{ flex: 1 }}>
          <Text style={{
            color: "#1C1C1E",
            fontSize: 36,
            fontWeight: "900",
            letterSpacing: -1,
            textTransform: "uppercase",
            lineHeight: 40,
          }}>
            {focus}
          </Text>
          <Text style={{ color: "#8E8E93", fontSize: 13, marginTop: 6 }}>
            {exerciseCount} exercises{streak > 0 ? `  ·  ${streak}w streak` : ""}
          </Text>
        </View>
      </View>

      {/* ─── Secondary actions — proper buttons ─── */}
      <View style={{ flexDirection: "row", gap: 10, marginBottom: 12 }}>
        {!hasWellnessLog && (
          <Pressable
            onPress={onWellnessCheck}
            style={{
              flex: 1, backgroundColor: "#F2F2F7",
              borderRadius: 12, paddingVertical: 14, alignItems: "center",
            }}
          >
            <Text style={{ color: "#8E8E93", fontSize: 14, fontWeight: "500" }}>Wellness Check</Text>
          </Pressable>
        )}
        <Pressable
          onPress={onSkipDay}
          style={{
            flex: 1, backgroundColor: "#F2F2F7",
            borderRadius: 12, paddingVertical: 14, alignItems: "center",
          }}
        >
          <Text style={{ color: "#AEAEB2", fontSize: 14, fontWeight: "500" }}>Skip Today</Text>
        </Pressable>
      </View>
    </View>
  );
}
