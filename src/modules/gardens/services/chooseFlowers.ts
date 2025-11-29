import { type GardenType } from "@prisma/client";



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




export type Flower = (typeof FLOWERS)[keyof typeof FLOWERS];
// allow underwater/galaxy to use free-text phrases
type FlowerLike = string;


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
    // SECONDARY EMOTIONS
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

const FLOWERS_MATRIX_UNDERWATER = {
  // Positive
  joy: "clusters of bright yellow sea anemones swaying in the current",
  love: "soft pink coral polyps nestled close together",
  hope: "newly sprouting green seagrass dotted with tiny white blossoms",
  excitement: "bursting patches of orange cup coral lighting up the reef",
  serenity: "lavender-tinted soft corals gently waving in slow water",
  creativity: "strange bird-of-paradise–like coral fans in unexpected colours",
  lust: "deep crimson anemones with long, sensuous tentacles",
  resilience: "tough barnacle-encrusted coral heads clinging to rock",
  silliness: "puffs of mixed bubbleweed and odd-shaped algae like underwater pom-poms",

  // Neutral
  curiosity: "rare blue-tipped coral clusters peeking from a crevice",
  awe: "huge plate corals layered like underwater flower terraces",
  contemplative: "quiet white sea lilies opening slowly on the seafloor",

  // Negative
  confusion: "tangled, hairlike seaweed spirals and oddly shaped sponge clusters",
  boredom: "patches of dull brown algae coating bare rock",
  embarrassment: "small pale anemones half-hiding behind larger corals",
  sadness: "drooping blue-tinted soft corals in dim light",
  anxiety: "narrow, spiky coral branches reaching awkwardly in all directions",
  anger: "sharp, poisonous lionfish coral mimics with jagged spines",
  guilt: "corals wrapped with drifting fishing line and clinging debris",
  loneliness: "a single lonely sea fan in a wide stretch of bare sand",
  disappointment: "once-bright coral patches now faded and half-bleached",
  jealousy: "twisted green algae clinging jealously to brighter coral towers",

  // SECONDARY EMOTIONS
  nostalgia: "tiny clusters of forget-me-not–blue polyps on old coral skeletons",
  relief: "simple white star-shaped sea flowers opening after a storm",
  calm: "soft lavender seaweed meadows gently rippling with water",
  contentment: "small orange reef blossoms nestled among safe rocks",
  pride: "upright purple tube sponges standing tall like little trophies",
  gratitude: "round hydrangea-like coral clumps in generous pastel clusters",
  affection: "bundles of round pink coral blossoms leaning into each other",
  tenderness: "delicate soft corals with feathery edges brushing gently",
  longing: "long-stemmed white sea lilies reaching toward the surface light",
  melancholy: "dark, oddly fragrant underwater lilies curling at the edges",
  regret: "fragrant hyacinth-like coral blooms growing from broken stone",
  frustration: "reedy sea grasses whipping back and forth in a stubborn current",
  resentment: "thick, bristling chrysanthemum-like sponge clusters with stiff petals",
  irritation: "unsettling pitcher-shaped sea flowers with inward-curved mouths",
  shame: "drooping tentacle blossoms that curl inward and hide their centres",
  uncertainty: "small yellow sea daffodils nodding hesitantly in the current",
  insecurity: "tiny shy violets of coral peeking from tight crevices",
  fear: "shadowy, fang-shaped sea blossoms glowing faintly from dark cracks",
  worry: "clusters of marigold-like orange polyps trembling with each wave",
  stress: "matts of chamomile-like white sea daisies swaying nervously",
  tension: "tight clusters of tiny bead-like buds wound around a stalk",
  restlessness: "fine, toxic-looking aconite-like sea blooms twitching constantly",
  anticipation: "fresh yellow sea daffodil buds just about to open",
  surprise: "exotic ginger-like underwater blooms with bold speckled petals",
  inspiration: "patches of softly glowing bioluminescent mushrooms on old logs",
  motivation: "large waxy magnolia-like underwater blossoms opening to the current",
  determination: "firm camellia-like sea blooms holding their shape in rough water",
  discouragement: "drooping petunia-like sea flowers losing their colour",
  emptiness: "plain cones of bare coral skeletons scattered on the sand",
  peacefulness: "soft dandelion-like seed heads releasing tiny underwater spores",
  comfort: "small star-shaped asters nestled into safe rock hollows",
  warmth: "sunny golden underwater dandelions glowing in light shafts",
  admiration: "long trails of fragrant honeysuckle-like sea flowers climbing coral",
  compassion: "clusters of jasmine-like white blossoms hovering protectively nearby",
  sympathy: "soft white lilies of the sea leaning toward each other sadly",
  isolation: "a single bluebell-shaped sea flower ringing quietly in the depths",
  affirmation: "delicate sprays of tiny baby’s-breath–like sea blossoms",
  validation: "bright hibiscus-like underwater flowers opening toward the viewer",
  confidence: "bold, spiky bromeliad-like sea blooms radiating from a central point",
};

const FLOWERS_MATRIX_GALAXY = {
  // Positive
  joy: "drifting cascades of wisteria-like star blossoms hanging in space",
  love: "clusters of rose-shaped nebulae unfurling soft red petals of gas",
  hope: "tulip-like beams of light sprouting upward from a dark void",
  excitement: "sunflower-shaped bursts of bright plasma facing a nearby star",
  serenity: "fields of lavender starlight mist stretching across the sky",
  creativity: "bird-of-paradise–like energy flares bending into wild shapes",
  lust: "bleeding-heart nebula blooms pulsing deep crimson in the dark",
  resilience: "tough snapdragon-shaped star clusters standing against cosmic winds",
  silliness: "mismatched orbs of light like mixed alliums bobbing in zero gravity",

  // Neutral
  curiosity: "rare blue-puya–like plasma blooms peeking from a dust cloud",
  awe: "protea pinwheel galaxies spinning like colossal star flowers",
  contemplative: "lotus-like circles of light floating on a still black ether",

  // Negative
  confusion: "medusa-like tendrils of gas spiralling in tangled patterns",
  boredom: "thistly burdock-like dust clumps drifting without glow",
  embarrassment: "soft anemone-like light puffs hiding behind brighter stars",
  sadness: "small bluebell nebula bells drooping in faint starlight",
  anxiety: "orchid-shaped voids edged in sharp violet light",
  anger: "foxglove-shaped plasma towers charged with dangerous energy",
  guilt: "passionflower-like rings of tangled cosmic filaments",
  loneliness: "single iris-like eye of light hovering in endless night",
  disappointment: "pale lily-shaped light sources that never fully brighten",
  jealousy: "dahlia-like layered star blooms in deep shadow, watching brighter clusters",

  // SECONDARY EMOTIONS
  nostalgia: "clouds of tiny forget-me-not star specks lingering behind",
  relief: "simple daisy-shaped constellations forming gentle circles",
  calm: "soft lavender nebula wisps dissolving into tranquil space",
  contentment: "small orange-blossom clusters glowing warmly around a quiet star",
  pride: "patches of crocus-like cosmic buds opening with quiet confidence",
  gratitude: "round hydrangea-like clusters of blue-white stars gathered together",
  affection: "fluffy peony nebula puffs embracing pockets of starlight",
  tenderness: "sweet-pea garlands of pastel light looping through the void",
  longing: "bleeding-heart star petals drifting away from a faint core",
  melancholy: "dark, twisted cosmic flowers exhaling faint greenish light",
  regret: "hyacinth-like spirals of light slowly losing their brilliance",
  frustration: "reedy streaks of starlight bending sharply in opposing directions",
  resentment: "dense chrysanthemum-shaped knots of hard, bristling light",
  irritation: "strange pitcher-shaped energy funnels trapping flickers of glow",
  shame: "hanging pods of shadowed starlight with hidden inner colour",
  uncertainty: "small daffodil-like light flares flickering on and off at the edge",
  insecurity: "clusters of violet-tinted sparks huddled near a brighter star",
  fear: "dark chantrieri-like bat flowers of shadow cutting off nearby light",
  worry: "marigold-coloured flickers pulsing irregularly around a dim star",
  stress: "crowded clouds of tiny chamomile-like light points buzzing together",
  tension: "tight rings of small, sharp star buds coiled in a halo",
  restlessness: "thin, poisonous-looking aconite star blooms twitching in place",
  anticipation: "daffodil bursts of yellow starlight poised to erupt",
  surprise: "ginger-like cosmic blooms exploding in unusual patterns of light",
  inspiration: "glowing mushrooms of bioluminescent nebula rising from dark rock",
  motivation: "large, luminous magnolia star-flowers unfolding toward a sun",
  determination: "camellia-like cosmic blooms with firm, bright, layered petals",
  discouragement: "petunia-shaped light pouches drooping and dimming",
  emptiness: "scattered pine-cone–like debris of old, collapsed stars",
  peacefulness: "dandelion star heads blowing tiny glints into the void",
  comfort: "soft, open asters of starlight cradling smaller sparks",
  warmth: "golden dandelion halo blooms radiating gentle cosmic heat",
  admiration: "honeysuckle trails of starlight curling lovingly around others",
  compassion: "jasmine-like white glows circling a weaker, fading star",
  sympathy: "white lily-shaped glows leaning toward a dim neighbour",
  isolation: "a single bluebell star-bloom hanging in a cavernous void",
  affirmation: "delicate halos of tiny baby’s-breath starlight surrounding a core",
  validation: "bold hibiscus-shaped bursts of light opening toward the viewer",
  confidence: "spiky bromeliad-like star blooms with sharp, radiant petals",
};


export const FLOWERS_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<string, FlowerLike>
> = {
  CLASSIC: FLOWERS_MATRIX as Record<string, FlowerLike>,

  UNDERWATER: FLOWERS_MATRIX_UNDERWATER,

    GALAXY: FLOWERS_MATRIX_GALAXY,
};

// ───────────────────────────────────────────────
// 3. Selector: from secondary_emotions → Flower[]
// ───────────────────────────────────────────────
export function selectFlowers(
  type: GardenType,
  secondaries: string[],
): FlowerLike[] {
  const matrix = FLOWERS_MATRIX_BY_TYPE[type] ?? FLOWERS_MATRIX_BY_TYPE.CLASSIC;

  return secondaries
    .map((s) => s.toLowerCase().trim())
    .map((key) => matrix[key] ?? FLOWERS_MATRIX_BY_TYPE.CLASSIC[key])
    .filter((f): f is FlowerLike => !!f);
}
