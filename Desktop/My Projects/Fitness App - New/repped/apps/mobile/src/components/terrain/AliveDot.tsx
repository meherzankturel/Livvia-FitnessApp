import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme, anim } from '../../lib/styles';

interface AliveDotProps {
  label?: string;
  color?: string;
  size?: number;
}

export function AliveDot({
  label,
  color = theme.colors.trail,
  size = 6,
}: AliveDotProps) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.35,
          duration: Math.round(anim.heartbeat * 0.3),
          easing: Easing.out(Easing.ease),
          useNativeDriver: true,
        }),
        Animated.timing(scale, {
          toValue: 1,
          duration: Math.round(anim.heartbeat * 0.7),
          easing: Easing.in(Easing.ease),
          useNativeDriver: true,
        }),
      ])
    );
    pulse.start();
    return () => pulse.stop();
  }, []);

  return (
    <View style={styles.row}>
      <Animated.View
        style={[
          {
            width: size,
            height: size,
            borderRadius: size / 2,
            backgroundColor: color,
          },
          { transform: [{ scale }] },
        ]}
      />
      {label ? (
        <Text style={[styles.label, { color }]}>{label}</Text>
      ) : null}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
  },
  label: {
    fontSize: 11,
    fontWeight: '600',
  },
});
