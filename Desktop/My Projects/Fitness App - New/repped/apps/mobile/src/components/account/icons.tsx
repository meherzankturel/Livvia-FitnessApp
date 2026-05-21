/**
 * Monochrome SVG icons for the Account screen.
 *
 * Note: react-native-svg is disallowed in this Expo Go build (see CLAUDE.md).
 * Each icon is built from layered Views — the same View-geometry pattern used
 * across the app for MuscleIcon, BadgeIcon, etc.
 */

import { View } from "react-native";

const C = "#1A1A1A";

const I = ({ children }: { children: React.ReactNode }) => (
  <View style={{ width: 22, height: 22, alignItems: "center", justifyContent: "center" }}>
    {children}
  </View>
);

export function ProfileIcon() {
  // Head circle + shoulders arc
  return (
    <I>
      <View style={{ width: 22, height: 22 }}>
        {/* Head */}
        <View
          style={{
            position: "absolute",
            top: 1, left: 7,
            width: 8, height: 8,
            borderRadius: 4,
            backgroundColor: C,
          }}
        />
        {/* Shoulders */}
        <View
          style={{
            position: "absolute",
            bottom: 1, left: 2,
            width: 18, height: 10,
            borderTopLeftRadius: 9,
            borderTopRightRadius: 9,
            backgroundColor: C,
          }}
        />
      </View>
    </I>
  );
}

export function GoalIcon() {
  // Concentric rings target
  return (
    <I>
      <View
        style={{
          width: 20, height: 20, borderRadius: 10,
          borderWidth: 2, borderColor: C,
          alignItems: "center", justifyContent: "center",
        }}
      >
        <View
          style={{
            width: 12, height: 12, borderRadius: 6,
            borderWidth: 1.5, borderColor: C,
            alignItems: "center", justifyContent: "center",
          }}
        >
          <View style={{ width: 4, height: 4, borderRadius: 2, backgroundColor: C }} />
        </View>
      </View>
    </I>
  );
}

export function TrainingIcon() {
  // Dumbbell — two end-bells connected by a bar
  return (
    <I>
      <View style={{ flexDirection: "row", alignItems: "center" }}>
        <View
          style={{
            width: 4, height: 14, borderRadius: 1.5,
            backgroundColor: C,
          }}
        />
        <View style={{ width: 2, height: 8, marginLeft: 1, marginRight: 1, backgroundColor: C }} />
        <View
          style={{
            width: 8, height: 3, backgroundColor: C,
          }}
        />
        <View style={{ width: 2, height: 8, marginLeft: 1, marginRight: 1, backgroundColor: C }} />
        <View
          style={{
            width: 4, height: 14, borderRadius: 1.5,
            backgroundColor: C,
          }}
        />
      </View>
    </I>
  );
}

export function NutritionIcon() {
  // Fork & knife — two parallel verticals with split top for the fork
  return (
    <I>
      <View style={{ flexDirection: "row", gap: 6, alignItems: "flex-start" }}>
        {/* Fork */}
        <View style={{ width: 7, height: 20, alignItems: "center" }}>
          <View style={{ flexDirection: "row", gap: 1 }}>
            <View style={{ width: 1.5, height: 5, backgroundColor: C, borderRadius: 0.5 }} />
            <View style={{ width: 1.5, height: 5, backgroundColor: C, borderRadius: 0.5 }} />
            <View style={{ width: 1.5, height: 5, backgroundColor: C, borderRadius: 0.5 }} />
          </View>
          <View style={{ width: 5, height: 2, backgroundColor: C }} />
          <View style={{ width: 2, height: 12, backgroundColor: C }} />
        </View>
        {/* Knife */}
        <View style={{ width: 5, height: 20, alignItems: "center" }}>
          <View style={{ width: 5, height: 9, backgroundColor: C, borderTopLeftRadius: 2, borderTopRightRadius: 2 }} />
          <View style={{ width: 2, height: 11, backgroundColor: C }} />
        </View>
      </View>
    </I>
  );
}

export function PreferencesIcon() {
  // Gear — outer ring with center hole
  return (
    <I>
      <View
        style={{
          width: 18, height: 18, borderRadius: 9,
          backgroundColor: C,
          alignItems: "center", justifyContent: "center",
        }}
      >
        {/* 4 tooth indicators */}
        <View style={{ position: "absolute", top: -2, width: 4, height: 4, backgroundColor: C, borderRadius: 1 }} />
        <View style={{ position: "absolute", bottom: -2, width: 4, height: 4, backgroundColor: C, borderRadius: 1 }} />
        <View style={{ position: "absolute", left: -2, width: 4, height: 4, backgroundColor: C, borderRadius: 1 }} />
        <View style={{ position: "absolute", right: -2, width: 4, height: 4, backgroundColor: C, borderRadius: 1 }} />
        <View style={{ width: 6, height: 6, borderRadius: 3, backgroundColor: "#FFFFFF" }} />
      </View>
    </I>
  );
}

export function HelpIcon() {
  // Speech bubble
  return (
    <I>
      <View style={{ width: 22, height: 22 }}>
        <View
          style={{
            position: "absolute",
            top: 2, left: 1,
            width: 20, height: 14,
            borderRadius: 4,
            backgroundColor: C,
          }}
        />
        {/* Tail */}
        <View
          style={{
            position: "absolute",
            bottom: 4, left: 4,
            width: 4, height: 4,
            backgroundColor: C,
            transform: [{ rotate: "45deg" }],
          }}
        />
      </View>
    </I>
  );
}

export function SignOutIcon() {
  return (
    <I>
      <View style={{ flexDirection: "row", alignItems: "center", gap: 2 }}>
        <View
          style={{
            width: 9, height: 16,
            borderLeftWidth: 2, borderTopWidth: 2, borderBottomWidth: 2,
            borderColor: C,
            borderTopLeftRadius: 2, borderBottomLeftRadius: 2,
          }}
        />
        <View style={{ width: 7, height: 2, backgroundColor: C }} />
        <View
          style={{
            width: 0, height: 0,
            borderTopWidth: 5, borderBottomWidth: 5, borderLeftWidth: 6,
            borderTopColor: "transparent",
            borderBottomColor: "transparent",
            borderLeftColor: C,
          }}
        />
      </View>
    </I>
  );
}
