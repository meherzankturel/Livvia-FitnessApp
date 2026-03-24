import { View, Text, ScrollView, Pressable } from "react-native";
import { router, useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { openYouTube } from "../../src/lib/deeplink";
import { TopoBackground } from "../../src/components/terrain";

export default function Recipe() {
  const params = useLocalSearchParams<{
    name: string;
    ingredients: string;
    steps: string;
    prepTime: string;
    cookTime: string;
  }>();

  const ingredients = params.ingredients ? JSON.parse(params.ingredients) : [];
  const steps = params.steps ? JSON.parse(params.steps) : [];
  const [currentStep, setCurrentStep] = useState(0);
  const [stepMode, setStepMode] = useState(false);

  return (
    <View style={{ flex: 1, backgroundColor: "#F6F5F0" }}>
      <TopoBackground />
      <ScrollView style={{ flex: 1 }} contentContainerStyle={{ paddingBottom: 120 }}>
        <View style={{ paddingHorizontal: 20, paddingTop: 64 }}>
          {/* Back button */}
          <Pressable onPress={() => router.navigate("/(app)/meals")} style={{ marginBottom: 16 }}>
            <View style={{ width: 40, height: 40, borderRadius: 20, alignItems: "center", justifyContent: "center", backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "600" }}>‹</Text>
            </View>
          </Pressable>

          {/* Title */}
          <Text style={{ color: "#2D2A24", fontSize: 30, fontWeight: "700", marginBottom: 16 }}>{params.name || "Recipe"}</Text>

          {/* Prep & Cook time pills */}
          <View style={{ flexDirection: "row", gap: 12, marginBottom: 20 }}>
            <View style={{ borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#8E8E7A", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Prep</Text>
              <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "700" }}>{params.prepTime || "5"} min</Text>
            </View>
            <View style={{ borderRadius: 16, paddingHorizontal: 20, paddingVertical: 12, backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#8E8E7A", fontSize: 11, fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 2 }}>Cook</Text>
              <Text style={{ color: "#2D2A24", fontSize: 18, fontWeight: "700" }}>{params.cookTime || "10"} min</Text>
            </View>
          </View>

          {/* YouTube Recipe Video */}
          <Pressable
            onPress={() => openYouTube((params.name || "recipe") + " recipe easy")}
            style={{ borderRadius: 16, paddingVertical: 12, alignItems: "center", marginBottom: 24, backgroundColor: "#2D2A24" }}
          >
            <Text style={{ color: "#F6F5F0", fontSize: 15, fontWeight: "600" }}>▶ Watch Recipe Video</Text>
          </Pressable>

          {/* Ingredients */}
          <Text style={{ color: "#2D2A24", fontSize: 20, fontWeight: "700", marginBottom: 12 }}>Ingredients</Text>
          <View style={{ borderRadius: 16, padding: 20, marginBottom: 24, backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" }}>
            {ingredients.map((ing: any, i: number) => (
              <View
                key={i}
                style={[
                  { flexDirection: "row", justifyContent: "space-between", paddingVertical: 12 },
                  i > 0 && { borderTopWidth: 0.5, borderTopColor: "#DDD9CE" },
                ]}
              >
                <Text style={{ color: "#2D2A24", fontSize: 16, flex: 1 }}>{ing.name}</Text>
                <Text style={{ color: "#8E8E7A", fontSize: 15 }}>{ing.amount} {ing.unit}</Text>
              </View>
            ))}
          </View>

          {/* Steps */}
          <View style={{ flexDirection: "row", justifyContent: "space-between", alignItems: "center", marginBottom: 12 }}>
            <Text style={{ color: "#2D2A24", fontSize: 20, fontWeight: "700" }}>Steps</Text>
            <Pressable onPress={() => setStepMode(!stepMode)}>
              <Text style={{ color: "#2D2A24", fontSize: 14, fontWeight: "600" }}>{stepMode ? "Show All" : "Step by Step"}</Text>
            </Pressable>
          </View>

          {stepMode ? (
            <View style={{ borderRadius: 16, padding: 24, marginBottom: 24, backgroundColor: "#EDEBE5" }}>
              <Text style={{ color: "#8E8E7A", fontSize: 13, marginBottom: 8 }}>Step {currentStep + 1} of {steps.length}</Text>
              <Text style={{ color: "#2D2A24", fontSize: 18, lineHeight: 28, marginBottom: 24 }}>{steps[currentStep]}</Text>
              <View style={{ flexDirection: "row", gap: 12 }}>
                <Pressable
                  onPress={() => setCurrentStep(Math.max(0, currentStep - 1))}
                  disabled={currentStep === 0}
                  style={[
                    { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: "center" },
                    { backgroundColor: "#DDD9CE", opacity: currentStep === 0 ? 0.4 : 1 },
                  ]}
                >
                  <Text style={{ color: "#2D2A24", fontWeight: "600" }}>Previous</Text>
                </Pressable>
                <Pressable
                  onPress={() => setCurrentStep(Math.min(steps.length - 1, currentStep + 1))}
                  disabled={currentStep === steps.length - 1}
                  style={[
                    { flex: 1, borderRadius: 16, paddingVertical: 12, alignItems: "center", backgroundColor: "#2D2A24" },
                    { opacity: currentStep === steps.length - 1 ? 0.4 : 1 },
                  ]}
                >
                  <Text style={{ color: "#F6F5F0", fontWeight: "600" }}>
                    {currentStep === steps.length - 1 ? "Done!" : "Next"}
                  </Text>
                </Pressable>
              </View>
            </View>
          ) : (
            <View style={{ gap: 12, marginBottom: 24 }}>
              {steps.map((step: string, i: number) => (
                <View key={i} style={{ borderRadius: 16, padding: 16, flexDirection: "row", backgroundColor: "#FFFFFF", borderWidth: 1, borderColor: "rgba(0,0,0,0.04)" }}>
                  <View style={{ width: 32, height: 32, borderRadius: 16, backgroundColor: "#2D2A24", alignItems: "center", justifyContent: "center", marginRight: 12, marginTop: 2 }}>
                    <Text style={{ color: "#F6F5F0", fontSize: 14, fontWeight: "700" }}>{i + 1}</Text>
                  </View>
                  <Text style={{ color: "#2D2A24", fontSize: 16, flex: 1, lineHeight: 24 }}>{step}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>
    </View>
  );
}
