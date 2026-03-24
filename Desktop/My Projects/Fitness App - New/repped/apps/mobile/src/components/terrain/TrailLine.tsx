import React, { useEffect, useRef, useState } from 'react';
import { Animated, Easing, StyleSheet, View } from 'react-native';
import { theme } from '../../lib/styles';

export function TrailLine() {
  const translateY = useRef(new Animated.Value(0)).current;
  const opacity = useRef(new Animated.Value(0)).current;
  const [containerHeight, setContainerHeight] = useState(0);
  const animationRef = useRef<Animated.CompositeAnimation | null>(null);

  useEffect(() => {
    if (containerHeight === 0) return;

    animationRef.current = Animated.loop(
      Animated.parallel([
        Animated.timing(translateY, {
          toValue: containerHeight,
          duration: 4000,
          easing: Easing.inOut(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.sequence([
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 400,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0.6,
            duration: 3200,
            useNativeDriver: true,
          }),
          Animated.timing(opacity, {
            toValue: 0,
            duration: 400,
            useNativeDriver: true,
          }),
        ]),
      ])
    );
    animationRef.current.start();

    return () => animationRef.current?.stop();
  }, [containerHeight]);

  return (
    <View
      style={styles.container}
      onLayout={(e) => setContainerHeight(e.nativeEvent.layout.height)}
    >
      <View style={styles.line} />
      <Animated.View
        style={[styles.pulse, { transform: [{ translateY }], opacity }]}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    left: 39,
    top: 0,
    bottom: 0,
    width: 2,
  },
  line: {
    flex: 1,
    backgroundColor: theme.colors.borderLight,
    borderRadius: 1,
  },
  pulse: {
    position: 'absolute',
    top: 0,
    width: 4,
    height: 20,
    left: -1,
    backgroundColor: theme.colors.trail,
    borderRadius: 2,
  },
});
