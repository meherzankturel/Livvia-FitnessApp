import { View } from "react-native";
import type { ReactNode } from "react";

interface FormGroupProps {
  children: ReactNode;
}

/**
 * White card container that holds InputRow children with hairline separators between them.
 * Matches the Profile sub-screen pattern: form-label heading + form-group container.
 */
export function FormGroup({ children }: FormGroupProps) {
  return (
    <View
      style={{
        backgroundColor: "#FFFFFF",
        borderRadius: 16,
        padding: 16,
        borderWidth: 1,
        borderColor: "rgba(0,0,0,0.05)",
      }}
    >
      {children}
    </View>
  );
}
