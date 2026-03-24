import { View, Text, Pressable, Platform, Animated, LayoutChangeEvent } from "react-native";
import type { BottomTabBarProps } from "@react-navigation/bottom-tabs";
import { useCallback, useRef, useState, useEffect } from "react";

const VISIBLE_TABS = ["index", "meals", "progress", "settings"];

export default function LiquidGlassTabBar({ state, descriptors, navigation }: BottomTabBarProps) {
  const visibleRoutes = state.routes.filter((route) => VISIBLE_TABS.includes(route.name));

  const [tabLayouts, setTabLayouts] = useState<{ x: number; width: number }[]>([]);
  const pillX = useRef(new Animated.Value(0)).current;
  const pillW = useRef(new Animated.Value(0)).current;

  const activeVisibleIndex = visibleRoutes.findIndex(
    (route) => state.routes.indexOf(route) === state.index
  );

  useEffect(() => {
    if (tabLayouts.length === visibleRoutes.length && activeVisibleIndex >= 0) {
      const layout = tabLayouts[activeVisibleIndex];
      if (layout) {
        Animated.parallel([
          Animated.spring(pillX, { toValue: layout.x, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: false }),
          Animated.spring(pillW, { toValue: layout.width, damping: 18, stiffness: 180, mass: 0.8, useNativeDriver: false }),
        ]).start();
      }
    }
  }, [activeVisibleIndex, tabLayouts]);

  const handleTabLayout = useCallback((index: number, event: LayoutChangeEvent) => {
    const { x, width } = event.nativeEvent.layout;
    setTabLayouts((prev) => {
      const next = [...prev];
      next[index] = { x, width };
      return next;
    });
  }, []);

  return (
    <View style={{ position: "absolute", bottom: Platform.OS === "ios" ? 30 : 16, left: 20, right: 20 }}>
      <View
        style={{
          flexDirection: "row",
          backgroundColor: "rgba(246,245,240,0.94)",
          borderRadius: 28,
          borderWidth: 0.5,
          borderColor: "rgba(45,42,36,0.06)",
          paddingVertical: 4,
          paddingHorizontal: 0,
          position: "relative",
          overflow: "hidden",
          // Shadow for elevation
          shadowColor: "#000",
          shadowOffset: { width: 0, height: 4 },
          shadowOpacity: 0.1,
          shadowRadius: 20,
          elevation: 8,
        }}
      >
        {/* Sliding pill */}
        <Animated.View
          style={{
            position: "absolute",
            top: 4,
            bottom: 4,
            left: pillX,
            width: pillW,
            borderRadius: 22,
            backgroundColor: "#2D2A24",
          }}
          pointerEvents="none"
        />

        {visibleRoutes.map((route, index) => {
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
              onLayout={(e) => handleTabLayout(index, e)}
              style={{ flex: 1, alignItems: "center", justifyContent: "center", paddingVertical: 8, zIndex: 1 }}
            >
              <View style={{ marginBottom: 3 }}>
                {options.tabBarIcon?.({
                  focused: isFocused,
                  color: isFocused ? "#F6F5F0" : "#8E8E7A",
                  size: 24,
                })}
              </View>
              <Text style={{ fontSize: 10, fontWeight: isFocused ? "700" : "500", color: isFocused ? "#F6F5F0" : "#8E8E7A", letterSpacing: 0.2 }}>
                {label}
              </Text>
            </Pressable>
          );
        })}
      </View>
    </View>
  );
}
