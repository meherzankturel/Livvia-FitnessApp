/**
 * Personal message generator for the Home Screen hero.
 * Returns a data-driven motivational message based on user's current state.
 * Uses terrain/expedition language.
 */

interface MessageContext {
  streak: number;
  longestStreak: number;
  exerciseCount: number;
  focusArea: string;
  completionPct: number;       // 0-100, this week
  daysCompletedThisWeek: number;
  totalDaysThisWeek: number;
  isDeloadWeek?: boolean;
  lastPRExercise?: string;
  lastPRWeight?: number;
  weeksSinceStart?: number;
}

interface PersonalMessage {
  message: string;
  highlight: string; // the key phrase to render in trail green
}

export function getPersonalMessage(ctx: MessageContext): PersonalMessage {
  const {
    streak, longestStreak, exerciseCount, focusArea,
    completionPct, daysCompletedThisWeek, totalDaysThisWeek,
    isDeloadWeek, lastPRExercise, lastPRWeight, weeksSinceStart,
  } = ctx;

  // Priority 1: About to break streak record
  if (streak > 0 && streak >= longestStreak - 1 && longestStreak > 3) {
    const away = longestStreak - streak;
    if (away <= 1) {
      return {
        message: `You're ${away === 0 ? 'at' : '1 session away from'} your longest streak ever.`,
        highlight: away === 0 ? 'at' : '1 session away',
      };
    }
  }

  // Priority 2: Deload week
  if (isDeloadWeek) {
    return {
      message: "Deload week. Lighter loads, same focus. Trust the descent.",
      highlight: "Trust the descent",
    };
  }

  // Priority 3: Recent PR
  if (lastPRExercise && lastPRWeight) {
    return {
      message: `You just hit ${lastPRWeight}kg on ${lastPRExercise}. New peak altitude.`,
      highlight: "New peak altitude",
    };
  }

  // Priority 4: High completion rate
  if (completionPct >= 80 && daysCompletedThisWeek >= 3) {
    return {
      message: `${daysCompletedThisWeek} of ${totalDaysThisWeek} summits this week. Keep climbing.`,
      highlight: "Keep climbing",
    };
  }

  // Priority 5: Active streak
  if (streak >= 7) {
    return {
      message: `${streak}-day streak. You haven't missed a beat in over a week.`,
      highlight: `${streak}-day streak`,
    };
  }

  if (streak >= 3) {
    return {
      message: `${streak} days strong. Momentum is building.`,
      highlight: "Momentum is building",
    };
  }

  // Priority 6: Milestone weeks
  if (weeksSinceStart && weeksSinceStart % 4 === 0 && weeksSinceStart > 0) {
    return {
      message: `Week ${weeksSinceStart} of your journey. Look how far you've climbed.`,
      highlight: "how far you've climbed",
    };
  }

  // Default: exercise count for today
  return {
    message: `${exerciseCount} exercises on today's route. ${focusArea} day — let's ascend.`,
    highlight: "let's ascend",
  };
}
