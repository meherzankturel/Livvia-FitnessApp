/**
 * Injury Assessment System
 *
 * Evaluates active injuries against today's planned workout and determines:
 * 1. Should the user REST today? (injury too risky for any training)
 * 2. Should the workout be MODIFIED? (swap/remove specific exercises)
 * 3. Should the user PROCEED normally? (injury doesn't affect today's muscles)
 *
 * Based on sports medicine principles:
 *
 * CRITICAL BODY PARTS (spine, rotator cuff):
 *   Neck + moderate/severe → FORCE REST (risk of nerve damage, disc herniation)
 *   Lower Back + moderate/severe → FORCE REST (disc, sciatic nerve risk)
 *   Shoulder + severe → FORCE REST (rotator cuff tear risk)
 *
 * HIGH-RISK BODY PARTS (weight-bearing joints):
 *   Knee + severe → REST for lower body, upper body okay
 *   Hip + severe → REST for lower body, upper body okay
 *   Ankle + severe → REST for lower body, upper body okay
 *
 * MODERATE-RISK:
 *   Wrist + severe → REST for push movements, pulling okay with straps
 *   Elbow + severe → REST for arm-intensive work, legs okay
 *
 * KEY PRINCIPLE: When in doubt, rest. A missed workout costs nothing.
 * A worsened injury costs weeks.
 */

import type { UserInjury } from "../constants/injuries";
import { INJURY_DEFINITIONS } from "../constants/injuries";

export type InjuryAction = "rest" | "modify" | "proceed";

export interface InjuryAssessment {
  action: InjuryAction;
  /** Why we're recommending this action */
  reason: string;
  /** Detailed recovery advice for the user */
  recoveryTip: string;
  /** Which injuries triggered the assessment */
  triggeringInjuries: { key: string; label: string; severity: string }[];
  /** If action is "modify": which muscle groups are unsafe today */
  unsafeMuscleGroups: string[];
  /** If action is "modify": which exercise patterns to avoid */
  unsafeExercisePatterns: string[];
}

// Body parts where moderate+ severity should force complete rest
const CRITICAL_PARTS: Record<string, {
  restAtSeverity: ("moderate" | "severe")[];
  reason: string;
  recoveryTip: string;
}> = {
  neck: {
    restAtSeverity: ["moderate", "severe"],
    reason: "Neck injuries carry serious risk — even light exercise can compress cervical discs or aggravate nerve impingement. Your body needs complete rest.",
    recoveryTip: "Apply gentle heat for 15-20 minutes, avoid looking down at your phone for extended periods, and sleep with a supportive pillow. If pain persists beyond 3 days or radiates to your arms, see a doctor.",
  },
  lower_back: {
    restAtSeverity: ["moderate", "severe"],
    reason: "Your lower back supports every movement. Training through back pain risks disc herniation, sciatic nerve compression, or muscle guarding that makes everything worse.",
    recoveryTip: "Gentle walking (10-15 min) is okay and can help. Avoid sitting for long periods. Cat-cow stretches and pelvic tilts can relieve tension. If you have numbness or tingling in your legs, see a doctor immediately.",
  },
  shoulder: {
    restAtSeverity: ["severe"],
    reason: "A severe shoulder injury means your rotator cuff or labrum may be compromised. Any pressing or overhead work risks serious damage.",
    recoveryTip: "Ice for 15 minutes every few hours. Avoid reaching overhead or behind your back. Gentle pendulum swings (lean forward, let arm hang and swing) can help. See a physiotherapist if pain is sharp or clicking.",
  },
};

// Body parts where severe injury blocks specific workout types
const PARTIAL_REST_PARTS: Record<string, {
  blockedFocuses: string[];  // workout focuses that should become rest
  reason: string;
  recoveryTip: string;
}> = {
  knee: {
    blockedFocuses: ["Legs", "Lower", "Full Body A", "Full Body B", "Full Body C"],
    reason: "Your knee needs to recover. Lower body exercises put direct load on the joint. We've switched today to a rest day — upper body work is fine tomorrow.",
    recoveryTip: "RICE: Rest, Ice (15 min on/off), Compression (knee sleeve), Elevation. Gentle range-of-motion exercises only. If it's swollen or unstable, see a doctor.",
  },
  hip: {
    blockedFocuses: ["Legs", "Lower", "Full Body A", "Full Body B", "Full Body C"],
    reason: "Your hip joint is under stress. Squats, lunges, and hip hinges will make it worse. Rest the lower body today.",
    recoveryTip: "Gentle hip circles and clamshells can help. Avoid sitting cross-legged or in deep chairs. A foam roller on the glutes (not directly on the hip) may relieve tension.",
  },
  ankle: {
    blockedFocuses: ["Legs", "Lower", "Full Body A", "Full Body B", "Full Body C"],
    reason: "A severe ankle injury means no weight-bearing lower body work today. Upper body training is fine.",
    recoveryTip: "RICE protocol. Keep it elevated when sitting. Gentle ankle circles once pain subsides. If bruising is severe or you can't bear weight at all, get an X-ray.",
  },
  wrist: {
    blockedFocuses: ["Push", "Upper", "Full Body A", "Full Body C"],
    reason: "Your wrist can't handle pressing or gripping heavy loads right now. We've adjusted your day.",
    recoveryTip: "Avoid gripping, twisting, or pressing with that hand. A wrist brace can help during daily activities. Gentle wrist circles once pain allows.",
  },
  elbow: {
    blockedFocuses: ["Push", "Pull", "Upper", "Full Body A", "Full Body B", "Full Body C"],
    reason: "Your elbow affects both pushing and pulling movements. Rest the upper body today.",
    recoveryTip: "Ice the elbow for 15 minutes. Avoid carrying heavy bags or repetitive gripping. If it's tennis/golfer's elbow, a forearm strap can help with daily activities.",
  },
};

/**
 * Assess whether the user should train today given their active injuries.
 *
 * @param injuries - User's current active injuries with severity
 * @param todayFocus - Today's planned workout focus (e.g., "Push", "Legs", "Full Body A")
 * @returns Assessment with action, reason, and recovery advice
 */
export function assessInjuryForWorkout(
  injuries: UserInjury[],
  todayFocus: string
): InjuryAssessment {
  if (!injuries || injuries.length === 0) {
    return {
      action: "proceed",
      reason: "",
      recoveryTip: "",
      triggeringInjuries: [],
      unsafeMuscleGroups: [],
      unsafeExercisePatterns: [],
    };
  }

  const triggering: { key: string; label: string; severity: string }[] = [];
  const unsafeMuscles: Set<string> = new Set();
  const unsafePatterns: Set<string> = new Set();

  // ── Check for FORCE REST conditions ──
  for (const injury of injuries) {
    const critical = CRITICAL_PARTS[injury.key];
    if (critical && (critical.restAtSeverity as string[]).includes(injury.severity)) {
      const def = INJURY_DEFINITIONS.find(d => d.key === injury.key);
      return {
        action: "rest",
        reason: critical.reason,
        recoveryTip: critical.recoveryTip,
        triggeringInjuries: [{
          key: injury.key,
          label: def?.label || injury.key,
          severity: injury.severity,
        }],
        unsafeMuscleGroups: [],
        unsafeExercisePatterns: [],
      };
    }
  }

  // ── Check for PARTIAL REST (severe + today's focus is blocked) ──
  for (const injury of injuries) {
    if (injury.severity !== "severe") continue;

    const partial = PARTIAL_REST_PARTS[injury.key];
    if (partial && partial.blockedFocuses.includes(todayFocus)) {
      const def = INJURY_DEFINITIONS.find(d => d.key === injury.key);
      return {
        action: "rest",
        reason: partial.reason,
        recoveryTip: partial.recoveryTip,
        triggeringInjuries: [{
          key: injury.key,
          label: def?.label || injury.key,
          severity: injury.severity,
        }],
        unsafeMuscleGroups: [],
        unsafeExercisePatterns: [],
      };
    }
  }

  // ── Check for MODIFY conditions (moderate injuries that affect today's focus) ──
  let shouldModify = false;

  for (const injury of injuries) {
    const def = INJURY_DEFINITIONS.find(d => d.key === injury.key);
    if (!def) continue;

    // Moderate: check if injury affects today's workout
    if (injury.severity === "moderate" || injury.severity === "severe") {
      // Collect unsafe muscle groups
      for (const mg of def.avoidMuscleGroups) {
        unsafeMuscles.add(mg);
      }
      // Collect unsafe exercise patterns
      for (const pattern of def.avoidExercisePatterns) {
        unsafePatterns.add(pattern);
      }
      triggering.push({
        key: injury.key,
        label: def.label,
        severity: injury.severity,
      });
      shouldModify = true;
    }

    // Mild: only flag modify patterns
    if (injury.severity === "mild") {
      for (const pattern of def.modifyExercisePatterns) {
        unsafePatterns.add(pattern);
      }
      if (def.modifyExercisePatterns.length > 0) {
        triggering.push({
          key: injury.key,
          label: def.label,
          severity: injury.severity,
        });
      }
    }
  }

  if (shouldModify) {
    const injuryNames = triggering.map(t => t.label.toLowerCase()).join(", ");
    return {
      action: "modify",
      reason: `We've adjusted today's workout for your ${injuryNames}. Some exercises have been swapped or removed to keep you safe.`,
      recoveryTip: "Listen to your body. If any exercise causes sharp pain (not just discomfort), skip it. Mild stretching and warmup is extra important today.",
      triggeringInjuries: triggering,
      unsafeMuscleGroups: Array.from(unsafeMuscles),
      unsafeExercisePatterns: Array.from(unsafePatterns),
    };
  }

  // Mild injuries present but don't significantly affect today
  if (triggering.length > 0) {
    return {
      action: "proceed",
      reason: "Your injuries are mild and don't significantly impact today's workout. We'll flag exercises to be careful with.",
      recoveryTip: "",
      triggeringInjuries: triggering,
      unsafeMuscleGroups: [],
      unsafeExercisePatterns: Array.from(unsafePatterns),
    };
  }

  return {
    action: "proceed",
    reason: "",
    recoveryTip: "",
    triggeringInjuries: [],
    unsafeMuscleGroups: [],
    unsafeExercisePatterns: [],
  };
}
