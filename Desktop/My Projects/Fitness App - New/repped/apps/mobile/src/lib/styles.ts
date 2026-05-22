import { ViewStyle, TextStyle } from "react-native";

// ─── Revive Design System v5 — Terrain × Magnetic ───
// Earthy expedition palette: sand backgrounds, trail green accents,
// earth-tone cards, and stone surfaces.

// ─── Color Tokens ────────────────────────────────────────────────────────────

export const theme = {
  colors: {
    /** Primary text, dark cards, CTA buttons */
    earth: "#2D2A24",
    /** Main screen background */
    bg: "#F6F5F0",
    /** Active states, progress rings, today indicators */
    trail: "#34D399",
    /** Secondary text, muted labels */
    rock: "#8E8E7A",
    /** Widget / card backgrounds */
    stone: "#EDEBE5",
    /** Streak highlights — use sparingly */
    accent: "#6366F1",
    accentLight: "#818CF8",
    /** Subtle card borders */
    border: "rgba(0,0,0,0.04)",
    borderLight: "#DDD9CE",
    /** Pure white — exercise cards */
    white: "#FFFFFF",
  },
} as const;

// ─── Muscle Group Tints ───────────────────────────────────────────────────────

export const muscleTints: Record<string, { bg: string; tint: string }> = {
  chest:     { bg: "#E8E4F8", tint: "#6366F1" },
  shoulders: { bg: "#FEF3C7", tint: "#F59E0B" },
  back:      { bg: "#D1FAE5", tint: "#34D399" },
  legs:      { bg: "#FEE2E2", tint: "#EF4444" },
  arms:      { bg: "#E0E7FF", tint: "#818CF8" },
  core:      { bg: "#FEF3C7", tint: "#F59E0B" },
  default:   { bg: "#EDEBE5", tint: "#8E8E7A" },
};

// ─── Radii ────────────────────────────────────────────────────────────────────

export const radii = {
  sm:   12,
  md:   18,
  lg:   22,
  xl:   24,
  pill: 100,
} as const;

// ─── Animation Configs ────────────────────────────────────────────────────────

export const anim = {
  /** Heartbeat loop duration (ms) */
  heartbeat: 2400,
  /** Standard spring */
  spring: { damping: 18, stiffness: 180, mass: 0.8 },
  /** Bouncy spring for pop-in effects */
  springBouncy: { damping: 12, stiffness: 200, mass: 0.6 },
  /** Per-item stagger offset (ms) */
  staggerDelay: 80,
} as const;

// ─── Typography Presets ───────────────────────────────────────────────────────

export const type = {
  hero: {
    fontSize: 26,
    fontFamily: "Quicksand_700Bold", fontWeight: "700" as const,
    color: theme.colors.earth,
  } as TextStyle,

  sectionTitle: {
    fontSize: 14,
    fontWeight: "700" as const,
    color: theme.colors.earth,
  } as TextStyle,

  widgetNum: {
    fontSize: 32,
    fontFamily: "Quicksand_700Bold", fontWeight: "800" as const,
    color: theme.colors.earth,
  } as TextStyle,

  label: {
    fontSize: 9,
    fontWeight: "600" as const,
    textTransform: "uppercase" as const,
    letterSpacing: 0.8,
    color: theme.colors.rock,
  } as TextStyle,

  body: {
    fontSize: 14,
    fontFamily: "Quicksand_400Regular", fontWeight: "400" as const,
    color: theme.colors.earth,
  } as TextStyle,

  meta: {
    fontSize: 11,
    color: theme.colors.rock,
  } as TextStyle,
} as const;

// ─── Card Presets ─────────────────────────────────────────────────────────────

export const cards = {
  /** Default widget card — stone surface */
  widget: {
    backgroundColor: theme.colors.stone,
    borderRadius: radii.lg,
  } as ViewStyle,

  /** Exercise card — white with subtle border */
  exercise: {
    backgroundColor: theme.colors.white,
    borderRadius: radii.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
  } as ViewStyle,

  /** Dark CTA / hero card */
  dark: {
    backgroundColor: theme.colors.earth,
    borderRadius: radii.lg,
  } as ViewStyle,
} as const;

// ─── Legacy Compat — remove when all screens are migrated ────────────────────

export const ACCENT       = theme.colors.accent;
export const ACCENT_LIGHT = theme.colors.accentLight;
export const ACCENT_BG    = "rgba(99,102,241,0.08)";
export const SCREEN_BG    = theme.colors.bg;

export const warmCard: ViewStyle     = cards.widget;
export const softCard: ViewStyle     = cards.widget;
export const glassCard: ViewStyle    = cards.widget;
export const glassCardBorder: ViewStyle = cards.widget;
export const cardBase: ViewStyle     = cards.widget;

export const innerCard: ViewStyle = {
  backgroundColor: theme.colors.stone,
  borderRadius: radii.sm,
};

export const pillButton: ViewStyle = {
  borderRadius: radii.pill,
  paddingHorizontal: 16,
  paddingVertical: 8,
};

export const pillActive: ViewStyle = {
  ...pillButton,
  backgroundColor: ACCENT,
};

export const pillInactive: ViewStyle = {
  ...pillButton,
  backgroundColor: theme.colors.stone,
};

export const sectionHeader: TextStyle = {
  color: theme.colors.earth,
  fontSize: 20,
  fontFamily: "Quicksand_700Bold", fontWeight: "700",
  letterSpacing: -0.5,
};

export const statNumber: TextStyle = {
  fontSize: 28,
  fontWeight: "700",
  color: ACCENT,
};

export const mutedLabel: TextStyle = {
  color: theme.colors.rock,
  fontSize: 13,
};

export const glassDivider: ViewStyle = {
  height: 0.5,
  backgroundColor: theme.colors.border,
};

export const tabBar: ViewStyle = {};
