import React, { useEffect, useRef } from 'react';
import { Animated, StyleSheet, Text, View } from 'react-native';
import { theme } from '../../lib/styles';

export interface DayData {
  day: string;
  volume: number;
  status: 'done' | 'today' | 'rest' | 'future';
  label?: string;
}

export interface VolumeChartProps {
  data: DayData[];
  maxVolume?: number;
}

const BAR_HEIGHT = 90;
const MIN_BAR = 6;

const BAR_COLORS: Record<DayData['status'], string> = {
  done: theme.colors.earth,
  today: theme.colors.trail,
  rest: '#D6D3CA',
  future: 'rgba(45,42,36,0.08)',
};

function formatLabel(d: DayData): string {
  if (d.label) return d.label;
  if (d.status === 'rest') return 'rest';
  if (d.status === 'future') return '';
  if (d.volume >= 1000) return `${(d.volume / 1000).toFixed(1)}k`;
  return d.volume > 0 ? String(d.volume) : '';
}

interface BarProps {
  d: DayData;
  barH: number;
  delay: number;
}

function Bar({ d, barH, delay }: BarProps) {
  const opacity = useRef(new Animated.Value(0)).current;
  const translateY = useRef(new Animated.Value(20)).current;
  const pingOpacity = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    Animated.spring(opacity, {
      toValue: 1,
      damping: 14,
      stiffness: 120,
      mass: 0.8,
      delay,
      useNativeDriver: true,
    }).start();

    Animated.spring(translateY, {
      toValue: 0,
      damping: 14,
      stiffness: 120,
      mass: 0.8,
      delay,
      useNativeDriver: true,
    }).start();
  }, []);

  useEffect(() => {
    if (d.status !== 'today') return;
    const loop = Animated.loop(
      Animated.sequence([
        Animated.timing(pingOpacity, {
          toValue: 0.4,
          duration: 600,
          useNativeDriver: true,
        }),
        Animated.timing(pingOpacity, {
          toValue: 0,
          duration: 1200,
          useNativeDriver: true,
        }),
      ])
    );
    loop.start();
    return () => loop.stop();
  }, [d.status]);

  const volLabel = formatLabel(d);

  return (
    <View style={styles.col}>
      <View style={[styles.barWrap, { height: BAR_HEIGHT }]}>
        <Animated.View
          style={[
            styles.bar,
            {
              height: barH,
              backgroundColor: BAR_COLORS[d.status],
              opacity,
              transform: [{ translateY }],
            },
          ]}
        >
          {d.status === 'today' && (
            <View style={styles.dotWrap}>
              <Animated.View style={[styles.pingRing, { opacity: pingOpacity }]} />
              <View style={styles.dot} />
            </View>
          )}
        </Animated.View>
      </View>
      <Text style={styles.dayLabel}>{d.day.toUpperCase()}</Text>
      {volLabel ? (
        <Text style={styles.volLabel}>{volLabel}</Text>
      ) : (
        <Text style={styles.volLabel}> </Text>
      )}
    </View>
  );
}

export function VolumeChart({ data, maxVolume }: VolumeChartProps) {
  const max = maxVolume ?? Math.max(...data.map(d => d.volume), 1);

  return (
    <View style={styles.card}>
      <View style={styles.row}>
        {data.map((d, i) => {
          const barH = d.volume > 0
            ? Math.max(MIN_BAR, Math.round((d.volume / max) * BAR_HEIGHT))
            : MIN_BAR;
          return (
            <Bar
              key={d.day + i}
              d={d}
              barH={barH}
              delay={300 + i * 60}
            />
          );
        })}
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.stone,
    borderRadius: 20,
    padding: 16,
  },
  row: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    gap: 6,
  },
  col: {
    flex: 1,
    alignItems: 'center',
  },
  barWrap: {
    width: '100%',
    justifyContent: 'flex-end',
    alignItems: 'center',
  },
  bar: {
    width: '100%',
    borderRadius: 8,
    borderBottomLeftRadius: 4,
    borderBottomRightRadius: 4,
    overflow: 'visible',
  },
  dotWrap: {
    position: 'absolute',
    top: -11,
    alignSelf: 'center',
    width: 14,
    height: 14,
    alignItems: 'center',
    justifyContent: 'center',
  },
  pingRing: {
    position: 'absolute',
    width: 14,
    height: 14,
    borderRadius: 7,
    backgroundColor: theme.colors.trail,
  },
  dot: {
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: theme.colors.trail,
  },
  dayLabel: {
    fontSize: 8,
    color: theme.colors.rock,
    textAlign: 'center',
    marginTop: 6,
    fontWeight: '600',
  },
  volLabel: {
    fontSize: 7,
    color: theme.colors.rock,
    opacity: 0.6,
    textAlign: 'center',
    marginTop: 2,
  },
});

export default VolumeChart;
