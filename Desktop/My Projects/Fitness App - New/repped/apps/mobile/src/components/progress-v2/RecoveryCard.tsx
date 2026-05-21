import React from "react";
import { View, Text, StyleSheet } from "react-native";

interface Props {
  score?: number;
  message?: string;
  hrv?: number;
  sleepHours?: number;
  restingHR?: number;
}

interface TagPillProps {
  label: string;
  value: string;
}

function TagPill({ label, value }: TagPillProps) {
  return (
    <View style={styles.tag}>
      <Text style={styles.tagLabel}>{label}</Text>
      <Text style={styles.tagValue}>{value}</Text>
    </View>
  );
}

export default function RecoveryCard({
  score = 82,
  message = "Good to train — your body is well recovered.",
  hrv = 48,
  sleepHours = 7.4,
  restingHR = 68,
}: Props) {
  const clampedScore = Math.min(Math.max(score, 0), 100);
  const ringSize = 48;
  const strokeWidth = 4;
  const innerSize = ringSize - strokeWidth * 2;

  return (
    <View style={styles.card}>
      <View style={styles.body}>
        {/* Left: score ring */}
        <View style={styles.ringSection}>
          <View
            style={[
              styles.ring,
              {
                width: ringSize,
                height: ringSize,
                borderRadius: ringSize / 2,
                borderWidth: strokeWidth,
              },
            ]}
          >
            {/* Inner mask */}
            <View
              style={[
                styles.ringInner,
                {
                  width: innerSize,
                  height: innerSize,
                  borderRadius: innerSize / 2,
                },
              ]}
            >
              <Text style={styles.scoreText}>{clampedScore}</Text>
            </View>
          </View>
          <Text style={styles.scoreLabel}>Score</Text>
        </View>

        {/* Right: text + tags */}
        <View style={styles.textSection}>
          <Text style={styles.title}>Recovery</Text>
          <Text style={styles.message} numberOfLines={2}>
            {message}
          </Text>

          <View style={styles.tagsRow}>
            <TagPill label="HRV" value={`${hrv}ms`} />
            <TagPill label="Sleep" value={`${sleepHours}h`} />
            <TagPill label="RHR" value={`${restingHR}bpm`} />
          </View>
        </View>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#F0F8F4",
    borderRadius: 20,
    padding: 16,
    marginHorizontal: 16,
    borderWidth: 1,
    borderColor: "rgba(45,184,119,0.3)",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.03,
    shadowRadius: 4,
    elevation: 1,
  },
  body: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  ringSection: {
    alignItems: "center",
    gap: 4,
  },
  ring: {
    borderColor: "#2DB877",
    backgroundColor: "transparent",
    alignItems: "center",
    justifyContent: "center",
  },
  ringInner: {
    backgroundColor: "#F0F8F4",
    alignItems: "center",
    justifyContent: "center",
  },
  scoreText: {
    fontSize: 13,
    fontWeight: "800",
    color: "#2DB877",
  },
  scoreLabel: {
    fontSize: 10,
    color: "#2DB877",
    fontWeight: "600",
  },
  textSection: {
    flex: 1,
    gap: 4,
  },
  title: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1a1a1a",
  },
  message: {
    fontSize: 11,
    color: "#555",
    lineHeight: 16,
  },
  tagsRow: {
    flexDirection: "row",
    gap: 6,
    marginTop: 6,
    flexWrap: "wrap",
  },
  tag: {
    backgroundColor: "rgba(45,184,119,0.12)",
    borderRadius: 10,
    paddingHorizontal: 8,
    paddingVertical: 4,
    flexDirection: "row",
    gap: 4,
    alignItems: "center",
  },
  tagLabel: {
    fontSize: 10,
    color: "#2DB877",
    fontWeight: "600",
  },
  tagValue: {
    fontSize: 10,
    color: "#1a1a1a",
    fontWeight: "700",
  },
});
