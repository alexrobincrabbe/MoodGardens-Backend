import { analyseDiaryMood } from "./analyseDiaryMood.js";
import { selectStylePack } from "./chooseStyle.js";
import { selectArchetype } from "./chooseArchitype.js";
import { selectWeather } from "./chooseWeather.js";
import { selectTree } from "./chooseTree.js";
import { selectFlowers } from "./chooseFlower.js";
const CAMERAS = [
    "wide bird’s-eye view", "isometric view", "eye-level view",
    "low angle looking up through foliage", "close-up of a small section of the garden",
];
const pick = (arr) => arr[Math.floor(Math.random() * arr.length)];
export async function buildPromptFromDiary(args) {
    const { diaryText, openai } = args;
    const userText = (diaryText ?? "").trim();
    const mood = await analyseDiaryMood(openai, userText);
    console.log("[buildPromptFromDiary] mood analysis result:", JSON.stringify(mood, null, 2));
    const style = selectStylePack(mood.valence, mood.earnestness);
    const intensityBand = mood.intensity <= 6 ? "low"
        : mood.intensity >= 9 ? "high"
            : "medium";
    const renormalisedIntensity = (i) => i <= 6 ? 1 :
        i === 7 ? 2 :
            i === 8 ? 3 :
                i === 9 ? 4 :
                    5;
    const archetype = selectArchetype(mood.primary_emotion, intensityBand);
    const camera = pick(CAMERAS);
    const weather = selectWeather(mood.primary_emotion, renormalisedIntensity(mood.intensity));
    const allEmotions = [mood.primary_emotion, ...mood.secondary_emotions].join(", ");
    const tree = selectTree(mood.primary_emotion);
    const flowers = selectFlowers(mood.secondary_emotions);
    const combinedSymbols = [
        ...mood.symbolic_elements,
        ...flowers,
    ];
    const treeLine = tree === "ivy"
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
        include these flowers: 
        ${flowers.join(", ")}

        Include these symbolic elements:
        ${mood.symbolic_elements.join(", ")}.

        Allow surreal / whimsical combinations.
        No people, no text or letters, no frames or borders.
        Square composition (1:1).
    `.trim();
    return { prompt };
}
