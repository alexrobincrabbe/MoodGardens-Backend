// chooseTree.ts
import type { PrimaryEmotion } from "./mood.types";

export const TREES = {
   OAK: "oak tree",
  ASH: "ash tree",
  WILLOW: "willow tree",
  CHERRY: "cherry tree",
  OLIVE: "olive tree",
  MAPLE: "maple tree",
  CYPRESS: "cypress tree",
  PALM: "palm tree",
  PINE: "pine tree",
  JACARANDA: "jacaranda tree",
  CITRUS: "citrus tree",
  MONKEYPUZZLE: "monkey puzzle tree",
  BANANA: "banana tree",
  FIG: "fig tree",
  COCONUT: "coconut tree",
  BANYAN: "banyan tree",
  BOOJUM: "boojum tree",
  BAOBAB: "baobab tree",
  SUMAC: "sumac tree",
  BEECH: "beech tree",
  MIMOSA: "mimosa tree",
  SEQUOIA: "sequoia tree",
  // special case: no "tree" suffix
  IVY: "ivy",
} as const;

export type Tree = (typeof TREES)[keyof typeof TREES];

export const TREES_MATRIX: Record<PrimaryEmotion, Tree> = {
    // POSITIVE
    joy: TREES.JACARANDA,
    love: TREES.CHERRY,
    hope: TREES.OLIVE,
    excitement: TREES.CITRUS,
    serenity: TREES.BANYAN,
    creativity: TREES.BOOJUM,
    lust: TREES.FIG,
    resilience: TREES.COCONUT,
    silliness: TREES.BANANA,
    // NEUTRAL
    curiosity: TREES.PALM,
    awe: TREES.BAOBAB,
    contemplative: TREES.OAK,
    // NEGATIVE
    confusion: TREES.MONKEYPUZZLE,
    boredom: TREES.PINE,
    embarrassment: TREES.SUMAC,
    sadness: TREES.WILLOW,
    anxiety: TREES.MIMOSA,
    anger: TREES.SEQUOIA,
    guilt: TREES.ASH,
    loneliness: TREES.CYPRESS,
    disappointment: TREES.BEECH,
    jealousy: TREES.IVY,

};

export function selectTree(primary: string): Tree {
    const p = primary.toLowerCase().trim() as PrimaryEmotion;
    return TREES_MATRIX[p] ?? TREES.OAK;
}
