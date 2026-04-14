import { View, Text } from "react-native";

interface Props {
  icon: string;
  earned: boolean;
  color: "blue" | "green" | "orange" | "red" | "purple" | "cyan" | "gold" | "lime" | "teal";
  size?: number;
  tier?: "bronze" | "silver" | "gold";
}

const COLOR_MAP: Record<string, [string, string, string]> = {
  // [primary, lighter accent, darkest shade]
  blue: ["#4F62F8", "#7B8CFF", "#2D3A9E"],
  green: ["#22C55E", "#6EE7A0", "#15803D"],
  orange: ["#F59E0B", "#FCD34D", "#B45309"],
  red: ["#EF4444", "#FCA5A5", "#991B1B"],
  purple: ["#A855F7", "#D8B4FE", "#7E22CE"],
  cyan: ["#06B6D4", "#67E8F9", "#0E7490"],
  gold: ["#EAB308", "#FDE047", "#A16207"],
  lime: ["#84CC16", "#BEF264", "#4D7C0F"],
  teal: ["#14B8A6", "#5EEAD4", "#0F766E"],
};

const TIER_FRAMES: Record<string, { outer: string; mid: string; highlight: string; shine: string }> = {
  bronze: { outer: "#8B6914", mid: "#CD7F32", highlight: "#DDA15E", shine: "#F0C97B" },
  silver: { outer: "#5A5A5F", mid: "#A8A8AD", highlight: "#D4D4D8", shine: "#F0F0F5" },
  gold: { outer: "#9A7B2E", mid: "#FFD700", highlight: "#FFE44D", shine: "#FFF8DC" },
};

const UNEARNED = { fill: "#E5E5EA", accent: "#D1D1D6", frame: "#C7C7CC", highlight: "#E0E0E5" };

export default function HexBadge({ icon, earned, color, size = 88, tier = "silver" }: Props) {
  const [primary, accent, dark] = earned ? (COLOR_MAP[color] || COLOR_MAP.blue) : [UNEARNED.fill, UNEARNED.accent, UNEARNED.frame];
  const frame = earned ? TIER_FRAMES[tier] : { outer: "#D1D1D6", mid: "#E5E5EA", highlight: "#F0F0F5", shine: "#FAFAFA" };

  return (
    <View style={{ alignItems: "center" }}>
      {/* Drop shadow for 3D depth */}
      <View style={{
        shadowColor: earned ? primary : "#000",
        shadowOffset: { width: 0, height: 4 },
        shadowOpacity: earned ? 0.3 : 0.08,
        shadowRadius: 8,
        elevation: earned ? 8 : 2,
      }}>
        {/* Outer frame hex */}
        <View style={{ position: "relative" }}>
          <Hexagon width={size} color={frame.outer} />

          {/* Frame gradient — brighter top half */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "50%", overflow: "hidden" }}>
            <Hexagon width={size} color={frame.mid} />
          </View>

          {/* Frame top shine strip */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "25%", overflow: "hidden", opacity: 0.6 }}>
            <Hexagon width={size} color={frame.highlight} />
          </View>

          {/* Inner colored hex (inset 5px) */}
          <View style={{ position: "absolute", top: 5, left: 5, right: 5, bottom: 5, alignItems: "center" }}>
            {/* Base dark fill */}
            <Hexagon width={size - 10} color={earned ? dark : UNEARNED.fill} />

            {/* Main color — top 60% */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "60%", overflow: "hidden" }}>
              <Hexagon width={size - 10} color={primary} />
            </View>

            {/* Bright accent — top 35% */}
            <View style={{ position: "absolute", top: 0, left: 0, right: 0, height: "35%", overflow: "hidden" }}>
              <Hexagon width={size - 10} color={accent} />
            </View>

            {/* Glass specular highlight — top 20% */}
            <View style={{ position: "absolute", top: 2, left: 6, right: 6, height: "18%", overflow: "hidden", opacity: earned ? 0.5 : 0.2 }}>
              <Hexagon width={size - 22} color="#ffffff" />
            </View>

            {/* Diagonal shine stripe (3D metallic effect) */}
            {earned && (
              <View style={{
                position: "absolute",
                top: "20%",
                left: "30%",
                width: size * 0.12,
                height: "60%",
                backgroundColor: "rgba(255,255,255,0.15)",
                transform: [{ rotate: "15deg" }],
                borderRadius: 4,
              }} />
            )}
          </View>

          {/* Decorative concentric rings */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }} pointerEvents="none">
            {earned && (
              <>
                <View style={{
                  width: size * 0.62,
                  height: size * 0.62,
                  borderRadius: size * 0.31,
                  borderWidth: 1.5,
                  borderColor: "rgba(255,255,255,0.2)",
                }} />
                <View style={{
                  position: "absolute",
                  width: size * 0.42,
                  height: size * 0.42,
                  borderRadius: size * 0.21,
                  borderWidth: 1,
                  borderColor: "rgba(255,255,255,0.12)",
                }} />
              </>
            )}
          </View>

          {/* Center icon */}
          <View style={{ position: "absolute", top: 0, left: 0, right: 0, bottom: 0, alignItems: "center", justifyContent: "center" }}>
            <Text style={{ fontSize: size * 0.32, textAlign: "center", opacity: earned ? 1 : 0.3 }}>
              {icon}
            </Text>
          </View>
        </View>
      </View>
    </View>
  );
}

function Hexagon({ width, color }: { width: number; color: string }) {
  const triHeight = width * 0.29;
  const rectHeight = width * 0.58;

  return (
    <View style={{ width, alignItems: "center" }}>
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: width / 2, borderRightWidth: width / 2, borderBottomWidth: triHeight,
        borderLeftColor: "transparent", borderRightColor: "transparent", borderBottomColor: color,
      }} />
      <View style={{ width, height: rectHeight, backgroundColor: color }} />
      <View style={{
        width: 0, height: 0,
        borderLeftWidth: width / 2, borderRightWidth: width / 2, borderTopWidth: triHeight,
        borderLeftColor: "transparent", borderRightColor: "transparent", borderTopColor: color,
      }} />
    </View>
  );
}
