import { View, Text, Pressable, Modal, ScrollView, Image, Alert, ActivityIndicator } from "react-native";
import { useState } from "react";
import * as ImagePicker from "expo-image-picker";
import * as ImageManipulator from "expo-image-manipulator";
import { supabase } from "../lib/supabase";
import { Avatar, DEFAULT_AVATARS } from "./Avatar";

const C = {
  earth: "#2D2A24",
  bg: "#F6F5F0",
  stone: "#EDEBE5",
  rock: "#8E8E7A",
  trail: "#34D399",
  border: "rgba(45,42,36,0.06)",
};

interface AvatarPickerProps {
  visible: boolean;
  userId: string;
  currentAvatar: string | null;
  displayName: string;
  onClose: () => void;
  onAvatarChanged: (newUrl: string) => void;
}

export function AvatarPicker({ visible, userId, currentAvatar, displayName, onClose, onAvatarChanged }: AvatarPickerProps) {
  const [uploading, setUploading] = useState(false);
  const [section, setSection] = useState<"options" | "defaults" | "preview">("options");

  const compressAndUpload = async (uri: string) => {
    setUploading(true);
    try {
      const manipulated = await ImageManipulator.manipulateAsync(
        uri,
        [{ resize: { width: 300, height: 300 } }],
        { compress: 0.8, format: ImageManipulator.SaveFormat.JPEG }
      );

      const response = await fetch(manipulated.uri);
      const blob = await response.blob();

      const fileName = `${userId}/avatar-${Date.now()}.jpg`;
      const { error: uploadError } = await supabase.storage
        .from("avatars")
        .upload(fileName, blob, { contentType: "image/jpeg", upsert: true });

      if (uploadError) {
        Alert.alert("Upload Failed", uploadError.message);
        setUploading(false);
        return;
      }

      const { data: urlData } = supabase.storage
        .from("avatars")
        .getPublicUrl(fileName);

      await supabase
        .from("profiles")
        .update({ avatar_url: urlData.publicUrl })
        .eq("id", userId);

      onAvatarChanged(urlData.publicUrl);
      onClose();
    } catch (err: any) {
      Alert.alert("Error", err.message || "Failed to upload photo");
    }
    setUploading(false);
  };

  const handleCamera = async () => {
    const { status } = await ImagePicker.requestCameraPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Camera access is needed to take a photo.");
      return;
    }
    const result = await ImagePicker.launchCameraAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8,
    });
    if (!result.canceled && result.assets[0]) {
      await compressAndUpload(result.assets[0].uri);
    }
  };

  const handleGallery = async () => {
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== "granted") {
      Alert.alert("Permission Required", "Photo library access is needed to select a photo.");
      return;
    }
    const result = await ImagePicker.launchImageLibraryAsync({
      allowsEditing: true, aspect: [1, 1], quality: 0.8, mediaTypes: ['images'],
    });
    if (!result.canceled && result.assets[0]) {
      await compressAndUpload(result.assets[0].uri);
    }
  };

  const handleDefaultAvatar = async (key: string) => {
    setUploading(true);
    await supabase.from("profiles").update({ avatar_url: key }).eq("id", userId);
    setUploading(false);
    onAvatarChanged(key);
    onClose();
  };

  const handleRemove = async () => {
    setUploading(true);
    await supabase.from("profiles").update({ avatar_url: null }).eq("id", userId);
    setUploading(false);
    onAvatarChanged("");
    onClose();
  };

  const defaultKeys = Object.keys(DEFAULT_AVATARS);

  return (
    <>
      {/* Main bottom sheet */}
      <Modal visible={visible && section !== "preview"} animationType="slide" transparent>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.4)", justifyContent: "flex-end" }}
          onPress={onClose}
        >
          <Pressable
            style={{
              backgroundColor: C.bg, borderTopLeftRadius: 24, borderTopRightRadius: 24,
              paddingTop: 12, paddingBottom: 40, maxHeight: "80%",
            }}
            onPress={() => {}}
          >
            {/* Handle bar */}
            <View style={{ width: 36, height: 4, borderRadius: 2, backgroundColor: "rgba(45,42,36,0.12)", alignSelf: "center", marginBottom: 16 }} />

            {uploading ? (
              <View style={{ padding: 40, alignItems: "center" }}>
                <ActivityIndicator size="large" color={C.earth} />
                <Text style={{ color: C.rock, fontSize: 14, marginTop: 12 }}>Uploading...</Text>
              </View>
            ) : section === "options" ? (
              <View style={{ paddingHorizontal: 24 }}>
                <Text style={{ fontSize: 18, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth, marginBottom: 20 }}>
                  Profile Picture
                </Text>

                {/* Current avatar preview */}
                <Pressable
                  onPress={() => currentAvatar ? setSection("preview") : null}
                  style={{ alignItems: "center", marginBottom: 24 }}
                >
                  <Avatar
                    avatarUrl={currentAvatar}
                    fallbackLetter={displayName?.[0] ?? "L"}
                    size={96}
                  />
                  {currentAvatar && (
                    <Text style={{ fontSize: 12, color: C.rock, marginTop: 8 }}>Tap to preview</Text>
                  )}
                </Pressable>

                {/* Take Photo */}
                <Pressable
                  onPress={handleCamera}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    backgroundColor: C.stone, borderRadius: 16, padding: 16, marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>📷</Text>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Take Photo</Text>
                    <Text style={{ fontSize: 12, color: C.rock }}>Use your camera</Text>
                  </View>
                </Pressable>

                {/* Choose from Gallery */}
                <Pressable
                  onPress={handleGallery}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    backgroundColor: C.stone, borderRadius: 16, padding: 16, marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>🖼️</Text>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Choose from Gallery</Text>
                    <Text style={{ fontSize: 12, color: C.rock }}>Pick from your photos</Text>
                  </View>
                </Pressable>

                {/* Choose Default Avatar */}
                <Pressable
                  onPress={() => setSection("defaults")}
                  style={{
                    flexDirection: "row", alignItems: "center", gap: 14,
                    backgroundColor: C.stone, borderRadius: 16, padding: 16, marginBottom: 10,
                  }}
                >
                  <Text style={{ fontSize: 22 }}>😊</Text>
                  <View>
                    <Text style={{ fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Choose an Avatar</Text>
                    <Text style={{ fontSize: 12, color: C.rock }}>Pick from our illustrations</Text>
                  </View>
                </Pressable>

                {/* Remove Photo */}
                {currentAvatar && (
                  <Pressable onPress={handleRemove} style={{ alignItems: "center", padding: 14, marginTop: 4 }}>
                    <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: "#EF4444" }}>Remove Photo</Text>
                  </Pressable>
                )}
              </View>
            ) : section === "defaults" ? (
              <View style={{ paddingHorizontal: 24 }}>
                <View style={{ flexDirection: "row", alignItems: "center", gap: 12, marginBottom: 20 }}>
                  <Pressable onPress={() => setSection("options")}>
                    <Text style={{ fontSize: 20, color: C.rock }}>←</Text>
                  </Pressable>
                  <Text style={{ fontSize: 18, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth }}>Choose an Avatar</Text>
                </View>
                <ScrollView showsVerticalScrollIndicator={false}>
                  <View style={{ flexDirection: "row", flexWrap: "wrap", gap: 12, paddingBottom: 20 }}>
                    {defaultKeys.map((key) => (
                      <Pressable
                        key={key}
                        onPress={() => handleDefaultAvatar(key)}
                        style={{
                          width: "30%", aspectRatio: 1, borderRadius: 20, overflow: "hidden",
                          borderWidth: 3, borderColor: currentAvatar === key ? C.trail : "transparent",
                        }}
                      >
                        <Image
                          source={DEFAULT_AVATARS[key]}
                          style={{ width: "100%", height: "100%" }}
                          resizeMode="cover"
                        />
                      </Pressable>
                    ))}
                  </View>
                </ScrollView>
              </View>
            ) : null}
          </Pressable>
        </Pressable>
      </Modal>

      {/* Animated popup preview */}
      <Modal visible={visible && section === "preview"} animationType="fade" transparent>
        <Pressable
          style={{ flex: 1, backgroundColor: "rgba(0,0,0,0.5)", justifyContent: "center", alignItems: "center" }}
          onPress={() => setSection("options")}
        >
          <Pressable
            style={{
              backgroundColor: C.bg, borderRadius: 28, padding: 28,
              alignItems: "center", width: 280,
              shadowColor: "#000", shadowOffset: { width: 0, height: 12 },
              shadowOpacity: 0.2, shadowRadius: 24, elevation: 12,
            }}
            onPress={() => {}}
          >
            <Avatar
              avatarUrl={currentAvatar}
              fallbackLetter={displayName?.[0] ?? "L"}
              size={180}
            />
            <Text style={{ fontSize: 18, fontFamily: "Quicksand_700Bold", fontWeight: "700", color: C.earth, marginTop: 16 }}>
              {displayName}
            </Text>
            <Text style={{ fontSize: 13, color: C.rock, marginTop: 4 }}>Profile Picture</Text>

            <Pressable
              onPress={() => setSection("options")}
              style={{
                marginTop: 20, backgroundColor: C.stone, borderRadius: 12,
                paddingVertical: 10, paddingHorizontal: 24,
              }}
            >
              <Text style={{ fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: C.earth }}>Close</Text>
            </Pressable>
          </Pressable>
        </Pressable>
      </Modal>
    </>
  );
}
