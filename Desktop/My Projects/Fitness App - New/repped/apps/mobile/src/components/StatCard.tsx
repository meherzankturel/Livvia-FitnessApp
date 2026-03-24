import { View, Text } from "react-native";

interface Props {
  label: string;
  value: string | number;
  color?: string;
  suffix?: string;
}

export default function StatCard({ label, value, color = "#2D2A24", suffix }: Props) {
  return (
    <View style={{ flex: 1, borderRadius: 20, padding: 16, backgroundColor: "#EDEBE5" }}>
      <Text style={{ fontSize: 10, textTransform: "uppercase", letterSpacing: 1, color: "#8E8E7A", marginBottom: 4 }}>{label}</Text>
      <Text style={{ fontSize: 24, fontWeight: "700", color }}>
        {value}
        {suffix && <Text style={{ fontSize: 14, fontWeight: "400", color: "#8E8E7A" }}> {suffix}</Text>}
      </Text>
    </View>
  );
}
