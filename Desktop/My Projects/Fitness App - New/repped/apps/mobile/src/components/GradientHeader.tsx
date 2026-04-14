import { View, Text } from "react-native";
import tw from "../lib/tw";

interface Props {
  subtitle?: string;
  title: string;
  rightElement?: React.ReactNode;
}

export default function GradientHeader({ subtitle, title, rightElement }: Props) {
  return (
    <View style={tw`px-6 pt-16 pb-4`}>
      {/* Simulated gradient with layered opacity views */}
      <View style={[tw`absolute inset-0`, { backgroundColor: "#6366F1", opacity: 0.06 }]} />
      <View style={[tw`absolute inset-0`, { backgroundColor: "#000", opacity: 0 }]} />
      <View style={tw`flex-row justify-between items-start`}>
        <View style={tw`flex-1`}>
          {subtitle && (
            <Text style={tw`text-[#6366F1] text-sm font-medium mb-1`}>{subtitle}</Text>
          )}
          <Text style={tw`text-white text-3xl font-bold`}>{title}</Text>
        </View>
        {rightElement}
      </View>
    </View>
  );
}
