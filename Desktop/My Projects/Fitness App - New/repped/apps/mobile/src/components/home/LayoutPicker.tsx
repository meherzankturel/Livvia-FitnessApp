import { View, Text, Pressable } from "react-native";

interface Props {
  current: "A" | "B" | "C";
  onChange: (layout: "A" | "B" | "C") => void;
}

/** Subtle layout switcher — small dots, not competing with content */
export default function LayoutPicker({ current, onChange }: Props) {
  const options: { key: "A" | "B" | "C" }[] = [{ key: "A" }, { key: "B" }, { key: "C" }];

  return (
    <View style={{ flexDirection: "row", justifyContent: "center", gap: 8, marginBottom: 24 }}>
      {options.map((o) => (
        <Pressable
          key={o.key}
          onPress={() => onChange(o.key)}
          style={{
            width: current === o.key ? 24 : 8,
            height: 8,
            borderRadius: 4,
            backgroundColor: current === o.key ? "#6366F1" : "#E5E5EA",
          }}
        />
      ))}
    </View>
  );
}
