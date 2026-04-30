import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import ProgressRing from "./ProgressRing";

interface Props {
  steps: number;
  stepsGoal: number;
  calories: number;
  heartRate: number;
}

// Heights for the ECG waveform bars (28 values simulate a heartbeat pattern)
const ECG_HEIGHTS = [3, 3, 4, 3, 3, 4, 10, 22, 6, 2, 8, 14, 3, 3, 4, 3, 3, 4, 10, 22, 6, 2, 8, 14, 3, 3, 4, 3];

export default function OverviewBento({ steps, stepsGoal, calories, heartRate }: Props) {
  const stepsProgress = stepsGoal > 0 ? Math.min(steps / stepsGoal, 1) : 0;

  return (
    <View style={styles.row}>
      {/* ── Left: Steps card ─────────────────────────────────────────── */}
      <View style={[styles.card, styles.stepsCard]}>
        <Text style={styles.cardTitle}>Steps</Text>
        <View style={styles.ringWrapper}>
          <ProgressRing size={110} strokeWidth={9} progress={stepsProgress} color="#2DB877" trackColor="#E0F4EB">
            <Image
              source={require("../../../assets/progress/icon-steps-ring.png")}
              style={styles.stepsIcon}
              resizeMode="contain"
            />
          </ProgressRing>
        </View>
        <Text style={styles.stepsNumber}>{steps.toLocaleString()}</Text>
        <Text style={styles.stepsGoal}>/ {stepsGoal.toLocaleString()} goal</Text>
      </View>

      {/* ── Right column ─────────────────────────────────────────────── */}
      <View style={styles.rightCol}>
        {/* Calories card */}
        <View style={[styles.card, styles.caloriesCard]}>
          <View style={styles.cardHeader}>
            <Image
              source={require("../../../assets/progress/icon-calories.png")}
              style={styles.smallIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Calories</Text>
          </View>
          <View style={styles.statRow}>
            <Text style={styles.bigNumber}>{calories.toLocaleString()}</Text>
            <Text style={styles.unit}>kcal</Text>
          </View>
        </View>

        {/* Heart Rate card */}
        <View style={[styles.card, styles.heartCard]}>
          <View style={styles.cardHeader}>
            <Image
              source={require("../../../assets/progress/icon-heartrate.png")}
              style={styles.smallIcon}
              resizeMode="contain"
            />
            <Text style={styles.cardTitle}>Heart Rate</Text>
          </View>
          {/* ECG waveform */}
          <View style={styles.ecgWrapper}>
            {/* Shadow layer */}
            <View style={[styles.ecgRow, styles.ecgShadow]}>
              {ECG_HEIGHTS.map((h, i) => (
                <View
                  key={`shadow-${i}`}
                  style={[styles.ecgBar, { height: h, backgroundColor: "rgba(226,91,91,0.18)" }]}
                />
              ))}
            </View>
            {/* Main waveform */}
            <View style={styles.ecgRow}>
              {ECG_HEIGHTS.map((h, i) => (
                <View
                  key={`ecg-${i}`}
                  style={[styles.ecgBar, { height: h, backgroundColor: "#E25B5B" }]}
                />
              ))}
            </View>
          </View>
          <View style={styles.statRow}>
            <Text style={[styles.bigNumber, { color: "#E25B5B" }]}>{heartRate}</Text>
            <Text style={styles.unit}>bpm</Text>
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: "row",
    gap: 10,
    paddingHorizontal: 16,
  },
  card: {
    backgroundColor: "#fff",
    borderRadius: 20,
    padding: 14,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  stepsCard: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 20,
  },
  rightCol: {
    flex: 1,
    gap: 10,
  },
  caloriesCard: {
    flex: 1,
  },
  heartCard: {
    flex: 1,
  },
  cardTitle: {
    fontSize: 13,
    fontWeight: "500",
    color: "#888",
    marginBottom: 4,
  },
  cardHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 6,
  },
  smallIcon: {
    width: 16,
    height: 16,
  },
  ringWrapper: {
    marginVertical: 12,
  },
  stepsIcon: {
    width: 32,
    height: 32,
  },
  stepsNumber: {
    fontSize: 16,
    fontWeight: "700",
    color: "#1a1a1a",
    marginTop: 6,
  },
  stepsGoal: {
    fontSize: 10,
    color: "#888",
    marginTop: 1,
  },
  statRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 3,
    marginTop: 2,
  },
  bigNumber: {
    fontSize: 22,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  unit: {
    fontSize: 11,
    color: "#888",
    marginBottom: 3,
  },
  ecgWrapper: {
    height: 28,
    marginVertical: 6,
    justifyContent: "flex-end",
  },
  ecgRow: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1.5,
    position: "absolute",
    bottom: 0,
    left: 0,
    right: 0,
  },
  ecgShadow: {
    bottom: -2,
    opacity: 0.6,
  },
  ecgBar: {
    width: 3,
    borderRadius: 1.5,
  },
});
