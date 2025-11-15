import { z } from "zod";
export const VALENCES = ["positive", "mixed", "negative"];
export const SERIOSITIES = ["low", "medium", "high"];
export const PRIMARY_EMOTIONS = [
    //positive
    "joy",
    "love",
    "hope",
    "excitement",
    "serenity",
    "creativity",
    "lust",
    "resilience",
    "silliness",
    //neutral
    "curiosity",
    "awe",
    "contemplative",
    //negative
    "confusion",
    "boredom",
    "embarrassment",
    "sadness",
    "anxiety",
    "anger",
    "guilt",
    "loneliness",
    "disappointment",
    "jealousy",
];
// ---- Zod schemas that use the same constants
export const IntensitySchema = z.coerce.number().int().min(1).max(5)
    .transform(n => Math.min(5, Math.max(1, n)));
export const MoodSchema = z.object({
    primary_emotion: z.enum(PRIMARY_EMOTIONS),
    secondary_emotions: z.array(z.string()).default([]),
    valence: z.enum(VALENCES),
    intensity: IntensitySchema,
    earnestness: z.enum(SERIOSITIES),
    short_theme: z.string(),
    color_palette: z.array(z.string()).min(0).max(10).default([]),
    symbolic_elements: z.array(z.string()).min(0).max(16).default([]),
});
// ---- Optional: synonym map if the model returns variants you want to coerce
const EMOTION_SYNONYMS = {};
export function coercePrimaryEmotion(s) {
    const raw = String(s ?? "").toLowerCase().trim();
    if (PRIMARY_EMOTIONS.includes(raw))
        return raw;
    return "boredom";
}
