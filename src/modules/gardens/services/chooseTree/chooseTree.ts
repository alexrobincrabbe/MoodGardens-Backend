import type { PrimaryEmotion } from "../../mood.types.js";
import { type GardenType } from "@prisma/client";
import { GALAXY_CELESTIAL_OBJECTS } from "./galaxyCelestialOjbects.js";
import { LARGE_MARINE_ANIMALS } from "./underWaterLargeAnimals.js";
import { TREES } from "./trees.js";


export const TREES_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<PrimaryEmotion, string[]>
> = {
  CLASSIC: TREES,
  UNDERWATER: LARGE_MARINE_ANIMALS,
  GALAXY: GALAXY_CELESTIAL_OBJECTS,
};

// ── Selector ───────────────────────────────────────────────
export function selectTree(
  type: GardenType,
  primaryEmotion: string,
): string {
  const p = primaryEmotion.toLowerCase().trim() as PrimaryEmotion;
  const list = TREES_MATRIX_BY_TYPE[type]?.[p] ?? TREES_MATRIX_BY_TYPE.CLASSIC[p];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

