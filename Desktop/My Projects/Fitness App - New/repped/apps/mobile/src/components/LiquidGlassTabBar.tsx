import { View, Text, Pressable, Platform } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";

const VISIBLE_TABS = ["index", "meals", "progress", "settings"];

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => VISIBLE_TABS.includes(route.name));

  return (
    <View style={{
      position: "absolute",
      bottom: Platform.OS === "ios" ? 30 : 16,
      left: 20,
      right: 20,
    }}>
      <View style={{
        flexDirection: "row",
        borderRadius: 26,
        paddingVertical: 3,
        paddingHorizontal: 3,
        overflow: "hidden",
        backgroundColor: "rgba(255,255,255,0.72)",
        borderWidth: 0.5,
        borderColor: "rgba(255,255,255,0.6)",
        shadowColor: "#000",
        shadowOffset: { width: 0, height: 8 },
        shadowOpacity: 0.12,
        shadowRadius: 24,
        elevation: 10,
      }}>
        {/* Inner frost layer */}
        <View
          style={{
            position: "absolute",
            top: 0, left: 0, right: 0, bottom: 0,
            borderRadius: 26,
            backgroundColor: "rgba(245,244,240,0.45)",
          }}
          pointerEvents="none"
        />

        {/* Top highlight edge */}
        <View
          style={{
            position: "absolute",
            top: 0, left: 8, right: 8,
            height: 0.5,
            backgroundColor: "rgba(255,255,255,0.8)",
            borderRadius: 1,
          }}
          pointerEvents="none"
        />

        {visibleRoutes.map((route) => {
          const { options } = descriptors[route.key];
          const realIndex = state.routes.indexOf(route);
          const isFocused = state.index === realIndex;
          const label = (options.title ?? route.name) as string;

          const onPress = () => {
            const event = navigation.emit({ type: "tabPress", target: route.key, canPreventDefault: true });
            if (!isFocused && !event.defaultPrevented) navigation.navigate(route.name);
          };

          return (
            <Pressable
              key={route.key}
              onPress={onPress}
              style={{
                flex: 1,
                alignItems: "center",
                justifyContent: "center",
                paddingVertical: 8,
                borderRadius: 23,
                backgroundColor: isFocused ? "#2D2A24" : "transparent",
              }}
            >
              <View style={{ marginBottom: 2 }}>
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? "#FFFFFF" : "#6B6B6B",
                  size: 26,
                })}
              </View>
              <Text style={{
                fontSize: 10,
                fontWeight: isFocused ? "600" : "400",
                color: isFocused ? "#FFFFFF" : "#6B6B6B",
                letterSpacing: 0.1,
              }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
