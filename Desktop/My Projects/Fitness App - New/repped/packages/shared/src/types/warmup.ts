export interface WarmUpExercise {
  name: string;
  duration_seconds: number;
  instructions: string;
  type: "general" | "dynamic" | "specific";
  /** Always "dynamic" for warmups — static stretching before lifting reduces performance */
  stretchType: "dynamic";
}

export interface CoolDownExercise {
  name: string;
  hold_seconds: number;
  instructions: string;
  target_muscles: string[];
  /** Always "static" for cooldowns — deep holds improve flexibility and aid recovery */
  stretchType: "static";
}
