export type Database = {
  public: {
    Tables: {
      profiles: {
        Row: {
          id: string;
          date_of_birth: string;
          weight_kg: number;
          height_cm: number;
          sex: string;
          activity_level: string;
          training_history: string;
          goal: string;
          equipment: string;
          days_per_week: number;
          dietary_preference: string;
          tdee: number | null;
          subscription_tier: string;
          onboarding_completed: boolean;
          created_at: string;
          updated_at: string;
        };
        Insert: {
          id: string;
          date_of_birth: string;
          weight_kg: number;
          height_cm: number;
          sex: string;
          activity_level: string;
          training_history: string;
          goal: string;
          equipment: string;
          days_per_week: number;
          dietary_preference?: string;
          tdee?: number | null;
          subscription_tier?: string;
          onboarding_completed?: boolean;
        };
        Update: {
          id?: string;
          date_of_birth?: string;
          weight_kg?: number;
          height_cm?: number;
          sex?: string;
          activity_level?: string;
          training_history?: string;
          goal?: string;
          equipment?: string;
          days_per_week?: number;
          dietary_preference?: string;
          tdee?: number | null;
          subscription_tier?: string;
          onboarding_completed?: boolean;
        };
      };
      exercises: {
        Row: {
          id: string;
          name: string;
          muscle_group: string;
          equipment: string[];
          difficulty: string;
          instructions: string;
          explain_eli5: string;
          default_sets: number;
          default_reps: number;
          default_rest_seconds: number;
          created_at: string;
        };
        Insert: {
          id?: string;
          name: string;
          muscle_group: string;
          equipment?: string[];
          difficulty: string;
          instructions?: string;
          explain_eli5?: string;
          default_sets?: number;
          default_reps?: number;
          default_rest_seconds?: number;
        };
        Update: {
          name?: string;
          muscle_group?: string;
          equipment?: string[];
          difficulty?: string;
          instructions?: string;
          explain_eli5?: string;
          default_sets?: number;
          default_reps?: number;
          default_rest_seconds?: number;
        };
      };
      workout_plans: {
        Row: {
          id: string;
          user_id: string;
          week: number;
          day: number;
          focus: string;
          is_rest_day: boolean;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week: number;
          day: number;
          focus: string;
          is_rest_day?: boolean;
        };
        Update: {
          user_id?: string;
          week?: number;
          day?: number;
          focus?: string;
          is_rest_day?: boolean;
        };
      };
      workout_plan_exercises: {
        Row: {
          id: string;
          workout_plan_id: string;
          exercise_id: string;
          order: number;
          target_sets: number;
          target_reps: number;
          target_rpe: number | null;
          rest_seconds: number;
          explain_why: string | null;
        };
        Insert: {
          id?: string;
          workout_plan_id: string;
          exercise_id: string;
          order: number;
          target_sets: number;
          target_reps: number;
          target_rpe?: number | null;
          rest_seconds?: number;
          explain_why?: string | null;
        };
        Update: {
          workout_plan_id?: string;
          exercise_id?: string;
          order?: number;
          target_sets?: number;
          target_reps?: number;
          target_rpe?: number | null;
          rest_seconds?: number;
          explain_why?: string | null;
        };
      };
      workout_logs: {
        Row: {
          id: string;
          user_id: string;
          workout_plan_id: string;
          started_at: string;
          completed_at: string | null;
          skipped: boolean;
          life_happened: boolean;
        };
        Insert: {
          id?: string;
          user_id: string;
          workout_plan_id: string;
          started_at?: string;
          completed_at?: string | null;
          skipped?: boolean;
          life_happened?: boolean;
        };
        Update: {
          user_id?: string;
          workout_plan_id?: string;
          started_at?: string;
          completed_at?: string | null;
          skipped?: boolean;
          life_happened?: boolean;
        };
      };
      set_logs: {
        Row: {
          id: string;
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg: number;
          rpe: number | null;
        };
        Insert: {
          id?: string;
          workout_log_id: string;
          exercise_id: string;
          set_number: number;
          reps: number;
          weight_kg?: number;
          rpe?: number | null;
        };
        Update: {
          workout_log_id?: string;
          exercise_id?: string;
          set_number?: number;
          reps?: number;
          weight_kg?: number;
          rpe?: number | null;
        };
      };
      meal_plans: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          target_calories: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          meals: unknown;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date: string;
          target_calories: number;
          target_protein_g: number;
          target_carbs_g: number;
          target_fat_g: number;
          meals?: unknown;
        };
        Update: {
          user_id?: string;
          date?: string;
          target_calories?: number;
          target_protein_g?: number;
          target_carbs_g?: number;
          target_fat_g?: number;
          meals?: unknown;
        };
      };
      progress_entries: {
        Row: {
          id: string;
          user_id: string;
          date: string;
          weight_kg: number | null;
          body_fat_pct: number | null;
          photo_url: string | null;
          notes: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          date?: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          photo_url?: string | null;
          notes?: string | null;
        };
        Update: {
          user_id?: string;
          date?: string;
          weight_kg?: number | null;
          body_fat_pct?: number | null;
          photo_url?: string | null;
          notes?: string | null;
        };
      };
      weekly_checkins: {
        Row: {
          id: string;
          user_id: string;
          week: number;
          difficulty_rating: string;
          adjustment_applied: string | null;
          created_at: string;
        };
        Insert: {
          id?: string;
          user_id: string;
          week: number;
          difficulty_rating: string;
          adjustment_applied?: string | null;
        };
        Update: {
          user_id?: string;
          week?: number;
          difficulty_rating?: string;
          adjustment_applied?: string | null;
        };
      };
    };
    Views: Record<string, never>;
    Functions: Record<string, never>;
    Enums: Record<string, never>;
  };
};
