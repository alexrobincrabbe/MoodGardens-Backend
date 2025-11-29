// chooseTree.ts
import type { PrimaryEmotion } from "../mood.types.js";
import { type GardenType } from "@prisma/client";

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


const TREES_MATRIX_GALAXY = {
  // POSITIVE
  joy: [
    "a bright golden main-sequence star shining nearby",
    "a small colourful terrestrial planet covered in swirling clouds",
    "a ringed planet gleaming cheerfully in the distance",
  ],
  love: [
    "a close pair of binary stars orbiting one another",
    "two twin moons hanging together over the horizon",
    "a rose-coloured nebula shaped like a blooming flower",
  ],
  hope: [
    "a newborn star forming in a soft glowing nebula",
    "a pale blue planet just entering the light of a new dawn",
    "a small green world slowly rotating into sunrise",
  ],
  excitement: [
    "a fast-moving comet with a long sparkling tail",
    "a cluster of young hot blue stars burning intensely",
    "a rogue planet racing through space on a wild orbit",
  ],
  serenity: [
    "a quiet blue-white star shining steadily in the distance",
    "a slow-rotating gas giant with soft pastel bands",
    "a solitary moon hanging in a still, star-filled sky",
  ],
  creativity: [
    "a patchwork planet with mismatched coloured continents",
    "a twisted, irregular asteroid drifting in a strange orbit",
    "a prismatic nebula cloud scattering light into unusual hues",
  ],
  lust: [
    "a deep red supergiant star glowing voluptuously",
    "a dark crimson gas giant with swirling storm bands",
    "a sultry violet nebula clinging to a hidden star cluster",
  ],
  resilience: [
    "a scarred rocky planet still holding onto its thin atmosphere",
    "a dense neutron star stubbornly enduring immense pressure",
    "an old, stable yellow star that has burned for billions of years",
  ],
  silliness: [
    "a tiny cartoonishly-striped planet with exaggerated rings",
    "a lumpy asteroid shaped almost like a rubber duck",
    "a small moon bouncing oddly in an off-kilter orbit",
  ],

  // NEUTRAL
  curiosity: [
    "a faintly glowing exoplanet with mysterious patterns on its surface",
    "a strange elongated asteroid tumbling end over end",
    "a dim, flickering star whose light pulses irregularly",
  ],
  awe: [
    "a massive ringed gas giant dominating the sky",
    "a huge elliptical galaxy arching across the horizon",
    "a colossal star cluster glittering like a cosmic city",
  ],
  contemplative: [
    "a single pale planet slowly rotating in the distance",
    "a calm white dwarf star glowing gently in the dark",
    "a lonely moon orbiting quietly in a wide empty orbit",
  ],

  // NEGATIVE
  confusion: [
    "a warped planet twisted by strong tidal forces",
    "a pulsar flashing in odd, uneven rhythms",
    "a binary system of stars pulling each other into chaotic spirals",
  ],
  boredom: [
    "a dull grey rocky planet with no visible atmosphere",
    "a small, lifeless moon pockmarked with craters",
    "a featureless brown dwarf star barely glowing",
  ],
  embarrassment: [
    "a small, dim red dwarf star hiding behind cosmic dust",
    "a faint planet partially eclipsed by its own moon",
    "a shy minor moon hovering in the penumbra of a larger world",
  ],
  sadness: [
    "a dying red giant star losing its outer layers slowly",
    "a cold, frozen planet drifting far from any warmth",
    "a faded nebula slowly dispersing into the void",
  ],
  anxiety: [
    "a jittery pulsar beaming intense radiation in rapid bursts",
    "a planet caught near the edge of a swirling accretion disk",
    "a fragile moon creaking under the pull of nearby giants",
  ],
  anger: [
    "a raging blue-white giant star burning violently",
    "a stormy gas giant with enormous blood-red storms",
    "a devouring black hole tearing light into sharp arcs",
  ],
  guilt: [
    "a shattered planet broken into an asteroid belt",
    "a scorched world with dark burn scars across its surface",
    "a dim star surrounded by a halo of debris and ruined fragments",
  ],
  loneliness: [
    "a solitary rogue planet drifting between galaxies",
    "a single star in a vast patch of empty dark",
    "a tiny moon in a wide, isolated orbit far from its parent world",
  ],
  disappointment: [
    "a once-promising world now dried into a lifeless rock",
    "a faded, cooling star that has lost most of its brightness",
    "a thin, patchy nebula that barely glows anymore",
  ],
  jealousy: [
    "a small, dim star orbiting far from a bright galactic core",
    "a cold rocky planet watching a lush, blue neighbour from afar",
    "a shadowed moon lingering just outside the glow of a vibrant ringed planet",
  ],
};



export const TREES_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<PrimaryEmotion, TreeLike[]>
> = {
  CLASSIC: TREES_MATRIX as Record<PrimaryEmotion, TreeLike[]>,
  UNDERWATER: TREES_MATRIX_UNDERWATER,
  GALAXY: TREES_MATRIX_GALAXY,
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

