import { View, Text, Image, ImageSourcePropType } from "react-native";

const C = {
  trail: "#34D399",
  earth: "#2D2A24",
  bg: "#F6F5F0",
};

// Default avatar images bundled with the app
const DEFAULT_AVATARS: Record<string, ImageSourcePropType> = {
  default_1: require("../../assets/avatars/avatar-1.jpg"),
  default_2: require("../../assets/avatars/avatar-2.jpg"),
  default_3: require("../../assets/avatars/avatar-3.jpg"),
  default_4: require("../../assets/avatars/avatar-4.jpg"),
  default_5: require("../../assets/avatars/avatar-5.jpg"),
  default_6: require("../../assets/avatars/avatar-6.jpg"),
  default_7: require("../../assets/avatars/avatar-7.jpg"),
  default_8: require("../../assets/avatars/avatar-8.jpg"),
};

export { DEFAULT_AVATARS };

interface AvatarProps {
  /** avatar_url from profile — can be a URL, "default_1"-"default_8", or null */
  avatarUrl: string | null | undefined;
  /** Fallback initial letter (from display name or email) */
  fallbackLetter: string;
  /** Size in pixels */
  size: number;
}

export function Avatar({ avatarUrl, fallbackLetter, size }: AvatarProps) {
  const borderRadius = size / 2;

  // Default avatar (bundled image)
  if (avatarUrl && avatarUrl.startsWith("default_")) {
    const source = DEFAULT_AVATARS[avatarUrl];
    if (source) {
      return (
        <Image
          source={source}
          style={{ width: size, height: size, borderRadius }}
          resizeMode="cover"
        />
      );
    }
  }

  // Custom uploaded photo (URL)
  if (avatarUrl && (avatarUrl.startsWith("http://") || avatarUrl.startsWith("https://"))) {
    return (
      <Image
        source={{ uri: avatarUrl }}
        style={{ width: size, height: size, borderRadius }}
        resizeMode="cover"
      />
    );
  }

  // Fallback: initial letter circle
  return (
    <View style={{
      width: size, height: size, borderRadius,
      backgroundColor: "rgba(52,211,153,0.12)",
      alignItems: "center", justifyContent: "center",
    }}>
      <Text style={{ fontSize: size * 0.4, fontWeight: "800", color: C.trail }}>
        {(fallbackLetter || "L").toUpperCase()}
      </Text>
    </View>
  );
}
