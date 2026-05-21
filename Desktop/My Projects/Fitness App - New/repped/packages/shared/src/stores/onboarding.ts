import { create } from "zustand";
import type { Sex, ActivityLevel, TrainingHistory, Goal, Equipment, DietaryPreference, MeatPreference } from "../types/user";

export interface OnboardingData {
  // Step 1: Welcome
  display_name: string | null;
  // Step 2: About You
  /** ISO date string (YYYY-MM-DD). Age is derived via calcAge() so it stays correct year over year. */
  date_of_birth: string | null;
  sex: Sex | null;
  weight_kg: number | null;
  height_cm: number | null;
  // Step 3: Health Screening (PAR-Q+)
  health_conditions: string[];
  health_cleared: boolean;
  // Step 4: Goal
  goal: Goal | null;
  /** Target weight in kg. Only meaningful when goal === "lose_fat" or "build_muscle". */
  target_weight_kg: number | null;
  // Step 5: Experience
  training_history: TrainingHistory | null;
  // Step 6: Equipment
  equipment: Equipment | null;
  // Step 7: Schedule
  days_per_week: number | null;
  activity_level: ActivityLevel | null;
  // Step 8: Nutrition
  dietary_preference: DietaryPreference | null;
  /** Preset id for the Non-Veg meat picker; mapped to meat_preferences on save. */
  meat_preset: "any" | "chicken" | "beef" | "white" | "no_pork_beef";
  meat_preferences: MeatPreference[];
  food_exclusions: string[];
  cuisine_preferences: string[];
  // Step 9: Injuries
  current_injuries: { key: string; severity: "mild" | "moderate" | "severe"; since: string }[];
}

export interface OnboardingState {
  step: number;
  totalSteps: number;
  data: OnboardingData;
  setStep: (step: number) => void;
  nextStep: () => void;
  prevStep: () => void;
  updateData: (partial: Partial<OnboardingData>) => void;
  reset: () => void;
  // Persistence helpers
  hydrate: (saved: { step: number; data: Partial<OnboardingData> }) => void;
  getSnapshot: () => { step: number; data: OnboardingData };
}

const initialData: OnboardingData = {
  display_name: null,
  date_of_birth: null,
  sex: null,
  weight_kg: null,
  height_cm: null,
  health_conditions: [],
  health_cleared: true,
  goal: null,
  target_weight_kg: null,
  training_history: null,
  equipment: null,
  days_per_week: null,
  activity_level: null,
  dietary_preference: null,
  meat_preset: "any",
  meat_preferences: [],
  food_exclusions: [],
  cuisine_preferences: [],
  current_injuries: [],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  totalSteps: 9,
  data: { ...initialData },
  setStep: (step) => set({ step }),
  nextStep: () => set((state) => ({ step: Math.min(state.step + 1, state.totalSteps) })),
  prevStep: () => set((state) => ({ step: Math.max(state.step - 1, 1) })),
  updateData: (partial) =>
    set((state) => ({ data: { ...state.data, ...partial } })),
  reset: () => set({ step: 1, data: { ...initialData } }),
  hydrate: (saved) => set({ step: saved.step, data: { ...initialData, ...saved.data } }),
  getSnapshot: () => ({ step: get().step, data: get().data }),
}));
