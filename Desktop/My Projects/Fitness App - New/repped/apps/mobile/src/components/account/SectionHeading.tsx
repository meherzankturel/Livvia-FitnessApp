import { Text } from "react-native";

interface SectionHeadingProps {
  children: string;
}

export function SectionHeading({ children }: SectionHeadingProps) {
  return (
    <Text
      style={{
        fontSize: 22,
        fontFamily: "Quicksand_700Bold", fontWeight: "800",
        color: "#1A1A1A",
        letterSpacing: -0.3,
        marginHorizontal: 26,
        marginTop: 20,
        marginBottom: 14,
      }}
    >
      {children}
    </Text>
  );
}
