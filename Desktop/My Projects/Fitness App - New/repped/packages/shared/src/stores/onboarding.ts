import { create } from "zustand";
import type { Sex, ActivityLevel, TrainingHistory, Goal, Equipment, DietaryPreference } from "../types/user";

export interface OnboardingData {
  // Step 1: Welcome
  display_name: string | null;
  // Step 2: About You
  age: number | null;
  sex: Sex | null;
  weight_kg: number | null;
  height_cm: number | null;
  // Step 3: Goal
  goal: Goal | null;
  // Step 4: Experience
  training_history: TrainingHistory | null;
  // Step 5: Equipment
  equipment: Equipment | null;
  // Step 6: Schedule
  days_per_week: number | null;
  activity_level: ActivityLevel | null;
  // Step 7: Nutrition
  dietary_preference: DietaryPreference | null;
  food_exclusions: string[];
  cuisine_preferences: string[];
  // Step 8: Injuries
  current_injuries: { key: string; severity: "moderate"; since: string }[];
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
  age: null,
  sex: null,
  weight_kg: null,
  height_cm: null,
  goal: null,
  training_history: null,
  equipment: null,
  days_per_week: null,
  activity_level: null,
  dietary_preference: null,
  food_exclusions: [],
  cuisine_preferences: [],
  current_injuries: [],
};

export const useOnboardingStore = create<OnboardingState>((set, get) => ({
  step: 1,
  totalSteps: 8,
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
