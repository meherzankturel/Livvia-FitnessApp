import React from 'react';
import { StyleSheet, View } from 'react-native';
import { theme } from '../../lib/styles';

export function TopoBackground() {
  return (
    <View style={styles.container} pointerEvents="none">
      <View style={[styles.ring, styles.outerTL]} />
      <View style={[styles.ring, styles.innerTL]} />
      <View style={[styles.ring, styles.outerBR]} />
      <View style={[styles.ring, styles.innerBR]} />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    ...StyleSheet.absoluteFillObject,
  },
  ring: {
    position: 'absolute',
    borderWidth: 1,
    borderColor: theme.colors.earth,
    borderRadius: 9999,
    opacity: 0.02,
  },
  outerTL: {
    width: 550,
    height: 440,
    top: -100,
    left: -100,
  },
  innerTL: {
    width: 420,
    height: 340,
    top: -50,
    left: -50,
  },
  outerBR: {
    width: 500,
    height: 400,
    bottom: -80,
    right: -100,
  },
  innerBR: {
    width: 380,
    height: 300,
    bottom: -40,
    right: -60,
  },
});
