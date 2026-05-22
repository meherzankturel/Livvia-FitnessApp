import { Pressable, View, Text } from "react-native";
import { Avatar } from "../Avatar";

const C = {
  earth: "#1A1A1A",
  stone: "#F2F1ED",
  rock: "#9A9A92",
};

interface AccountHeroProps {
  name: string;
  email: string;
  avatarUrl?: string | null;
  onAvatarPress?: () => void;
}

export function AccountHero({ name, email, avatarUrl, onAvatarPress }: AccountHeroProps) {
  const initial = (name?.[0] ?? "A").toUpperCase();
  return (
    <View
      style={{
        marginHorizontal: 20,
        marginTop: 4,
        marginBottom: 12,
        paddingVertical: 14,
        paddingLeft: 12,
        paddingRight: 16,
        backgroundColor: C.stone,
        borderRadius: 26,
        flexDirection: "row",
        alignItems: "center",
        gap: 14,
      }}
    >
      <Pressable
        onPress={onAvatarPress}
        hitSlop={6}
        style={({ pressed }) => ({ width: 54, height: 54, opacity: pressed ? 0.7 : 1 })}
      >
        <Avatar avatarUrl={avatarUrl ?? null} fallbackLetter={initial} size={54} />
      </Pressable>
      <View style={{ flex: 1 }}>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 17,
            fontFamily: "Quicksand_700Bold", fontWeight: "700",
            color: C.earth,
            letterSpacing: -0.2,
          }}
        >
          {name}
        </Text>
        <Text
          numberOfLines={1}
          style={{
            fontSize: 13,
            color: C.rock,
            marginTop: 2,
          }}
        >
          {email}
        </Text>
      </View>
    </View>
  );
}
