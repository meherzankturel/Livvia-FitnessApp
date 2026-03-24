/**
 * Centralized animation utilities for the app.
 *
 * CONSTRAINTS:
 * - No react-native-reanimated (crashes in Expo Go)
 * - Only React Native's built-in Animated API
 * - All animations use useNativeDriver: true (opacity + transform only)
 */

import { Animated, Easing } from 'react-native';

// ---------------------------------------------------------------------------
// Animation constants
// ---------------------------------------------------------------------------
const HEARTBEAT_DURATION = 2400; // ms
const SPRING_CONFIG = { damping: 18, stiffness: 180, mass: 0.8 };
const SPRING_BOUNCY = { damping: 12, stiffness: 200, mass: 0.6 };
const STAGGER_DELAY = 80; // ms between items

// ---------------------------------------------------------------------------
// Exported utilities
// ---------------------------------------------------------------------------

/**
 * Creates an Animated.Value that loops forever on the heartbeat rhythm:
 *   0 → 1 (30% of HEARTBEAT_DURATION, ease-out) → 0 (70%, ease-in).
 *
 * Starts immediately. Use the returned value to drive opacity or scale.
 * Represents pulse intensity (0 = resting, 1 = peak).
 */
export function createHeartbeat(): Animated.Value {
  const val = new Animated.Value(0);

  const pulse = Animated.sequence([
    Animated.timing(val, {
      toValue: 1,
      duration: HEARTBEAT_DURATION * 0.3,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(val, {
      toValue: 0,
      duration: HEARTBEAT_DURATION * 0.7,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);

  Animated.loop(pulse).start();

  return val;
}

/**
 * Creates staggered entrance animations for a list of `count` items.
 * Each item starts at opacity 0 / translateY 20 and springs to
 * opacity 1 / translateY 0 with an increasing delay.
 *
 * Starts immediately. Attach the returned values to your components.
 *
 * @param count  Number of items to animate.
 * @param delay  Additional base delay (ms) before the first item starts.
 */
export function createStaggerEntrance(
  count: number,
  delay = 0,
): { opacities: Animated.Value[]; translateYs: Animated.Value[] } {
  const opacities = Array.from({ length: count }, () => new Animated.Value(0));
  const translateYs = Array.from({ length: count }, () => new Animated.Value(20));

  const animations = opacities.flatMap((opacity, i) => {
    const translateY = translateYs[i];
    const itemDelay = delay + i * STAGGER_DELAY;

    return [
      Animated.delay(itemDelay),
      Animated.parallel([
        Animated.spring(opacity, {
          toValue: 1,
          ...SPRING_CONFIG,
          useNativeDriver: true,
        }),
        Animated.spring(translateY, {
          toValue: 0,
          ...SPRING_CONFIG,
          useNativeDriver: true,
        }),
      ]),
    ];
  });

  Animated.sequence(animations).start();

  return { opacities, translateYs };
}

/**
 * Springs `val` from its current position to 1 using the bouncy spring config.
 * Designed for widget scale pop-in where the value starts at 0.
 *
 * @param val    Animated.Value to animate (should start at 0).
 * @param delay  Optional delay in ms before the spring starts.
 */
export function springIn(val: Animated.Value, delay = 0): void {
  const spring = Animated.spring(val, {
    toValue: 1,
    ...SPRING_BOUNCY,
    useNativeDriver: true,
  });

  if (delay > 0) {
    Animated.sequence([Animated.delay(delay), spring]).start();
  } else {
    spring.start();
  }
}

/**
 * Loops `val` between 1 and 1.35 on the heartbeat rhythm.
 * Used for AliveDot and trail indicators (scale-based pulse).
 *
 * @param val  Animated.Value to loop (should start at 1).
 */
export function createPulse(val: Animated.Value): void {
  const pulse = Animated.sequence([
    Animated.timing(val, {
      toValue: 1.35,
      duration: HEARTBEAT_DURATION * 0.3,
      easing: Easing.out(Easing.ease),
      useNativeDriver: true,
    }),
    Animated.timing(val, {
      toValue: 1,
      duration: HEARTBEAT_DURATION * 0.7,
      easing: Easing.in(Easing.ease),
      useNativeDriver: true,
    }),
  ]);

  Animated.loop(pulse).start();
}

/**
 * Springs `val` from 0 to 1 with an optional delay.
 * Drives bar chart scaleY so bars grow from the baseline up.
 *
 * @param val    Animated.Value to animate (should start at 0).
 * @param delay  Optional delay in ms before the spring starts.
 */
export function growBar(val: Animated.Value, delay = 0): void {
  const spring = Animated.spring(val, {
    toValue: 1,
    ...SPRING_CONFIG,
    useNativeDriver: true,
  });

  if (delay > 0) {
    Animated.sequence([Animated.delay(delay), spring]).start();
  } else {
    spring.start();
  }
}

/**
 * Timing fade from 0 to 1 with optional delay and custom duration.
 *
 * @param val       Animated.Value to animate (should start at 0).
 * @param delay     Optional delay in ms before fading starts.
 * @param duration  Duration of the fade in ms (default 300).
 */
export function fadeIn(val: Animated.Value, delay = 0, duration = 300): void {
  const fade = Animated.timing(val, {
    toValue: 1,
    duration,
    easing: Easing.out(Easing.ease),
    useNativeDriver: true,
  });

  if (delay > 0) {
    Animated.sequence([Animated.delay(delay), fade]).start();
  } else {
    fade.start();
  }
}

/**
 * Staggers a fade-in (0 → 1) across an array of Animated.Values.
 * Each value is delayed by STAGGER_DELAY * index ms after the base delay.
 *
 * @param values  Array of Animated.Values (each should start at 0).
 * @param delay   Optional base delay in ms before the first item starts.
 */
export function staggeredFadeIn(values: Animated.Value[], delay = 0): void {
  const animations = values.flatMap((val, i) => {
    const itemDelay = delay + i * STAGGER_DELAY;
    return [
      Animated.delay(itemDelay),
      Animated.timing(val, {
        toValue: 1,
        duration: 300,
        easing: Easing.out(Easing.ease),
        useNativeDriver: true,
      }),
    ];
  });

  Animated.sequence(animations).start();
}
