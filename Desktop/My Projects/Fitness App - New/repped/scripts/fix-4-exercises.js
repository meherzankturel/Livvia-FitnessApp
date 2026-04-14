/**
 * Fix the 4 remaining incorrect exercise images with hyper-specific prompts.
 */
const GEMINI_KEY = "AIzaSyAcaiXT_K_1ujombea3IU7i3kvGO3-x9EQ";
const fs = require("fs");
const path = require("path");

const EXERCISES = [
  {
    name: "Hip Thrust",
    prompt: `Professional fitness photography. An athletic male wearing a black t-shirt and grey shorts is performing a barbell hip thrust. His UPPER BACK and SHOULDER BLADES are leaning against the LONG SIDE of a flat weight bench behind him. He is NOT sitting on the bench. His back is against the bench edge. His FEET are flat on the floor in front of him with knees bent at 90 degrees. A loaded BARBELL is resting across his HIP CREASE. His HIPS are DRIVEN UPWARD so his thighs and torso form a STRAIGHT LINE parallel to the floor — like a bridge or tabletop shape. His shoulders are on the bench, his butt is elevated off the ground, his hips are at the highest point. Side view from the left. Clean light grey studio background. Soft even lighting. No text.`
  },
  {
    name: "Diamond Push-Up",
    prompt: `Professional fitness photography. An athletic male wearing a black t-shirt and grey shorts is performing a diamond push-up on a gym floor. He is in the lowered push-up position with his chest nearly touching the floor. The KEY FEATURE: his HANDS are placed directly UNDER HIS CHEST with his THUMBS and INDEX FINGERS TOUCHING each other to form a DIAMOND or TRIANGLE shape. The diamond hand shape must be clearly visible. His hands are very close together, not shoulder width apart. His elbows point outward. His body is straight from head to heels. Shot from a 3/4 front-side angle so the hand position is clearly visible. Clean light grey studio background. No text.`
  },
  {
    name: "Calf Raise",
    prompt: `Professional fitness photography. An athletic male wearing a black t-shirt and grey shorts is performing a standing calf raise. He is standing on the EDGE of a raised step or platform. BOTH feet are on the platform with only the BALLS OF HIS FEET on the edge — his HEELS are hanging OFF the back of the platform in the AIR. He is RISING UP on his TOES as high as possible, heels elevated well above the platform level. His legs are STRAIGHT. He is holding a dumbbell in each hand at his sides for added weight. Side view showing the elevated heel position clearly. Both feet visible, both on the platform edge. Clean light grey studio background. No text.`
  },
  {
    name: "Skull Crusher",
    prompt: `Professional fitness photography. An athletic male wearing a black t-shirt and grey shorts is performing a skull crusher (lying triceps extension). He is LYING FLAT on his BACK on a flat weight bench. His head is at the end of the bench. He is holding an EZ-curl BAR (the zigzag shaped barbell) with both hands. His UPPER ARMS are pointing STRAIGHT UP toward the ceiling and are STATIONARY. He is BENDING only at the ELBOWS to lower the bar toward his FOREHEAD. The bar is approximately 2 inches above his forehead. His elbows point toward the ceiling, not flared out. Side view showing him lying flat on the bench with the bar near his forehead. Clean light grey studio background. No text.`
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

  if (!response.ok) throw new Error(`Failed (${response.status}): ${(await response.text()).slice(0, 200)}`);

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
  console.log(`Fixing ${EXERCISES.length} images...\n`);

  for (let i = 0; i < EXERCISES.length; i++) {
    const { name, prompt } = EXERCISES[i];
    const fileName = name.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";
    try {
      console.log(`[${i + 1}/${EXERCISES.length}] ${name}...`);
      const buf = await generateImage(prompt);
      fs.writeFileSync(path.join(dir, fileName), buf);
      console.log(`  ✓ Saved\n`);
      await new Promise(r => setTimeout(r, 3000));
    } catch (err) {
      console.error(`  ✗ ${err.message}\n`);
    }
  }
  console.log("Done!");
}

main().catch(console.error);
