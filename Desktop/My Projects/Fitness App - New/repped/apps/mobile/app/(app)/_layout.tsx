import { Tabs } from "expo-router";
import { View } from "react-native";
import LiquidGlassTabBar from "../../src/components/LiquidGlassTabBar";

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        // These are needed for the custom tabBar icons to receive props
        tabBarActiveTintColor: "#0090ff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color, focused }) => (
            <View
              style={{
                width: 24,
                height: 24,
                borderRadius: 12,
                borderWidth: 2.5,
                borderColor: color,
                alignItems: "center",
                justifyContent: "center",
              }}
            >
              {focused && (
                <View
                  style={{
                    width: 7,
                    height: 7,
                    borderRadius: 3.5,
                    backgroundColor: color,
                  }}
                />
              )}
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Nutrition",
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: "center", justifyContent: "center" }}>
              <View
                style={{
                  width: 22,
                  height: 22,
                  borderRadius: 5,
                  borderWidth: 2,
                  borderColor: color,
                  alignItems: "center",
                  justifyContent: "center",
                }}
              >
                <View style={{ width: 9, height: 1.5, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
                <View style={{ width: 13, height: 1.5, backgroundColor: color, borderRadius: 1, marginBottom: 2 }} />
                <View style={{ width: 7, height: 1.5, backgroundColor: color, borderRadius: 1 }} />
              </View>
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => (
            <View style={{ flexDirection: "row", gap: 2.5, alignItems: "flex-end", height: 20 }}>
              <View style={{ width: 4.5, height: 7, backgroundColor: color, borderRadius: 1.5 }} />
              <View style={{ width: 4.5, height: 13, backgroundColor: color, borderRadius: 1.5 }} />
              <View style={{ width: 4.5, height: 20, backgroundColor: color, borderRadius: 1.5 }} />
            </View>
          ),
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => (
            <View style={{ alignItems: "center" }}>
              <View
                style={{
                  width: 11,
                  height: 11,
                  borderRadius: 5.5,
                  borderWidth: 2,
                  borderColor: color,
                  marginBottom: 1,
                }}
              />
              <View
                style={{
                  width: 18,
                  height: 9,
                  borderTopLeftRadius: 9,
                  borderTopRightRadius: 9,
                  borderWidth: 2,
                  borderBottomWidth: 0,
                  borderColor: color,
                }}
              />
            </View>
          ),
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="generate-plan" options={{ href: null }} />
      <Tabs.Screen name="workout-player" options={{ href: null }} />
      <Tabs.Screen name="checkin" options={{ href: null }} />
      <Tabs.Screen name="injury-check" options={{ href: null }} />
      <Tabs.Screen name="warmup" options={{ href: null }} />
      <Tabs.Screen name="cooldown" options={{ href: null }} />
      <Tabs.Screen name="wellness" options={{ href: null }} />
      <Tabs.Screen name="recipe" options={{ href: null }} />
      <Tabs.Screen name="grocery-list" options={{ href: null }} />
      <Tabs.Screen name="achievements" options={{ href: null }} />
      <Tabs.Screen name="weekly-summary" options={{ href: null }} />

    </Tabs>
  );
}
