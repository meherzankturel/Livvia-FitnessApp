import { View, Text, Modal, Pressable, Animated, Easing } from "react-native";
import { useEffect, useRef } from "react";
import tw from "../lib/tw";
import HexBadge from "./HexBadge";

interface Props {
  visible: boolean;
  onClose: () => void;
  badge: {
    icon: string;
    name: string;
    description: string;
    category: string;
    earned: boolean;
    color: "blue" | "green" | "orange" | "red" | "purple" | "cyan" | "gold" | "lime" | "teal";
    tier: "bronze" | "silver" | "gold";
    earnedDate?: string;
  } | null;
}

/** Difficulty mapping for display */
const TIER_LABELS: Record<string, { label: string; color: string }> = {
  bronze: { label: "Common", color: "#CD7F32" },
  silver: { label: "Rare", color: "#A8A8AD" },
  gold: { label: "Legendary", color: "#FFD700" },
};

/** Category-specific unlock hints */
const UNLOCK_HINTS: Record<string, string> = {
  workout: "Complete workouts consistently to earn this",
  streak: "Maintain your workout streak week after week",
  progress: "Hit personal records and track your gains",
  nutrition: "Log your nutrition and follow your meal plan",
  social: "Share your achievements with friends",
  consistency: "Show up every day — dedication pays off",
  volume: "Push your total volume higher each session",
  milestone: "Reach key strength milestones",
  recovery: "Take rest days and deload when needed",
};

export default function AwardPreviewModal({ visible, onClose, badge }: Props) {
  // Entrance animations
  const scaleAnim = useRef(new Animated.Value(0.3)).current;
  const opacityAnim = useRef(new Animated.Value(0)).current;
  const rotateAnim = useRef(new Animated.Value(0)).current;
  const shineAnim = useRef(new Animated.Value(0)).current;
  const badgeY = useRef(new Animated.Value(30)).current;

  useEffect(() => {
    if (visible && badge) {
      // Reset
      scaleAnim.setValue(0.3);
      opacityAnim.setValue(0);
      rotateAnim.setValue(0);
      shineAnim.setValue(0);
      badgeY.setValue(30);

      // Entrance sequence
      Animated.parallel([
        // Backdrop fade in
        Animated.timing(opacityAnim, {
          toValue: 1,
          duration: 200,
          useNativeDriver: true,
        }),
        // Badge bounces in
        Animated.spring(scaleAnim, {
          toValue: 1,
          damping: 12,
          stiffness: 150,
          mass: 0.8,
          useNativeDriver: true,
        }),
        // Badge slides up
        Animated.spring(badgeY, {
          toValue: 0,
          damping: 14,
          stiffness: 120,
          useNativeDriver: true,
        }),
      ]).start(() => {
        // After entrance, start continuous animations
        if (badge.earned) {
          // Slow continuous rotation for earned badges
          Animated.loop(
            Animated.sequence([
              Animated.timing(rotateAnim, {
                toValue: 1,
                duration: 4000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(rotateAnim, {
                toValue: 0,
                duration: 4000,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ).start();

          // Shine sweep
          Animated.loop(
            Animated.sequence([
              Animated.timing(shineAnim, {
                toValue: 1,
                duration: 2000,
                easing: Easing.inOut(Easing.ease),
                useNativeDriver: true,
              }),
              Animated.delay(3000),
              Animated.timing(shineAnim, {
                toValue: 0,
                duration: 0,
                useNativeDriver: true,
              }),
            ])
          ).start();
        } else {
          // Subtle pulse for locked badges
          Animated.loop(
            Animated.sequence([
              Animated.timing(scaleAnim, {
                toValue: 1.03,
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
              Animated.timing(scaleAnim, {
                toValue: 1,
                duration: 1500,
                easing: Easing.inOut(Easing.sin),
                useNativeDriver: true,
              }),
            ])
          ).start();
        }
      });
    }
  }, [visible, badge]);

  const handleClose = () => {
    Animated.parallel([
      Animated.timing(opacityAnim, { toValue: 0, duration: 150, useNativeDriver: true }),
      Animated.timing(scaleAnim, { toValue: 0.5, duration: 150, useNativeDriver: true }),
    ]).start(() => onClose());
  };

  if (!badge) return null;

  const tierInfo = TIER_LABELS[badge.tier] || TIER_LABELS.silver;
  const rotateInterpolate = rotateAnim.interpolate({
    inputRange: [0, 1],
    outputRange: ["-5deg", "5deg"],
  });
  const shineOpacity = shineAnim.interpolate({
    inputRange: [0, 0.5, 1],
    outputRange: [0, 0.6, 0],
  });
  const shineTranslate = shineAnim.interpolate({
    inputRange: [0, 1],
    outputRange: [-60, 60],
  });

  return (
    <Modal visible={visible} transparent animationType="none" onRequestClose={handleClose}>
      <Animated.View
        style={[
          tw`flex-1 justify-center items-center`,
          { backgroundColor: "rgba(0,0,0,0.6)", opacity: opacityAnim },
        ]}
      >
        <Pressable style={tw`absolute inset-0`} onPress={handleClose} />

        {/* Award card */}
        <Animated.View
          style={[
            tw`mx-8 rounded-3xl p-8 items-center`,
            {
              backgroundColor: "#fff",
              transform: [
                { scale: scaleAnim },
                { translateY: badgeY },
              ],
              shadowColor: "#000",
              shadowOffset: { width: 0, height: 16 },
              shadowOpacity: 0.15,
              shadowRadius: 32,
              elevation: 20,
            },
          ]}
        >
          {/* Badge with rotation animation */}
          <Animated.View
            style={{
              transform: [{ rotate: rotateInterpolate }],
              marginBottom: 24,
              position: "relative",
            }}
          >
            <HexBadge
              icon={badge.icon}
              earned={badge.earned}
              color={badge.color}
              size={140}
              tier={badge.tier}
            />

            {/* Animated shine sweep overlay */}
            {badge.earned && (
              <Animated.View
                style={{
                  position: "absolute",
                  top: 10,
                  bottom: 10,
                  width: 20,
                  backgroundColor: "rgba(255,255,255,0.4)",
                  transform: [{ translateX: shineTranslate }, { rotate: "15deg" }],
                  borderRadius: 10,
                  opacity: shineOpacity,
                }}
                pointerEvents="none"
              />
            )}
          </Animated.View>

          {/* Tier badge */}
          <View
            style={[
              tw`px-4 py-1 rounded-full mb-3`,
              { backgroundColor: badge.earned ? `${tierInfo.color}20` : "#F2F2F7" },
            ]}
          >
            <Text style={{ color: badge.earned ? tierInfo.color : "#8E8E93", fontSize: 12, fontFamily: "Quicksand_700Bold", fontWeight: "700", letterSpacing: 0.5 }}>
              {tierInfo.label.toUpperCase()}
            </Text>
          </View>

          {/* Name */}
          <Text style={{ color: "#1C1C1E", fontSize: 22, fontWeight: "700", textAlign: "center", marginBottom: 8 }}>
            {badge.name}
          </Text>

          {/* Description */}
          <Text style={{ color: "#8E8E93", fontSize: 15, textAlign: "center", lineHeight: 22, marginBottom: 16 }}>
            {badge.description}
          </Text>

          {/* Status */}
          {badge.earned ? (
            <View style={[tw`w-full rounded-2xl p-4 items-center`, { backgroundColor: "rgba(34,197,94,0.08)" }]}>
              <Text style={{ color: "#22C55E", fontSize: 13, fontFamily: "Quicksand_700Bold", fontWeight: "700", letterSpacing: 0.5 }}>EARNED</Text>
              {badge.earnedDate && (
                <Text style={{ color: "#8E8E93", fontSize: 12, marginTop: 4 }}>{badge.earnedDate}</Text>
              )}
            </View>
          ) : (
            <View style={[tw`w-full rounded-2xl p-4`, { backgroundColor: "#F2F2F7" }]}>
              <Text style={{ color: "#8E8E93", fontSize: 11, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", letterSpacing: 0.5, textTransform: "uppercase", marginBottom: 4 }}>
                HOW TO UNLOCK
              </Text>
              <Text style={{ color: "#636366", fontSize: 14, lineHeight: 20 }}>
                {UNLOCK_HINTS[badge.category] || "Keep training to unlock this achievement"}
              </Text>
            </View>
          )}

          {/* Close button */}
          <Pressable
            onPress={handleClose}
            style={[tw`mt-5 w-full rounded-2xl py-3 items-center`, { backgroundColor: "#F2F2F7" }]}
          >
            <Text style={{ color: "#1C1C1E", fontSize: 16, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" }}>Close</Text>
          </Pressable>
        </Animated.View>
      </Animated.View>
    </Modal>
  );
}
