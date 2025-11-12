// buildPromptFromDiary.ts
import type OpenAI from "openai";
import { analyseDiaryMood } from "./analyseDiaryMood.js";
import { type MoodAnalysis, type Valence, type Energy, type PrimaryEmotion, type Intensity } from "./mood.types.js";
import { selectStylePack } from "./chooseStyle.js";
import { selectArchetype } from "./chooseArchitype.js";
import { selectWeather } from "./chooseWeather.js";

const CAMERAS = [
    "wide bird’s-eye view", "isometric view", "eye-level view from a garden path",
    "low angle looking up through foliage", "close-up of a small section of the garden",
];

const pick = <T,>(arr: T[]) => arr[Math.floor(Math.random() * arr.length)];

export async function buildPromptFromDiary(args: {
    diaryText?: string | null;
    openai: OpenAI;
}): Promise<{ prompt: string }> {
    const { diaryText, openai } = args;
    const userText = (diaryText ?? "").trim();

    const mood: MoodAnalysis = await analyseDiaryMood(openai, userText);
    console.log("[buildPromptFromDiary] mood analysis result:", JSON.stringify(mood, null, 2));
    const style = selectStylePack(mood.valence as Valence, mood.energy as Energy);

    const intensityBand =
        (mood.intensity as Intensity) <= 2 ? "low"
            : (mood.intensity as Intensity) === 3 ? "medium"
                : "high";

    const archetype = selectArchetype(
        mood.primary_emotion as PrimaryEmotion,
        intensityBand
    );

    const camera = pick(CAMERAS);
    const weather = selectWeather(mood.primary_emotion, mood.intensity);

    const allEmotions = [mood.primary_emotion, ...mood.secondary_emotions].join(", ");

    const prompt = `
        ${style.label} illustration of a ${archetype}, seen from a ${camera}.
        Weather: ${weather}.

        The scene visually represents:
        "${mood.short_theme}"
        Mood blend: ${allEmotions}.

        Use a color palette inspired by:
        ${mood.color_palette.join(", ")}

        Include these symbolic elements:
        ${mood.symbolic_elements.join(", ")}

        Allow surreal / whimsical combinations.
        No people, no text or letters, no frames or borders.
        Square composition (1:1).
    `.trim();


    return { prompt };
}
