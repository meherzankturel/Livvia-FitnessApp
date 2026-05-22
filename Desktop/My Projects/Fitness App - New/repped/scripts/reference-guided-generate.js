/**
 * Reference-guided exercise image generation.
 * 1. Downloads a reference photo showing correct form
 * 2. Sends reference + style prompt to Gemini 2.5 Flash Image
 * 3. Gemini generates our uniform version with correct form
 */
const GEMINI_KEY = process.env.GEMINI_KEY;
if (!GEMINI_KEY) throw new Error("Set GEMINI_KEY in your environment (do not hardcode API keys).");
const fs = require("fs");
const path = require("path");

const OUTPUT_DIR = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");
const REF_DIR = path.join(__dirname, "references");
if (!fs.existsSync(REF_DIR)) fs.mkdirSync(REF_DIR, { recursive: true });

const STYLE_PROMPT = `Look at the reference image carefully. It shows the correct exercise form, body position, grip, and equipment.

Now generate a NEW image of a DIFFERENT person performing this EXACT SAME exercise with the EXACT SAME form, position, grip, and equipment shown in the reference.

Requirements for the new image:
- Athletic male, medium muscular build, short dark hair
- Wearing fitted black t-shirt and dark grey athletic shorts, black training shoes
- Clean light grey seamless studio background
- Soft even studio lighting, no harsh shadows
- Sharp focus, professional fitness photography
- 3/4 side view from waist height
- Full body visible and centered in frame
- No text, no logos, no watermarks
- The exercise form, grip, equipment, and body position must EXACTLY match the reference image
- Square composition`;

// Reference image sources — free-exercise-db on GitHub
const EXERCISE_DB_BASE = "https://raw.githubusercontent.com/yuhonas/free-exercise-db/main/exercises";

// Map: our exercise name → free-exercise-db folder name → which image (0 or 1)
const EXERCISES = [
  { name: "Hip Thrust", ref: "Barbell_Hip_Thrust/0.jpg", extra: "The key position: upper back against bench edge, barbell across hips, hips elevated high so thighs are parallel to floor." },
  { name: "Diamond Push-Up", ref: "Diamond_Push-Up/0.jpg", extra: "Hands forming a diamond/triangle shape under the chest. This narrow hand position is the defining feature." },
  { name: "Dumbbell Fly", ref: "Dumbbell_Flyes/0.jpg", extra: "Lying flat on bench with arms spread wide to sides holding dumbbells." },
  { name: "Skull Crusher", ref: "EZ-Bar_Skullcrusher/0.jpg", extra: "Lying on bench, lowering EZ-bar toward forehead by bending elbows only." },
  { name: "Calf Raise", ref: "Standing_Calf_Raises/0.jpg", extra: "Standing on edge of platform, rising up on toes with heels elevated." },
];

async function downloadReference(refPath) {
  const url = `${EXERCISE_DB_BASE}/${refPath}`;
  const localPath = path.join(REF_DIR, refPath.replace(/\//g, "_"));

  if (fs.existsSync(localPath)) {
    return fs.readFileSync(localPath);
  }

  console.log(`  Downloading reference: ${url}`);
  const res = await fetch(url);
  if (!res.ok) throw new Error(`Reference download failed: ${res.status} for ${url}`);
  const buf = Buffer.from(await res.arrayBuffer());
  fs.writeFileSync(localPath, buf);
  return buf;
}

async function generateWithReference(refImageBuffer, exerciseName, extraPrompt) {
  const refBase64 = refImageBuffer.toString("base64");

  const prompt = `${STYLE_PROMPT}\n\nExercise: ${exerciseName}\n${extraPrompt}`;

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [
            {
              inlineData: {
                mimeType: "image/jpeg",
                data: refBase64,
              }
            },
            {
              text: prompt,
            }
          ]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini failed (${response.status}): ${err.slice(0, 300)}`);
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
  console.log(`=== Reference-Guided Generation (${EXERCISES.length} exercises) ===\n`);

  let ok = 0, fail = 0;

  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, ref, extra } = EXERCISES[i];
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";

    try {
      console.log(`[${i + 1}/${EXERCISES.length}] ${name}`);

      // Download reference
      const refBuf = await downloadReference(ref);
      console.log(`  Reference: ${ref} (${Math.round(refBuf.length / 1024)}KB)`);

      // Generate with reference
      const imgBuf = await generateWithReference(refBuf, name, extra);
      fs.writeFileSync(path.join(OUTPUT_DIR, fileName), imgBuf);
      console.log(`  ✓ Generated: ${fileName} (${Math.round(imgBuf.length / 1024)}KB)\n`);
      ok++;

      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
      fail++;
      await new Promise(r => setTimeout(r, 2000));
    }
  }

  console.log(`=== Done: ${ok} success, ${fail} failed ===`);
}

main().catch(console.error);
