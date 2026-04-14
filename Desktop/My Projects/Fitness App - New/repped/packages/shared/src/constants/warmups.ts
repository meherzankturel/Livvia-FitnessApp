import type { WarmUpExercise, CoolDownExercise } from "../types/warmup";

export const WARMUP_BY_FOCUS: Record<string, WarmUpExercise[]> = {
  Push: [
    { name: "Jumping Jacks", duration_seconds: 60, instructions: "Jump feet wide while raising arms overhead. Keep a steady pace.", type: "general", stretchType: "dynamic" },
    { name: "Arm Circles", duration_seconds: 30, instructions: "Extend arms to sides. Make small circles, gradually increasing size.", type: "dynamic", stretchType: "dynamic" },
    { name: "Chest Openers", duration_seconds: 30, instructions: "Clasp hands behind back, squeeze shoulder blades, lift chest.", type: "dynamic", stretchType: "dynamic" },
    { name: "Band Pull-Aparts", duration_seconds: 30, instructions: "Hold band at shoulder width, pull apart squeezing upper back.", type: "dynamic", stretchType: "dynamic" },
    { name: "Wall Push-Ups", duration_seconds: 45, instructions: "10 slow push-ups against a wall to warm up chest and shoulders.", type: "specific", stretchType: "dynamic" },
  ],
  Pull: [
    { name: "Jumping Jacks", duration_seconds: 60, instructions: "Jump feet wide while raising arms overhead. Keep a steady pace.", type: "general", stretchType: "dynamic" },
    { name: "Cat-Cow Stretch", duration_seconds: 40, instructions: "On all fours, arch and round your back alternately. Breathe deeply.", type: "dynamic", stretchType: "dynamic" },
    { name: "Thoracic Rotations", duration_seconds: 30, instructions: "On all fours, place hand behind head. Rotate chest toward ceiling, then floor.", type: "dynamic", stretchType: "dynamic" },
    { name: "Shoulder Dislocates", duration_seconds: 30, instructions: "Hold a band wide, pass it over your head and behind your back in an arc.", type: "dynamic", stretchType: "dynamic" },
    { name: "Scapular Pull-Ups", duration_seconds: 30, instructions: "Hang from bar, pull shoulder blades down and together without bending elbows.", type: "specific", stretchType: "dynamic" },
  ],
  Legs: [
    { name: "High Knees", duration_seconds: 60, instructions: "March in place, driving knees up to hip height. Pump your arms.", type: "general", stretchType: "dynamic" },
    { name: "Leg Swings (Forward)", duration_seconds: 30, instructions: "Hold a wall, swing one leg forward and back. 10 each side.", type: "dynamic", stretchType: "dynamic" },
    { name: "Leg Swings (Lateral)", duration_seconds: 30, instructions: "Swing leg side to side across your body. 10 each side.", type: "dynamic", stretchType: "dynamic" },
    { name: "Hip Circles", duration_seconds: 30, instructions: "Hands on hips, make large circles. 10 each direction.", type: "dynamic", stretchType: "dynamic" },
    { name: "Bodyweight Squats", duration_seconds: 45, instructions: "10 slow bodyweight squats. Focus on depth and control.", type: "specific", stretchType: "dynamic" },
    { name: "Walking Lunges", duration_seconds: 30, instructions: "5 walking lunges each leg. Go slow, feel the stretch.", type: "specific", stretchType: "dynamic" },
  ],
  Upper: [
    { name: "Jumping Jacks", duration_seconds: 60, instructions: "Jump feet wide while raising arms overhead. Keep a steady pace.", type: "general", stretchType: "dynamic" },
    { name: "Arm Circles", duration_seconds: 30, instructions: "Extend arms to sides. Make small circles, gradually increasing size.", type: "dynamic", stretchType: "dynamic" },
    { name: "Cat-Cow Stretch", duration_seconds: 40, instructions: "On all fours, arch and round your back alternately. Breathe deeply.", type: "dynamic", stretchType: "dynamic" },
    { name: "Band Pull-Aparts", duration_seconds: 30, instructions: "Hold band at shoulder width, pull apart squeezing upper back.", type: "dynamic", stretchType: "dynamic" },
    { name: "Light Push-Ups", duration_seconds: 30, instructions: "5 slow push-ups to warm up pressing muscles.", type: "specific", stretchType: "dynamic" },
  ],
  Lower: [
    { name: "High Knees", duration_seconds: 60, instructions: "March in place, driving knees up to hip height. Pump your arms.", type: "general", stretchType: "dynamic" },
    { name: "Leg Swings (Forward)", duration_seconds: 30, instructions: "Hold a wall, swing one leg forward and back. 10 each side.", type: "dynamic", stretchType: "dynamic" },
    { name: "Hip Circles", duration_seconds: 30, instructions: "Hands on hips, make large circles. 10 each direction.", type: "dynamic", stretchType: "dynamic" },
    { name: "Glute Bridges", duration_seconds: 30, instructions: "Lie on back, drive hips up. 10 reps, squeeze at top.", type: "dynamic", stretchType: "dynamic" },
    { name: "Bodyweight Squats", duration_seconds: 45, instructions: "10 slow bodyweight squats. Focus on depth and control.", type: "specific", stretchType: "dynamic" },
  ],
  "Full Body A": [
    { name: "Jumping Jacks", duration_seconds: 60, instructions: "Jump feet wide while raising arms overhead.", type: "general", stretchType: "dynamic" },
    { name: "Arm Circles", duration_seconds: 30, instructions: "Extend arms, make circles increasing in size.", type: "dynamic", stretchType: "dynamic" },
    { name: "Leg Swings", duration_seconds: 30, instructions: "Swing each leg forward and back, 10 each.", type: "dynamic", stretchType: "dynamic" },
    { name: "Inchworms", duration_seconds: 45, instructions: "Bend over, walk hands out to plank, walk back. 5 reps.", type: "dynamic", stretchType: "dynamic" },
  ],
  "Full Body B": [
    { name: "High Knees", duration_seconds: 60, instructions: "March in place driving knees high.", type: "general", stretchType: "dynamic" },
    { name: "Hip Circles", duration_seconds: 30, instructions: "Hands on hips, large circles both directions.", type: "dynamic", stretchType: "dynamic" },
    { name: "Shoulder Dislocates", duration_seconds: 30, instructions: "Band overhead and behind back in an arc.", type: "dynamic", stretchType: "dynamic" },
    { name: "Bodyweight Squats", duration_seconds: 45, instructions: "10 slow squats focusing on depth.", type: "specific", stretchType: "dynamic" },
  ],
  "Full Body C": [
    { name: "Jumping Jacks", duration_seconds: 60, instructions: "Jump feet wide while raising arms overhead.", type: "general", stretchType: "dynamic" },
    { name: "Cat-Cow Stretch", duration_seconds: 40, instructions: "On all fours, arch and round alternately.", type: "dynamic", stretchType: "dynamic" },
    { name: "Walking Lunges", duration_seconds: 30, instructions: "5 walking lunges each leg.", type: "dynamic", stretchType: "dynamic" },
    { name: "Light Push-Ups", duration_seconds: 30, instructions: "5 slow push-ups.", type: "specific", stretchType: "dynamic" },
  ],
};

export const COOLDOWN_BY_FOCUS: Record<string, CoolDownExercise[]> = {
  Push: [
    { name: "Chest Doorway Stretch", hold_seconds: 30, instructions: "Place forearm on doorframe at shoulder height, lean through. Hold each side.", target_muscles: ["chest"], stretchType: "static" },
    { name: "Tricep Overhead Stretch", hold_seconds: 30, instructions: "Reach one arm behind your head, use other hand to gently push elbow down.", target_muscles: ["triceps"], stretchType: "static" },
    { name: "Shoulder Cross-Body Stretch", hold_seconds: 30, instructions: "Pull one arm across your chest with the other hand. Hold each side.", target_muscles: ["shoulders"], stretchType: "static" },
    { name: "Child's Pose", hold_seconds: 45, instructions: "Kneel, sit back on heels, reach arms forward on the floor. Breathe deeply.", target_muscles: ["back", "shoulders"], stretchType: "static" },
  ],
  Pull: [
    { name: "Lat Stretch", hold_seconds: 30, instructions: "Grab a doorframe overhead with one hand, lean away. Hold each side.", target_muscles: ["back"], stretchType: "static" },
    { name: "Bicep Wall Stretch", hold_seconds: 30, instructions: "Place palm on wall behind you, fingers pointing down. Lean forward.", target_muscles: ["biceps"], stretchType: "static" },
    { name: "Cat-Cow Stretch", hold_seconds: 45, instructions: "On all fours, slowly arch and round your back. 5 cycles.", target_muscles: ["back", "core"], stretchType: "static" },
    { name: "Neck Rolls", hold_seconds: 30, instructions: "Slowly roll head in circles, 5 each direction.", target_muscles: ["neck"], stretchType: "static" },
  ],
  Legs: [
    { name: "Quad Stretch", hold_seconds: 30, instructions: "Stand on one leg, grab ankle behind you, pull heel to glute. Hold each side.", target_muscles: ["quads"], stretchType: "static" },
    { name: "Hamstring Stretch", hold_seconds: 30, instructions: "Sit with one leg extended, reach for toes. Hold each side.", target_muscles: ["hamstrings"], stretchType: "static" },
    { name: "Pigeon Stretch", hold_seconds: 45, instructions: "From push-up position, bring one knee to same wrist. Lower hips. Hold each side.", target_muscles: ["glutes", "hip flexors"], stretchType: "static" },
    { name: "Calf Stretch", hold_seconds: 30, instructions: "Step one foot back, press heel into floor, lean forward. Hold each side.", target_muscles: ["calves"], stretchType: "static" },
    { name: "Butterfly Stretch", hold_seconds: 30, instructions: "Sit with soles of feet together, gently press knees toward floor.", target_muscles: ["adductors"], stretchType: "static" },
  ],
  Upper: [
    { name: "Chest Doorway Stretch", hold_seconds: 30, instructions: "Forearm on doorframe, lean through. Hold each side.", target_muscles: ["chest"], stretchType: "static" },
    { name: "Lat Stretch", hold_seconds: 30, instructions: "Grab doorframe overhead, lean away. Hold each side.", target_muscles: ["back"], stretchType: "static" },
    { name: "Tricep Stretch", hold_seconds: 30, instructions: "Arm behind head, push elbow down. Hold each side.", target_muscles: ["triceps"], stretchType: "static" },
    { name: "Shoulder Stretch", hold_seconds: 30, instructions: "Arm across chest, hold with other hand. Each side.", target_muscles: ["shoulders"], stretchType: "static" },
  ],
  Lower: [
    { name: "Quad Stretch", hold_seconds: 30, instructions: "Grab ankle behind you, pull to glute. Each side.", target_muscles: ["quads"], stretchType: "static" },
    { name: "Hamstring Stretch", hold_seconds: 30, instructions: "Sit, extend one leg, reach for toes. Each side.", target_muscles: ["hamstrings"], stretchType: "static" },
    { name: "Pigeon Stretch", hold_seconds: 45, instructions: "Knee to wrist, lower hips. Each side.", target_muscles: ["glutes"], stretchType: "static" },
    { name: "Calf Stretch", hold_seconds: 30, instructions: "Step back, heel down, lean forward. Each side.", target_muscles: ["calves"], stretchType: "static" },
  ],
  "Full Body A": [
    { name: "Chest Stretch", hold_seconds: 30, instructions: "Forearm on doorframe, lean through.", target_muscles: ["chest"], stretchType: "static" },
    { name: "Quad Stretch", hold_seconds: 30, instructions: "Grab ankle, pull to glute. Each side.", target_muscles: ["quads"], stretchType: "static" },
    { name: "Child's Pose", hold_seconds: 45, instructions: "Kneel, sit back, reach arms forward.", target_muscles: ["back"], stretchType: "static" },
  ],
  "Full Body B": [
    { name: "Shoulder Stretch", hold_seconds: 30, instructions: "Arm across chest. Each side.", target_muscles: ["shoulders"], stretchType: "static" },
    { name: "Hamstring Stretch", hold_seconds: 30, instructions: "Sit, reach for toes. Each side.", target_muscles: ["hamstrings"], stretchType: "static" },
    { name: "Pigeon Stretch", hold_seconds: 45, instructions: "Knee to wrist, lower hips. Each side.", target_muscles: ["glutes"], stretchType: "static" },
  ],
  "Full Body C": [
    { name: "Chest Stretch", hold_seconds: 30, instructions: "Forearm on doorframe, lean through.", target_muscles: ["chest"], stretchType: "static" },
    { name: "Lat Stretch", hold_seconds: 30, instructions: "Grab overhead, lean away. Each side.", target_muscles: ["back"], stretchType: "static" },
    { name: "Quad Stretch", hold_seconds: 30, instructions: "Grab ankle, pull to glute.", target_muscles: ["quads"], stretchType: "static" },
  ],
};
