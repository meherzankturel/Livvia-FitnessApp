import React from "react";
import { View, Text, Image, StyleSheet } from "react-native";
import DottedSemiArc from "./DottedSemiArc";
import LineWaveform from "./LineWaveform";

interface Props {
  steps: number;
  stepsGoal: number;
  calories: number;
  heartRate: number;
}

// ECG-like pattern — flat baseline punctuated by occasional P-Q-R-S-T-style spikes.
// Values represent height; LineWaveform connects them as a smooth polyline.
const ECG_PATTERN = [
  10, 10, 10, 10, 10, 10, 10, 10, 11, 12, 11, 10,
  10, 10, 10, 14, 9, 18, 4, 14, 8, 12, 10, 10,
  10, 10, 10, 10, 10, 11, 11, 10, 10, 10, 10, 10,
  10, 13, 10, 14, 9, 18, 4, 14, 8, 12, 10, 10,
  10, 10, 10, 10, 10, 10, 10, 10,
];

const formatNum = (n: number) => n.toLocaleString();

export default function OverviewBento({ steps, stepsGoal, calories, heartRate }: Props) {
  const stepsProgress = stepsGoal > 0 ? Math.min(steps / stepsGoal, 1) : 0;

  return (
    <View style={styles.row}>
      {/* ── Left: Steps card ─────────────────────────────────────────── */}
      <View style={[styles.card, styles.stepsCard]}>
        <View style={styles.stepsHeader}>
          <Image
            source={require("../../../assets/progress/icon-steps.png")}
            style={styles.headerIcon}
            resizeMode="contain"
          />
          <Text style={styles.cardTitle}>Steps</Text>
        </View>

        <View style={styles.arcWrapper}>
          <DottedSemiArc size={180} progress={stepsProgress} color="#7CC78A" trackColor="#C9C7BD" minFilled={4}>
            <View style={styles.arcCenter}>
              <Image
                source={require("../../../assets/progress/icon-steps-ring.png")}
                style={styles.shoeIcon}
                resizeMode="contain"
              />
              <Text style={styles.stepsNumber}>{formatNum(steps)}</Text>
              <Text style={styles.stepsLabel}>Steps</Text>
            </View>
          </DottedSemiArc>
        </View>
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
            <Text style={styles.bigNumber}>{formatNum(calories)}</Text>
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
          {/* ECG line — continuous polyline with layered soft glow underneath */}
          <View style={styles.ecgWrapper}>
            {/* Outer glow — widest, most transparent, furthest down */}
            <View style={[styles.ecgShadowLayer, { top: 4 }]} pointerEvents="none">
              <LineWaveform values={ECG_PATTERN} height={28} color="rgba(226,91,91,0.08)" thickness={7} />
            </View>
            {/* Mid glow */}
            <View style={[styles.ecgShadowLayer, { top: 2.5 }]} pointerEvents="none">
              <LineWaveform values={ECG_PATTERN} height={28} color="rgba(226,91,91,0.12)" thickness={4.5} />
            </View>
            {/* Close shadow — closest to the line */}
            <View style={[styles.ecgShadowLayer, { top: 1 }]} pointerEvents="none">
              <LineWaveform values={ECG_PATTERN} height={28} color="rgba(226,91,91,0.20)" thickness={2.5} />
            </View>
            {/* Main line — crisp on top */}
            <View style={StyleSheet.absoluteFill}>
              <LineWaveform values={ECG_PATTERN} height={28} color="#E25B5B" thickness={1.5} />
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
    paddingVertical: 16,
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
    fontFamily: "Quicksand_500Medium", fontWeight: "500",
    color: "#888",
  },
  stepsHeader: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    marginBottom: 4,
  },
  headerIcon: {
    width: 16,
    height: 16,
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
  arcWrapper: {
    alignItems: "center",
    justifyContent: "center",
    marginTop: 4,
  },
  arcCenter: {
    alignItems: "center",
    justifyContent: "center",
  },
  shoeIcon: {
    width: 56,
    height: 56,
    marginBottom: 6,
  },
  stepsNumber: {
    fontSize: 22,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: "#1a1a1a",
    letterSpacing: -0.5,
  },
  stepsLabel: {
    fontSize: 11,
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
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: "#1a1a1a",
  },
  unit: {
    fontSize: 11,
    color: "#888",
    marginBottom: 3,
  },
  ecgWrapper: {
    height: 28,
    marginVertical: 4,
    justifyContent: "center",
    position: "relative",
  },
  ecgShadowLayer: {
    position: "absolute",
    left: 0,
    right: 0,
    bottom: 0,
  },
});
