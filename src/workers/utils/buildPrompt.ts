// apps/api/src/workers/utils/buildPrompt.ts
import type OpenAI from "openai";

type MoodAnalysis = {
  primary_emotion: string;
  secondary_emotions: string[];
  valence: "positive" | "negative" | "mixed";
  intensity: 1 | 2 | 3 | 4 | 5;
  energy: "low" | "medium" | "high";
  short_theme: string;
  color_palette: string[];
  symbolic_elements: string[];
};

const GARDEN_ARCHETYPES = [
  "secret walled garden",
  "floating island garden",
  "overgrown ruins garden",
  "tiny balcony garden",
  "moonlit forest clearing",
  "terraced hillside garden",
  "underwater coral garden",
  "sky garden built on clouds",
];

const STYLE_PACKS = [
  "soft watercolor illustration",
  "storybook ink-and-watercolor sketch",
  "dreamy oil painting",
  "low-poly 3D diorama",
  "isometric pixel art",
  "flat pastel vector art",
  "Ghibli-like painterly scene",
];

const CAMERA_ANGLES = [
  "wide bird’s-eye view",
  "isometric view",
  "eye-level view from a garden path",
  "low angle looking up through foliage",
  "close-up of a small section of the garden",
];

const TIMES_OF_DAY = ["sunrise", "mid-morning", "afternoon", "sunset", "blue hour", "night"];

const WEATHERS = [
  "clear sky",
  "soft overcast sky",
  "misty air",
  "gentle rain",
  "starry sky",
  "distant storm clouds",
];

function pickRandom<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

// Slightly mood-biased helpers
function pickArchetype(mood: MoodAnalysis): string {
  if (mood.valence === "negative") {
    return pickRandom([
      "overgrown ruins garden",
      "moonlit forest clearing",
      "underwater coral garden",
      "secret walled garden",
    ]);
  }
  if (mood.valence === "positive") {
    return pickRandom([
      "floating island garden",
      "terraced hillside garden",
      "sky garden built on clouds",
      "tiny balcony garden",
    ]);
  }
  // mixed
  return pickRandom(GARDEN_ARCHETYPES);
}

function pickStyle(mood: MoodAnalysis): string {
  if (mood.energy === "high") {
    return pickRandom([
      "flat pastel vector art",
      "isometric pixel art",
      "low-poly 3D diorama",
    ]);
  }
  if (mood.energy === "low") {
    return pickRandom([
      "soft watercolor illustration",
      "storybook ink-and-watercolor sketch",
      "dreamy oil painting",
    ]);
  }
  return pickRandom(STYLE_PACKS);
}

function pickTimeOfDay(mood: MoodAnalysis): string {
  if (mood.valence === "negative") return pickRandom(["blue hour", "night", "sunset"]);
  if (mood.valence === "positive") return pickRandom(["sunrise", "morning", "afternoon"]);
  return pickRandom(TIMES_OF_DAY);
}

function pickWeather(mood: MoodAnalysis): string {
  if (mood.primary_emotion === "anxiety" || mood.primary_emotion === "sadness") {
    return pickRandom(["misty air", "soft overcast sky", "distant storm clouds"]);
  }
  return pickRandom(WEATHERS);
}

// 🔍 1) Analyse diary with a text model
async function analyseDiaryMood(openai: OpenAI, diaryText: string): Promise<MoodAnalysis> {
  const resp = await openai.chat.completions.create({
    model: "gpt-4.1-mini",
    temperature: 0.4, // stable-ish; you get creativity in the visual step
    response_format: { type: "json_object" },
    messages: [
      {
        role: "system",
        content: `
You are a Mood Garden mood analyst.
Given a diary entry, you describe the emotional state in a compact JSON object.

Respond ONLY with JSON in this shape:
{
  "primary_emotion": "joy | sadness | anxiety | anger | calm | mixed | nostalgia | overwhelm | hope",
  "secondary_emotions": ["string", ...],
  "valence": "positive" | "negative" | "mixed",
  "intensity": 1-5,
  "energy": "low" | "medium" | "high",
  "short_theme": "one short sentence describing the emotional arc",
  "color_palette": ["2-5 short color phrases, like 'soft mint green', 'deep navy blue'"],
  "symbolic_elements": ["3-8 short symbolic phrases, like 'winding path into fog', 'lantern at the end of a tunnel'"]
}
        `.trim(),
      },
      {
        role: "user",
        content: diaryText,
      },
    ],
  });

  const content = resp.choices[0]?.message?.content;
  if (!content) {
    throw new Error("Mood analysis returned no content");
  }
  return JSON.parse(content) as MoodAnalysis;
}

// 🌱 2) Build the actual image prompt (variety + mood match)
export async function buildPromptFromDiary(args: {
  period: string;
  periodKey: string;
  diaryText?: string | null;
  openai: OpenAI;
}): Promise<string> {
  const { diaryText, openai } = args;
  const userText = (diaryText ?? "").trim();

  // no diary text → generic calm garden, still with some random flavour
  if (!userText) {
    const style = pickRandom(STYLE_PACKS);
    const archetype = pickRandom(GARDEN_ARCHETYPES);
    const camera = pickRandom(CAMERA_ANGLES);
    const time = pickRandom(TIMES_OF_DAY);
    const weather = pickRandom(WEATHERS);

    return `
A ${style} illustration of a tranquil ${archetype}, seen from a ${camera}.
Time of day: ${time}. Weather: ${weather}.
Soft, calming color palette in greens, blues and gentle neutrals.
No people, no text, no frames or borders.
Pure garden scene with plants, paths and natural elements only.
Square composition (1:1).
    `.trim();
  }

  // 🔍 Analyse mood
  const mood = await analyseDiaryMood(openai, userText);

  const archetype = pickArchetype(mood);
  const style = pickStyle(mood);
  const camera = pickRandom(CAMERA_ANGLES);
  const time = pickTimeOfDay(mood);
  const weather = pickWeather(mood);

  // 🌀 Final creative prompt – here you can crank up variety
  return `
${style} illustration of a ${archetype}, seen from a ${camera}.
Time of day: ${time}. Weather: ${weather}.

The scene visually represents:
"${mood.short_theme}"

Use a color palette inspired by:
${mood.color_palette.join(", ")}

Include several symbolic elements that match the emotions, such as:
${mood.symbolic_elements.join(", ")}

Keep it clearly a garden: plants, trees, flowers, paths, water, stones, simple structures.
Allow surreal / whimsical combinations and layouts to express the feelings.
No people, no text or letters, no frames or borders.
Square composition (1:1).
  `.trim();
}
