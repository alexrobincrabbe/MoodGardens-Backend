import { type GardenType } from "@prisma/client";
import { SPACE_SPRITES } from "./spaceSprites.js";
import { SMALL_FISH } from "./smallFish.js";
import { CREATURES } from "./creatures.js";


const CREATURES_MATRIX_BY_TYPE: Record<
    GardenType,
    Record<string, string>
> = {
    CLASSIC: CREATURES,
    UNDERWATER: SMALL_FISH,
    GALAXY: SPACE_SPRITES,
};

export function selectCreatures(
    type: GardenType,
    secondaryEmotions: string[],
): string[] {
    const matrix = CREATURES_MATRIX_BY_TYPE[type];
    return secondaryEmotions
        .map((s) => s.toLowerCase().trim())
        .map((key) => matrix[key])
        .filter((f): f is string => !!f);
}
