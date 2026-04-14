/**
 * Fix problem images only — using Imagen 4.0.
 */
const GEMINI_KEY = "AIzaSyAcaiXT_K_1ujombea3IU7i3kvGO3-x9EQ";
const fs = require("fs");
const path = require("path");

const STYLE = "Professional fitness studio photography. Athletic male, medium muscular build, short dark hair, wearing fitted black t-shirt and dark grey athletic shorts, black training shoes. Clean light grey seamless studio background. Soft even studio lighting with no harsh shadows. Sharp focus. 3/4 side view from waist height. Full body visible and centered. No text, no logos, no watermarks. Photorealistic.";

const EXERCISES = [
  { name: "Hip Thrust", form: "His UPPER BACK and SHOULDERS are resting against the SIDE EDGE of a flat weight bench. His butt is OFF the ground. A loaded BARBELL is across his HIP CREASE. His HIPS are ELEVATED — thighs and torso form a flat tabletop shape. Knees bent 90 degrees, feet flat on floor. He is NOT sitting on or lying on the bench. The bench supports only his upper back. Hips are in the air." },
  { name: "Diamond Push-Up", form: "In a push-up position on the floor. Hands placed directly under chest with THUMBS and INDEX FINGERS TOUCHING to form a clear DIAMOND or TRIANGLE shape. Close-up angle showing the diamond hand position clearly. In the down position with chest near hands." },
  { name: "Calf Raise", form: "Standing on the EDGE of a raised platform or step. BOTH feet on the platform with only the BALLS of his feet on the edge. Heels hanging OFF the back edge. RISING UP on his TOES as high as possible. Legs straight. Holding dumbbells at sides. Side view showing elevated heels." },
  { name: "Skull Crusher", form: "LYING FLAT on his back on a flat bench. Holding an EZ-CURL BAR (zigzag barbell) with arms extended above his chest. LOWERING the bar toward his FOREHEAD by bending ONLY at the elbows. Upper arms stay vertical and stationary. Bar is near the forehead. Side view showing him lying flat." },
  { name: "Barbell Row", form: "Standing with feet shoulder-width apart, BENT OVER at 45 degrees at the waist. Knees slightly bent. Holding a loaded BARBELL with overhand grip, PULLING it up toward lower chest/belly. Back is flat and straight, not rounded. The bent-over position is the key." },
  { name: "Dumbbell Fly", form: "LYING FLAT on his back on a FLAT bench (not incline). Arms spread WIDE OPEN to the sides in a hugging arc. Holding a dumbbell in each hand. Elbows have a slight 15-degree bend. Arms are wide open like wings. The open chest stretch position." },
  { name: "Cable Row", form: "SEATED on a seated cable row machine bench. Feet planted on the foot platform in front. Pulling a V-handle attachment toward his lower torso/belly with both hands. Torso upright, chest out, slight lean back. SEATED position is key." },
  { name: "Romanian Deadlift", form: "Standing holding a loaded BARBELL. HINGED FORWARD at the hips with torso at about 45 degrees. The bar is sliding DOWN along his thighs toward his shins. Knees are SLIGHTLY bent but mostly straight. Back is flat. He is NOT standing upright — the hip hinge position is key." },
  { name: "Leg Curl", form: "LYING FACE DOWN (prone) on a leg curl machine. Ankles hooked under the roller pad. CURLING his legs UP by bending his knees, bringing heels toward his glutes. He is lying face down on the machine pad." },
  { name: "Rear Delt Fly", form: "BENT OVER at the waist, torso nearly parallel to the floor. Holding a dumbbell in each hand. Arms pulling dumbbells OUT TO THE SIDES with slightly bent elbows. Squeezing shoulder blades together. The bent-over position with arms wide is the key." },
  { name: "Shrug", form: "Standing upright holding a heavy DUMBBELL in each hand at his sides. SHOULDERS are VISIBLY ELEVATED and RAISED UP toward his ears as high as possible. Trapezius muscles are clearly engaged and bunched up. Arms straight, only shoulders moving up." },
  { name: "Kickback", form: "BENT OVER with left hand and left knee on a flat bench for support. Right arm holding a DUMBBELL. Right ELBOW pinned at his side. EXTENDING the right forearm BACKWARD until the arm is straight and parallel to the floor. This is a TRICEP dumbbell kickback, not a cable glute kickback." },
  { name: "Close Grip Bench Press", form: "LYING FLAT on his back on a flat bench. Hands placed CLOSE TOGETHER on the barbell, approximately 8 inches apart (inside shoulder width). Pressing the barbell up from chest. The NARROW hand spacing is the key difference from regular bench press. Side view showing him lying down." },
  { name: "Overhead Tricep Extension", form: "Standing upright. Holding ONE dumbbell with BOTH HANDS behind his head. Elbows pointing straight UP toward ceiling, close to ears. The dumbbell is BEHIND his neck/head. He is in the LOWERED position showing the deep elbow bend. Arms are not extended — they are bent." },
  { name: "Kettlebell Swing", form: "Standing with feet wider than shoulder-width. Holding a KETTLEBELL (distinctive round cast iron weight with a thick handle on top) with both hands. The kettlebell is at the TOP of the swing at shoulder height with arms extended forward. Hips are fully extended. The kettlebell shape must be clearly recognizable." },
  { name: "Burpee", form: "In the PUSH-UP/PLANK phase of a burpee. Hands on floor, body in plank or push-up position. One or both feet jumping forward toward hands. Showing the transition from plank to standing. Dynamic action." },
  { name: "Crunch", form: "LYING on his back on the floor. Knees bent, feet flat. Hands behind head or across chest. CURLING his upper body UP — only his shoulders and upper back lift off the ground, NOT a full sit-up. Lower back stays on the floor. The partial curl is key." },
  { name: "Leg Raise", form: "LYING FLAT on his back on the floor or a flat bench. Legs STRAIGHT. RAISING both legs upward toward the ceiling while keeping them straight. Legs are at about 45-60 degrees. Hands flat at sides or gripping bench edge. The lying flat position with legs elevated." },
  { name: "Mountain Climber", form: "In a push-up position with arms straight. ONE KNEE is DRIVEN FORWARD toward his chest. The other leg is extended back. This shows the running-in-place motion. Dynamic action pose showing the knee drive clearly." },
  { name: "Chin-Up", form: "Hanging from a pull-up bar with UNDERHAND grip (palms facing TOWARD him). Pulling himself up with chin above bar. Hands shoulder-width apart. The SUPINATED underhand grip with palms facing him is the defining feature." },
  { name: "Preacher Curl", form: "SEATED at a preacher curl bench. His UPPER ARMS are resting FLAT against the angled preacher PAD from armpit to elbow. Curling an EZ-bar or barbell UPWARD. Arms are isolated and supported by the pad. The pad is clearly visible under his arms." },
  { name: "Arnold Press", form: "Standing or seated. Holding dumbbells at shoulder height. IN THE MIDDLE of the rotation — one arm showing palm facing toward him while the other is rotating outward and pressing up. The ROTATION from palms-in to palms-out during the press is the key feature." },
  { name: "Bench Press", form: "LYING FLAT on his back on a flat weight bench. Pressing a loaded BARBELL straight up above his mid-chest. Arms extended but not locked. Feet flat on floor. Back slightly arched. Side view showing him lying down with barbell above chest." },
  { name: "Dumbbell Pullover", form: "LYING on his back on a flat bench. Holding ONE dumbbell with BOTH hands (interlocked grip) with arms extended. The dumbbell is being lowered BEHIND and OVER his head in an arc. Arms mostly straight with slight bend. Side view showing the arc motion behind head." },
];

async function generate(prompt) {
  const res = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: { sampleCount: 1, aspectRatio: "1:1", personGeneration: "allow_adult", safetySetting: "block_low_and_above" },
      }),
    }
  );
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 200)}`);
  const d = await res.json();
  if (d.predictions?.[0]?.bytesBase64Encoded) return Buffer.from(d.predictions[0].bytesBase64Encoded, "base64");
  throw new Error("No image");
}

async function main() {
  const dir = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");
  console.log(`=== Imagen 4.0 — Fixing ${EXERCISES.length} images ===\n`);
  let ok = 0, fail = 0;
  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, form } = EXERCISES[i];
    const file = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";
    try {
      console.log(`[${i+1}/${EXERCISES.length}] ${name}...`);
      const buf = await generate(`${STYLE} ${form}`);
      fs.writeFileSync(path.join(dir, file), buf);
      console.log(`  ✓ ${file}`);
      ok++;
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
      fail++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }
  console.log(`\n=== ${ok} success, ${fail} failed ===`);
}
main().catch(console.error);
