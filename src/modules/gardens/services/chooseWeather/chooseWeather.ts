import { type PrimaryEmotion, NormalisedIntensity } from "../../mood.types.js";
import { type GardenType } from "@prisma/client";
import { COSMIC_AMBIENCE } from "./cosmicAmbience.js";

const WEATHERS = {
    // joy
    FLUFFY_CLOUDS: "fluffy clouds",
    CLEAR_SKY: "clear sky",
    SUNSHINE: "sunshine",
    RAINBOW: "rainbow",
    DOUBLE_RAINBOW: "double rainbow",

    // sadness
    VIRGA: "virga",
    LIGHT_FOG: "light fog",
    GLOOMY_FOG: "gloomy fog",
    DOWNPOUR: "downpour",
    FLOOD: "flood",

    // anxiety
    DISTANT_STORM: "distant storm",
    LOW_MIST: "gloomy creeping mist",
    GALE_WINDS: "gale winds",
    LIGHTING_STORM: "lightning storm",
    TORNADOES: "tornadoes",

    // anger
    HEAT_SHIMMER: "heat shimmer",
    DARK_SKIES: "dark skies",
    SANDSTORM: "sandstorms",
    HURRICANE: "hurricane",
    TSUNAMI: "tsunamis",

    // love
    WARM_GLOW: "warm glow sunshine",
    PINK_SUNSET: "pink sunset",
    STARRY_SKY: "a glowing blue sky dotted with hundreds of clear, twinkling stars",
    SHOOTING_STAR: "shooting star",
    FIRE_RAINBOW: "fire rainbow",

    // guilt
    SCATTERED_CLOUDS: "scattered clouds",
    OVERCAST: "overcast",
    LIGHT_MIST: "light mist",
    DENSE_FOG: "dense fog",
    BLOOD_MOON: "blood moon cover in mist",

    // hope
    BLUE_SKY: "blue skies",
    HAZE: "haze",
    SUN_SHOWER: "sun shower",
    SILVER_LINING: "silver lined clouds",
    RAY_OF_SUN: "rays of sun bursting through the clouds",

    // loneliness
    DRIZZLE: "drizzle",
    FROST: "frost",
    LONE_STAR: "night sky with a lone star",
    SNOWFALL: "snowfall",
    GLACIERS: "glaciers and icicles",

    // silliness
    SPIRAL_CLOUDS: "spiral clouds",
    CANDY_CLOUDS: "candy floss clouds",
    PINK_CLOUDS: "pink clouds",
    ELEPHANT_CLOUDS: "elephant shaped clouds",

    // excitement / awe extras
    LENTICULAR_CLOUDS: "lenticular clouds",
    EARTHQUAKE_LIGHTS: "earthquake lights",
    LIGHT_PILLARS: "light pillars",
    AURORA: "aurora",
    METEOR_SHOWER: "meteor shower",

    // jealousy
    MURKY: "murky skies",
    GREEN_LIGHTNING: "green lightning",
    HAIL: "hail",
    HEATWAVE: "heat wave",
    GREEN_SKIES: "green angry skies",

    // boredom
    STRATUS: "stratus clouds",
    GREY: "grey skies",
    GLOOM: "dusky gloom",
    WHITE: "blank white sky",
    BLACK: "black night sky, no clouds, stars or moon",

    // NEW: serenity
    CALM_BLUE: "calm pale blue sky",
    GENTLE_BREEZE: "gentle breeze with soft clouds",
    GOLDEN_HOUR: "soft golden hour light",
    TRANQUIL_TWILIGHT: "tranquil blue-purple twilight",
    SERENE_NIGHT: "quiet clear night sky with soft stars",

    // NEW: creativity
    PATCHWORK_CLOUDS: "patchwork clouds drifting across the sky",
    SPARKLY_CLOUDS: "clouds shimmering, sparkling like tiny lightbulbs",
    PAINTED_SKY: "painted multi-colored evening sky",
    COLOR_STREAKS: "color-streaked sky",
    SUNRAY_FANS: "fan of sunrays breaking through clouds",

    // NEW: lust
    HUMID_HAZE: "warm humid evening haze",
    CRIMSON_SUNSET: "deep crimson sunset",
    VELVET_NIGHT: "velvet night sky with a glowing horizon",

    // NEW: resilience
    PASSING_SHOWERS: "passing showers with glimpses of sun",
    CLEARING_STORM: "storm clouds parting to reveal clear sky",

    // NEW: curiosity
    WANDERING_CLOUDS: "small wandering clouds across a wide sky",
    ODDLY_SHAPED_CLOUDS: "pareidolia clouds, not quite discernible",
    SHAFTS_OF_LIGHT: "shafts of light through cloud gaps",
    DAPPLED_LIGHT: "dappled light filtering through thin clouds",

    // NEW: confusion
    SWIRLING_MIST: "swirling patchy mist",
    PATCHY_FOG: "patchy fog with shifting gaps",
    CHAOTIC_CLOUDS: "chaotic swirling clouds overhead",
    SWIRLING_STORM: "a strange swirling storm approaches",

    // NEW: embarrassment
    BLUSH_SKY: "pale pink-tinted sky behind thin clouds",
    DRIFTING_VEIL: "thin veils of cloud drifting across the sun",

    //NEW: contempative
    DISTANT_PLANET: "a dark blue sky with a light mist, a distant planet glows bright blue",
    
    PURPLE_LIGHTNING: "a tropical storm with intense flashes of purple lightning",
    SHAFTS_OF_TWINKLING_LIGHT: "shafts of sparkling, twinkling light through cloud gaps",
} as const;



type Weather = string;

const WEATHER_MATRIX: Record<PrimaryEmotion, Record<NormalisedIntensity, Weather>> = {
    joy: {
        1: WEATHERS.FLUFFY_CLOUDS,
        2: WEATHERS.CLEAR_SKY,
        3: WEATHERS.SUNSHINE,
        4: WEATHERS.RAINBOW,
        5: WEATHERS.DOUBLE_RAINBOW,
    },

    sadness: {
        1: WEATHERS.VIRGA,
        2: WEATHERS.LIGHT_FOG,
        3: WEATHERS.GLOOMY_FOG,
        4: WEATHERS.DOWNPOUR,
        5: WEATHERS.FLOOD,
    },

    anxiety: {
        1: WEATHERS.DISTANT_STORM,
        2: WEATHERS.LOW_MIST,
        3: WEATHERS.GALE_WINDS,
        4: WEATHERS.LIGHTING_STORM,
        5: WEATHERS.TORNADOES,
    },

    anger: {
        1: WEATHERS.HEAT_SHIMMER,
        2: WEATHERS.DARK_SKIES,
        3: WEATHERS.SANDSTORM,
        4: WEATHERS.HURRICANE,
        5: WEATHERS.TSUNAMI,
    },

    love: {
        1: WEATHERS.WARM_GLOW,
        2: WEATHERS.PINK_SUNSET,
        3: WEATHERS.STARRY_SKY,
        4: WEATHERS.SHOOTING_STAR,
        5: WEATHERS.FIRE_RAINBOW,
    },

    guilt: {
        1: WEATHERS.SCATTERED_CLOUDS,
        2: WEATHERS.OVERCAST,
        3: WEATHERS.LIGHT_MIST,
        4: WEATHERS.DENSE_FOG,
        5: WEATHERS.BLOOD_MOON,
    },

    hope: {
        1: WEATHERS.BLUE_SKY,
        2: WEATHERS.HAZE,
        3: WEATHERS.SUN_SHOWER,
        4: WEATHERS.SILVER_LINING,
        5: WEATHERS.RAY_OF_SUN,
    },

    loneliness: {
        1: WEATHERS.DRIZZLE,
        2: WEATHERS.FROST,
        3: WEATHERS.LONE_STAR,
        4: WEATHERS.SNOWFALL,
        5: WEATHERS.GLACIERS,
    },

    silliness: {
        1: WEATHERS.SPIRAL_CLOUDS,
        2: WEATHERS.CANDY_CLOUDS,
        3: WEATHERS.PINK_CLOUDS,
        4: WEATHERS.SPARKLY_CLOUDS,
        5: WEATHERS.ELEPHANT_CLOUDS,
    },

    disappointment: {
        1: WEATHERS.VIRGA,
        2: WEATHERS.LIGHT_FOG,
        3: WEATHERS.GLOOMY_FOG,
        4: WEATHERS.DOWNPOUR,
        5: WEATHERS.FLOOD,
    },

    excitement: {
        1: WEATHERS.SCATTERED_CLOUDS,
        2: WEATHERS.SUN_SHOWER,
        3: WEATHERS.SUNSHINE,
        4: WEATHERS.STARRY_SKY,
        5: WEATHERS.AURORA,
    },

    jealousy: {
        1: WEATHERS.MURKY,
        2: WEATHERS.GREEN_LIGHTNING,
        3: WEATHERS.HAIL,
        4: WEATHERS.HEATWAVE,
        5: WEATHERS.GREEN_SKIES,
    },

    boredom: {
        1: WEATHERS.STRATUS,
        2: WEATHERS.GREY,
        3: WEATHERS.GLOOM,
        4: WEATHERS.WHITE,
        5: WEATHERS.BLACK,
    },

    // NEW: serenity
    serenity: {
        1: WEATHERS.CALM_BLUE,
        2: WEATHERS.GENTLE_BREEZE,
        3: WEATHERS.GOLDEN_HOUR,
        4: WEATHERS.TRANQUIL_TWILIGHT,
        5: WEATHERS.SERENE_NIGHT,
    },

    // NEW: creativity
    creativity: {
        1: WEATHERS.PATCHWORK_CLOUDS,
        2: WEATHERS.SPARKLY_CLOUDS,
        3: WEATHERS.PAINTED_SKY,
        4: WEATHERS.SUNRAY_FANS,
        5: WEATHERS.AURORA,
    },

    // NEW: lust
    lust: {
        1: WEATHERS.HUMID_HAZE,
        2: WEATHERS.CRIMSON_SUNSET,
        3: WEATHERS.HEATWAVE,
        4: WEATHERS.PURPLE_LIGHTNING,
        5: WEATHERS.VELVET_NIGHT,
    },

    // NEW: resilience
    resilience: {
        1: WEATHERS.DRIZZLE,
        2: WEATHERS.PASSING_SHOWERS,
        3: WEATHERS.CLEARING_STORM,
        4: WEATHERS.SILVER_LINING,
        5: WEATHERS.RAY_OF_SUN,
    },

    // NEW: curiosity
    curiosity: {
        1: WEATHERS.WANDERING_CLOUDS,
        2: WEATHERS.ODDLY_SHAPED_CLOUDS,
        3: WEATHERS.SHAFTS_OF_TWINKLING_LIGHT,
        4: WEATHERS.DAPPLED_LIGHT,
        5: WEATHERS.LENTICULAR_CLOUDS,
    },

    // NEW: awe
    awe: {
        1: WEATHERS.LENTICULAR_CLOUDS,
        2: WEATHERS.LIGHT_PILLARS,
        3: WEATHERS.AURORA,
        4: WEATHERS.EARTHQUAKE_LIGHTS,
        5: WEATHERS.METEOR_SHOWER,
    },

    // NEW: contemplative
    contemplative: {
        1: WEATHERS.LIGHT_MIST,
        2: WEATHERS.HAZE,
        3: WEATHERS.STARRY_SKY,
        4: WEATHERS.LONE_STAR,
        5: WEATHERS.DISTANT_PLANET,
    },

    // NEW: confusion
    confusion: {
        1: WEATHERS.SWIRLING_MIST,
        2: WEATHERS.PATCHY_FOG,
        3: WEATHERS.HAZE,
        4: WEATHERS.CHAOTIC_CLOUDS,
        5: WEATHERS.SWIRLING_STORM,
    },

    // NEW: embarrassment
    embarrassment: {
        1: WEATHERS.BLUSH_SKY,
        2: WEATHERS.DRIFTING_VEIL,
        3: WEATHERS.HAZE,
        4: WEATHERS.LIGHT_FOG,
        5: WEATHERS.GLOOMY_FOG,
    },
};


const UNDERWATER_WEATHER_MATRIX:  Record<PrimaryEmotion, Record<NormalisedIntensity, Weather>> = {
  // POSITIVE
  joy: {
    1: "soft surface ripples with gentle sunbeams",
    2: "bright dancing light patterns on the seafloor",
    3: "sparkling bubbles rising through clear blue water",
    4: "shimmering fish flashes like underwater confetti",
    5: "burst of glittering caustics and swirling bubbles everywhere",
  },

  love: {
    1: "warm golden light pooling in a sheltered cove",
    2: "rosy-tinted sunbeams filtering through calm water",
    3: "soft blue glow with drifting heart-shaped bubbles",
    4: "hazy pink bioluminescent shimmer around the water",
    5: "intense bioluminescent glow painting everything in deep crimson and gold",
  },

  hope: {
    1: "pale blue water with a single bright shaft of light",
    2: "hazy water with several sunbeams reaching downward",
    3: "soft upward current carrying sparkles of silt toward the surface",
    4: "glowing patch of water hinting at sunlight just above",
    5: "brilliant opening of light breaking through the water overhead",
  },

  excitement: {
    1: "quick flashes of light as small fish dart by",
    2: "restless surface ripples sending flickering light below",
    3: "busy swirl of bubbles and darting forms in the water",
    4: "strong playful current tossing strands of seaweed around",
    5: "wild vortex of bubbles, fish and dancing light everywhere",
  },

  serenity: {
    1: "still clear water with faint drifting particles",
    2: "slow sunbeams slanting through quiet blue depths",
    3: "gentle underwater haze with soft, even light",
    4: "deep calm water with slow-moving shafts of turquoise light",
    5: "vast, silent blue expanse with perfectly still light",
  },

  creativity: {
    1: "patchy light creating playful patterns on sand",
    2: "soft overlapping beams painting shapes on the reef",
    3: "multi-colored bioluminescent specks drifting like confetti",
    4: "swirling ribbons of colored light under the surface",
    5: "kaleidoscope of shifting bioluminescent patterns in the water",
  },

  lust: {
    1: "humid-feeling warm water with a soft amber glow",
    2: "deep red-tinted light filtering through hazy water",
    3: "velvet-dark water lit by slow, pulsing bioluminescent glows",
    4: "intense magenta and violet light shimmering through the depths",
    5: "sultry, enveloping red-violet glow swirling around everything",
  },

  resilience: {
    1: "steady, cool current brushing past resilient seagrass",
    2: "occasional stronger surges rocking but not breaking the plants",
    3: "choppy water with persistent light still reaching below",
    4: "rough, swirling currents that gradually settle",
    5: "once-violent water now clearing, sunlight punching through cloudy depths",
  },

  silliness: {
    1: "bobbing bubbles drifting in funny wobbling paths",
    2: "clownish fish kicking up whimsical sparkles of sand",
    3: "little jets of bubbles popping around like underwater giggles",
    4: "chaotic fountain of bubbles spiraling upward",
    5: "zany storm of spinning bubbles and cartoonish fish swoops",
  },

  // NEUTRAL
  curiosity: {
    1: "soft, patchy light revealing just glimpses of the seafloor",
    2: "moving sunbeams revealing and hiding shapes in the haze",
    3: "slow swirling silt clouds obscuring and revealing details",
    4: "mysterious blue-green glow from an unclear source",
    5: "dense shifting halo of light and shadow that suggests hidden depths",
  },

  awe: {
    1: "broad, gentle sunbeams fanning out through deep water",
    2: "towering columns of light plunging into blue darkness",
    3: "curtain of shimmering light dust falling through the sea",
    4: "vast cathedral-like shafts of light reaching from surface to abyss",
    5: "overwhelming wall of luminous blue, as if the sea itself is glowing",
  },

  contemplative: {
    1: "dim, even blue light like a quiet underwater room",
    2: "softly swirling particles in a muted teal glow",
    3: "slow, rhythmic brightening and fading as ripples cross the light",
    4: "deep soft twilight blue with a single lingering sunbeam",
    5: "hushed dark blue-green water with the faintest distant glimmer",
  },

  // NEGATIVE
  confusion: {
    1: "patches of murky water and clear pockets swirling together",
    2: "shifting veils of silt that constantly change shape",
    3: "chaotic streaks of light cutting through cloudy water",
    4: "tangled patterns of current and sediment, hard to see through",
    5: "churning, clouded water where light and darkness mix unpredictably",
  },

  boredom: {
    1: "flat, even underwater haze with little movement",
    2: "uniform grey-blue water, dull and unchanging",
    3: "featureless murky light with no distinct beams",
    4: "thick, lifeless cloud of suspended particles",
    5: "nearly opaque, monotonous greenish gloom with no variation",
  },

  embarrassment: {
    1: "faint blush of pinkish light hidden behind murky water",
    2: "thin veils of silt drifting in front of brighter water",
    3: "soft cloudy haze that half-obscures everything",
    4: "layered curtains of murk that keep the scene partly hidden",
    5: "dense overlapping veils of clouded water that conceal most details",
  },

  sadness: {
    1: "pale grey-blue water with slow-falling silt",
    2: "dim, slightly murky water with faded light",
    3: "thick blue-grey gloom with few rays reaching down",
    4: "heavy, darkened water with languid drifting debris",
    5: "deep, almost lightless blue murk pressing from all sides",
  },

  anxiety: {
    1: "narrow band of light above a looming darker depth",
    2: "low drifting fog of silt along a drop-off edge",
    3: "strong, unpredictable currents tugging at everything",
    4: "swirling, opaque sediment clouds hiding what lies ahead",
    5: "dark, roiling water dropping away into unseen abyss",
  },

  anger: {
    1: "shimmering hot-looking water with harsh, sharp beams",
    2: "dark red-tinged water with aggressive light streaks",
    3: "sand and gravel whipped up in abrasive clouds",
    4: "violent churning surge pounding the seafloor",
    5: "furious underwater storm, water tearing past in raging torrents",
  },

  guilt: {
    1: "thin layer of silt drifting over a quiet scene",
    2: "heavy, low-hanging murk that dims the water",
    3: "slowly thickening cloud of grey sediment",
    4: "dense, clinging gloom that seems to cling to everything",
    5: "oppressive underwater darkness with faint, accusing glints in the distance",
  },

  loneliness: {
    1: "soft quiet blue with a single distant glimmer of light",
    2: "cold, slightly dim water with far-off sparkles above",
    3: "sparse beams of light in a wide empty blue",
    4: "faint distant flicker of light in a large dark space",
    5: "vast dark water with only one tiny source of light far away",
  },

  disappointment: {
    1: "thin, half-hearted light through slightly cloudy water",
    2: "flat grey-green haze instead of clear blue",
    3: "murky water where sunbeams barely penetrate",
    4: "once-clear water now clouded and dull",
    5: "thick, lifeless underwater gloom where light has almost given up",
  },

  jealousy: {
    1: "dull greenish water under brighter blue seen in the distance",
    2: "murky patch of water beside a clearer shaft of light",
    3: "clouded green gloom while brighter beams fall elsewhere",
    4: "turbid, swirling green water watching clear light on the other side",
    5: "dark, envious green-black water around a faraway bright opening",
  },
};

export const WEATHER_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<PrimaryEmotion, Record<NormalisedIntensity, Weather>>
> = {
  CLASSIC: WEATHER_MATRIX,
  UNDERWATER: UNDERWATER_WEATHER_MATRIX
  ,
  GALAXY: COSMIC_AMBIENCE,
};



export function selectWeather(
  type: GardenType,
  primary: string,
  intensity: number,
): Weather {
  const p = primary.toLowerCase().trim() as PrimaryEmotion;
  const i = (Math.min(5, Math.max(1, Math.round(intensity))) || 3) as NormalisedIntensity;

  const matrixForType = WEATHER_MATRIX_BY_TYPE[type] ?? WEATHER_MATRIX_BY_TYPE.CLASSIC;
  return matrixForType[p]?.[i] ?? WEATHERS.CLEAR_SKY;
}
