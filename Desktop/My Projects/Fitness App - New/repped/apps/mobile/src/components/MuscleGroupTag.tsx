import { Text, View } from "react-native";
import tw from "../lib/tw";

const MUSCLE_COLORS: Record<string, { bg: string; text: string }> = {
  chest: { bg: "rgba(127, 29, 29, 0.12)", text: "#f87171" },
  back: { bg: "rgba(30, 58, 138, 0.12)", text: "#60a5fa" },
  shoulders: { bg: "rgba(124, 45, 18, 0.12)", text: "#fb923c" },
  biceps: { bg: "rgba(88, 28, 135, 0.12)", text: "#c084fc" },
  triceps: { bg: "rgba(131, 24, 67, 0.12)", text: "#f472b6" },
  quads: { bg: "rgba(20, 83, 45, 0.12)", text: "#4ade80" },
  hamstrings: { bg: "rgba(6, 78, 59, 0.12)", text: "#34d399" },
  glutes: { bg: "rgba(113, 63, 18, 0.12)", text: "#facc15" },
  calves: { bg: "rgba(19, 78, 74, 0.12)", text: "#2dd4bf" },
  core: { bg: "rgba(21, 94, 117, 0.12)", text: "#22d3ee" },
  full_body: { bg: "rgba(55, 48, 163, 0.12)", text: "#818cf8" },
};

interface Props {
  muscleGroup: string;
}

export default function MuscleGroupTag({ muscleGroup }: Props) {
  const colors = MUSCLE_COLORS[muscleGroup] || MUSCLE_COLORS.full_body;
  const label = muscleGroup.replace("_", " ");

  return (
    <View style={[tw`px-3 py-1 rounded-full`, { backgroundColor: colors.bg }]}>
      <Text style={[tw`text-xs font-semibold`, { color: colors.text, textTransform: "capitalize" }]}>
        {label}
      </Text>
    </View>
  );
}
