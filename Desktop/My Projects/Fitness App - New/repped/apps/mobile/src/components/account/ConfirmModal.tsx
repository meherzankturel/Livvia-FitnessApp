import { Modal, View, Text, Pressable } from "react-native";

const C = {
  earth: "#1A1A1A",
  stone: "#F2F1ED",
  rock: "#9A9A92",
};

export interface DiffItem {
  label: string;
  from: string;
  to: string;
}

interface ConfirmModalProps {
  visible: boolean;
  title: string;
  diffs?: DiffItem[];
  effects?: string[];
  body?: string;
  cancelLabel?: string;
  applyLabel?: string;
  destructive?: boolean;
  onCancel: () => void;
  onApply: () => void;
}

export function ConfirmModal(props: ConfirmModalProps) {
  const {
    visible, title, diffs, effects, body,
    cancelLabel = "Cancel", applyLabel = "Continue",
    destructive, onCancel, onApply,
  } = props;

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <View style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", alignItems: "center", justifyContent: "center" }}>
        <View
          style={{
            backgroundColor: "#FFFFFF",
            borderRadius: 22,
            width: "88%",
            maxWidth: 380,
            padding: 22,
          }}
        >
          <Text
            style={{
              fontSize: 17,
              fontWeight: "800",
              color: C.earth,
              letterSpacing: -0.2,
              marginBottom: 16,
            }}
          >
            {title}
          </Text>

          {body && (
            <Text style={{ fontSize: 13, color: C.rock, lineHeight: 20, marginBottom: 18 }}>
              {body}
            </Text>
          )}

          {diffs && diffs.length > 0 && (
            <View style={{ marginBottom: 14 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: C.rock,
                  letterSpacing: 1.4,
                  marginBottom: 8,
                }}
              >
                WHAT YOU CHANGED
              </Text>
              {diffs.map((d, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
                  <Text style={{ color: C.rock, marginRight: 8, fontWeight: "700" }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: C.earth, lineHeight: 19 }}>
                    {d.label}: <Text style={{ fontWeight: "700" }}>{d.from}</Text> → <Text style={{ fontWeight: "700" }}>{d.to}</Text>
                  </Text>
                </View>
              ))}
            </View>
          )}

          {effects && effects.length > 0 && (
            <View style={{ marginBottom: 18 }}>
              <Text
                style={{
                  fontSize: 10,
                  fontWeight: "700",
                  color: C.rock,
                  letterSpacing: 1.4,
                  marginBottom: 8,
                }}
              >
                WHAT HAPPENS
              </Text>
              {effects.map((e, i) => (
                <View key={i} style={{ flexDirection: "row", alignItems: "flex-start", marginBottom: 4 }}>
                  <Text style={{ color: C.rock, marginRight: 8, fontWeight: "700" }}>•</Text>
                  <Text style={{ flex: 1, fontSize: 13, color: C.earth, lineHeight: 19 }}>{e}</Text>
                </View>
              ))}
            </View>
          )}

          <View style={{ flexDirection: "row", gap: 8 }}>
            <Pressable
              onPress={onCancel}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: pressed ? "#E2DED6" : C.stone,
                alignItems: "center",
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: C.earth }}>{cancelLabel}</Text>
            </Pressable>
            <Pressable
              onPress={onApply}
              style={({ pressed }) => ({
                flex: 1,
                paddingVertical: 12,
                borderRadius: 14,
                backgroundColor: destructive ? "#EF4444" : C.earth,
                opacity: pressed ? 0.85 : 1,
                alignItems: "center",
              })}
            >
              <Text style={{ fontSize: 14, fontWeight: "700", color: "#FFFFFF" }}>{applyLabel}</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
