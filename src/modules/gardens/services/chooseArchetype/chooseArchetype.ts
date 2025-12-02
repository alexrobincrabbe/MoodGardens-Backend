import { type PrimaryEmotion } from "../../mood.types.js";
import { GALAXY_ARCHTYPES } from "./galaxyArchetypes.js";
import { CLASSIC_ARCHETYPES } from "./classicArchetypes.js";
import { UNDERWATER_ARCHETYPES } from "./underwaterArchetypes.js";

type IntensityBand = "low" | "medium" | "high";
export type GardenType = "CLASSIC" | "UNDERWATER" | "GALAXY";
type ArchetypeBands = Record<IntensityBand, readonly string[]>;
type ArchetypeByEmotion = Record<PrimaryEmotion, ArchetypeBands>;

function pick<T>(arr: readonly T[]): T {
    return arr[Math.floor(Math.random() * arr.length)];
}

const DEFAULT_FALLBACK: readonly string[] = [
    "flower meadow with path",
    "still pond with stepping stones",
    "walled herb garden",
];

const ARCHETYPE_MATRIX: Record<GardenType, ArchetypeByEmotion> = {
    CLASSIC: CLASSIC_ARCHETYPES,
    UNDERWATER: UNDERWATER_ARCHETYPES,
    GALAXY: GALAXY_ARCHTYPES
};

export function selectArchetype(
    type: GardenType,
    primary: PrimaryEmotion,
    intensity: IntensityBand,
): string {
    const matrixForType = ARCHETYPE_MATRIX[type] ?? ARCHETYPE_MATRIX.CLASSIC;
    const row = matrixForType[primary];
    const band = row?.[intensity];
    if (band?.length) return pick(band);
    if (row?.medium?.length) return pick(row.medium);
    return pick(DEFAULT_FALLBACK);
}