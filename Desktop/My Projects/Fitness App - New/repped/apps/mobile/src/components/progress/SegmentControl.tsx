import { View, Text, Pressable, StyleSheet } from "react-native";

const earth = "#2D2A24";
const sand = "#F6F5F0";
const rock = "#8E8E7A";
const stone = "#EDEBE5";

interface Props {
  tabs: string[];
  active: number;
  onChange: (index: number) => void;
}

export function SegmentControl({ tabs, active, onChange }: Props) {
  return (
    <View style={s.container}>
      {tabs.map((label, i) => {
        const isActive = i === active;
        return (
          <Pressable
            key={label}
            onPress={() => onChange(i)}
            style={[s.pill, isActive && s.pillActive]}
          >
            <Text style={[s.label, isActive && s.labelActive]}>{label}</Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const s = StyleSheet.create({
  container: {
    flexDirection: "row",
    backgroundColor: stone,
    borderRadius: 14,
    padding: 3,
    marginBottom: 24,
  },
  pill: {
    flex: 1,
    paddingVertical: 10,
    borderRadius: 12,
    alignItems: "center",
  },
  pillActive: {
    backgroundColor: earth,
  },
  label: {
    fontSize: 12,
    fontWeight: "600",
    color: rock,
  },
  labelActive: {
    color: sand,
  },
});
