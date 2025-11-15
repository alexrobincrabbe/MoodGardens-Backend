
// ───────────────────────────────────────────────
// 1. Canonical flower list
// ───────────────────────────────────────────────
export const FLOWERS = {
    WISTERIA: "wisterias",
    ROSE: "roses",
    TULIP: "tulips",
    SUNFLOWER: "sunflowers",
    LAVENDER: "lavenders",
    STRELITZIA: "strelitzias",
    BLEEDING_HEART: "bleeding hearts(flowers)",
    SNAPDRAGON: "snapdragon",
    MIXED_ALLIUMS: "mixed alliums",
    BLUE_PUYA: "blue puyas",
    PROTEA_PINWHEEL: "protea pinwheels",
    LOTUS: "lotuses",
    BULBOPHYLLUM_MEDUSAE: "bulbophyllum medusae",
    BURDOCK: "burdocks",
    ANEMONE: "anemones",
    BLUEBELLS: "bluebells",
    ORCHID: "orchids",
    FOXGLOVE: "foxgloves",
    PASSIONFLOWER: "passionflowers",
    IRIS: "irises(flowers)",
    LILY: "lilies",
    DAHLIA: "dahlias",
    GIANT_DANDELIONS: "giant dandelions",
    FORGETMENOTS: "forgetmenots",
    DAISIES: "daisies",
    ORANGE_BLOSSOMS: "orange blossoms",
    CROCUSES: "crocuses",
    HYDRANGEAS: "hydrangeas",
    PEONIES: "peonies",
    SWEET_PEAS: "sweet peas",
    BLEEDING_HEARTS: "bleeding hearts",
    DRACUNCULUS_VULGARIS: "dracunculus vulgaris",
    HYACINTHS: "hyacinths",
    REEDS: "reeds",
    CHRYSANTHEMUMS: "chrysanthemums",
    ARISTOLOCHIA_GIGANTEAS: "aristolochia giganteas",
    PARKIA_BIGLOBOSAS: "parkia biglobosas",
    DAFFODILS: "daffodils",
    VIOLETS: "violets",
    CHANTRIERIS: "chantrieris",
    MARIGOLDS: "marigolds",
    CAMOMILES: "camomiles",
    ABATINAS: "abatinas",
    ACONITES: "aconites",
    ZINGIBER_SPECTABILES: "zingiber spectabiles",
    GLOWING_MUSHROOMS: "glowing mushrooms",
    MAGNOLIAS: "magnolias",
    CAMELLIAS: "camellias",
    PETUNIAS: "petunias",
    PINE_CONES: "pine cones",
    DANDELIONS: "dandelions",
    ASTER: "aster",
    HONEYSUCKLE: "honeysuckle",
    JASMINE: "jasmine",
    LILIES: "lilies",
    BABYS_BREATH: "baby's breath flowers",
    HIBISCUSES: "hibiscuses",
    AECHMEA_FASCIATAS: "aechmea fasciatas",



} as const;

export type Flower = (typeof FLOWERS)[keyof typeof FLOWERS]; // or reuse FlowerType if you prefer

// ───────────────────────────────────────────────
// 2. Full emotion → flower mapping
//    Includes all primary emotions + many secondaries
//    All keys are lowercase emotion names.
// ───────────────────────────────────────────────
export const FLOWERS_MATRIX: Record<string, Flower> = {
    // Positive
    joy: FLOWERS.WISTERIA,
    love: FLOWERS.ROSE,
    hope: FLOWERS.TULIP,
    excitement: FLOWERS.SUNFLOWER,
    serenity: FLOWERS.LAVENDER,
    creativity: FLOWERS.STRELITZIA,
    lust: FLOWERS.BLEEDING_HEART,
    resilience: FLOWERS.SNAPDRAGON,
    silliness: FLOWERS.MIXED_ALLIUMS,


    // Neutral
    curiosity: FLOWERS.BLUE_PUYA,
    awe: FLOWERS.PROTEA_PINWHEEL,
    contemplative: FLOWERS.LOTUS,

    // Negative
    confusion: FLOWERS.BULBOPHYLLUM_MEDUSAE,
    boredom: FLOWERS.BURDOCK,
    embarrassment: FLOWERS.ANEMONE,
    sadness: FLOWERS.BLUEBELLS,
    anxiety: FLOWERS.ORCHID,
    anger: FLOWERS.FOXGLOVE,
    guilt: FLOWERS.PASSIONFLOWER,
    loneliness: FLOWERS.IRIS,
    disappointment: FLOWERS.LILY,
    jealousy: FLOWERS.DAHLIA,


    // ─────────────────────────────
    // SECONDARY EMOTIONS (unchanged)
    // ─────────────────────────────

    nostalgia: FLOWERS.FORGETMENOTS,
    relief: FLOWERS.DAISIES,
    calm: FLOWERS.LAVENDER,
    contentment: FLOWERS.ORANGE_BLOSSOMS,
    pride: FLOWERS.CROCUSES,
    gratitude: FLOWERS.HYDRANGEAS,
    affection: FLOWERS.PEONIES,
    tenderness: FLOWERS.SWEET_PEAS,
    longing: FLOWERS.BLEEDING_HEARTS,
    melancholy: FLOWERS.DRACUNCULUS_VULGARIS,
    regret: FLOWERS.HYACINTHS,
    frustration: FLOWERS.REEDS,
    resentment: FLOWERS.CHRYSANTHEMUMS,
    irritation: FLOWERS.ARISTOLOCHIA_GIGANTEAS,
    shame: FLOWERS.PARKIA_BIGLOBOSAS,
    uncertainty: FLOWERS.DAFFODILS,
    insecurity: FLOWERS.VIOLETS,
    fear: FLOWERS.CHANTRIERIS,
    worry: FLOWERS.MARIGOLDS,
    stress: FLOWERS.CAMOMILES,
    tension: FLOWERS.ABATINAS,
    restlessness: FLOWERS.ACONITES,
    anticipation: FLOWERS.DAFFODILS,
    surprise: FLOWERS.ZINGIBER_SPECTABILES,
    inspiration: FLOWERS.GLOWING_MUSHROOMS,
    motivation: FLOWERS.MAGNOLIAS,
    determination: FLOWERS.CAMELLIAS,
    discouragement: FLOWERS.PETUNIAS,
    emptiness: FLOWERS.PINE_CONES,
    peacefulness: FLOWERS.DANDELIONS,
    comfort: FLOWERS.ASTER,
    warmth: FLOWERS.DANDELIONS,
    admiration: FLOWERS.HONEYSUCKLE,
    compassion: FLOWERS.JASMINE,
    sympathy: FLOWERS.LILY,
    isolation: FLOWERS.BLUEBELLS,
    affirmation: FLOWERS.BABYS_BREATH,
    validation: FLOWERS.HIBISCUSES,
    confidence: FLOWERS.AECHMEA_FASCIATAS
};

// ───────────────────────────────────────────────
// 3. Selector: from secondary_emotions → Flower[]
// ───────────────────────────────────────────────
export function selectFlowers(secondaries: string[]): Flower[] {
    return secondaries
        .map((s) => s.toLowerCase().trim())
        .map((s) => FLOWERS_MATRIX[s])
        .filter((f): f is Flower => !!f); // strip unknown emotions
}
