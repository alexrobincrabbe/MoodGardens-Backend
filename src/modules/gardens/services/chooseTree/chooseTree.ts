// chooseTree.ts
import type { PrimaryEmotion } from "../../mood.types.js";
import { type GardenType } from "@prisma/client";
import { GALAXY_CELESTIAL_OBJECTS } from "./galaxyCelestialOjbects.js";


export const TREES = {
    ACACIA_PYCNANTHA: "acacia pycnantha",
    ANGEL_OAK: "angel oak",
    ASH: "ash tree",
    ASPEN: "aspen",
    BAOBAB: "baobab tree",
    BANANA: "banana tree",
    BAUHINIA_PURPUREA: "bauhinia purpurea",
    BANYAN: "banyan tree",
    BARBED_WIRE_WRAPPED_TREE: "barbed wire wrapped tree",
    BASIC_TREE_TRUNK: "basic tree trunk",
    BEECH: "beech tree",
    BENT_SAPPY_TREE: "bent sappy tree",
    BLACKTHORN: "blackthorn",
    BOOJUM: "boojum tree",
    BRISTLECONE_PINE: "bristlecone pine",
    BROKEN_TREE: "broken tree",
    BURNT_TREE: "burnt tree",
    CASSIA_FISTULA: "cassia fistula",
    CHERRY: "cherry tree",
    CHIONANTHUS_VIRGINICUS: "chionanthus virginicus",
    CITRUS: "citrus tree",
    COCONUT: "coconut tree",
    COTINUS_COGGYGRIA: "cotinus coggygria",
    CYPRESS: "cypress tree",
    DEADVLEI_TREE: "deadvlei tree",
    DRACAENA_DRACO: "dracaena draco",
    FOSSILISED_TREE: "fossilised tree",
    FIG: "fig tree",
    FIREWORK_TREE: "firework tree",
    FIREFLY_TREE: "firefly tree",
    GINKGO: "ginkgo",
    GLOWING_COLOURFUL_ORBS_TREE: "glowing colourful orbs tree",
    HANDROANTHUS_HEPTAPHYLLUS: "handroanthus heptaphyllus",
    HIDING_TREE: "hiding tree",
    HOLLOWED_TREE: "hollowed tree",
    HYOPHORBE_LAGENICAULIS: "hyophorbe lagenicaulis",
    IVY: "ivy",
    JACARANDA: "jacaranda tree",
    JAGGED_DEAD_STUMPS: "jagged dead stumps",
    JAPANESE_MAPLE: "japanese maple",
    KAPOK: "kapok",
    KATSURA: "katsura",
    KNOTTED_TREE: "knotted tree",
    LAGERSTROEMIA: "lagerstroemia",
    MAGNOLIA: "magnolia",
    MAPLE: "maple tree",
    MONKEYPUZZLE: "monkey puzzle tree",
    OLEANDER: "oleander",
    OLIVE: "olive tree",
    PALM: "palm tree",
    PILE_OF_BRANCHES: "pile of branches",
    PINE: "pine tree",
    PLASTIC_WHITE_TREE: "plastic white tree",
    PYRUS_CALLERYANA: "pyrus calleryana",
    QUESTION_MARK_TREE: "question mark tree",
    RAINBOW_EUCALYPTUS: "rainbow eucalyptus",
    RAIN_TREE: "rain tree",
    RAVENALA_MADAGASCARIENSIS: "ravenala madagascariensis",
    ROYAL_POINCIANA: "royal poinciana",
    SEQUOIA: "sequoia tree",
    SILVER_BIRCH: "silver birch",
    STRANGLER_FIG: "strangler fig",
    SUMAC: "sumac tree",
    TAXODIUM_MUCRONATUM: "taxodium mucronatum",
    TREEHOUSE_TREE_WITH_ROPE_SWING: "treehouse tree with rope swing",
    TWISTED_TREE: "twisted tree",
    UPSIDE_DOWN_TREE: "upside down tree",
    WASHINGTONIA_FILIFERA: "washingtonia filifera",
    WILLOW: "willow tree",
    WISTERIA: "wisteria",
} as const;

export type Tree = (typeof TREES)[keyof typeof TREES];

export const TREES_MATRIX: Record<PrimaryEmotion, Tree[]> = {
    // POSITIVE
    joy: [TREES.JACARANDA, TREES.CASSIA_FISTULA, TREES.HANDROANTHUS_HEPTAPHYLLUS],
    love: [TREES.CHERRY, TREES.MAGNOLIA, TREES.WISTERIA],
    hope: [TREES.OLIVE, TREES.GINKGO, TREES.PYRUS_CALLERYANA],
    excitement: [TREES.CITRUS, TREES.WASHINGTONIA_FILIFERA, TREES.FIREWORK_TREE],
    serenity: [TREES.BANYAN, TREES.BAUHINIA_PURPUREA, TREES.JAPANESE_MAPLE],
    creativity: [TREES.BOOJUM, TREES.RAINBOW_EUCALYPTUS, TREES.RAVENALA_MADAGASCARIENSIS],
    lust: [TREES.FIG, TREES.ROYAL_POINCIANA, TREES.LAGERSTROEMIA],
    resilience: [TREES.COCONUT, TREES.ACACIA_PYCNANTHA, TREES.KATSURA],
    silliness: [
        TREES.TREEHOUSE_TREE_WITH_ROPE_SWING,
        TREES.COTINUS_COGGYGRIA,
        TREES.GLOWING_COLOURFUL_ORBS_TREE
    ],

    // NEUTRAL
    curiosity: [TREES.HYOPHORBE_LAGENICAULIS, TREES.KAPOK, TREES.BANANA],
    awe: [TREES.BAOBAB, TREES.TAXODIUM_MUCRONATUM, TREES.FIREFLY_TREE],
    contemplative: [TREES.ANGEL_OAK, TREES.CHIONANTHUS_VIRGINICUS, TREES.FOSSILISED_TREE],

    // NEGATIVE
    confusion: [TREES.MONKEYPUZZLE, TREES.QUESTION_MARK_TREE, TREES.UPSIDE_DOWN_TREE],
    boredom: [TREES.PINE, TREES.BASIC_TREE_TRUNK, TREES.PLASTIC_WHITE_TREE],
    embarrassment: [TREES.SUMAC, TREES.HIDING_TREE, TREES.KNOTTED_TREE],
    sadness: [TREES.WILLOW, TREES.BENT_SAPPY_TREE, TREES.RAIN_TREE],
    anxiety: [TREES.BRISTLECONE_PINE, TREES.ASPEN, TREES.TWISTED_TREE],
    anger: [TREES.SEQUOIA, TREES.DRACAENA_DRACO, TREES.DEADVLEI_TREE],
    guilt: [TREES.BARBED_WIRE_WRAPPED_TREE, TREES.BLACKTHORN, TREES.JAGGED_DEAD_STUMPS],
    loneliness: [TREES.PILE_OF_BRANCHES, TREES.SILVER_BIRCH, TREES.HOLLOWED_TREE],
    disappointment: [TREES.BEECH, TREES.BURNT_TREE, TREES.BROKEN_TREE],
    jealousy: [TREES.IVY, TREES.OLEANDER, TREES.STRANGLER_FIG],
};

// For other types, we’ll also just use descriptive strings
type TreeLike = string;

const TREES_MATRIX_UNDERWATER = {
  // POSITIVE
  joy: [
    "a playful pod of dolphins",
    "a colourful shoal of clownfish weaving through the scene",
    "a huge manta ray gliding in joyful circles",
  ],
  love: [
    "a pair of sea turtles swimming side by side",
    "two seahorses wrapped around the same strand of seagrass",
    "a pair of humpback whales gently circling each other",
  ],
  hope: [
    "a tiny turtle hatchling heading toward the light",
    "a shimmering school of silver fish moving toward the bright surface",
    "a young reef shark exploring cautiously near the edge of the garden",
  ],
  excitement: [
    "a sprinting shoal of tuna darting across the scene",
    "a group of dolphins leaping through columns of bubbles",
    "a fast-moving swarm of small fish exploding in all directions",
  ],
  serenity: [
    "a slow, serene manatee drifting past the garden",
    "a gentle sea turtle hovering above the seafloor",
    "a massive whale gliding quietly through the blue",
  ],
  creativity: [
    "a curious octopus rearranging shells and stones",
    "a cuttlefish shifting colours like living paint",
    "a mixed school of wildly patterned reef fish",
  ],
  lust: [
    "a lionfish fanning out its ornate fins",
    "a ribbon eel weaving sensually through the water",
    "two rays circling each other in a slow underwater dance",
  ],
  resilience: [
    "a scarred old sea turtle that has clearly survived many storms",
    "a sturdy grouper standing guard near a rock",
    "a small reef shark patrolling the edge of the garden",
  ],
  silliness: [
    "a puffed-up pufferfish floating like a silly balloon",
    "a clownfish darting in and out of anemones",
    "a sleepy seal tumbling around in clumsy loops",
  ],

  // NEUTRAL
  curiosity: [
    "a curious octopus peeking out of a rocky crevice",
    "a moray eel cautiously watching from its hole",
    "a small ray lifting sand with each investigative flap",
  ],
  awe: [
    "a blue whale passing far above like a living mountain",
    "a giant manta ray soaring through shafts of light",
    "a huge swirling bait ball of fish forming shifting shapes",
  ],
  contemplative: [
    "an ancient sea turtle resting motionless on the seafloor",
    "a solitary ray slowly circling a quiet patch of sand",
    "an old grouper hovering in place, barely moving",
  ],

  // NEGATIVE
  confusion: [
    "a small school of fish circling in disoriented spirals",
    "a cloud of panicked fish scattering in random directions",
    "a startled octopus darting and changing colour erratically",
  ],
  boredom: [
    "a lone sluggish fish drifting aimlessly",
    "a tired ray shuffling lazily across the sand",
    "a jellyfish pulsing in slow, repetitive motions",
  ],
  embarrassment: [
    "a shy fish darting behind a rock whenever anything moves",
    "a small crab retreating into its hole and peeking out",
    "a timid seahorse hiding behind a strand of seaweed",
  ],
  sadness: [
    "a solitary ray gliding slowly through dim water",
    "an old turtle with scarred shell moving with effort",
    "a single fish hovering over a bare patch of seafloor",
  ],
  anxiety: [
    "a frantic shoal of fish scattering at every movement",
    "several small fish constantly glancing toward the dark deep",
    "a nervous squid propelling itself away in bursts of ink and panic",
  ],
  anger: [
    "a barracuda hovering with sharp, watchful eyes",
    "a shark circling tightly around the garden’s edge",
    "a territorial grouper lunging aggressively at intruders",
  ],
  guilt: [
    "a turtle dragging a tangle of lost fishing line",
    "a dolphin with old scars across its side",
    "a ray gliding past a broken, damaged coral field",
  ],
  loneliness: [
    "a single whale far in the distance, calling into the deep",
    "one small fish hovering in a wide empty blue",
    "a lone turtle silhouetted against a distant shaft of light",
  ],
  disappointment: [
    "a small school of dull-coloured fish drifting through a sparse reef",
    "a tired old ray over a damaged patch of seafloor",
    "a shark passing a once-bright coral area now mostly barren",
  ],
  jealousy: [
    "a lurking moray eel watching brighter fish from the shadows",
    "a shadowy barracuda hovering near a lively reef it cannot enter",
    "a solitary fish staring toward a distant colourful shoal",
  ],
};





export const TREES_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<PrimaryEmotion, TreeLike[]>
> = {
  CLASSIC: TREES_MATRIX as Record<PrimaryEmotion, TreeLike[]>,
  UNDERWATER: TREES_MATRIX_UNDERWATER,
  GALAXY: GALAXY_CELESTIAL_OBJECTS,
};

// ── Selector ───────────────────────────────────────────────
export function selectTree(
  type: GardenType,
  primary: string,
): TreeLike {
  const p = primary.toLowerCase().trim() as PrimaryEmotion;
  const list = TREES_MATRIX_BY_TYPE[type]?.[p] ?? TREES_MATRIX_BY_TYPE.CLASSIC[p];
  const index = Math.floor(Math.random() * list.length);
  return list[index];
}

