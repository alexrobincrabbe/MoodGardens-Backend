import { type GardenType } from "@prisma/client";
import { SPACE_SPRITES } from "./spaceSprites.js";


export const CREATURES = {
    BEETLES: "beetles",
    CICADAS: "cicadas",
    GLOWING_EYES: "glowing eyes",
    MOLE: "mole",
    HORNETS: "hornets",
    SPIDER: "spider",
    PARROTS: "parrots",
    SALAMANDER: "salamander",
    BUTTERFLIES: "butterflies",
    MOTHS: "moths",
    DRAGONFLIES: "dragonflies",
    HUMMINGBIRDS: "hummingbirds",
    HEDGEHOGS: "hedgehogs",
    OWL: "owl",
    FROGS: "frogs",
    KOI: "koi",
    WHITE_PARROT: "white parrot",
    DOVES: "doves",
    CROWS: "crows",
    FIREFLIES: "fireflies",
    RAVEN: "raven",
    PEACOCK: "peacock",
    BEES: "bees",
    ROBINS: "robins",
    WORMS: "worms",
    ANTS: "ants",
    GRASSHOPPER: "grasshopper",
    DEATHWATCH_BEETLE: "deathwatch beetle",
    RAVENS: "ravens",
    SPIDERS: "spiders",
    HEDGEHOG: "hedgehog",

} as const

export type Creature = (typeof CREATURES)[keyof typeof CREATURES];

const CREATURES_MATRIX: Record<string, Creature> = {
    // Positive
    joy: CREATURES.BUTTERFLIES,
    love: CREATURES.HUMMINGBIRDS,
    hope: CREATURES.CICADAS,
    excitement: CREATURES.DRAGONFLIES,
    serenity: CREATURES.DOVES,
    creativity: CREATURES.DRAGONFLIES,
    lust: CREATURES.PEACOCK,
    resilience: CREATURES.ANTS,
    silliness: CREATURES.PARROTS,
    // Neutral
    curiosity: CREATURES.GRASSHOPPER,
    awe: CREATURES.FIREFLIES,
    contemplative: CREATURES.KOI,
    // Negative
    confusion: CREATURES.FROGS,
    boredom: CREATURES.MOTHS,
    embarrassment: CREATURES.MOLE,
    sadness: CREATURES.RAVEN,
    anxiety: CREATURES.DEATHWATCH_BEETLE,
    anger: CREATURES.HORNETS,
    guilt: CREATURES.OWL,
    loneliness: CREATURES.WORMS,
    disappointment: CREATURES.WORMS,
    jealousy: CREATURES.SPIDER,
    // ─────────────────────────────
    // SECONDARY EMOTIONS
    // ─────────────────────────────
    nostalgia: CREATURES.RAVENS,
    relief: CREATURES.DOVES,
    calm: CREATURES.KOI,
    contentment: CREATURES.BUTTERFLIES,
    pride: CREATURES.FROGS,
    gratitude: CREATURES.HUMMINGBIRDS,
    affection: CREATURES.BUTTERFLIES,
    tenderness: CREATURES.HUMMINGBIRDS,
    longing: CREATURES.CICADAS,
    melancholy: CREATURES.RAVEN,
    regret: CREATURES.RAVENS,
    frustration: CREATURES.WORMS,
    resentment: CREATURES.HORNETS,
    irritation: CREATURES.BEES,
    shame: CREATURES.WORMS,
    uncertainty: CREATURES.HEDGEHOG,
    insecurity: CREATURES.MOLE,
    fear: CREATURES.GLOWING_EYES,
    worry: CREATURES.MOLE,
    stress: CREATURES.WORMS,
    tension: CREATURES.DEATHWATCH_BEETLE,
    restlessness: CREATURES.HUMMINGBIRDS,
    anticipation: CREATURES.BEETLES,
    surprise: CREATURES.PARROTS,
    inspiration: CREATURES.DRAGONFLIES,
    motivation: CREATURES.BEES,
    determination: CREATURES.ANTS,
    discouragement: CREATURES.SPIDERS,
    emptiness: CREATURES.MOTHS,
    peacefulness: CREATURES.KOI,
    comfort: CREATURES.HEDGEHOG,
    warmth: CREATURES.SALAMANDER,
    admiration: CREATURES.FIREFLIES,
    compassion: CREATURES.WHITE_PARROT,
    sympathy: CREATURES.ROBINS,
    isolation: CREATURES.GRASSHOPPER,
    affirmation: CREATURES.DOVES,
    validation: CREATURES.OWL,
    confidence: CREATURES.PEACOCK,
}

type CreatureLike = string;

const CREATURES_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<string, CreatureLike>
> = {
  CLASSIC: CREATURES_MATRIX,
  UNDERWATER: {
    // POSITIVE
    joy: "shimmering cloud of tiny orange reef fish",
    love: "pair of small clownfish weaving close together",
    hope: "small silver fish schooling toward the bright surface",
    excitement: "quick darting blue chromis flashing through the water",
    serenity: "slow-moving group of pale, gentle damselfish",
    creativity: "stripy gobies painting zigzags through the water",
    lust: "small ruby-colored anthias swirling in tight circles",
    resilience: "sturdy little wrasse grazing tirelessly along the rocks",
    silliness: "tiny, curious blennies popping in and out of holes",

    // NEUTRAL
    curiosity: "bright-eyed gobies hovering just above the sand",
    awe: "dense ball of tiny silver baitfish moving as one",
    contemplative: "small koi-like reef fish drifting in slow orbits",

    // NEGATIVE
    confusion: "startled little fish spinning in messy circles",
    boredom: "dull grey fish drifting without much purpose",
    embarrassment: "small fish hiding behind seagrass, peeking out",
    sadness: "lonely pale fish hovering near the seafloor",
    anxiety: "nervous damselfish darting back and forth",
    anger: "spiky juvenile lionfish flaring its fins",
    guilt: "small fish with torn fins hovering near broken coral",
    loneliness: "single tiny fish hovering in a wide empty patch of blue",
    disappointment: "faded, colourless fish drifting over a bare patch of sand",
    jealousy: "shadow-dwelling fish watching colourful shoals from the dark",

    // SECONDARY EMOTIONS
    nostalgia: "small silver fish circling slowly like distant memories",
    relief: "little fish relaxing in a gently swaying patch of seagrass",
    calm: "tiny koi-like fish gliding in smooth, lazy loops",
    contentment: "small reef fish lazily nibbling algae from rocks",
    pride: "slightly larger, bright-coloured fish patrolling a tiny territory",
    gratitude: "tiny cleaner fish darting around a patient client fish",
    affection: "pair of tiny fish resting close together in a coral nook",
    tenderness: "small group of young fish sheltering near a parent",
    longing: "small fish gazing toward a brighter, distant shoal",
    melancholy: "little dark fish staying close to a patch of dim coral",
    regret: "tiny fish circling slowly around a broken coral piece",
    frustration: "small fish repeatedly bumping against a tangle of seaweed",
    resentment: "edgy damselfish defending a small patch of rock",
    irritation: "small territorial fish snapping at passersby",
    shame: "small fish pressed close to a rock, avoiding the light",
    uncertainty: "little fish hovering between two hiding spots",
    insecurity: "tiny fish repeatedly retreating deeper into crevices",
    fear: "tight school of tiny fish bunching together suddenly",
    worry: "small fish flicking its tail nervously near a drop-off",
    stress: "breathing-fast fish hovering in choppy water",
    tension: "cluster of small fish holding rigidly in strong current",
    restlessness: "small fish pacing a loop around a rock cluster",
    anticipation: "little fish hovering at the edge of a reef, ready to dart",
    surprise: "tiny fish shooting suddenly from the sand and vanishing again",
    inspiration: "glittering neon fish tracing bright lines through the blue",
    motivation: "small fish tirelessly combing rocks for food",
    determination: "tiny fish pushing upstream against a mild current",
    discouragement: "little fish sinking slowly toward the seafloor",
    emptiness: "almost invisible, pale fish barely moving in the haze",
    peacefulness: "calm koi-like fish drifting in gentle circles",
    comfort: "small fish nestled safely among soft corals",
    warmth: "little orange fish basking in a shaft of golden light",
    admiration: "tiny fish swirling around a larger, graceful shoal",
    compassion: "small fish lingering protectively near a weaker companion",
    sympathy: "pair of small fish swimming slowly side by side",
    isolation: "single fish out beyond the reef’s edge",
    affirmation: "little group of fish swimming in supportive formation",
    validation: "tiny fish basking in a soft, approving halo of light",
    confidence: "brightly coloured fish darting boldly through open water",
  },

  GALAXY: SPACE_SPRITES,
};

export function selectCreatures(
  type: GardenType,
  secondaries: string[],
): CreatureLike[] {
  const matrix = CREATURES_MATRIX_BY_TYPE[type] ?? CREATURES_MATRIX_BY_TYPE.CLASSIC;

  return secondaries
    .map((s) => s.toLowerCase().trim())
    .map((key) => matrix[key] ?? CREATURES_MATRIX[key]) // fallback to NORMAL
    .filter((f): f is CreatureLike => !!f);
}
