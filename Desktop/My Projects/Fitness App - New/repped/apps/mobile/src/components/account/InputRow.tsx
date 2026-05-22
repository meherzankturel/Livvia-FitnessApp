import { Pressable, View, Text, TextInput } from "react-native";
import type { ReactNode } from "react";

const C = {
  earth: "#1A1A1A",
  rock: "#9A9A92",
  sand: "#F6F5F0",
  stone: "#EDEBE5",
  chev: "#B8B8AE",
};

interface BaseRowProps {
  label: string;
  isFirst?: boolean;
}

interface ReadonlyValueProps extends BaseRowProps {
  variant: "readonly";
  value: string;
}

interface TappableProps extends BaseRowProps {
  variant: "tappable";
  value: string;
  onPress: () => void;
}

interface TextInputProps extends BaseRowProps {
  variant: "text-input";
  value: string;
  onChangeText: (v: string) => void;
  placeholder?: string;
  width?: number;
}

interface NumberInputProps extends BaseRowProps {
  variant: "number-input";
  value: number;
  onChangeNumber: (v: number) => void;
  min?: number;
  max?: number;
  width?: number;
}

interface CustomProps extends BaseRowProps {
  variant: "custom";
  right: ReactNode;
}

export type InputRowProps =
  | ReadonlyValueProps
  | TappableProps
  | TextInputProps
  | NumberInputProps
  | CustomProps;

export function InputRow(props: InputRowProps) {
  const rowStyle = {
    flexDirection: "row" as const,
    alignItems: "center" as const,
    paddingVertical: 10,
    gap: 12,
    borderTopWidth: props.isFirst ? 0 : 0.5,
    borderTopColor: "rgba(0,0,0,0.06)",
  };

  const labelStyle = {
    flex: 1,
    fontSize: 13,
    color: C.earth,
    fontFamily: "Quicksand_500Medium", fontWeight: "500" as const,
  };

  if (props.variant === "readonly") {
    return (
      <View style={rowStyle}>
        <Text style={labelStyle}>{props.label}</Text>
        <Text style={{ fontSize: 14, fontFamily: "Quicksand_400Regular", fontWeight: "400", color: C.rock, paddingVertical: 6 }}>
          {props.value}
        </Text>
      </View>
    );
  }

  if (props.variant === "tappable") {
    return (
      <Pressable
        onPress={props.onPress}
        style={({ pressed }) => [
          rowStyle,
          { backgroundColor: pressed ? "rgba(0,0,0,0.025)" : "transparent", borderRadius: 8 },
        ]}
      >
        <Text style={labelStyle}>{props.label}</Text>
        <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>{props.value}</Text>
        <Text style={{ fontSize: 16, color: C.rock }}>›</Text>
      </Pressable>
    );
  }

  if (props.variant === "text-input") {
    return (
      <View style={rowStyle}>
        <Text style={labelStyle}>{props.label}</Text>
        <TextInput
          value={props.value}
          onChangeText={props.onChangeText}
          placeholder={props.placeholder}
          placeholderTextColor={C.rock}
          style={{
            backgroundColor: C.sand,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
            color: C.earth,
            textAlign: "right",
            width: props.width ?? 140,
          }}
        />
      </View>
    );
  }

  if (props.variant === "number-input") {
    return (
      <View style={rowStyle}>
        <Text style={labelStyle}>{props.label}</Text>
        <TextInput
          value={String(props.value)}
          onChangeText={(t) => {
            const n = parseInt(t.replace(/[^0-9]/g, ""), 10);
            if (!isNaN(n)) props.onChangeNumber(n);
            else if (t === "") props.onChangeNumber(0);
          }}
          keyboardType="number-pad"
          style={{
            backgroundColor: C.sand,
            paddingHorizontal: 14,
            paddingVertical: 8,
            borderRadius: 10,
            fontSize: 14,
            fontFamily: "Quicksand_600SemiBold", fontWeight: "600",
            color: C.earth,
            textAlign: "right",
            width: props.width ?? 100,
          }}
        />
      </View>
    );
  }

  // custom
  return (
    <View style={rowStyle}>
      <Text style={labelStyle}>{props.label}</Text>
      {props.right}
    </View>
  );
}
