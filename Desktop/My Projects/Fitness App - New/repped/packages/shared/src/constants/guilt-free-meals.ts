/**
 * Guilt-Free Meal Day system.
 * Content and logic for the monthly guilt-free meal allowance.
 * Based on the 85/15 rule: 3 guilt-free meals per month (~1 every 10 days).
 */

/** Number of guilt-free meals allowed per month */
export const GUILT_FREE_MEALS_PER_MONTH = 3;

/** Approximate spacing between guilt-free days (in days) */
export const GUILT_FREE_INTERVAL_DAYS = 10;

// ---------------------------------------------------------------------------
// Motivational rotation lines — shown in the meals section between guilt-free days
// ---------------------------------------------------------------------------

export const GUILT_FREE_MOTIVATION_LINES: string[] = [
  "Burger? Pizza? Pasta? Whatever it is — you've earned it.",
  "One meal won't undo your progress. But it WILL make your week better.",
  "Your muscles don't care about one slice of pizza. They care about the other 57 meals this month.",
  "Pro tip: enjoy your Guilt-Free meal slowly. You'll enjoy it twice as much.",
  "Fun fact: many bodybuilders credit a weekly cheat meal with keeping them sane AND boosting metabolism.",
  "Restriction breeds bingeing. Planned indulgence breeds consistency.",
  "The best diet is the one you don't quit. That's why this exists.",
  "Think of this as a reward from your future self — the one who showed up 10 days straight.",
  "Your brain needs a break from discipline just like your muscles need a break from lifting.",
  "Pizza doesn't cancel out deadlifts. Science says so. Probably.",
  "The goal isn't perfection — it's a lifestyle you actually enjoy living.",
  "3 guilt-free meals a month. That's the deal. No fine print, no catch.",
  "What are you craving? Start planning — anticipation is half the fun.",
  "You're not cheating. You're following the plan. The plan includes joy.",
  "Elite athletes eat cake too. The difference? They don't feel bad about it.",
];

// ---------------------------------------------------------------------------
// Messages for the guilt-free day itself
// ---------------------------------------------------------------------------

export const GUILT_FREE_DAY_HEADLINE = "Today's a Guilt-Free day!";

export const GUILT_FREE_DAY_MESSAGES: string[] = [
  "Eat what makes you happy. No tracking, no guilt, no math. You've been consistent — this is part of the plan, not a break from it.",
  "This isn't a cheat. This is a scheduled win. Enjoy every single bite.",
  "Go eat that thing you've been thinking about all week. You earned it by showing up.",
  "Today the only macro that matters is happiness. Enjoy your meal.",
  "No calorie counting today. Just good food and zero guilt. That's the rule.",
];

export const GUILT_FREE_DAY_TIP =
  "One suggestion: eat your favorite meal slowly and enjoy it. Don't scroll, don't rush. You earned this moment.";

// ---------------------------------------------------------------------------
// Message for the day after a guilt-free day
// ---------------------------------------------------------------------------

export const GUILT_FREE_NEXT_DAY_MESSAGES: string[] = [
  "Welcome back. Yesterday was fun — now let's get back to building.",
  "Great reset. Your body is fueled, your mind is refreshed. Let's go.",
  "That was well-deserved. Now back to the 85% that builds the results.",
  "Yesterday was for the soul. Today is for the gains. Both matter.",
];

// ---------------------------------------------------------------------------
// Cravings list prompts — shown when user adds to their cravings list
// ---------------------------------------------------------------------------

export const CRAVINGS_PROMPTS: string[] = [
  "What are you craving right now? Save it for your Guilt-Free day.",
  "Add it to the list. When your day comes, you'll know exactly what to eat.",
  "Smart move — planning your indulgence beats impulse every time.",
  "Noted. Your future self is already excited.",
];

// ---------------------------------------------------------------------------
// Helper functions
// ---------------------------------------------------------------------------

/**
 * Get a random motivation line for the countdown period.
 * Optionally pass a day index to get deterministic rotation (e.g., based on day of month).
 */
export function getMotivationLine(dayIndex?: number): string {
  if (dayIndex !== undefined) {
    return GUILT_FREE_MOTIVATION_LINES[dayIndex % GUILT_FREE_MOTIVATION_LINES.length];
  }
  return GUILT_FREE_MOTIVATION_LINES[Math.floor(Math.random() * GUILT_FREE_MOTIVATION_LINES.length)];
}

/**
 * Get the guilt-free day message (for when today IS a guilt-free day).
 */
export function getGuiltFreeDayMessage(dayIndex?: number): string {
  if (dayIndex !== undefined) {
    return GUILT_FREE_DAY_MESSAGES[dayIndex % GUILT_FREE_DAY_MESSAGES.length];
  }
  return GUILT_FREE_DAY_MESSAGES[Math.floor(Math.random() * GUILT_FREE_DAY_MESSAGES.length)];
}

/**
 * Get the "day after" message.
 */
export function getNextDayMessage(dayIndex?: number): string {
  if (dayIndex !== undefined) {
    return GUILT_FREE_NEXT_DAY_MESSAGES[dayIndex % GUILT_FREE_NEXT_DAY_MESSAGES.length];
  }
  return GUILT_FREE_NEXT_DAY_MESSAGES[Math.floor(Math.random() * GUILT_FREE_NEXT_DAY_MESSAGES.length)];
}

/**
 * Get a random cravings prompt.
 */
export function getCravingsPrompt(): string {
  return CRAVINGS_PROMPTS[Math.floor(Math.random() * CRAVINGS_PROMPTS.length)];
}

/**
 * Calculate guilt-free meal day dates for a given month.
 * Spaces them evenly: roughly day 1, 11, and 21 of the month.
 * @param year - The year
 * @param month - The month (1-12)
 * @returns Array of Date objects for the 3 guilt-free days
 */
export function getGuiltFreeDates(year: number, month: number): Date[] {
  const daysInMonth = new Date(year, month, 0).getDate();
  const spacing = Math.floor(daysInMonth / GUILT_FREE_MEALS_PER_MONTH);

  return Array.from({ length: GUILT_FREE_MEALS_PER_MONTH }, (_, i) => {
    const day = Math.min(1 + i * spacing, daysInMonth);
    return new Date(year, month - 1, day);
  });
}

/**
 * Get the current guilt-free status for today.
 * @param today - Current date
 * @param guiltFreeDates - The 3 scheduled guilt-free dates this month
 * @param usedCount - How many guilt-free meals the user has already taken this month
 */
export function getGuiltFreeStatus(
  today: Date,
  guiltFreeDates: Date[],
  usedCount: number
): {
  isGuiltFreeDay: boolean;
  isDayAfter: boolean;
  daysUntilNext: number | null;
  remaining: number;
  message: string;
  tip?: string;
} {
  const todayStr = today.toISOString().split("T")[0];
  const remaining = Math.max(0, GUILT_FREE_MEALS_PER_MONTH - usedCount);

  // Check if today is a guilt-free day
  const isGuiltFreeDay = guiltFreeDates.some(
    (d) => d.toISOString().split("T")[0] === todayStr
  );

  if (isGuiltFreeDay && remaining > 0) {
    return {
      isGuiltFreeDay: true,
      isDayAfter: false,
      daysUntilNext: 0,
      remaining,
      message: getGuiltFreeDayMessage(),
      tip: GUILT_FREE_DAY_TIP,
    };
  }

  // Check if yesterday was a guilt-free day
  const yesterday = new Date(today);
  yesterday.setDate(yesterday.getDate() - 1);
  const yesterdayStr = yesterday.toISOString().split("T")[0];
  const isDayAfter = guiltFreeDates.some(
    (d) => d.toISOString().split("T")[0] === yesterdayStr
  );

  if (isDayAfter) {
    // Find next upcoming guilt-free date
    const nextDate = guiltFreeDates.find((d) => d > today);
    const daysUntilNext = nextDate
      ? Math.ceil((nextDate.getTime() - today.getTime()) / 86400000)
      : null;

    return {
      isGuiltFreeDay: false,
      isDayAfter: true,
      daysUntilNext,
      remaining: Math.max(0, remaining),
      message: getNextDayMessage(),
    };
  }

  // Normal countdown day
  const nextDate = guiltFreeDates.find((d) => d >= today);
  const daysUntilNext = nextDate
    ? Math.ceil((nextDate.getTime() - today.getTime()) / 86400000)
    : null;

  return {
    isGuiltFreeDay: false,
    isDayAfter: false,
    daysUntilNext,
    remaining,
    message: getMotivationLine(today.getDate()),
  };
}
