// mood.types.ts
import { z } from "zod";

// ---- canonical option lists (single source of truth)
export const VALENCES = ["positive", "mixed", "negative"] as const;
export const ENERGIES = ["low", "medium", "high"] as const;

// ⚠️ unify names across your app (no "boredom"/"calmness"/"neutral" vs "bored"/"calm")
export const PRIMARY_EMOTIONS = [
  "joy", "sadness", "anxiety", "anger",
  "love", "guilt", "hope", "loneliness",
  "silliness", "disappointment", "excitement",
  "jealousy", "overwhelm", "boredom",
] as const;

// ---- TypeScript union types derived from the arrays
export type Valence = typeof VALENCES[number];
export type Energy  = typeof ENERGIES[number];
export type PrimaryEmotion = typeof PRIMARY_EMOTIONS[number];
export type Intensity = 1 | 2 | 3 | 4 | 5;

// ---- Zod schemas that use the same constants
export const IntensitySchema = z.coerce.number().int().min(1).max(5)
  .transform(n => (Math.min(5, Math.max(1, n)) as Intensity));

export const MoodSchema = z.object({
  primary_emotion: z.enum(PRIMARY_EMOTIONS),
  secondary_emotions: z.array(z.string()).default([]),
  valence: z.enum(VALENCES),
  intensity: IntensitySchema,
  energy: z.enum(ENERGIES),
  short_theme: z.string(),
  color_palette: z.array(z.string()).min(0).max(10).default([]),
  symbolic_elements: z.array(z.string()).min(0).max(16).default([]),
});

export type MoodAnalysis = z.infer<typeof MoodSchema>;

// ---- Optional: synonym map if the model returns variants you want to coerce
const EMOTION_SYNONYMS: Record<string, PrimaryEmotion> = {

};

export function coercePrimaryEmotion(s: unknown): PrimaryEmotion {
  const raw = String(s ?? "").toLowerCase().trim();
  if ((PRIMARY_EMOTIONS as readonly string[]).includes(raw)) return raw as PrimaryEmotion;
  return EMOTION_SYNONYMS[raw] ?? "mixed";
}
