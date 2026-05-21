import React from "react";
import { View, Text, StyleSheet, Pressable } from "react-native";
import ProgressRing from "./ProgressRing";

interface Props {
  calories: number;
  caloriesGoal: number;
  protein: number;
  proteinGoal: number;
  carbs: number;
  carbsGoal: number;
  fat: number;
  fatGoal: number;
  /** Tap handler for the "History ›" link. When omitted, the link still renders but does nothing. */
  onHistoryPress?: () => void;
}

interface MacroRowProps {
  label: string;
  value: number;
  goal: number;
  color: string;
}

function MacroRow({ label, value, goal, color }: MacroRowProps) {
  const progress = goal > 0 ? Math.min(value / goal, 1) : 0;
  return (
    <View style={styles.macroRow}>
      <View style={styles.macroLabelRow}>
        <Text style={styles.macroLabel}>{label}</Text>
        <Text style={styles.macroValue}>
          {value}g
          <Text style={styles.macroGoal}> / {goal}g</Text>
        </Text>
      </View>
      <View style={styles.barTrack}>
        <View style={[styles.barFill, { width: `${progress * 100}%`, backgroundColor: color }]} />
      </View>
    </View>
  );
}

export default function NutritionCard({
  calories,
  caloriesGoal,
  protein,
  proteinGoal,
  carbs,
  carbsGoal,
  fat,
  fatGoal,
  onHistoryPress,
}: Props) {
  const calProgress = caloriesGoal > 0 ? Math.min(calories / caloriesGoal, 1) : 0;

  return (
    <View style={styles.card}>
      <View style={styles.titleRow}>
        <View style={styles.titleLeft}>
          <Text style={styles.titleEmoji}>🍴</Text>
          <Text style={styles.title}>Nutrition</Text>
        </View>
        <Pressable onPress={onHistoryPress} hitSlop={8}>
          <Text style={styles.viewDetails}>History ›</Text>
        </Pressable>
      </View>

      <View style={styles.body}>
        {/* Left: calories ring */}
        <View style={styles.ringSection}>
          <ProgressRing size={108} strokeWidth={6} progress={calProgress} color="#2DB877" trackColor="#E2E2DA">
            <View style={styles.ringCenter}>
              <Text style={styles.calNumber}>{calories.toLocaleString()}</Text>
              <Text style={styles.calGoal}>/ {caloriesGoal.toLocaleString()} kcal</Text>
            </View>
          </ProgressRing>
        </View>

        {/* Right: macro bars */}
        <View style={styles.macrosSection}>
          <MacroRow label="Protein" value={protein} goal={proteinGoal} color="#F4A933" />
          <MacroRow label="Carbs" value={carbs} goal={carbsGoal} color="#6366F1" />
          <MacroRow label="Fat" value={fat} goal={fatGoal} color="#E25B5B" />
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 18,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  titleRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: 16,
  },
  titleLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
  },
  titleEmoji: {
    fontSize: 16,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: "#1a1a1a",
  },
  viewDetails: {
    fontSize: 12,
    fontWeight: "600",
    color: "#2DB877",
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 18,
  },
  ringSection: {
    alignItems: "center",
  },
  ringCenter: {
    alignItems: "center",
    justifyContent: "center",
    paddingHorizontal: 4,
  },
  calNumber: {
    fontSize: 20,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  calGoal: {
    fontSize: 9,
    color: "#999",
    marginTop: 2,
  },
  macrosSection: {
    flex: 1,
    gap: 14,
  },
  macroRow: {
    gap: 5,
  },
  macroLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  macroLabel: {
    fontSize: 13,
    fontWeight: "500",
    color: "#1a1a1a",
  },
  macroValue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.3,
  },
  macroGoal: {
    fontSize: 11,
    fontWeight: "400",
    color: "#bbb",
  },
  barTrack: {
    height: 6,
    backgroundColor: "#F0EFEA",
    borderRadius: 3,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
});
