import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, ViewStyle } from 'react-native';
import { theme, radii, anim } from '../../lib/styles';

interface BentoWidgetProps {
  variant: 'dark' | 'stone';
  children: React.ReactNode;
  style?: ViewStyle;
}

export function BentoWidget({ variant, children, style }: BentoWidgetProps) {
  const scale = useRef(new Animated.Value(0.92)).current;
  const opacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(scale, {
      toValue: 1,
      ...anim.springBouncy,
      useNativeDriver: true,
    }).start();
    Animated.spring(opacity, {
      toValue: 1,
      ...anim.springBouncy,
      useNativeDriver: true,
    }).start();
  }, []);

  return (
    <Animated.View
      style={[
        styles.base,
        variant === 'dark' ? styles.dark : styles.stone,
        { transform: [{ scale }], opacity },
        style,
      ]}
    >
      {children}
    </Animated.View>
  );
}

const styles = StyleSheet.create({
  base: {
    borderRadius: radii.lg,
    padding: 16,
    overflow: 'hidden',
  },
  dark: {
    backgroundColor: theme.colors.earth,
  },
  stone: {
    backgroundColor: theme.colors.stone,
  },
});
