/**
 * Round 3 fixes — Imagen 4.0.
 * Calf raise (had debug text), Dumbbell fly (wrong position),
 * Diamond push-up (hand shape not visible), Skull crusher (wrong equipment),
 * Kickback (wrong position)
 */
const GEMINI_KEY = process.env.GEMINI_KEY;
if (!GEMINI_KEY) throw new Error("Set GEMINI_KEY in your environment (do not hardcode API keys).");
const fs = require("fs");
const path = require("path");

const STYLE = "Professional fitness studio photography. Athletic male, medium muscular build, short dark hair, wearing fitted black t-shirt and dark grey athletic shorts, black training shoes. Clean light grey seamless studio background. Soft even studio lighting with no harsh shadows. Sharp focus. Full body visible and centered. No text, no logos, no watermarks, no labels, no annotations. Photorealistic.";

const EXERCISES = [
  {
    name: "Calf Raise",
    form: "Side view from waist height. Man standing on the edge of a raised step platform. Both feet are on the step with only the front part of his feet on the edge. His heels are raised HIGH in the air above the step level — he is up on his tiptoes. His legs are straight. He is holding a dumbbell in each hand hanging at his sides. The key is showing him risen up on his toes with heels elevated."
  },
  {
    name: "Dumbbell Fly",
    form: "Side view from waist height. Man LYING FLAT on his BACK on a horizontal flat weight bench. He is looking up at the ceiling. His arms are spread WIDE OPEN to the sides below bench level, each hand holding a dumbbell. His elbows have a slight bend. His arms form a wide open arc like he is hugging a large barrel. He is lying down, not sitting. The wide open arm position is the key feature."
  },
  {
    name: "Diamond Push-Up",
    form: "Shot from above at a 45 degree angle looking down at the man. He is in a push-up position on the floor in the lowered position. His hands are placed together under his chest forming a TRIANGLE or DIAMOND shape with his thumbs and index fingers touching. The camera angle from above clearly shows the triangle hand position. Body straight from head to heels."
  },
  {
    name: "Skull Crusher",
    form: "Side view from waist height. Man LYING FLAT on his back on a flat weight bench. He is holding an EZ-curl barbell (a zigzag shaped short barbell) above his face. His upper arms are angled slightly back from vertical. He is bending at the elbows to lower the EZ-bar toward the top of his forehead. Only his forearms move. His elbows point toward the ceiling. The bar is a few inches above his forehead."
  },
  {
    name: "Kickback",
    form: "Side view from waist height. Man is bent over a flat weight bench. His LEFT hand and LEFT knee are resting on the bench for support, body horizontal. His RIGHT arm is holding a DUMBBELL. His right upper arm is parallel to the floor, pinned against his torso. He is EXTENDING his right forearm straight BACK behind him until the arm is fully straight and parallel to the ground. This is a tricep dumbbell kickback."
  },
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
  if (!res.ok) throw new Error(`${res.status}: ${(await res.text()).slice(0, 300)}`);
  const d = await res.json();
  if (d.predictions?.[0]?.bytesBase64Encoded) return Buffer.from(d.predictions[0].bytesBase64Encoded, "base64");
  throw new Error("No image");
}

async function main() {
  const dir = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");
  console.log(`=== Round 3 — ${EXERCISES.length} images ===\n`);
  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, form } = EXERCISES[i];
    const file = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";
    try {
      console.log(`[${i+1}/${EXERCISES.length}] ${name}...`);
      const buf = await generate(`${STYLE} ${form}`);
      fs.writeFileSync(path.join(dir, file), buf);
      console.log(`  ✓ ${file}`);
      await new Promise(r => setTimeout(r, 3000));
    } catch (e) {
      console.error(`  ✗ ${e.message}`);
    }
  }
  console.log("\nDone!");
}
main().catch(console.error);
