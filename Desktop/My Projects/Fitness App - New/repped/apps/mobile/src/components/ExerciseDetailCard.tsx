import { View, Text, Pressable, Image } from "react-native";
import { useState } from "react";
import { getFocusCue } from "@repped/shared";
import { openYouTube } from "../lib/deeplink";
import { getExerciseImage } from "../lib/exercise-images";
import MuscleIcon, { MUSCLE_COLORS } from "./MuscleIcon";

interface Props {
  exerciseName: string;
  targetSets: number;
  targetReps: number;
  explainWhy: string;
  instructions?: string;
  explainEli5?: string;
  animationUrl?: string | null;
  muscleGroup?: string;
  suggestedWeight?: number;
  weightReasoning?: string;
  index?: number;
}

export default function ExerciseDetailCard({
  exerciseName, targetSets, targetReps, explainWhy,
  instructions, muscleGroup,
  suggestedWeight, weightReasoning,
}: Props) {
  const [open, setOpen] = useState(false);

  const mg = MUSCLE_COLORS[muscleGroup || "full_body"] || MUSCLE_COLORS.full_body;
  const imageSource = getExerciseImage(exerciseName);

  return (
    <Pressable onPress={() => setOpen(!open)}>
      <View style={{
        backgroundColor: "#F5F5F8",
        borderRadius: 20,
        marginBottom: 14,
        overflow: "hidden",
      }}>
        {/* ─── Main ─── */}
        <View style={{ flexDirection: "row", alignItems: "center", padding: 18 }}>

          {/* Thumbnail */}
          <View style={{
            width: 64, height: 64, borderRadius: 16,
            backgroundColor: mg.bg,
            alignItems: "center", justifyContent: "center",
            marginRight: 16, overflow: "hidden",
          }}>
            {imageSource ? (
              <Image
                source={imageSource}
                style={{ width: 64, height: 64 }}
                resizeMode="cover"
              />
            ) : (
              <MuscleIcon muscleGroup={muscleGroup || "full_body"} size={64} />
            )}
          </View>

          {/* Info */}
          <View style={{ flex: 1 }}>
            <Text style={{
              color: "#1C1C1E", fontSize: 14, fontFamily: "Quicksand_700Bold", fontWeight: "700",
              letterSpacing: 0.3, textTransform: "uppercase",
              marginBottom: 10,
            }}>
              {exerciseName}
            </Text>

            <View style={{ flexDirection: "row", gap: 20 }}>
              <View>
                <Text style={{ color: "#AEAEB2", fontSize: 9, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>Sets</Text>
                <Text style={{ color: "#1C1C1E", fontSize: 18, fontWeight: "700" }}>{targetSets}</Text>
              </View>
              <View>
                <Text style={{ color: "#AEAEB2", fontSize: 9, fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>Reps</Text>
                <Text style={{ color: "#1C1C1E", fontSize: 18, fontWeight: "700" }}>{targetReps}</Text>
              </View>
              {suggestedWeight !== undefined && suggestedWeight > 0 && (
                <View>
                  <Text style={{ color: "#AEAEB2", fontSize: 9, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", letterSpacing: 0.8, textTransform: "uppercase", marginBottom: 3 }}>Weight</Text>
                  <Text style={{ color: "#1C1C1E", fontSize: 18, fontWeight: "700" }}>{suggestedWeight}<Text style={{ fontSize: 11, color: "#AEAEB2" }}>kg</Text></Text>
                </View>
              )}
            </View>
          </View>
        </View>

        {/* ─── Expanded ─── */}
        {open && (
          <View style={{ paddingHorizontal: 18, paddingBottom: 22, paddingTop: 6 }}>

            <View style={{ height: 0.5, backgroundColor: "#E5E5EA", marginBottom: 20 }} />

            {/* Muscle tag */}
            {muscleGroup && (
              <View style={{ flexDirection: "row", marginBottom: 18 }}>
                <View style={{ backgroundColor: mg.bg, borderRadius: 8, paddingHorizontal: 12, paddingVertical: 6 }}>
                  <Text style={{ color: mg.fg, fontSize: 12, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", textTransform: "capitalize" }}>
                    {muscleGroup.replace("_", " ")}
                  </Text>
                </View>
              </View>
            )}

            {/* Focus cue */}
            {muscleGroup && (
              <View style={{ backgroundColor: "#EEEDFF", borderRadius: 14, padding: 16, marginBottom: 18 }}>
                <Text style={{ color: "#6366F1", fontSize: 14, lineHeight: 22, fontFamily: "Quicksand_500Medium", fontWeight: "500" }}>
                  {getFocusCue(exerciseName, muscleGroup)}
                </Text>
              </View>
            )}

            {/* Instructions */}
            {instructions && (
              <Text style={{ color: "#8E8E93", fontSize: 14, lineHeight: 22, marginBottom: 18 }}>
                {instructions}
              </Text>
            )}

            {/* Weight reasoning */}
            {weightReasoning && (
              <Text style={{ color: "#C7C7CC", fontSize: 13, lineHeight: 19, marginBottom: 20 }}>
                {weightReasoning}
              </Text>
            )}

            {/* Video */}
            <Pressable
              onPress={() => openYouTube(exerciseName + " exercise form tutorial")}
              style={{
                backgroundColor: "#6366F1", borderRadius: 14,
                paddingVertical: 16, alignItems: "center",
              }}
            >
              <Text style={{ color: "#fff", fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>Watch Form Video</Text>
            </Pressable>
          </View>
        )}
      </View>
    </Pressable>
  );
}
