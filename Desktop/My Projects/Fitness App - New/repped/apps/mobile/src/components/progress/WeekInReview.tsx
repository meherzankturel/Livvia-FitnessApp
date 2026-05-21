import { View, Text, Pressable, StyleSheet, Share, Platform } from "react-native";

const earth = "#2D2A24";
const sand = "#F6F5F0";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

interface PR {
  name: string;
  value: number;
  type: string;
}

interface Props {
  weekLabel: string;
  workoutsCompleted: number;
  workoutsPlanned: number;
  volumeThisWeek: number;
  volumeLastWeek: number;
  streak: number;
  prs: PR[];
  weightStart: number | null;
  weightEnd: number | null;
}

export function WeekInReview({
  weekLabel,
  workoutsCompleted,
  workoutsPlanned,
  volumeThisWeek,
  volumeLastWeek,
  streak,
  prs,
  weightStart,
  weightEnd,
}: Props) {
  const volumeChange =
    volumeLastWeek > 0
      ? Math.round(((volumeThisWeek - volumeLastWeek) / volumeLastWeek) * 100)
      : 0;

  const weightDelta =
    weightStart != null && weightEnd != null
      ? weightEnd - weightStart
      : null;

  const handleShare = async () => {
    const lines = [
      `WEEK IN REVIEW \u00B7 ${weekLabel}`,
      "",
      `\uD83C\uDFCB\uFE0F ${workoutsCompleted}/${workoutsPlanned} workouts`,
      volumeThisWeek > 0
        ? `\uD83D\uDCAA ${(volumeThisWeek / 1000).toFixed(1)}t volume${volumeChange !== 0 ? ` (${volumeChange > 0 ? "+" : ""}${volumeChange}%)` : ""}`
        : null,
      streak > 0 ? `\uD83D\uDD25 ${streak}-day streak` : null,
      prs.length > 0
        ? `\uD83C\uDFC6 ${prs.length} new PR${prs.length > 1 ? "s" : ""}: ${prs.map((p) => `${p.name} ${p.value}kg`).join(", ")}`
        : null,
      weightDelta != null
        ? `\u2696\uFE0F ${weightStart} \u2192 ${weightEnd} kg (${weightDelta > 0 ? "+" : ""}${weightDelta.toFixed(1)})`
        : null,
      "",
      "Tracked with Revive \uD83D\uDCAA",
    ];

    try {
      await Share.share({
        message: lines.filter(Boolean).join("\n"),
      });
    } catch {}
  };

  return (
    <View style={s.card}>
      {/* Header */}
      <View style={s.header}>
        <Text style={s.headerLabel}>WEEK IN REVIEW</Text>
        <Text style={s.headerDate}>{weekLabel}</Text>
      </View>

      {/* Stats grid */}
      <View style={s.statsGrid}>
        <View style={s.statItem}>
          <Text style={s.statIcon}>{"\uD83C\uDFCB\uFE0F"}</Text>
          <Text style={s.statValue}>
            {workoutsCompleted}/{workoutsPlanned}
          </Text>
          <Text style={s.statLabel}>workouts</Text>
        </View>

        <View style={s.statItem}>
          <Text style={s.statIcon}>{"\uD83D\uDCAA"}</Text>
          <Text style={s.statValue}>
            {volumeThisWeek > 0
              ? `${(volumeThisWeek / 1000).toFixed(1)}t`
              : "\u2014"}
          </Text>
          <Text style={s.statLabel}>
            {volumeChange !== 0 && volumeLastWeek > 0
              ? `${volumeChange > 0 ? "+" : ""}${volumeChange}%`
              : "volume"}
          </Text>
        </View>

        <View style={s.statItem}>
          <Text style={s.statIcon}>{"\uD83D\uDD25"}</Text>
          <Text style={s.statValue}>{streak}d</Text>
          <Text style={s.statLabel}>streak</Text>
        </View>
      </View>

      {/* PRs */}
      {prs.length > 0 && (
        <View style={s.prSection}>
          <Text style={s.prBadge}>
            {"\uD83C\uDFC6"} {prs.length} new PR{prs.length > 1 ? "s" : ""}
          </Text>
          {prs.slice(0, 3).map((pr, i) => (
            <Text key={i} style={s.prItem}>
              {pr.name} \u00B7 {pr.value}
              {pr.type === "weight" ? "kg" : ""}
            </Text>
          ))}
        </View>
      )}

      {/* Weight change */}
      {weightDelta != null && (
        <View style={s.weightRow}>
          <Text style={s.weightText}>
            {"\u2696\uFE0F"} {weightStart} \u2192 {weightEnd} kg
          </Text>
          <Text
            style={[
              s.weightDelta,
              { color: weightDelta <= 0 ? trail : "#EF4444" },
            ]}
          >
            {weightDelta > 0 ? "+" : ""}
            {weightDelta.toFixed(1)}
          </Text>
        </View>
      )}

      {/* Share button */}
      <Pressable onPress={handleShare} style={s.shareBtn}>
        <Text style={s.shareBtnText}>
          {"\uD83D\uDCE4"} Share Week
        </Text>
      </Pressable>
    </View>
  );
}

const s = StyleSheet.create({
  card: {
    backgroundColor: stone,
    borderRadius: 20,
    padding: 20,
    marginBottom: 24,
  },
  header: {
    alignItems: "center",
    marginBottom: 18,
  },
  headerLabel: {
    fontSize: 9,
    color: rock,
    letterSpacing: 1.5,
    fontWeight: "700",
    marginBottom: 2,
  },
  headerDate: {
    fontSize: 13,
    color: earth,
    fontWeight: "600",
  },
  statsGrid: {
    flexDirection: "row",
    justifyContent: "space-around",
    marginBottom: 16,
  },
  statItem: {
    alignItems: "center",
  },
  statIcon: {
    fontSize: 20,
    marginBottom: 4,
  },
  statValue: {
    fontSize: 20,
    fontWeight: "800",
    color: earth,
  },
  statLabel: {
    fontSize: 9,
    color: rock,
    fontWeight: "500",
    marginTop: 2,
  },
  prSection: {
    backgroundColor: "rgba(52,211,153,0.06)",
    borderRadius: 12,
    padding: 12,
    marginBottom: 12,
  },
  prBadge: {
    fontSize: 12,
    fontWeight: "700",
    color: earth,
    marginBottom: 6,
  },
  prItem: {
    fontSize: 11,
    color: "#047857",
    fontWeight: "500",
    marginTop: 2,
  },
  weightRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingVertical: 8,
    borderTopWidth: 0.5,
    borderTopColor: "rgba(45,42,36,0.08)",
    marginBottom: 12,
  },
  weightText: {
    fontSize: 12,
    color: earth,
    fontWeight: "500",
  },
  weightDelta: {
    fontSize: 12,
    fontWeight: "700",
  },
  shareBtn: {
    backgroundColor: earth,
    borderRadius: 12,
    paddingVertical: 12,
    alignItems: "center",
  },
  shareBtnText: {
    fontSize: 13,
    fontWeight: "700",
    color: sand,
  },
});
