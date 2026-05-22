import { View, Text } from "react-native";

type IconName =
  | "dumbbell" | "flame" | "trophy" | "crown" | "star"
  | "lightning" | "check" | "target" | "scale" | "ruler"
  | "calendar" | "leaf" | "share" | "sun" | "moon"
  | "weight" | "medal" | "shield" | "heart" | "chart";

interface Props {
  name: IconName;
  size: number;
  color: string;
}

/**
 * Bold, FILLED vector icons — designed to be readable at small badge sizes.
 * Uses thick strokes and solid fills (not thin outlines).
 */
export default function BadgeIcon({ name, size, color }: Props) {
  const s = size;

  // Use bold Unicode characters + geometric View shapes
  // These render cleanly at small sizes unlike thin wireframe icons

  const ICON_MAP: Record<IconName, string> = {
    target: "◉",
    dumbbell: "⫶",
    trophy: "⬡",
    crown: "♔",
    star: "★",
    flame: "⬆",
    lightning: "⚡",
    check: "✓",
    scale: "⚖",
    ruler: "⊞",
    calendar: "▦",
    leaf: "❧",
    share: "⬆",
    sun: "✦",
    moon: "☽",
    weight: "◆",
    medal: "✪",
    shield: "⛨",
    heart: "♥",
    chart: "↗",
  };

  // Custom View-based icons for the most important ones
  // The rest fall back to bold Unicode text

  switch (name) {
    case "dumbbell":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.65, height: s * 0.15, backgroundColor: color, borderRadius: s * 0.05 }} />
          <View style={{ position: "absolute", left: s * 0.08, width: s * 0.22, height: s * 0.5, backgroundColor: color, borderRadius: s * 0.06 }} />
          <View style={{ position: "absolute", right: s * 0.08, width: s * 0.22, height: s * 0.5, backgroundColor: color, borderRadius: s * 0.06 }} />
        </View>
      );

    case "flame":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "flex-end" }}>
          <View style={{
            width: s * 0.5, height: s * 0.72,
            backgroundColor: color,
            borderTopLeftRadius: s * 0.12,
            borderTopRightRadius: s * 0.25,
            borderBottomLeftRadius: s * 0.25,
            borderBottomRightRadius: s * 0.12,
            transform: [{ rotate: "-2deg" }],
          }} />
          <View style={{
            position: "absolute", bottom: 0,
            width: s * 0.22, height: s * 0.35,
            backgroundColor: "rgba(255,255,255,0.35)",
            borderTopLeftRadius: s * 0.06,
            borderTopRightRadius: s * 0.11,
            borderBottomLeftRadius: s * 0.11,
            borderBottomRightRadius: s * 0.06,
          }} />
        </View>
      );

    case "trophy":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{
            width: s * 0.5, height: s * 0.42, backgroundColor: color,
            borderBottomLeftRadius: s * 0.25, borderBottomRightRadius: s * 0.25,
            borderTopLeftRadius: s * 0.06, borderTopRightRadius: s * 0.06,
          }} />
          <View style={{ width: s * 0.12, height: s * 0.14, backgroundColor: color }} />
          <View style={{ width: s * 0.32, height: s * 0.08, backgroundColor: color, borderRadius: s * 0.04 }} />
        </View>
      );

    case "star":
      return (
        <Text style={{ fontSize: s * 0.65, color, textAlign: "center", lineHeight: s, includeFontPadding: false }}>★</Text>
      );

    case "crown":
      return (
        <Text style={{ fontSize: s * 0.6, color, textAlign: "center", lineHeight: s, includeFontPadding: false }}>♔</Text>
      );

    case "heart":
      return (
        <Text style={{ fontSize: s * 0.55, color, textAlign: "center", lineHeight: s, includeFontPadding: false }}>♥</Text>
      );

    case "check":
      return (
        <Text style={{ fontSize: s * 0.6, color, fontFamily: "Quicksand_700Bold", fontWeight: "900", textAlign: "center", lineHeight: s, includeFontPadding: false }}>✓</Text>
      );

    case "lightning":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.22, height: s * 0.55, backgroundColor: color, borderRadius: s * 0.04, transform: [{ rotate: "12deg" }, { skewX: "-12deg" }] }} />
        </View>
      );

    case "weight":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.52, height: s * 0.52, borderRadius: s * 0.26, backgroundColor: color }} />
          <View style={{ position: "absolute", width: s * 0.18, height: s * 0.18, borderRadius: s * 0.09, backgroundColor: "rgba(255,255,255,0.3)" }} />
        </View>
      );

    case "shield":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{
            width: s * 0.48, height: s * 0.58, backgroundColor: color,
            borderTopLeftRadius: s * 0.06, borderTopRightRadius: s * 0.06,
            borderBottomLeftRadius: s * 0.24, borderBottomRightRadius: s * 0.24,
          }}>
            <View style={{ position: "absolute", top: s * 0.12, left: 0, right: 0, height: s * 0.06, backgroundColor: "rgba(255,255,255,0.3)" }} />
          </View>
        </View>
      );

    case "target":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.55, height: s * 0.55, borderRadius: s * 0.275, backgroundColor: color }} />
          <View style={{ position: "absolute", width: s * 0.35, height: s * 0.35, borderRadius: s * 0.175, backgroundColor: "rgba(255,255,255,0.25)" }} />
          <View style={{ position: "absolute", width: s * 0.15, height: s * 0.15, borderRadius: s * 0.075, backgroundColor: color }} />
        </View>
      );

    case "medal":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ position: "absolute", top: s * 0.05, width: s * 0.15, height: s * 0.32, backgroundColor: color, opacity: 0.5, transform: [{ rotate: "-15deg" }], borderRadius: s * 0.03 }} />
          <View style={{ position: "absolute", top: s * 0.05, width: s * 0.15, height: s * 0.32, backgroundColor: color, opacity: 0.5, transform: [{ rotate: "15deg" }], borderRadius: s * 0.03 }} />
          <View style={{ width: s * 0.42, height: s * 0.42, borderRadius: s * 0.21, backgroundColor: color, marginTop: s * 0.12 }} />
          <View style={{ position: "absolute", bottom: s * 0.18, width: s * 0.2, height: s * 0.2, borderRadius: s * 0.1, backgroundColor: "rgba(255,255,255,0.25)" }} />
        </View>
      );

    case "chart":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "flex-end", paddingBottom: s * 0.12 }}>
          <View style={{ flexDirection: "row", gap: s * 0.04, alignItems: "flex-end" }}>
            <View style={{ width: s * 0.1, height: s * 0.2, backgroundColor: color, borderRadius: s * 0.03 }} />
            <View style={{ width: s * 0.1, height: s * 0.35, backgroundColor: color, borderRadius: s * 0.03 }} />
            <View style={{ width: s * 0.1, height: s * 0.28, backgroundColor: color, borderRadius: s * 0.03 }} />
            <View style={{ width: s * 0.1, height: s * 0.5, backgroundColor: color, borderRadius: s * 0.03 }} />
          </View>
        </View>
      );

    case "calendar":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.52, height: s * 0.48, backgroundColor: color, borderRadius: s * 0.06 }}>
            <View style={{ width: "100%", height: s * 0.1, backgroundColor: "rgba(255,255,255,0.25)", borderTopLeftRadius: s * 0.06, borderTopRightRadius: s * 0.06 }} />
          </View>
        </View>
      );

    case "leaf":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{
            width: s * 0.38, height: s * 0.55, backgroundColor: color,
            borderTopLeftRadius: s * 0.28, borderTopRightRadius: s * 0.05,
            borderBottomLeftRadius: s * 0.05, borderBottomRightRadius: s * 0.28,
            transform: [{ rotate: "10deg" }],
          }} />
        </View>
      );

    case "sun":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15, backgroundColor: color }} />
          {[0, 45, 90, 135].map(deg => (
            <View key={deg} style={{
              position: "absolute", width: s * 0.08, height: s * 0.6,
              backgroundColor: color, borderRadius: s * 0.04,
              transform: [{ rotate: `${deg}deg` }], opacity: 0.45,
            }} />
          ))}
        </View>
      );

    case "moon":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.45, height: s * 0.45, borderRadius: s * 0.225, backgroundColor: color }} />
          <View style={{ position: "absolute", top: s * 0.18, right: s * 0.2, width: s * 0.3, height: s * 0.3, borderRadius: s * 0.15, backgroundColor: "rgba(255,255,255,0.3)" }} />
        </View>
      );

    case "share":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.12, height: s * 0.4, backgroundColor: color, borderRadius: s * 0.04 }} />
          <View style={{ position: "absolute", top: s * 0.15, width: 0, height: 0,
            borderLeftWidth: s * 0.14, borderRightWidth: s * 0.14, borderBottomWidth: s * 0.16,
            borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color,
          }} />
          <View style={{ position: "absolute", bottom: s * 0.15, width: s * 0.4, height: s * 0.3,
            borderWidth: s * 0.06, borderColor: color, borderTopWidth: 0, borderRadius: s * 0.06,
          }} />
        </View>
      );

    case "scale":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.6, height: s * 0.08, backgroundColor: color, borderRadius: s * 0.03 }} />
          <View style={{ width: s * 0.08, height: s * 0.35, backgroundColor: color, borderRadius: s * 0.03 }} />
          <View style={{ width: s * 0.3, height: s * 0.08, backgroundColor: color, borderRadius: s * 0.03 }} />
        </View>
      );

    case "ruler":
      return (
        <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
          <View style={{ width: s * 0.18, height: s * 0.65, backgroundColor: color, borderRadius: s * 0.04 }}>
            <View style={{ width: s * 0.1, height: s * 0.04, backgroundColor: "rgba(255,255,255,0.3)", marginTop: s * 0.1 }} />
            <View style={{ width: s * 0.06, height: s * 0.04, backgroundColor: "rgba(255,255,255,0.3)", marginTop: s * 0.06 }} />
            <View style={{ width: s * 0.1, height: s * 0.04, backgroundColor: "rgba(255,255,255,0.3)", marginTop: s * 0.06 }} />
          </View>
        </View>
      );

    default:
      return (
        <Text style={{ fontSize: s * 0.5, color, fontFamily: "Quicksand_700Bold", fontWeight: "800", textAlign: "center", lineHeight: s }}>
          {ICON_MAP[name] || "●"}
        </Text>
      );
  }
}

export type { IconName };
