import { Text } from "react-native";
import tw from "../lib/tw";

interface Props {
  text: string;
}

export default function SectionLabel({ text }: Props) {
  return (
    <Text style={tw`text-gray-500 text-[10px] uppercase tracking-widest mb-3`}>{text}</Text>
  );
}
