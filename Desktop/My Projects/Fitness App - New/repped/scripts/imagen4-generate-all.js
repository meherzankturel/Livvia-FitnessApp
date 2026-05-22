/**
 * Regenerate ALL exercise images using Imagen 4.0 (highest quality).
 * Every prompt specifies exact grip, equipment, body position, and the defining feature.
 */
const GEMINI_KEY = process.env.GEMINI_KEY;
if (!GEMINI_KEY) throw new Error("Set GEMINI_KEY in your environment (do not hardcode API keys).");
const fs = require("fs");
const path = require("path");

const STYLE = "Professional fitness studio photography. Athletic male, medium muscular build, short dark hair, wearing fitted black t-shirt and dark grey athletic shorts, black training shoes. Clean light grey seamless studio background. Soft even studio lighting with no harsh shadows. Sharp focus. 3/4 side view from waist height. Full body visible and centered. No text, no logos, no watermarks. Photorealistic.";

const EXERCISES = [
  // ─── CHEST ───
  { name: "Bench Press", form: "LYING FLAT on his back on a flat weight bench. Pressing a loaded BARBELL straight up above his mid-chest. Arms extended but not locked. Feet flat on floor. Back slightly arched. Side view showing him lying down with barbell above chest." },
  { name: "Incline Bench Press", form: "LYING on an INCLINE bench set to 30-45 degrees. Pressing a loaded BARBELL upward from upper chest. Arms extended. Feet on floor. The incline angle of the bench must be clearly visible." },
  { name: "Incline Dumbbell Press", form: "LYING on an incline bench set to 30-45 degrees. Pressing a DUMBBELL in each hand upward from shoulder level. Arms extended above upper chest. Neutral or pronated grip." },
  { name: "Dumbbell Fly", form: "LYING FLAT on his back on a FLAT bench (not incline). Arms spread WIDE OPEN to the sides in a hugging arc. Holding a dumbbell in each hand. Elbows have a slight 15-degree bend. Arms are wide open like wings. The open chest stretch position." },
  { name: "Cable Crossover", form: "Standing between two high cable pulleys. Pulling cable handles DOWN and TOGETHER in front of his chest in a hugging motion. Slight forward lean. Arms making an X shape as cables cross. One foot slightly forward." },
  { name: "Push-Up", form: "In a standard push-up position on the floor. Hands shoulder-width apart, fingers forward. Body straight from head to heels. In the DOWN position with chest near the floor. Arms bent at 90 degrees." },
  { name: "Diamond Push-Up", form: "In a push-up position on the floor. Hands placed directly under chest with THUMBS and INDEX FINGERS TOUCHING to form a clear DIAMOND or TRIANGLE shape. Close-up angle showing the diamond hand position clearly. In the down position with chest near hands." },
  { name: "Chest Dip", form: "On parallel dip bars/station. Body LEANING FORWARD about 30 degrees to target chest. Arms bent, lowered position. Legs crossed behind. The forward lean distinguishes this from a tricep dip." },
  { name: "Dumbbell Pullover", form: "LYING on his back on a flat bench. Holding ONE dumbbell with BOTH hands (interlocked grip) with arms extended. The dumbbell is being lowered BEHIND and OVER his head in an arc. Arms mostly straight with slight bend. Side view showing the arc motion behind head." },

  // ─── BACK ───
  { name: "Barbell Row", form: "Standing with feet shoulder-width apart, BENT OVER at 45 degrees at the waist. Knees slightly bent. Holding a loaded BARBELL with overhand grip, PULLING it up toward lower chest/belly. Back is flat and straight, not rounded. The bent-over position is the key." },
  { name: "Lat Pulldown", form: "SEATED at a lat pulldown machine FACING FORWARD. Thighs secured under the knee pad. Gripping a wide lat bar overhead with wide overhand grip. PULLING the bar down to UPPER CHEST in front. Chest is pushed forward. Seated front-facing view." },
  { name: "Pull-Up", form: "Hanging from a pull-up bar with OVERHAND grip (palms facing AWAY). Pulling himself UP with chin above the bar. Wide grip, slightly wider than shoulders. Full body hanging. The overhand/pronated grip must be visible." },
  { name: "Chin-Up", form: "Hanging from a pull-up bar with UNDERHAND grip (palms facing TOWARD him). Pulling himself up with chin above bar. Hands shoulder-width apart. The SUPINATED underhand grip with palms facing him is the defining feature." },
  { name: "Cable Row", form: "SEATED on a seated cable row machine bench. Feet planted on the foot platform in front. Pulling a V-handle attachment toward his lower torso/belly with both hands. Torso upright, chest out, slight lean back. SEATED position is key." },
  { name: "Face Pull", form: "Standing in front of a cable machine with high pulley. Pulling a ROPE attachment toward his FACE with both hands. ELBOWS are HIGH and flared out at EAR LEVEL. Hands are near his temples, pulling the rope apart. External rotation visible." },

  // ─── SHOULDERS ───
  { name: "Overhead Press", form: "Standing upright. Pressing a loaded BARBELL from shoulder level straight overhead to full arm extension. Feet shoulder-width apart. Core braced. Bar is directly overhead at the top position." },
  { name: "Lateral Raise", form: "Standing upright. Holding a DUMBBELL in each hand. Arms raised out to the SIDES to shoulder height. Elbows have a slight bend. Arms horizontal like a T-shape. The side-raise position at the top." },
  { name: "Arnold Press", form: "Standing or seated. Holding dumbbells at shoulder height. IN THE MIDDLE of the rotation — one arm showing palm facing toward him while the other is rotating outward and pressing up. The ROTATION from palms-in to palms-out during the press is the key feature." },
  { name: "Front Raise", form: "Standing upright. Holding a dumbbell in each hand. Raising one or both dumbbells straight in FRONT to shoulder height with arms nearly straight. The forward raise to eye level." },
  { name: "Rear Delt Fly", form: "BENT OVER at the waist, torso nearly parallel to the floor. Holding a dumbbell in each hand. Arms pulling dumbbells OUT TO THE SIDES with slightly bent elbows. Squeezing shoulder blades together. The bent-over position with arms wide is the key." },
  { name: "Shrug", form: "Standing upright holding a heavy DUMBBELL in each hand at his sides. SHOULDERS are VISIBLY ELEVATED and RAISED UP toward his ears as high as possible. Trapezius muscles are clearly engaged and bunched up. Arms straight, only shoulders moving up." },
  { name: "Upright Row", form: "Standing upright. Holding a BARBELL with narrow overhand grip. PULLING the bar straight up close to his body from waist to chin level. Elbows pointing OUT and UP above the bar. Bar is at upper chest/chin level." },

  // ─── BICEPS ───
  { name: "Barbell Curl", form: "Standing upright. CURLING a straight BARBELL or EZ-bar with both hands using an underhand grip. Elbows pinned at sides, forearms curling upward. Bar is at mid-curl position near chest height." },
  { name: "Dumbbell Curl", form: "Standing upright. Holding a DUMBBELL in one hand, curling it upward with a SUPINATED grip (palm facing up). Elbow pinned at side. The other arm is at rest or also curling alternately." },
  { name: "Hammer Curl", form: "Standing upright. Holding a DUMBBELL in each hand with NEUTRAL grip (palms facing INWARD toward each other, thumbs pointing up). Curling upward while maintaining the neutral wrist position. The thumbs-up grip is the defining feature." },
  { name: "Preacher Curl", form: "SEATED at a preacher curl bench. His UPPER ARMS are resting FLAT against the angled preacher PAD from armpit to elbow. Curling an EZ-bar or barbell UPWARD. Arms are isolated and supported by the pad. The pad is clearly visible under his arms." },
  { name: "Concentration Curl", form: "SEATED on a flat bench. Leaning forward. One arm hanging between his legs holding a DUMBBELL. ELBOW BRACED against the INNER THIGH of the same side. Curling the dumbbell up. The elbow-on-thigh position is the defining feature." },

  // ─── TRICEPS ───
  { name: "Tricep Pushdown", form: "Standing at a cable machine with a high pulley. Pushing a straight bar or rope attachment DOWNWARD with both hands. ELBOWS pinned tight at his sides. Forearms pushing down until arms are fully extended. Upper arms don't move." },
  { name: "Skull Crusher", form: "LYING FLAT on his back on a flat bench. Holding an EZ-CURL BAR (zigzag barbell) with arms extended above his chest. LOWERING the bar toward his FOREHEAD by bending ONLY at the elbows. Upper arms stay vertical and stationary. Bar is near the forehead. Side view showing him lying flat." },
  { name: "Close Grip Bench Press", form: "LYING FLAT on his back on a flat bench. Hands placed CLOSE TOGETHER on the barbell, approximately 8 inches apart (inside shoulder width). Pressing the barbell up from chest. The NARROW hand spacing is the key difference from regular bench press. Side view showing him lying down." },
  { name: "Overhead Tricep Extension", form: "Standing upright. Holding ONE dumbbell with BOTH HANDS behind his head. Elbows pointing straight UP toward ceiling, close to ears. The dumbbell is BEHIND his neck/head. He is in the LOWERED position showing the deep elbow bend. Arms are not extended — they are bent." },
  { name: "Kickback", form: "BENT OVER with left hand and left knee on a flat bench for support. Right arm holding a DUMBBELL. Right ELBOW pinned at his side. EXTENDING the right forearm BACKWARD until the arm is straight and parallel to the floor. This is a TRICEP dumbbell kickback, not a cable glute kickback." },
  { name: "Tricep Dip", form: "On parallel dip bars. Body is UPRIGHT (vertical, NOT leaning forward). Arms bent, in the lowered position. Legs hanging straight down or slightly forward. The upright posture targets triceps vs the forward lean for chest." },

  // ─── LEGS ───
  { name: "Barbell Squat", form: "Standing with a loaded BARBELL resting on his UPPER BACK/traps. In the BOTTOM position of a squat with thighs parallel to floor. Feet shoulder-width apart, toes slightly out. Back straight, chest up. Knees tracking over toes." },
  { name: "Leg Press", form: "SEATED in a 45-degree leg press machine. Back flat against the seat pad. Feet placed shoulder-width on the foot platform above. Pressing the platform away by extending legs. The machine structure is visible." },
  { name: "Romanian Deadlift", form: "Standing holding a loaded BARBELL. HINGED FORWARD at the hips with torso at about 45 degrees. The bar is sliding DOWN along his thighs toward his shins. Knees are SLIGHTLY bent but mostly straight. Back is flat. He is NOT standing upright — the hip hinge position is key." },
  { name: "Deadlift", form: "Standing with a loaded BARBELL on the floor in front. In the starting/pulling position — hips hinged back, knees bent, gripping the bar with straight arms, back flat, about to pull. Or mid-pull with the bar just below knee height." },
  { name: "Leg Extension", form: "SEATED on a leg extension machine. Back against the pad. Ankles hooked under the roller pad. Extending legs outward to nearly straight. The quadriceps are engaged. Seated machine exercise." },
  { name: "Leg Curl", form: "LYING FACE DOWN (prone) on a leg curl machine. Ankles hooked under the roller pad. CURLING his legs UP by bending his knees, bringing heels toward his glutes. He is lying face down on the machine pad." },
  { name: "Calf Raise", form: "Standing on the EDGE of a raised platform or step. BOTH feet on the platform with only the BALLS of his feet on the edge. Heels hanging OFF the back edge. RISING UP on his TOES as high as possible. Legs straight. Holding dumbbells at sides. Side view showing elevated heels." },
  { name: "Lunge", form: "Standing in a split stance. One foot forward, one foot back. BOTH knees bent at approximately 90 degrees. Torso upright. Back knee nearly touching the floor. Hands clasped in front or holding dumbbells at sides." },
  { name: "Hip Thrust", form: "His UPPER BACK and SHOULDERS are resting against the SIDE EDGE of a flat weight bench. His butt is OFF the ground. A loaded BARBELL is across his HIP CREASE. His HIPS are ELEVATED — thighs and torso form a flat tabletop shape. Knees bent 90 degrees, feet flat on floor. He is NOT sitting on or lying on the bench. The bench supports only his upper back. Hips are in the air." },
  { name: "Goblet Squat", form: "Standing, holding a KETTLEBELL or single dumbbell at CHEST level with both hands (goblet grip). In the bottom squat position. Elbows between knees. Feet shoulder-width, toes slightly out." },
  { name: "Bulgarian Split Squat", form: "One foot on the ground in front. REAR foot elevated on a bench BEHIND him (top of foot resting on bench). Holding dumbbells at sides. In the lowered lunge position with front knee bent ~90 degrees." },
  { name: "Step-Up", form: "Stepping UP onto a raised box or platform with one foot. The drive leg is bent on top of the box. Other leg is hanging or pushing off the ground. Holding dumbbells at sides. The step-up motion is clear." },

  // ─── CORE ───
  { name: "Plank", form: "In a forearm plank position on the floor. FOREARMS flat on the ground, elbows under shoulders. Body forming a straight line from head to heels. Core engaged, not sagging or piking. Side view showing the straight body line." },
  { name: "Crunch", form: "LYING on his back on the floor. Knees bent, feet flat. Hands behind head or across chest. CURLING his upper body UP — only his shoulders and upper back lift off the ground, NOT a full sit-up. Lower back stays on the floor. The partial curl is key." },
  { name: "Leg Raise", form: "LYING FLAT on his back on the floor or a flat bench. Legs STRAIGHT. RAISING both legs upward toward the ceiling while keeping them straight. Legs are at about 45-60 degrees. Hands flat at sides or gripping bench edge. The lying flat position with legs elevated." },
  { name: "Russian Twist", form: "SEATED on the floor. Torso leaned back at ~45 degrees. Knees bent, feet slightly off the floor. Holding a weight plate or medicine ball with both hands. ROTATING his torso to one side. The twist rotation is the key movement." },
  { name: "Mountain Climber", form: "In a push-up position with arms straight. ONE KNEE is DRIVEN FORWARD toward his chest. The other leg is extended back. This shows the running-in-place motion. Dynamic action pose showing the knee drive clearly." },
  { name: "Ab Wheel Rollout", form: "KNEELING on the floor. Both hands gripping an AB WHEEL on the floor. Rolled FORWARD with arms extended far in front, body stretched out in a long line from knees to hands. The extended/stretched position. The ab wheel is visible on the floor." },

  // ─── FULL BODY ───
  { name: "Clean and Press", form: "Standing with a loaded BARBELL pressed fully overhead with straight arms. Feet shoulder-width apart. The barbell is at the top lockout position overhead. Full body visible showing the completed clean and press." },
  { name: "Burpee", form: "In the PUSH-UP/PLANK phase of a burpee. Hands on floor, body in plank or push-up position. One or both feet jumping forward toward hands. Showing the transition from plank to standing. Dynamic action." },
  { name: "Kettlebell Swing", form: "Standing with feet wider than shoulder-width. Holding a KETTLEBELL (distinctive round cast iron weight with a thick handle on top) with both hands. The kettlebell is at the TOP of the swing at shoulder height with arms extended forward. Hips are fully extended. The kettlebell shape must be clearly recognizable." },
  { name: "Band Pull-Apart", form: "Standing upright. Holding a resistance BAND with both hands at shoulder height, arms extended forward. PULLING the band APART horizontally by spreading arms wide to the sides. The stretched band across his chest." },
];

async function generateWithImagen4(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          personGeneration: "allow_adult",
          safetySetting: "block_only_high",
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Imagen 4.0 failed (${response.status}): ${err.slice(0, 300)}`);
  }

  const data = await response.json();
  if (data.predictions?.[0]?.bytesBase64Encoded) {
    return Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
  }
  throw new Error("No image data in response");
}

async function main() {
  const dir = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  console.log(`=== Generating ${EXERCISES.length} images with Imagen 4.0 ===\n`);

  let success = 0, fail = 0;

  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, form } = EXERCISES[i];
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";
    const fullPrompt = `${STYLE} ${form}`;

    try {
      console.log(`[${i + 1}/${EXERCISES.length}] ${name}...`);
      const buf = await generateWithImagen4(fullPrompt);
      fs.writeFileSync(path.join(dir, fileName), buf);
      console.log(`  ✓ ${fileName} (${Math.round(buf.length / 1024)}KB)`);
      success++;
      // Rate limit: 3 seconds between requests
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error(`  ✗ ${err.message}`);
      fail++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`\n=== Done: ${success} success, ${fail} failed ===`);
}

main().catch(console.error);
