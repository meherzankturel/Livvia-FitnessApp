import React from "react";
import { View, Text, StyleSheet } from "react-native";
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
          {value}
          <Text style={styles.macroGoal}>/{goal}g</Text>
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
}: Props) {
  const calProgress = caloriesGoal > 0 ? Math.min(calories / caloriesGoal, 1) : 0;

  return (
    <View style={styles.card}>
      <Text style={styles.title}>Nutrition</Text>
      <View style={styles.body}>
        {/* Left: calories ring */}
        <View style={styles.ringSection}>
          <ProgressRing size={90} strokeWidth={5} progress={calProgress} color="#2DB877" trackColor="#E0F4EB">
            <View style={styles.ringCenter}>
              <Text style={styles.calNumber}>{calories}</Text>
              <Text style={styles.calUnit}>kcal</Text>
            </View>
          </ProgressRing>
          <Text style={styles.ringLabel}>of {caloriesGoal}</Text>
        </View>

        {/* Right: macro bars */}
        <View style={styles.macrosSection}>
          <MacroRow label="Protein" value={protein} goal={proteinGoal} color="#D4930D" />
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
    padding: 16,
    marginHorizontal: 16,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  title: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
    marginBottom: 14,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 16,
  },
  ringSection: {
    alignItems: "center",
    gap: 6,
  },
  ringCenter: {
    alignItems: "center",
  },
  calNumber: {
    fontSize: 18,
    fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  calUnit: {
    fontSize: 9,
    color: "#999",
    marginTop: 1,
  },
  ringLabel: {
    fontSize: 10,
    color: "#999",
  },
  macrosSection: {
    flex: 1,
    gap: 12,
  },
  macroRow: {
    gap: 4,
  },
  macroLabelRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "baseline",
  },
  macroLabel: {
    fontSize: 12,
    fontWeight: "500",
    color: "#888",
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
    height: 3,
    backgroundColor: "#F0F0F0",
    borderRadius: 1.5,
    overflow: "hidden",
  },
  barFill: {
    height: "100%",
    borderRadius: 3,
  },
});
