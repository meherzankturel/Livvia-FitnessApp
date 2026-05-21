import { Tabs } from "expo-router";
import { View, Image } from "react-native";
import LiquidGlassTabBar from "../../src/components/LiquidGlassTabBar";

const tabTodayIcon = require("../../assets/tab-today.png");
const tabNutritionIcon = require("../../assets/tab-nutrition.png");
const tabProgressIcon = require("../../assets/tab-progress.png");
const tabAccountIcon = require("../../assets/tab-account.png");

const TAB_ICON_SIZE = 26;

const TabIcon = ({ source, color }: { source: any; color: string }) => (
  <View style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE, alignItems: "center", justifyContent: "center" }}>
    <Image source={source} style={{ width: TAB_ICON_SIZE, height: TAB_ICON_SIZE, tintColor: color }} resizeMode="contain" />
  </View>
);

export default function AppLayout() {
  return (
    <Tabs
      tabBar={(props) => <LiquidGlassTabBar {...props} />}
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: "#0090ff",
        tabBarInactiveTintColor: "rgba(255,255,255,0.35)",
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Today",
          tabBarIcon: ({ color }) => <TabIcon source={tabTodayIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="meals"
        options={{
          title: "Meals",
          tabBarIcon: ({ color }) => <TabIcon source={tabNutritionIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="progress"
        options={{
          title: "Progress",
          tabBarIcon: ({ color }) => <TabIcon source={tabProgressIcon} color={color} />,
        }}
      />
      <Tabs.Screen
        name="settings"
        options={{
          title: "Account",
          tabBarIcon: ({ color }) => <TabIcon source={tabAccountIcon} color={color} />,
        }}
      />
      {/* Hidden screens */}
      <Tabs.Screen name="generate-plan" options={{ href: null }} />
      <Tabs.Screen name="workout-player" options={{ href: null }} />
      <Tabs.Screen name="checkin" options={{ href: null }} />
      <Tabs.Screen name="injury-check" options={{ href: null }} />
      <Tabs.Screen name="warmup" options={{ href: null }} />
      <Tabs.Screen name="cooldown" options={{ href: null }} />
      <Tabs.Screen name="conditioning-player" options={{ href: null }} />
      <Tabs.Screen name="wellness" options={{ href: null }} />
      <Tabs.Screen name="recipe" options={{ href: null }} />
      <Tabs.Screen name="grocery-list" options={{ href: null }} />
      <Tabs.Screen name="achievements" options={{ href: null }} />
      <Tabs.Screen name="weekly-summary" options={{ href: null }} />
      <Tabs.Screen name="meal-history" options={{ href: null }} />
      <Tabs.Screen name="account-profile" options={{ href: null }} />
      <Tabs.Screen name="account-goal" options={{ href: null }} />
      <Tabs.Screen name="account-training" options={{ href: null }} />
      <Tabs.Screen name="account-nutrition" options={{ href: null }} />
      <Tabs.Screen name="account-preferences" options={{ href: null }} />
      <Tabs.Screen name="account-help" options={{ href: null }} />
      <Tabs.Screen name="privacy-policy" options={{ href: null }} />
      <Tabs.Screen name="terms-conditions" options={{ href: null }} />

    </Tabs>
  );
}
