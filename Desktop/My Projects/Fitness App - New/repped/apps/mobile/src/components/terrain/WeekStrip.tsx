import React, { useEffect, useRef } from 'react';
import { Animated, Easing, StyleSheet, Text, View } from 'react-native';
import { theme, anim } from '../../lib/styles';
import type { DayData } from './VolumeChart';

export interface WeekStripProps {
  data: DayData[];
}

const DOT_COLORS: Record<DayData['status'], string> = {
  done: theme.colors.earth,
  today: theme.colors.trail,
  rest: '#D6D3CA',
  future: 'transparent',
};

function Dot({ status }: { status: DayData['status'] }) {
  const scale = useRef(new Animated.Value(1)).current;

  useEffect(() => {
    if (status !== 'today') return;
    const pulse = Animated.loop(
      Animated.sequence([
        Animated.timing(scale, {
          toValue: 1.4,
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
  }, [status]);

  return (
    <Animated.View
      style={[
        styles.dot,
        {
          backgroundColor: DOT_COLORS[status],
          borderWidth: status === 'future' ? 1.5 : 0,
          borderColor: 'rgba(45,42,36,0.18)',
          transform: [{ scale: status === 'today' ? scale : 1 }],
        },
      ]}
    />
  );
}

export function WeekStrip({ data }: WeekStripProps) {
  return (
    <View style={styles.row}>
      {data.map((d, i) => (
        <View key={d.day + i} style={styles.col}>
          <Text
            style={[
              styles.dayLabel,
              {
                color:
                  d.status === 'today' ? theme.colors.trail : theme.colors.rock,
                fontWeight: d.status === 'today' ? '700' : '600',
              },
            ]}
          >
            {d.day.charAt(0).toUpperCase()}
          </Text>
          <Dot status={d.status} />
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  row: {
    flexDirection: 'row',
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
    gap: 8,
  },
  dayLabel: {
    fontSize: 10,
    letterSpacing: 1.2,
  },
  dot: {
    width: 9,
    height: 9,
    borderRadius: 4.5,
  },
});

export default WeekStrip;
