// buildPromptFromDiary.ts
import type OpenAI from "openai";
import { analyseDiaryMood } from "./analyseDiaryMood.js";
import { type MoodAnalysis, type Valence, type Seriousness, type PrimaryEmotion, type Intensity, NormalisedIntensity } from "./mood.types.js";
import { selectStylePack } from "./services/chooseStyle.js";
import { selectArchetype } from "./services/chooseArchitype.js";
import { selectWeather } from "./services/chooseWeather.js";
import { selectTree } from "./services/chooseTree.js";
import { selectFlowers } from "./services/chooseFlowers.js";
import { selectCreatures } from "./services/chooseCreatures.js";
import { type Garden } from "@prisma/client";
import { prisma } from "../../lib/prismaClient.js";

export const CAMERA_OPTIONS = {
    CLASSIC: [
        "wide bird’s-eye view",
        "isometric view",
        "eye-level view",
        "low angle looking up through foliage",
        "close-up of a small section of the garden",
    ],
    UNDERWATER: [
        "perspective looking up toward the surface",
        "close-up of drifting seaweed",
        "wide reef view",
        "low angle from the ocean floor looking upward",
        "mid-water perspective among fish",
    ],
    GALAXY: [
        "deep-space wide angle",
        "nebula close-up with swirling gases",
        "view from inside a star cluster",
        "low angle from the surface of a tiny planet",
        "galactic isometric view",
    ],
} as const;

export type GardenType = keyof typeof CAMERA_OPTIONS;

export function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

export async function buildPromptFromDiary(args: {
    diaryText?: string | null;
    openai: OpenAI;
    garden: Garden;
}): Promise<{ prompt: string }> {
    const { diaryText, openai, garden } = args;
    const userText = (diaryText ?? "").trim();
    const type = garden.type
    const mood: MoodAnalysis = await analyseDiaryMood(openai, userText, type);
    console.log("mood analysis result:", JSON.stringify(mood, null, 2));
    const style = selectStylePack(mood.valence as Valence, mood.earnestness as Seriousness);
    const renormalisedIntensity = (i: number) =>
        i <= 4 ? 1 :
            5 <= i && i <= 6 ? 2 :
                i === 6 ? 3 :
                    7 <= i && i <= 8 ? 4 :
                        5;

    const renormalisedBoredomIntensity = (i: number) =>
        i <= 2 ? 1 :
            3 <= i && i <= 4 ? 2 :
                5 <= i && i <= 6 ? 3 :
                    i === 7 ? 4 :
                        5;



    const cameraOptions = CAMERA_OPTIONS[garden.type as GardenType];
    const camera = pick(cameraOptions);

    let adjustedIntensity
    mood.primary_emotion === "boredom"
        ? adjustedIntensity = renormalisedBoredomIntensity(mood.intensity)
        : adjustedIntensity = renormalisedIntensity(mood.intensity)

    const intensityBand =
        (adjustedIntensity as NormalisedIntensity) <= 2 ? "low"
            : (adjustedIntensity as NormalisedIntensity) >= 5 ? "high"
                : "medium";

    const archetype = selectArchetype(
        garden.type as GardenType,
        mood.primary_emotion as PrimaryEmotion,
        intensityBand
    );
    const weather = selectWeather(garden.type as GardenType, mood.primary_emotion, adjustedIntensity);
    const allEmotions = [mood.primary_emotion, ...mood.secondary_emotions].join(", ");
    const tree = selectTree(garden.type as GardenType, mood.primary_emotion);
    const flowers = selectFlowers(garden.type as GardenType, mood.secondary_emotions);
    const creatures = selectCreatures(garden.type as GardenType, mood.secondary_emotions)
    const treeLine =
        tree === "ivy"
            ? "Trailing ivy winds through the garden."
            : `Include this type of tree in the garden: ${tree}.`;

    const prompt = `
        ${style.label} illustration of a ${archetype}, seen from a ${camera}.
        Weather: ${weather}.

        The scene visually represents:
        "${mood.short_theme}"
        Mood blend: ${allEmotions}.

        Use a color palette inspired by:
        ${mood.color_palette.join(", ")}

        ${treeLine}
        include these flowers: ${flowers.join(", ")}
        include these creatures: ${creatures.join(", ")}
        Include these symbolic elements:${mood.symbolic_elements.join(", ")}.

        Allow surreal / whimsical combinations.
        No people, no text or letters, no frames or borders.
        Square composition (1:1).
    `.trim();



    const secondaryEmotions = Array.isArray(mood.secondary_emotions)
        ? mood.secondary_emotions
        : [];
    const updatedGarden = await prisma.garden.update({
        where: { id: garden.id },
        data: {
            valence: mood.valence,
            primaryEmotion: mood.primary_emotion,
            secondaryEmotions: secondaryEmotions,
            intensity: mood.intensity,
            normalisedIntensity: adjustedIntensity,
            intensityBand: intensityBand,
            archetype: archetype,
            earnestness: mood.earnestness,
            prompt: prompt,
        }
    })
    return { prompt };
}
