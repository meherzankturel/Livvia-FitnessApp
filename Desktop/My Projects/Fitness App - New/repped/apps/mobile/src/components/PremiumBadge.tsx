import { View } from "react-native";
import BadgeIcon from "./BadgeIcon";
import type { IconName } from "./BadgeIcon";
import type { BadgeShape, BadgeTier } from "@repped/shared";

interface Props {
  icon: IconName;
  earned: boolean;
  accentColor: string;
  size?: number;
  shape?: BadgeShape;
  tier?: BadgeTier;
}

const TIER_RING: Record<string, string> = {
  starter: "#8E8E93",
  intermediate: "#6366F1",
  advanced: "#F97316",
  elite: "#EAB308",
};

export default function PremiumBadge({ icon, earned, accentColor, size = 76, shape = "circle", tier = "starter" }: Props) {
  const s = size;
  const iconSize = s * 0.4;
  const ringColor = earned ? (TIER_RING[tier] || "#8E8E93") : "#C7C7CC";

  // Colors — earned gets vibrant, locked gets medium gray (NOT white-on-white)
  const bg = earned ? accentColor : "#B0B0B8";
  const bgDark = earned ? darken(accentColor, 0.4) : "#8E8E93";
  const bgLight = earned ? lighten(accentColor, 0.3) : "#C7C7CC";
  const iconColor = "#FFFFFF";

  // Inner badge content — same for all shapes
  const innerLayers = (borderRadius: number) => (
    <>
      {/* Base dark */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, backgroundColor: bgDark, borderRadius }} />
      {/* Main color — top 58% */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "58%", backgroundColor: bg, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }} />
      {/* Bright cap — top 25% */}
      <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "25%", backgroundColor: bgLight, borderTopLeftRadius: borderRadius, borderTopRightRadius: borderRadius }} />
      {/* Glass specular — very top */}
      <View style={{ position: "absolute", top: 2, left: "15%", right: "15%", height: "12%", backgroundColor: "rgba(255,255,255,0.4)", borderRadius: 100 }} />
      {/* Bottom shadow for 3D depth */}
      <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", backgroundColor: "rgba(0,0,0,0.18)", borderBottomLeftRadius: borderRadius, borderBottomRightRadius: borderRadius }} />
    </>
  );

  const renderCircle = () => (
    <View style={{ width: s, height: s }}>
      {/* Outer glow */}
      {earned && <View style={{ position: "absolute", top: -3, left: -3, right: -3, bottom: -3, borderRadius: (s + 6) / 2, backgroundColor: accentColor, opacity: 0.15 }} />}
      {/* Ring */}
      <View style={{ width: s, height: s, borderRadius: s / 2, borderWidth: 3, borderColor: ringColor, overflow: "hidden" }}>
        {innerLayers(s / 2)}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <BadgeIcon name={icon} size={iconSize} color={iconColor} />
        </View>
      </View>
    </View>
  );

  const renderHexagon = () => {
    const triH = s * 0.2;
    const rectH = s * 0.6;
    return (
      <View style={{ width: s, height: triH * 2 + rectH, alignItems: "center" }}>
        {/* Frame */}
        <HexShape width={s} color={ringColor} />
        {/* Inner fill (inset 3px) */}
        <View style={{ position: "absolute", top: 3, left: 3, right: 3, bottom: 3, alignItems: "center" }}>
          <HexShape width={s - 6} color={bgDark} />
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "55%", overflow: "hidden" }}>
            <HexShape width={s - 6} color={bg} />
          </View>
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "25%", overflow: "hidden" }}>
            <HexShape width={s - 6} color={bgLight} />
          </View>
          {/* Bottom shadow */}
          <View style={{ position: "absolute", bottom: 0, left: 0, right: 0, height: "30%", overflow: "hidden", opacity: 0.18 }}>
            <HexShape width={s - 6} color="#000000" />
          </View>
        </View>
        {/* Glass */}
        <View style={{ position: "absolute", top: 5, left: "18%", right: "18%", height: "10%", backgroundColor: "rgba(255,255,255,0.35)", borderRadius: 100 }} pointerEvents="none" />
        {/* Icon centered */}
        <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
          <BadgeIcon name={icon} size={iconSize} color={iconColor} />
        </View>
      </View>
    );
  };

  const renderShield = () => (
    <View style={{ width: s, height: s * 1.1 }}>
      {earned && <View style={{ position: "absolute", top: -2, left: -2, right: -2, bottom: -2, borderTopLeftRadius: s * 0.15, borderTopRightRadius: s * 0.15, borderBottomLeftRadius: s * 0.45, borderBottomRightRadius: s * 0.45, backgroundColor: accentColor, opacity: 0.12 }} />}
      <View style={{
        width: s, height: s * 1.1,
        borderTopLeftRadius: s * 0.12, borderTopRightRadius: s * 0.12,
        borderBottomLeftRadius: s * 0.45, borderBottomRightRadius: s * 0.45,
        borderWidth: 3, borderColor: ringColor, overflow: "hidden",
      }}>
        {innerLayers(0)}
        <View style={{ flex: 1, alignItems: "center", justifyContent: "center", zIndex: 1 }}>
          <BadgeIcon name={icon} size={iconSize} color={iconColor} />
        </View>
      </View>
    </View>
  );

  const renderDiamond = () => {
    const innerS = s * 0.65;
    return (
      <View style={{ width: s, height: s, alignItems: "center", justifyContent: "center" }}>
        {earned && <View style={{ position: "absolute", width: innerS + 8, height: innerS + 8, borderRadius: s * 0.1, backgroundColor: accentColor, opacity: 0.12, transform: [{ rotate: "45deg" }] }} />}
        <View style={{
          width: innerS, height: innerS, borderRadius: s * 0.08,
          transform: [{ rotate: "45deg" }], borderWidth: 3, borderColor: ringColor, overflow: "hidden",
        }}>
          {innerLayers(0)}
        </View>
        {/* Icon NOT rotated */}
        <View style={{ position: "absolute", zIndex: 2 }}>
          <BadgeIcon name={icon} size={iconSize * 0.85} color={iconColor} />
        </View>
      </View>
    );
  };

  const renderShape = () => {
    switch (shape) {
      case "hexagon": return renderHexagon();
      case "shield": return renderShield();
      case "diamond": return renderDiamond();
      default: return renderCircle();
    }
  };

  return (
    <View style={{ opacity: earned ? 1 : 0.55, alignItems: "center" }}>
      <View style={{
        shadowColor: earned ? accentColor : "#888",
        shadowOffset: { width: 0, height: earned ? 4 : 1 },
        shadowOpacity: earned ? 0.3 : 0.1,
        shadowRadius: earned ? 8 : 3,
        elevation: earned ? 8 : 2,
      }}>
        {renderShape()}
      </View>
    </View>
  );
}

function HexShape({ width, color }: { width: number; color: string }) {
  const triH = width * 0.2;
  const rectH = width * 0.6;
  return (
    <View style={{ width, alignItems: "center" }}>
      <View style={{ width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2, borderBottomWidth: triH, borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color }} />
      <View style={{ width, height: rectH, backgroundColor: color }} />
      <View style={{ width: 0, height: 0, borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: triH, borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: color }} />
    </View>
  );
}

function darken(hex: string, f: number): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.round(r * (1 - f))},${Math.round(g * (1 - f))},${Math.round(b * (1 - f))})`;
}

function lighten(hex: string, f: number): string {
  const r = parseInt(hex.slice(1, 3), 16), g = parseInt(hex.slice(3, 5), 16), b = parseInt(hex.slice(5, 7), 16);
  return `rgb(${Math.min(255, Math.round(r + (255 - r) * f))},${Math.min(255, Math.round(g + (255 - g) * f))},${Math.min(255, Math.round(b + (255 - b) * f))})`;
}
