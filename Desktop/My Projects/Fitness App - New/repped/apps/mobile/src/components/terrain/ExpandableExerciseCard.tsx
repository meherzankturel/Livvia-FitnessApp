import { useEffect, useRef } from "react";
import {
  View, Text, Pressable, Image, Animated,
  LayoutAnimation, Platform, UIManager, StyleSheet,
} from "react-native";
import { getFocusCue } from "@repped/shared";
import { openYouTube } from "../../lib/deeplink";
import { getExerciseImage } from "../../lib/exercise-images";
import MuscleIcon from "../MuscleIcon";
import { theme, muscleTints } from "../../lib/styles";

if (Platform.OS === "android" && UIManager.setLayoutAnimationEnabledExperimental) {
  UIManager.setLayoutAnimationEnabledExperimental(true);
}

export interface ExpandableExerciseCardProps {
  exerciseName: string;
  targetSets: number;
  targetReps: string | number;
  muscleGroup: string;
  exerciseType?: string;
  suggestedWeight?: number;
  focusCue?: string;
  instructions?: string;
  lastSession?: { weight: number; reps: number } | null;
  index?: number;
  isOpen: boolean;
  onToggle: () => void;
}

const STAGGER = 50;
const EXPANDED_CHILDREN = 7;

function useFadeStagger(isOpen: boolean, count: number) {
  const anims = useRef(
    Array.from({ length: count }, () => ({
      opacity: new Animated.Value(0),
      translateY: new Animated.Value(12),
    }))
  ).current;

  useEffect(() => {
    if (isOpen) {
      const staggered = anims.map((a, i) =>
        Animated.parallel([
          Animated.timing(a.opacity, { toValue: 1, duration: 220, delay: i * STAGGER, useNativeDriver: true }),
          Animated.spring(a.translateY, { toValue: 0, damping: 12, stiffness: 200, mass: 0.6, delay: i * STAGGER, useNativeDriver: true }),
        ])
      );
      Animated.parallel(staggered).start();
    } else {
      anims.forEach((a) => {
        a.opacity.setValue(0);
        a.translateY.setValue(12);
      });
    }
  }, [isOpen]);

  return anims;
}

export function ExpandableExerciseCard({
  exerciseName, targetSets, targetReps, muscleGroup, exerciseType,
  suggestedWeight, focusCue, lastSession, isOpen, onToggle,
}: ExpandableExerciseCardProps) {
  const mt = muscleTints[muscleGroup.toLowerCase()] || muscleTints.default;
  const imageSource = getExerciseImage(exerciseName);
  const cue = focusCue || getFocusCue(exerciseName, muscleGroup);
  const anims = useFadeStagger(isOpen, EXPANDED_CHILDREN);

  const handleToggle = () => {
    LayoutAnimation.configureNext(LayoutAnimation.Presets.easeInEaseOut);
    onToggle();
  };

  const animStyle = (i: number) => ({
    opacity: anims[i].opacity,
    transform: [{ translateY: anims[i].translateY }],
  });

  const weightDiff = lastSession && suggestedWeight
    ? suggestedWeight - lastSession.weight : null;

  return (
    <Pressable onPress={handleToggle}>
      <View style={s.card}>
        {!isOpen ? (
          /* ─── Collapsed ─── */
          <View style={s.collapsed}>
            <View style={[s.thumb, { backgroundColor: mt.bg }]}>
              {imageSource
                ? <Image source={imageSource} style={s.thumbImg} resizeMode="cover" />
                : <MuscleIcon muscleGroup={muscleGroup} size={56} />}
            </View>
            <View style={{ flex: 1 }}>
              <Text style={s.collName} numberOfLines={1}>{exerciseName}</Text>
              <Text style={s.collMeta}>
                {muscleGroup}{exerciseType ? ` · ${exerciseType}` : ""} · {targetSets} sets
              </Text>
            </View>
            {suggestedWeight != null && suggestedWeight > 0 && (
              <View style={{ alignItems: "center", marginRight: 10 }}>
                <Text style={s.collWeight}>{suggestedWeight}</Text>
                <Text style={s.collUnit}>kg</Text>
              </View>
            )}
            <Text style={s.chevron}>▾</Text>
          </View>
        ) : (
          /* ─── Expanded ─── */
          <View>
            {/* 0: Image hero */}
            <Animated.View style={animStyle(0)}>
              <View style={[s.hero, { backgroundColor: mt.bg + "14" }]}>
                {imageSource
                  ? <Image source={imageSource} style={s.heroImg} resizeMode="contain" />
                  : <MuscleIcon muscleGroup={muscleGroup} size={100} />}
                <Pressable onPress={handleToggle} style={s.closeBtn}>
                  <Text style={s.closeTxt}>×</Text>
                </Pressable>
              </View>
            </Animated.View>

            <View style={{ padding: 18 }}>
              {/* 1: Tags */}
              <Animated.View style={[{ flexDirection: "row", gap: 8, marginBottom: 10 }, animStyle(1)]}>
                <View style={[s.pill, { backgroundColor: mt.bg }]}>
                  <Text style={[s.pillTxt, { color: mt.tint }]}>{muscleGroup}</Text>
                </View>
                {exerciseType && (
                  <View style={[s.pill, { backgroundColor: "rgba(52,211,153,0.1)" }]}>
                    <Text style={[s.pillTxt, { color: theme.colors.trail }]}>{exerciseType}</Text>
                  </View>
                )}
              </Animated.View>

              {/* 2: Name */}
              <Animated.View style={animStyle(2)}>
                <Text style={s.exName}>{exerciseName}</Text>
              </Animated.View>

              {/* 3: Stats grid */}
              <Animated.View style={[s.statsRow, animStyle(3)]}>
                {[
                  { v: String(targetSets), l: "Sets" },
                  { v: String(targetReps), l: "Reps" },
                  { v: suggestedWeight ? `${suggestedWeight}` : "—", l: "Weight" },
                ].map((st) => (
                  <View key={st.l} style={s.statCell}>
                    <Text style={s.statVal}>{st.v}</Text>
                    <Text style={s.statLabel}>{st.l}</Text>
                  </View>
                ))}
              </Animated.View>

              {/* 4: Set pips */}
              <Animated.View style={[s.pipsRow, animStyle(4)]}>
                {Array.from({ length: targetSets }, (_, i) => (
                  <View key={i} style={s.pip} />
                ))}
              </Animated.View>

              {/* 5: Focus cue */}
              <Animated.View style={[s.cueCard, animStyle(5)]}>
                <Text style={s.cueLabel}>⛰ Focus Cue</Text>
                <Text style={s.cueTxt}>{cue}</Text>
              </Animated.View>

              {/* 6: Last session + video */}
              <Animated.View style={animStyle(6)}>
                {lastSession && (
                  <View style={s.lastCard}>
                    <Text style={s.lastTxt}>
                      📊 Last session: <Text style={{ fontFamily: "Quicksand_700Bold", fontWeight: "700" }}>{lastSession.weight}kg × {lastSession.reps} reps</Text>
                      {weightDiff != null ? ` · Today: ${weightDiff >= 0 ? "+" : ""}${weightDiff}kg` : ""}
                    </Text>
                  </View>
                )}
                <Pressable
                  onPress={() => openYouTube(exerciseName + " exercise form tutorial")}
                  style={s.videoBtn}
                >
                  <Text style={s.videoBtnTxt}>Watch Form Video</Text>
                </Pressable>
              </Animated.View>
            </View>
          </View>
        )}
      </View>
    </Pressable>
  );
}

export default ExpandableExerciseCard;

const s = StyleSheet.create({
  card: {
    backgroundColor: theme.colors.white,
    borderRadius: 20,
    borderWidth: 1,
    borderColor: theme.colors.border,
    overflow: "hidden",
    marginBottom: 14,
  },
  // Collapsed
  collapsed: { flexDirection: "row", alignItems: "center", padding: 10, height: 76 },
  thumb: { width: 56, height: 56, borderRadius: 16, alignItems: "center", justifyContent: "center", overflow: "hidden", marginRight: 12 },
  thumbImg: { width: 56, height: 56 },
  collName: { fontSize: 14, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", color: theme.colors.earth, marginBottom: 3 },
  collMeta: { fontSize: 11, color: theme.colors.rock },
  collWeight: { fontSize: 18, fontWeight: "800", color: theme.colors.earth },
  collUnit: { fontSize: 9, color: theme.colors.rock },
  chevron: { fontSize: 14, color: "#D6D3CA", marginLeft: 2 },
  // Expanded hero
  hero: { height: 180, alignItems: "center", justifyContent: "center" },
  heroImg: { width: "80%", height: 160 },
  closeBtn: { position: "absolute", top: 12, right: 12, width: 28, height: 28, borderRadius: 14, backgroundColor: "rgba(0,0,0,0.06)", alignItems: "center", justifyContent: "center" },
  closeTxt: { fontSize: 16, color: theme.colors.earth, lineHeight: 18 },
  // Tags
  pill: { borderRadius: 8, paddingHorizontal: 10, paddingVertical: 4 },
  pillTxt: { fontSize: 10, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", textTransform: "uppercase" },
  // Name
  exName: { fontSize: 20, fontWeight: "700", color: theme.colors.earth, marginBottom: 14 },
  // Stats
  statsRow: { flexDirection: "row", gap: 8, marginBottom: 12 },
  statCell: { flex: 1, backgroundColor: theme.colors.stone, borderRadius: 14, padding: 12, alignItems: "center" },
  statVal: { fontSize: 20, fontWeight: "800", color: theme.colors.earth },
  statLabel: { fontSize: 9, fontFamily: "Quicksand_600SemiBold", fontWeight: "600", textTransform: "uppercase", color: theme.colors.rock, marginTop: 2 },
  // Pips
  pipsRow: { flexDirection: "row", gap: 6, marginBottom: 14 },
  pip: { flex: 1, height: 6, borderRadius: 3, backgroundColor: theme.colors.stone },
  // Cue
  cueCard: { backgroundColor: "rgba(52,211,153,0.05)", borderWidth: 1, borderColor: "rgba(52,211,153,0.08)", borderRadius: 14, padding: 14, marginBottom: 14 },
  cueLabel: { fontSize: 11, fontWeight: "600", color: theme.colors.trail, marginBottom: 4 },
  cueTxt: { fontSize: 14, lineHeight: 20, color: "#4D7C5B" },
  // Last session
  lastCard: { backgroundColor: theme.colors.stone, borderRadius: 14, padding: 14, marginBottom: 12 },
  lastTxt: { fontSize: 13, color: theme.colors.earth, lineHeight: 19 },
  // Video button
  videoBtn: { backgroundColor: theme.colors.earth, borderRadius: 14, paddingVertical: 16, alignItems: "center" },
  videoBtnTxt: { color: "#F6F5F0", fontSize: 15, fontFamily: "Quicksand_600SemiBold", fontWeight: "600" },
});
