/**
 * Regenerate specific exercise images with detailed form-accurate prompts.
 */

const GEMINI_KEY = "AIzaSyAcaiXT_K_1ujombea3IU7i3kvGO3-x9EQ";
const fs = require("fs");
const path = require("path");

const BASE_STYLE = "Professional fitness photography in a modern gym studio. Athletic male with medium build wearing fitted black t-shirt and dark grey athletic shorts. Shot from 3/4 side angle at waist height. Clean minimal light grey studio background with soft even lighting. High quality, sharp focus. No text, no logos. Square composition.";

// Each exercise gets a SPECIFIC prompt describing the exact form
const EXERCISES = [
  {
    name: "Diamond Push-Up",
    prompt: `${BASE_STYLE} The man is in a push-up position on the floor. His hands are placed directly under his chest with thumbs and index fingers TOUCHING to form a DIAMOND or triangle shape. His body is straight from head to heels. He is in the lowered position with chest close to his hands.`
  },
  {
    name: "Bench Press",
    prompt: `${BASE_STYLE} The man is LYING FLAT on his back on a flat weight bench. He is pressing a barbell straight up above his chest with both arms. His feet are flat on the floor. His back is slightly arched. The barbell has weight plates on each side. View from the side showing him lying down.`
  },
  {
    name: "Overhead Tricep Extension",
    prompt: `${BASE_STYLE} The man is standing upright holding ONE dumbbell with BOTH hands behind his head. His elbows are pointing straight UP toward the ceiling close to his ears. The dumbbell is behind his neck. His upper arms are stationary and vertical. This is the lowered position of the exercise showing the elbow bend.`
  },
  {
    name: "Dumbbell Pullover",
    prompt: `${BASE_STYLE} The man is lying flat on his back on a weight bench. He is holding ONE dumbbell with BOTH hands above his chest with arms slightly bent. He is in the motion of lowering the dumbbell backward behind his head in an arc. Side view showing the stretch position.`
  },
  {
    name: "Dumbbell Fly",
    prompt: `${BASE_STYLE} The man is lying flat on his back on a FLAT weight bench (not incline). He is holding a dumbbell in each hand with arms spread WIDE OPEN to the sides in a hugging arc motion. His elbows have a slight bend. His arms are open wide like wings. View from the side.`
  },
  {
    name: "Barbell Row",
    prompt: `${BASE_STYLE} The man is BENT OVER at approximately 45 degrees at the waist. His knees are slightly bent. He is holding a barbell with both hands and PULLING it up toward his lower chest. His back is flat and straight. The barbell is close to his body. This is the bent-over row position.`
  },
  {
    name: "Lat Pulldown",
    prompt: `${BASE_STYLE} The man is SEATED at a lat pulldown machine FACING FORWARD toward the camera. He is gripping a wide bar overhead and pulling it down to his UPPER CHEST in front of his face. His chest is pushed forward slightly. View from the front-side angle.`
  },
  {
    name: "Face Pull",
    prompt: `${BASE_STYLE} The man is standing in front of a cable machine. He is pulling a ROPE attachment toward his FACE. His elbows are HIGH and flared out to the sides at head level. His hands are near his ears pulling the rope apart. This shows external rotation of the shoulders.`
  },
  {
    name: "Cable Row",
    prompt: `${BASE_STYLE} The man is SEATED on a low row bench with his feet firmly planted on the foot platform in front of him. He is pulling a V-bar cable handle toward his lower torso with both hands. His back is upright and chest is out. He is seated, not standing or crouching.`
  },
  {
    name: "Chin-Up",
    prompt: `${BASE_STYLE} The man is hanging from a pull-up bar with an UNDERHAND grip — his palms are facing TOWARD him. He is pulling himself up with his chin above the bar. The underhand supinated grip is clearly visible. His arms are close to shoulder width.`
  },
  {
    name: "Preacher Curl",
    prompt: `${BASE_STYLE} The man is SEATED at a preacher curl bench. His UPPER ARMS are resting flat against the angled preacher pad. He is curling a barbell or EZ-bar upward. The pad supports his arms from armpit to elbow. His arms are isolated on the pad.`
  },
  {
    name: "Romanian Deadlift",
    prompt: `${BASE_STYLE} The man is standing and HINGING FORWARD at the hips holding a barbell. His torso is leaned forward at approximately 45 degrees. The barbell is sliding down along his thighs toward his shins. His knees are SLIGHTLY bent but mostly straight. His back is flat and straight. This is the lowered hip-hinge position, not standing upright.`
  },
  {
    name: "Leg Curl",
    prompt: `${BASE_STYLE} The man is LYING FACE DOWN on a leg curl machine. His ankles are hooked under the padded roller. He is curling his legs UP toward his glutes by bending his knees. He is in the prone lying position on the machine, not seated.`
  },
  {
    name: "Calf Raise",
    prompt: `${BASE_STYLE} The man is standing on the EDGE of a raised step or platform. Only the balls of his feet are on the platform, his HEELS are hanging off the edge. He is RISING UP on his toes, pushing his heels as high as possible. His legs are straight. He may be holding dumbbells at his sides. Side view showing the raised heel position.`
  },
  {
    name: "Hip Thrust",
    prompt: `${BASE_STYLE} The man has his UPPER BACK resting against the edge of a flat weight bench behind him. He is on the floor with his knees bent and feet flat on the ground. A BARBELL is placed across his HIPS. He is DRIVING his hips UPWARD so his thighs and torso form a straight line. His shoulders are on the bench, hips are elevated. Side view.`
  },
  {
    name: "Rear Delt Fly",
    prompt: `${BASE_STYLE} The man is BENT OVER at the waist at approximately 90 degrees. He is holding a dumbbell in each hand. His arms are pulling the dumbbells OUT TO THE SIDES with slightly bent elbows, squeezing his shoulder blades together. His torso is parallel to the ground. View showing the bent-over position with arms spread wide.`
  },
  {
    name: "Shrug",
    prompt: `${BASE_STYLE} The man is standing upright holding a heavy dumbbell in each hand at his sides. His SHOULDERS are VISIBLY ELEVATED and SHRUGGED UP toward his ears as high as possible. The trapezius muscles are engaged. His arms are straight. The upward shoulder shrug motion is the key focus.`
  },
  {
    name: "Skull Crusher",
    prompt: `${BASE_STYLE} The man is LYING FLAT on his back on a weight bench. He is holding a barbell or EZ-bar with arms extended above his chest. He is LOWERING the bar toward his FOREHEAD by bending only at the elbows. His upper arms are stationary and vertical. The bar is near his forehead. Side view showing him lying down.`
  },
  {
    name: "Close Grip Bench Press",
    prompt: `${BASE_STYLE} The man is LYING FLAT on his back on a weight bench. He is pressing a barbell upward. His hands are placed CLOSE TOGETHER on the bar, inside shoulder width, about 6 inches apart. This narrow grip targets the triceps. He is lying flat, not sitting. Side view.`
  },
  {
    name: "Kickback",
    prompt: `${BASE_STYLE} The man is bent over with one hand and one knee resting on a flat bench for support. With his OTHER arm, he is holding a DUMBBELL and EXTENDING his forearm BACKWARD until his arm is straight and parallel to the ground. This is a TRICEP kickback exercise. His elbow is pinned at his side. Side view.`
  },
  {
    name: "Burpee",
    prompt: `${BASE_STYLE} The man is in the PLANK or push-up phase of a burpee. His hands are on the floor, body straight, in a push-up position, with one or both feet jumping forward toward his hands. This shows the transition phase of the burpee exercise. Dynamic action pose.`
  },
  {
    name: "Kettlebell Swing",
    prompt: `${BASE_STYLE} The man is performing a kettlebell swing. He is holding a KETTLEBELL (the distinctive round weight with a handle on top) with both hands. He is in the forward swing position with the kettlebell at shoulder height, arms extended forward. His hips are fully extended. The kettlebell shape must be clearly visible.`
  },
  {
    name: "Arnold Press",
    prompt: `${BASE_STYLE} The man is standing holding two dumbbells at shoulder height. He is MID-ROTATION — one arm shows the palm facing toward him (starting position) while rotating outward as he presses upward. This shows the distinctive ROTATION that defines the Arnold Press. The twist from palms-in to palms-out during the press.`
  },
  {
    name: "Mountain Climber",
    prompt: `${BASE_STYLE} The man is in a push-up position on the floor. One KNEE is DRIVEN FORWARD toward his chest while the other leg is extended back. This shows the running-in-place motion that defines mountain climbers. His arms are straight supporting his body. Dynamic pose showing the knee drive.`
  },
];

async function generateImage(prompt) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{ parts: [{ text: `Generate an image: ${prompt}` }] }],
        generationConfig: { responseModalities: ["TEXT", "IMAGE"] },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini failed (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }
  throw new Error("No image in response");
}

async function main() {
  const dir = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");

  console.log(`=== Regenerating ${EXERCISES.length} exercise images ===\n`);

  let success = 0, fail = 0;

  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, prompt } = EXERCISES[i];
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";

    try {
      console.log(`[${i + 1}/${EXERCISES.length}] ${name}...`);
      const buf = await generateImage(prompt);
      fs.writeFileSync(path.join(dir, fileName), buf);
      console.log(`  ✓ Saved: ${fileName}\n`);
      success++;
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
      fail++;
    }
  }

  console.log(`\n=== Done: ${success} success, ${fail} failed ===`);
}

main().catch(console.error);
