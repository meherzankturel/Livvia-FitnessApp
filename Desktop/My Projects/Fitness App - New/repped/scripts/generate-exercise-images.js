/**
 * Generate uniform exercise images using Google Gemini Imagen API.
 * Uploads each image to Supabase Storage.
 *
 * Usage: node scripts/generate-exercise-images.js
 *
 * All images use the EXACT SAME prompt — only the exercise name changes.
 * This ensures 100% uniform style.
 */

const GEMINI_KEY = process.env.GEMINI_KEY;
if (!GEMINI_KEY) throw new Error("Set GEMINI_KEY in your environment (do not hardcode API keys).");
const SUPABASE_URL = process.env.SUPABASE_URL || process.env.EXPO_PUBLIC_SUPABASE_URL;
const SUPABASE_KEY = process.env.SUPABASE_ANON_KEY || process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY;
if (!SUPABASE_URL || !SUPABASE_KEY) throw new Error("Set SUPABASE_URL and SUPABASE_ANON_KEY in your environment.");
const BUCKET = "exercise-images";

// All exercises we need images for
const EXERCISES = [
  // Already done (skip these)
  // "Bench Press", "Barbell Squat", "Deadlift", "Pull-Up", "Lateral Raise",

  // Push
  "Diamond Push-Up",
  "Incline Dumbbell Press",
  "Dumbbell Pullover",
  "Band Pull-Apart",
  "Front Raise",
  "Overhead Tricep Extension",
  "Push-Up",
  "Chest Dip",
  "Cable Crossover",
  "Incline Bench Press",
  "Dumbbell Fly",

  // Pull
  "Barbell Row",
  "Lat Pulldown",
  "Face Pull",
  "Barbell Curl",
  "Hammer Curl",
  "Dumbbell Curl",
  "Cable Row",
  "Chin-Up",
  "Preacher Curl",
  "Concentration Curl",

  // Legs
  "Leg Press",
  "Romanian Deadlift",
  "Leg Extension",
  "Leg Curl",
  "Calf Raise",
  "Lunge",
  "Hip Thrust",
  "Goblet Squat",
  "Bulgarian Split Squat",
  "Step-Up",

  // Shoulders
  "Overhead Press",
  "Arnold Press",
  "Rear Delt Fly",
  "Shrug",
  "Upright Row",

  // Core
  "Plank",
  "Crunch",
  "Leg Raise",
  "Russian Twist",
  "Mountain Climber",
  "Ab Wheel Rollout",

  // Triceps
  "Tricep Pushdown",
  "Skull Crusher",
  "Close Grip Bench Press",
  "Kickback",
  "Tricep Dip",

  // Full body
  "Clean and Press",
  "Burpee",
  "Kettlebell Swing",
];

// The ONE prompt template — uniform for all
function getPrompt(exerciseName) {
  return `Professional fitness photography of an athletic male with medium build performing a ${exerciseName} exercise in a modern gym studio. The man is wearing a fitted black t-shirt and dark grey athletic shorts. Shot from a 3/4 side angle at waist height. Clean minimal light grey studio background with soft even lighting and no harsh shadows. The person is centered in the frame with full body visible. High quality, sharp focus, professional sports photography style. No text, no logos, no watermarks. Square composition.`;
}

async function generateImage(exerciseName) {
  console.log(`Generating: ${exerciseName}...`);

  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/imagen-4.0-generate-001:predict?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        instances: [{ prompt: getPrompt(exerciseName) }],
        parameters: {
          sampleCount: 1,
          aspectRatio: "1:1",
          safetySetting: "block_only_high",
          personGeneration: "allow_adult",
        },
      }),
    }
  );

  if (!response.ok) {
    // Try Gemini 2.0 Flash as fallback (supports image generation)
    console.log(`  Imagen failed (${response.status}), trying Gemini Flash...`);
    return generateWithGeminiFlash(exerciseName);
  }

  const data = await response.json();
  if (data.predictions && data.predictions[0] && data.predictions[0].bytesBase64Encoded) {
    return Buffer.from(data.predictions[0].bytesBase64Encoded, "base64");
  }

  throw new Error(`No image data for ${exerciseName}: ${JSON.stringify(data).slice(0, 200)}`);
}

async function generateWithGeminiFlash(exerciseName) {
  const response = await fetch(
    `https://generativelanguage.googleapis.com/v1beta/models/gemini-2.5-flash-image:generateContent?key=${GEMINI_KEY}`,
    {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        contents: [{
          parts: [{
            text: `Generate an image: ${getPrompt(exerciseName)}`
          }]
        }],
        generationConfig: {
          responseModalities: ["TEXT", "IMAGE"],
        },
      }),
    }
  );

  if (!response.ok) {
    const err = await response.text();
    throw new Error(`Gemini Flash failed (${response.status}): ${err.slice(0, 200)}`);
  }

  const data = await response.json();

  // Find image part in response
  const parts = data.candidates?.[0]?.content?.parts || [];
  for (const part of parts) {
    if (part.inlineData?.mimeType?.startsWith("image/")) {
      return Buffer.from(part.inlineData.data, "base64");
    }
  }

  throw new Error(`No image in Gemini Flash response for ${exerciseName}`);
}

async function saveLocally(exerciseName, imageBuffer) {
  const fs = require("fs");
  const path = require("path");
  const dir = path.join(__dirname, "..", "apps", "mobile", "assets", "exercises");
  if (!fs.existsSync(dir)) fs.mkdirSync(dir, { recursive: true });

  const fileName = exerciseName.toLowerCase().replace(/[^a-z0-9]/g, "-") + ".png";
  const filePath = path.join(dir, fileName);
  fs.writeFileSync(filePath, imageBuffer);
  console.log(`  Saved: assets/exercises/${fileName}`);
  return fileName;
}

async function ensureBucketExists() {
  // Try to create bucket (will fail silently if exists)
  await fetch(`${SUPABASE_URL}/storage/v1/bucket`, {
    method: "POST",
    headers: {
      Authorization: `Bearer ${SUPABASE_KEY}`,
      apikey: SUPABASE_KEY,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      id: BUCKET,
      name: BUCKET,
      public: true,
    }),
  });
}

async function main() {
  console.log("=== Exercise Image Generator ===\n");
  console.log(`Generating ${EXERCISES.length} images...\n`);

  await ensureBucketExists();

  const results = {};
  const errors = [];

  for (let i = 0; i < EXERCISES.length; i++) {
    const name = EXERCISES[i];
    try {
      const imageBuffer = await generateImage(name);
      const fileName = await saveLocally(name, imageBuffer);
      results[name.toLowerCase()] = fileName;
      console.log(`  [${i + 1}/${EXERCISES.length}] ✓ ${name}\n`);

      // Rate limit: wait 2s between requests
      await new Promise(r => setTimeout(r, 2000));
    } catch (err) {
      console.error(`  [${i + 1}/${EXERCISES.length}] ✗ ${name}: ${err.message}\n`);
      errors.push({ name, error: err.message });
    }
  }

  // Write mapping file
  const mappingPath = require("path").join(__dirname, "..", "apps", "mobile", "src", "lib", "exercise-image-urls.json");
  require("fs").writeFileSync(mappingPath, JSON.stringify(results, null, 2));
  console.log(`\n=== Results ===`);
  console.log(`✓ Generated: ${Object.keys(results).length}`);
  console.log(`✗ Failed: ${errors.length}`);
  console.log(`\nMapping saved to: ${mappingPath}`);

  if (errors.length > 0) {
    console.log("\nFailed exercises:");
    errors.forEach(e => console.log(`  - ${e.name}: ${e.error}`));
  }
}

main().catch(console.error);
