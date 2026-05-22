import { View, Text, StyleSheet } from "react-native";

const earth = "#2D2A24";
const trail = "#34D399";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

interface Props {
  totalWorkoutDays: number;
  workoutDaysWithMealPlan: number;
  totalPRs: number;
  prsOnMealPlanDays: number;
  avgProteinTarget: number;
  mealPlanAdherence: number;
  // Actual logged nutrition
  daysLogged: number;
  avgCaloriesLogged: number;
  avgProteinLogged: number;
}

export function NutritionCorrelation({
  totalWorkoutDays,
  workoutDaysWithMealPlan,
  totalPRs,
  prsOnMealPlanDays,
  avgProteinTarget,
  mealPlanAdherence,
  daysLogged,
  avgCaloriesLogged,
  avgProteinLogged,
}: Props) {
  const hasMealData = workoutDaysWithMealPlan > 0 || mealPlanAdherence > 0 || daysLogged > 0;

  if (!hasMealData) {
    return (
      <View style={s.card}>
        <Text style={s.emptyIcon}>{"\uD83E\uDD66"}</Text>
        <Text style={s.emptyTitle}>Nutrition Insights</Text>
        <Text style={s.emptyText}>
          Log your meals on the Nutrition tab to unlock real-time nutrition tracking
        </Text>
      </View>
    );
  }

  const insights: { icon: string; text: string; highlight: string }[] = [];

  // Actual meal logging stats (real data > plan targets)
  if (daysLogged > 0) {
    insights.push({
      icon: "\uD83D\uDCCA",
      text: `${daysLogged} days tracked this month`,
      highlight: `Avg ${avgCaloriesLogged} cal \u00B7 ${avgProteinLogged}g protein per day`,
    });
  }

  // Protein tracking vs target
  if (avgProteinTarget > 0 && avgProteinLogged > 0) {
    const proteinPct = Math.round((avgProteinLogged / avgProteinTarget) * 100);
    if (proteinPct >= 90) {
      insights.push({
        icon: "\uD83C\uDFC6",
        text: "Crushing your protein target",
        highlight: `${avgProteinLogged}g avg vs ${Math.round(avgProteinTarget)}g target (${proteinPct}%)`,
      });
    } else if (proteinPct >= 70) {
      insights.push({
        icon: "\uD83D\uDCC8",
        text: "Good protein intake",
        highlight: `${avgProteinLogged}g avg vs ${Math.round(avgProteinTarget)}g target \u2014 push for ${Math.round(avgProteinTarget)}g+`,
      });
    } else {
      insights.push({
        icon: "\u26A0\uFE0F",
        text: "Protein is low",
        highlight: `${avgProteinLogged}g avg vs ${Math.round(avgProteinTarget)}g target \u2014 aim higher for results`,
      });
    }
  } else if (avgProteinTarget > 0) {
    insights.push({
      icon: "\uD83E\uDD69",
      text: "Daily protein target",
      highlight: `${Math.round(avgProteinTarget)}g \u2014 log meals to track your intake`,
    });
  }

  // Meal plan adherence
  if (mealPlanAdherence >= 70) {
    insights.push({
      icon: "\u2705",
      text: "Strong nutrition consistency!",
      highlight: `${mealPlanAdherence}% of days had a meal plan`,
    });
  } else if (mealPlanAdherence >= 40) {
    insights.push({
      icon: "\uD83D\uDCC8",
      text: "Good start with nutrition",
      highlight: `${mealPlanAdherence}% adherence \u2014 aim for 70%+`,
    });
  }

  // PR correlation
  if (totalPRs > 0 && workoutDaysWithMealPlan > 0) {
    const prRate = prsOnMealPlanDays > 0
      ? Math.round((prsOnMealPlanDays / totalPRs) * 100) : 0;
    if (prRate >= 50) {
      insights.push({
        icon: "\uD83C\uDFC6",
        text: "Nutrition fuels PRs",
        highlight: `${prRate}% of your PRs came on days with a meal plan`,
      });
    }
  }

  // Workout coverage
  if (totalWorkoutDays > 0) {
    const coverage = Math.round(
      (workoutDaysWithMealPlan / totalWorkoutDays) * 100
    );
    if (coverage > 0) {
      insights.push({
        icon: "\uD83C\uDFCB\uFE0F",
        text: "Workout day nutrition",
        highlight: `${coverage}% of workout days had a meal plan`,
      });
    }
  }

  return (
    <View style={s.card}>
      <View style={s.headerRow}>
        <Text style={s.title}>💡 Nutrition × Training</Text>
      </View>
      {insights.map((insight, i) => (
        <View
          key={i}
          style={[s.insightRow, i < insights.length - 1 && s.insightBorder]}
        >
          <Text style={s.insightIcon}>{insight.icon}</Text>
          <View style={s.insightContent}>
            <Text style={s.insightText}>{insight.text}</Text>
            <Text style={s.insightHighlight}>{insight.highlight}</Text>
          </View>
        </View>
      ))}
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
  headerRow: {
    marginBottom: 14,
  },
  title: {
    fontSize: 14,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: earth,
  },
  insightRow: {
    flexDirection: "row",
    paddingVertical: 12,
    alignItems: "flex-start",
  },
  insightBorder: {
    borderBottomWidth: 0.5,
    borderBottomColor: "rgba(45,42,36,0.06)",
  },
  insightIcon: {
    fontSize: 18,
    marginRight: 12,
    marginTop: 1,
  },
  insightContent: {
    flex: 1,
  },
  insightText: {
    fontSize: 13,
    fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
    color: earth,
    marginBottom: 2,
  },
  insightHighlight: {
    fontSize: 11,
    color: "#047857",
    fontFamily: "Quicksand_500Medium", fontWeight: "500",
  },
  emptyIcon: {
    fontSize: 32,
    textAlign: "center",
    marginBottom: 10,
  },
  emptyTitle: {
    fontSize: 15,
    fontFamily: "Quicksand_700Bold", fontWeight: "700",
    color: earth,
    textAlign: "center",
    marginBottom: 6,
  },
  emptyText: {
    fontSize: 12,
    color: rock,
    textAlign: "center",
    lineHeight: 18,
  },
});
