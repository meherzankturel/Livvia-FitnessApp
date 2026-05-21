import { Modal, View, Text, Pressable, ScrollView } from "react-native";

const C = {
  earth: "#1A1A1A",
  sand: "#FFFFFF",
  stone: "#F2F1ED",
  rock: "#9A9A92",
  trail: "#34D399",
};

export interface PickerOption<T> {
  value: T;
  label: string;
}

interface PickerSheetProps<T extends string | number> {
  visible: boolean;
  title: string;
  options: PickerOption<T>[];
  current: T | T[];
  multi?: boolean;
  compact?: boolean;
  onCancel: () => void;
  onSingleSelect?: (value: T) => void;
  onMultiSelect?: (values: T[]) => void;
}

export function PickerSheet<T extends string | number>(props: PickerSheetProps<T>) {
  const {
    visible, title, options, current, multi, compact,
    onCancel, onSingleSelect, onMultiSelect,
  } = props;

  const currentArr = Array.isArray(current) ? current : [current];

  const handleTap = (value: T) => {
    if (multi) {
      const arr = currentArr as T[];
      const next = arr.includes(value) ? arr.filter((v) => v !== value) : [...arr, value];
      onMultiSelect?.(next);
    } else {
      onSingleSelect?.(value);
    }
  };

  return (
    <Modal visible={visible} transparent animationType="fade" onRequestClose={onCancel}>
      <Pressable
        onPress={onCancel}
        style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
      >
        <Pressable
          onPress={(e) => e.stopPropagation()}
          style={{
            backgroundColor: C.sand,
            borderTopLeftRadius: 28,
            borderTopRightRadius: 28,
            paddingTop: 12,
            paddingHorizontal: 20,
            paddingBottom: 28,
            maxHeight: "72%",
          }}
        >
          {/* Handle */}
          <View
            style={{
              width: 36, height: 4,
              backgroundColor: C.stone,
              borderRadius: 2,
              alignSelf: "center",
              marginBottom: 14,
            }}
          />

          {/* Header */}
          <View
            style={{
              flexDirection: "row",
              justifyContent: "space-between",
              alignItems: "center",
              marginBottom: 16,
            }}
          >
            <Pressable onPress={onCancel} hitSlop={12}>
              <Text style={{ fontSize: 14, color: C.rock, fontWeight: "600", minWidth: 60 }}>
                Cancel
              </Text>
            </Pressable>
            <Text style={{ fontSize: 16, fontWeight: "800", color: C.earth, flex: 1, textAlign: "center" }}>
              {title}
            </Text>
            {multi ? (
              <Pressable onPress={() => onMultiSelect?.(currentArr as T[])} hitSlop={12}>
                <Text style={{ fontSize: 14, color: C.earth, fontWeight: "800", minWidth: 60, textAlign: "right" }}>
                  Done
                </Text>
              </Pressable>
            ) : (
              <View style={{ minWidth: 60 }} />
            )}
          </View>

          {/* Options */}
          {compact ? (
            <ScrollView
              showsVerticalScrollIndicator={false}
              contentContainerStyle={{
                flexDirection: "row",
                flexWrap: "wrap",
                gap: 10,
                paddingBottom: 8,
              }}
            >
              {options.map((opt) => {
                const selected = currentArr.includes(opt.value);
                return (
                  <Pressable
                    key={String(opt.value)}
                    onPress={() => handleTap(opt.value)}
                    style={({ pressed }) => ({
                      width: "48%",
                      paddingVertical: 18,
                      paddingHorizontal: 10,
                      backgroundColor: selected ? C.earth : (pressed ? "#E2DED6" : C.stone),
                      borderRadius: 16,
                      alignItems: "center",
                      justifyContent: "center",
                      minHeight: 64,
                      position: "relative",
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 14,
                        fontWeight: "500",
                        color: selected ? "#FFFFFF" : C.earth,
                        textAlign: "center",
                      }}
                    >
                      {opt.label}
                    </Text>
                    {selected && (
                      <View
                        style={{
                          position: "absolute",
                          top: 8, right: 8,
                          width: 16, height: 16,
                          borderRadius: 8,
                          backgroundColor: C.trail,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 9, color: C.earth, fontWeight: "800" }}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          ) : (
            <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={{ gap: 8, paddingBottom: 8 }}>
              {options.map((opt) => {
                const selected = currentArr.includes(opt.value);
                return (
                  <Pressable
                    key={String(opt.value)}
                    onPress={() => handleTap(opt.value)}
                    style={({ pressed }) => ({
                      paddingVertical: 14,
                      paddingHorizontal: 18,
                      backgroundColor: selected ? C.earth : (pressed ? "#E2DED6" : C.stone),
                      borderRadius: 18,
                      flexDirection: "row",
                      alignItems: "center",
                      justifyContent: "space-between",
                    })}
                  >
                    <Text
                      style={{
                        fontSize: 15,
                        fontWeight: "500",
                        color: selected ? "#FFFFFF" : C.earth,
                        flex: 1,
                        paddingRight: 12,
                      }}
                    >
                      {opt.label}
                    </Text>
                    {selected && (
                      <View
                        style={{
                          width: 18, height: 18,
                          borderRadius: 9,
                          backgroundColor: C.trail,
                          alignItems: "center",
                          justifyContent: "center",
                        }}
                      >
                        <Text style={{ fontSize: 10, color: C.earth, fontWeight: "800" }}>✓</Text>
                      </View>
                    )}
                  </Pressable>
                );
              })}
            </ScrollView>
          )}
        </Pressable>
      </Pressable>
    </Modal>
  );
}
