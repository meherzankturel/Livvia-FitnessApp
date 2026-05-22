import { Alert, Linking, Pressable, Text, View } from "react-native";
import { router } from "expo-router";
import * as Clipboard from "expo-clipboard";
import {
  SubScreenLayout,
  FormLabel,
  SubSection,
} from "../../src/components/account/SubScreenLayout";
import { FormGroup } from "../../src/components/account/FormGroup";
import { InputRow } from "../../src/components/account/InputRow";

const SUPPORT_EMAIL = "support@revive.app";

async function copyEmail() {
  await Clipboard.setStringAsync(SUPPORT_EMAIL);
  Alert.alert("Copied", SUPPORT_EMAIL);
}

async function openGmail() {
  const deepLink = `googlegmail://co?to=${SUPPORT_EMAIL}`;
  const can = await Linking.canOpenURL(deepLink).catch(() => false);
  if (can) {
    Linking.openURL(deepLink);
  } else {
    // Fallback to web Gmail compose
    Linking.openURL(`https://mail.google.com/mail/?view=cm&to=${SUPPORT_EMAIL}`).catch(() => {});
  }
}

function openMail() {
  Linking.openURL(`mailto:${SUPPORT_EMAIL}`).catch(() => {
    Alert.alert("No mail app", "No email app is set up. Try Copy to copy the address.");
  });
}

function presentContactSheet() {
  Alert.alert(
    "Contact us",
    SUPPORT_EMAIL,
    [
      { text: "Open in Gmail", onPress: () => { void openGmail(); } },
      { text: "Open in Mail", onPress: openMail },
      { text: "Copy email", onPress: () => { void copyEmail(); } },
      { text: "Cancel", style: "cancel" },
    ],
    { cancelable: true }
  );
}

/** Custom row that supports both tap (action sheet) and long-press (instant copy). */
function ContactRow() {
  return (
    <Pressable
      onPress={presentContactSheet}
      onLongPress={() => { void copyEmail(); }}
      delayLongPress={400}
      style={({ pressed }) => ({
        flexDirection: "row",
        alignItems: "center",
        paddingVertical: 10,
        gap: 12,
        backgroundColor: pressed ? "rgba(0,0,0,0.025)" : "transparent",
        borderRadius: 8,
      })}
    >
      <Text style={{ flex: 1, fontSize: 13, fontFamily: "Quicksand_500Medium", fontWeight: "500", color: "#1A1A1A" }}>
        Contact us
      </Text>
      <Text style={{ fontSize: 13, color: "#9A9A92" }}>{SUPPORT_EMAIL}</Text>
      <Text style={{ fontSize: 16, color: "#9A9A92" }}>›</Text>
    </Pressable>
  );
}

export default function AccountHelp() {
  return (
    <SubScreenLayout title="Help & Legal">
      <SubSection>
        <FormLabel>Get in touch</FormLabel>
        <FormGroup>
          <ContactRow />
        </FormGroup>
        <Text style={{ fontSize: 11, color: "#9A9A92", marginTop: 6, marginLeft: 2 }}>
          Long-press the row to copy the email.
        </Text>
      </SubSection>

      <SubSection>
        <FormLabel>Legal</FormLabel>
        <FormGroup>
          <InputRow
            variant="tappable"
            label="Privacy Policy"
            value=""
            onPress={() => router.push("/(app)/privacy-policy" as any)}
            isFirst
          />
          <InputRow
            variant="tappable"
            label="Terms & Conditions"
            value=""
            onPress={() => router.push("/(app)/terms-conditions" as any)}
          />
        </FormGroup>
      </SubSection>

      <Text
        style={{
          textAlign: "center",
          fontSize: 11,
          color: "#9A9A92",
          marginTop: 4,
          opacity: 0.7,
        }}
      >
        Revive v1.2.4 (build 124)
      </Text>
    </SubScreenLayout>
  );
}
