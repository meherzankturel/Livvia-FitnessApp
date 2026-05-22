/**
 * Animated splash screen.
 *
 * Mounted as a full-screen overlay in app/_layout.tsx and unmounts once
 * (a) its entry animation completes AND (b) bootstrap (auth resolve + nav
 * ready) is done — whichever finishes last. The cream background matches
 * the native splash configured in app.json so the handoff is invisible.
 *
 * Expo Go-safe: built-in Animated API only (no Reanimated worklets, no SVG).
 */

import { useEffect, useRef, useState } from "react";
import { View, Animated, Easing, StyleSheet } from "react-native";
import { ReviveWordmark } from "./ReviveWordmark";

const C = {
  plate: "#F5EFE3",
  navy: "#1E3A8A",
};

const WORDMARK_SIZE = 64;
// Wordmark width at size N ≈ N × 4.2 (sum of letter widths + 5 gaps). At 64 → ~270pt.
// Comeback line target: 75% of that.
const LINE_WIDTH_TARGET = Math.round(WORDMARK_SIZE * 4.2 * 0.75);

interface SplashAnimationProps {
  /** Set to true once the app's bootstrap (auth resolve, navigation ready) is complete. */
  ready: boolean;
  /** Called after the exit fade-out completes — parent should unmount this component. */
  onComplete: () => void;
}

export function SplashAnimation({ ready, onComplete }: SplashAnimationProps) {
  const wordmarkOpacity = useRef(new Animated.Value(0)).current;
  const wordmarkScale = useRef(new Animated.Value(0.94)).current;
  const lineWidth = useRef(new Animated.Value(0)).current;
  const containerOpacity = useRef(new Animated.Value(1)).current;

  const [enterComplete, setEnterComplete] = useState(false);

  // ── Enter sequence (mirrors the mockup) ───────────────────────────────────
  useEffect(() => {
    Animated.sequence([
      Animated.delay(150),
      Animated.parallel([
        Animated.timing(wordmarkOpacity, {
          toValue: 1,
          duration: 650,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
        Animated.timing(wordmarkScale, {
          toValue: 1,
          duration: 650,
          easing: Easing.bezier(0.22, 1, 0.36, 1),
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(120),
      Animated.timing(lineWidth, {
        toValue: LINE_WIDTH_TARGET,
        duration: 450,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
        useNativeDriver: false,
      }),
    ]).start(() => setEnterComplete(true));
  }, []);

  // ── Exit fade once both enter is done AND parent says we're ready ─────────
  useEffect(() => {
    if (!enterComplete || !ready) return;
    Animated.sequence([
      Animated.delay(180),
      Animated.timing(containerOpacity, {
        toValue: 0,
        duration: 400,
        easing: Easing.bezier(0.65, 0, 0.35, 1),
        useNativeDriver: true,
      }),
    ]).start(() => onComplete());
  }, [enterComplete, ready]);

  return (
    <Animated.View
      style={[s.container, { opacity: containerOpacity }]}
      pointerEvents="none"
    >
      <Animated.View
        style={[s.center, { opacity: wordmarkOpacity, transform: [{ scale: wordmarkScale }] }]}
      >
        <ReviveWordmark size={WORDMARK_SIZE} />
        <Animated.View style={[s.line, { width: lineWidth }]} />
      </Animated.View>
    </Animated.View>
  );
}

const s = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: C.plate,
    alignItems: "center",
    justifyContent: "center",
    zIndex: 1000,
  },
  center: { alignItems: "center" },
  line: {
    marginTop: 22,
    height: 1.4,
    backgroundColor: C.navy,
    opacity: 0.55,
    borderRadius: 1,
  },
});
