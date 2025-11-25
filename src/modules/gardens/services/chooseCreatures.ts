

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

export function selectCreatures(secondaries: string[]): Creature[] {
    return secondaries
        .map((s) => s.toLowerCase().trim())
        .map((s) => CREATURES_MATRIX[s])
        .filter((f): f is Creature => !!f);
}
