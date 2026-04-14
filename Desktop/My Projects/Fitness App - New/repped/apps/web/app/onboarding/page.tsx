"use client";

import { useState } from "react";
import { supabase } from "../../src/lib/supabase";
import { calculateTDEE } from "@repped/shared";

const steps = ["Basics", "Body", "Experience", "Goal", "Equipment", "Schedule", "Diet"];

export default function Onboarding() {
  const [step, setStep] = useState(0);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);

  // Form data
  const [age, setAge] = useState("");
  const [sex, setSex] = useState<"male" | "female" | "">("");
  const [weight, setWeight] = useState("");
  const [height, setHeight] = useState("");
  const [trainingHistory, setTrainingHistory] = useState("");
  const [goal, setGoal] = useState("");
  const [equipment, setEquipment] = useState("");
  const [daysPerWeek, setDaysPerWeek] = useState<number>(0);
  const [activityLevel, setActivityLevel] = useState("");
  const [dietaryPreference, setDietaryPreference] = useState("");

  const canNext = () => {
    switch (step) {
      case 0: return age && sex;
      case 1: return weight && height;
      case 2: return trainingHistory;
      case 3: return goal;
      case 4: return equipment;
      case 5: return daysPerWeek > 0 && activityLevel;
      case 6: return dietaryPreference;
      default: return false;
    }
  };

  const handleComplete = async () => {
    setLoading(true);
    setError(null);

    const { data: { session: __s } } = await supabase.auth.getSession(); const user = __s?.user; if (!user) return;
    if (!user) { setError("Not signed in"); setLoading(false); return; }

    const tdee = calculateTDEE(
      parseFloat(weight), parseFloat(height), parseInt(age),
      sex as "male" | "female",
      activityLevel as any
    );

    const { error: dbError } = await supabase.from("profiles").upsert({
      id: user.id,
      age: parseInt(age),
      weight_kg: parseFloat(weight),
      height_cm: parseFloat(height),
      sex,
      activity_level: activityLevel,
      training_history: trainingHistory,
      goal,
      equipment,
      days_per_week: daysPerWeek,
      dietary_preference: dietaryPreference,
      tdee,
      onboarding_completed: true,
    } as any);

    setLoading(false);
    if (dbError) { setError(dbError.message); return; }
    window.location.href = "/today";
  };

  const OptionButton = ({ label, value, selected, onClick, desc }: { label: string; value: string; selected: boolean; onClick: () => void; desc?: string }) => (
    <button
      onClick={onClick}
      className={`w-full text-left rounded-2xl p-5 transition-colors ${selected ? "bg-[#0090ff] text-white" : "bg-gray-900 text-gray-300 hover:bg-gray-800"}`}
    >
      <div className="text-lg font-semibold">{label}</div>
      {desc && <div className={`text-sm mt-1 ${selected ? "text-blue-100" : "text-gray-500"}`}>{desc}</div>}
    </button>
  );

  return (
    <main className="min-h-screen bg-black flex flex-col items-center justify-center px-6 py-12">
      <div className="w-full max-w-md">
        {/* Progress */}
        <div className="flex gap-1 mb-2">
          {steps.map((_, i) => (
            <div key={i} className={`h-1 flex-1 rounded-full ${i <= step ? "bg-[#0090ff]" : "bg-gray-800"}`} />
          ))}
        </div>
        <p className="text-gray-500 text-sm mb-6">Step {step + 1} of {steps.length}</p>

        {/* Step 0: Basics */}
        {step === 0 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-8">About You</h1>
            <label className="text-gray-300 text-lg mb-2 block">How old are you?</label>
            <input type="number" placeholder="25" value={age} onChange={e => setAge(e.target.value)}
              className="w-full bg-gray-900 text-white text-xl rounded-2xl px-5 py-4 mb-6 outline-none focus:ring-2 focus:ring-[#0090ff] placeholder:text-gray-600" />
            <label className="text-gray-300 text-lg mb-2 block">Sex</label>
            <p className="text-gray-500 text-sm mb-3">Helps calculate your calories accurately.</p>
            <div className="flex gap-4">
              {(["male", "female"] as const).map(s => (
                <button key={s} onClick={() => setSex(s)}
                  className={`flex-1 rounded-2xl py-4 text-lg font-semibold transition-colors ${sex === s ? "bg-[#0090ff] text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}>
                  {s === "male" ? "Male" : "Female"}
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Step 1: Body */}
        {step === 1 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-8">Your Body</h1>
            <label className="text-gray-300 text-lg mb-2 block">Weight (kg)</label>
            <input type="number" placeholder="70" value={weight} onChange={e => setWeight(e.target.value)}
              className="w-full bg-gray-900 text-white text-xl rounded-2xl px-5 py-4 mb-6 outline-none focus:ring-2 focus:ring-[#0090ff] placeholder:text-gray-600" />
            <label className="text-gray-300 text-lg mb-2 block">Height (cm)</label>
            <input type="number" placeholder="175" value={height} onChange={e => setHeight(e.target.value)}
              className="w-full bg-gray-900 text-white text-xl rounded-2xl px-5 py-4 outline-none focus:ring-2 focus:ring-[#0090ff] placeholder:text-gray-600" />
          </div>
        )}

        {/* Step 2: Experience */}
        {step === 2 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Experience</h1>
            <p className="text-gray-400 mb-6">How long have you been training?</p>
            <div className="space-y-3">
              <OptionButton label="Beginner" desc="New to lifting or less than 6 months" value="beginner" selected={trainingHistory === "beginner"} onClick={() => setTrainingHistory("beginner")} />
              <OptionButton label="Intermediate" desc="6 months to 2 years of consistent training" value="intermediate" selected={trainingHistory === "intermediate"} onClick={() => setTrainingHistory("intermediate")} />
              <OptionButton label="Advanced" desc="2+ years of serious training" value="advanced" selected={trainingHistory === "advanced"} onClick={() => setTrainingHistory("advanced")} />
            </div>
          </div>
        )}

        {/* Step 3: Goal */}
        {step === 3 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Your Goal</h1>
            <p className="text-gray-400 mb-6">What do you want to achieve?</p>
            <div className="space-y-3">
              <OptionButton label="Lose Fat" desc="Drop body fat while keeping muscle" value="lose_fat" selected={goal === "lose_fat"} onClick={() => setGoal("lose_fat")} />
              <OptionButton label="Stay Fit" desc="Maintain your current physique" value="maintain" selected={goal === "maintain"} onClick={() => setGoal("maintain")} />
              <OptionButton label="Build Muscle" desc="Get bigger and stronger" value="build_muscle" selected={goal === "build_muscle"} onClick={() => setGoal("build_muscle")} />
            </div>
          </div>
        )}

        {/* Step 4: Equipment */}
        {step === 4 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Equipment</h1>
            <p className="text-gray-400 mb-6">What do you have access to?</p>
            <div className="space-y-3">
              <OptionButton label="Full Gym" desc="Barbells, dumbbells, cables, machines" value="full_gym" selected={equipment === "full_gym"} onClick={() => setEquipment("full_gym")} />
              <OptionButton label="Dumbbells Only" desc="Home gym or hotel workout" value="dumbbells_only" selected={equipment === "dumbbells_only"} onClick={() => setEquipment("dumbbells_only")} />
              <OptionButton label="Bodyweight" desc="No equipment needed" value="bodyweight" selected={equipment === "bodyweight"} onClick={() => setEquipment("bodyweight")} />
            </div>
          </div>
        )}

        {/* Step 5: Schedule */}
        {step === 5 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Schedule</h1>
            <p className="text-gray-400 mb-6">We'll build your plan around your life.</p>
            <label className="text-gray-300 text-lg mb-3 block">Days per week</label>
            <div className="flex gap-3 mb-8">
              {[2, 3, 4, 5, 6].map(d => (
                <button key={d} onClick={() => setDaysPerWeek(d)}
                  className={`flex-1 rounded-2xl py-4 text-lg font-bold transition-colors ${daysPerWeek === d ? "bg-[#0090ff] text-white" : "bg-gray-900 text-gray-400 hover:bg-gray-800"}`}>
                  {d}
                </button>
              ))}
            </div>
            <label className="text-gray-300 text-lg mb-3 block">Activity outside the gym</label>
            <div className="space-y-3">
              {[
                { v: "sedentary", l: "Sedentary", d: "Desk job, minimal movement" },
                { v: "lightly_active", l: "Lightly Active", d: "Walking, light daily activity" },
                { v: "moderately_active", l: "Moderately Active", d: "On your feet most of the day" },
                { v: "very_active", l: "Very Active", d: "Physical job or active lifestyle" },
              ].map(o => (
                <OptionButton key={o.v} label={o.l} desc={o.d} value={o.v} selected={activityLevel === o.v} onClick={() => setActivityLevel(o.v)} />
              ))}
            </div>
          </div>
        )}

        {/* Step 6: Diet */}
        {step === 6 && (
          <div>
            <h1 className="text-white text-3xl font-bold mb-2">Diet</h1>
            <p className="text-gray-400 mb-6">Any dietary preferences?</p>
            <div className="space-y-3">
              {[
                { v: "no_preference", l: "No Preference" },
                { v: "vegetarian", l: "Vegetarian" },
                { v: "vegan", l: "Vegan" },
                { v: "pescatarian", l: "Pescatarian" },
                { v: "keto", l: "Keto" },
              ].map(o => (
                <OptionButton key={o.v} label={o.l} value={o.v} selected={dietaryPreference === o.v} onClick={() => setDietaryPreference(o.v)} />
              ))}
            </div>
          </div>
        )}

        {error && <p className="text-red-400 text-center mt-4">{error}</p>}

        {/* Navigation */}
        <div className="flex gap-4 mt-8">
          {step > 0 && (
            <button onClick={() => setStep(step - 1)}
              className="flex-1 border border-gray-700 rounded-2xl py-4 text-gray-400 text-lg hover:bg-gray-900 transition-colors">
              Back
            </button>
          )}
          {step < steps.length - 1 ? (
            <button onClick={() => setStep(step + 1)} disabled={!canNext()}
              className={`flex-1 rounded-2xl py-4 text-lg font-semibold transition-colors ${canNext() ? "bg-[#0090ff] text-white hover:bg-[#0070dd]" : "bg-gray-800 text-gray-600"}`}>
              Continue
            </button>
          ) : (
            <button onClick={handleComplete} disabled={!canNext() || loading}
              className={`flex-1 rounded-2xl py-4 text-lg font-semibold transition-colors ${canNext() && !loading ? "bg-[#0090ff] text-white hover:bg-[#0070dd]" : "bg-gray-800 text-gray-600"}`}>
              {loading ? "..." : "Let's Go"}
            </button>
          )}
        </div>
      </div>
    </main>
  );
}
