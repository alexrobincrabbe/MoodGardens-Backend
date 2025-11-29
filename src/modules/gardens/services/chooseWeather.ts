import { type PrimaryEmotion, NormalisedIntensity } from "../mood.types.js";
import { type GardenType } from "@prisma/client";

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

const GALAXY_WEATHER_MATRIX:  Record<PrimaryEmotion, Record<NormalisedIntensity, Weather>> = {
    // POSITIVE
  joy: {
    1: "soft starlight dusting a calm cosmic sky",
    2: "bright starfield with playful twinkling points of light",
    3: "warm golden glow from a nearby star bathing the scene",
    4: "vivid bands of colored nebula streaming overhead",
    5: "explosive spray of cosmic light like a galactic firework",
  },

  love: {
    1: "gentle rose-tinted starlight on a quiet orbital night",
    2: "soft pink nebula glow wrapping the scene in warmth",
    3: "paired stars casting overlapping halos across the sky",
    4: "meteor trails crossing like intertwined silver threads",
    5: "intense crimson and violet nebula embrace filling the heavens",
  },

  hope: {
    1: "small pale star breaking through a dull cosmic haze",
    2: "thin beam of starlight pointing toward a distant galaxy",
    3: "growing pale-gold halo around a rising star",
    4: "broad ray of light cutting through deep cosmic darkness",
    5: "radiant burst of starlight tearing open the night like a promise",
  },

  excitement: {
    1: "occasional bright meteors streaking across a starfield",
    2: "frequent shooting stars racing across the sky",
    3: "busy meteor shower criss-crossing above the garden",
    4: "flurries of comets and glowing debris zipping past",
    5: "wild meteor storm and flashing cosmic arcs everywhere",
  },

  serenity: {
    1: "still black velvet sky with soft scattered stars",
    2: "calm indigo firmament with slow gentle twinkling",
    3: "quiet blue-purple nebula faintly glowing in the distance",
    4: "wide tranquil arc of distant galaxies suspended in silence",
    5: "deep endless starfield that feels timeless and perfectly still",
  },

  creativity: {
    1: "patchwork of differently colored stars scattered playfully",
    2: "thin ribbons of nebula paint streaking across the sky",
    3: "kaleidoscopic dust clouds in unusual shapes",
    4: "spiraling streams of starlight drawing whimsical patterns",
    5: "riot of swirling multi-colored nebulae and light trails",
  },

  lust: {
    1: "warm crimson glow lingering on the cosmic horizon",
    2: "deep red sunset-like nebula spreading behind the stars",
    3: "velvet-dark night lit by sensual magenta and violet clouds",
    4: "slow pulsing of red-gold solar flares tinting the sky",
    5: "overwhelming crimson-violet cosmic blaze flooding the scene",
  },

  resilience: {
    1: "steady starshine persisting through thin drifting dust",
    2: "starlight breaking through a passing cosmic cloud",
    3: "strong, unwavering glow amid weak solar winds",
    4: "storm of charged particles gradually clearing to bright clarity",
    5: "clear, resolute starlight shining where a cosmic storm once raged",
  },

  silliness: {
    1: "few stars twinkling in odd, playful patterns",
    2: "cartoonishly bright stars blinking on and off",
    3: "comet tails looping in silly, unnecessary spirals",
    4: "bubbles of starlight bobbing around like cosmic balloons",
    5: "chaotic swirl of neon-colored cosmic lights behaving like a party",
  },

  // NEUTRAL
  curiosity: {
    1: "thin mist of cosmic dust half-hiding distant stars",
    2: "patchy nebula clouds revealing mysterious gaps of space",
    3: "probing shafts of cosmic light cutting into darker regions",
    4: "shifting band of faint aurora-like glow across the void",
    5: "restless, swirling cosmic haze hinting at unknown structures beyond",
  },

  awe: {
    1: "clear view of a distant spiral galaxy hanging in the sky",
    2: "tall arc of the Milky Way sweeping overhead",
    3: "huge glowing nebula wall filling the horizon",
    4: "colossal tapestry of stars, nebulae and galaxies braided together",
    5: "overwhelming cosmic panorama of galaxies and radiant clouds in every direction",
  },

  contemplative: {
    1: "simple dark-blue space with sparse stars and gentle glow",
    2: "soft cosmic haze through which few stars gently shine",
    3: "steady, unhurried twinkling of distant constellations",
    4: "slowly drifting band of faint light across deep space",
    5: "profoundly still blackness with rare, quiet, distant points of light",
  },

  // NEGATIVE
  confusion: {
    1: "swirling cosmic mist partly obscuring constellations",
    2: "patchy, flickering starfield where patterns refuse to settle",
    3: "chaotic arcs of light bending in impossible directions",
    4: "distorted, wavy nebula patterns like warped reflections",
    5: "intense, tangled storm of warped light and shadow twisting through the void",
  },

  boredom: {
    1: "flat dark-grey sky with a few dull stars",
    2: "uniform, washed-out starfield lacking contrast",
    3: "featureless cosmic haze with no clear shapes",
    4: "monotone grey-black sky, hardly any visible stars",
    5: "dead black void with almost no visible light at all",
  },

  embarrassment: {
    1: "pale pink blush of light behind thin cosmic veil",
    2: "gentle semi-transparent clouds sliding in front of brighter stars",
    3: "patchy, faint nebula that seems to hide the sky",
    4: "layered sheets of translucent cosmic mist concealing constellations",
    5: "thick veils of dusty clouds covering much of the starfield",
  },

  sadness: {
    1: "subdued navy-blue sky with dim stars",
    2: "thin dreary haze over once-bright constellations",
    3: "heavy, dark cosmic clouds swallowing starlight",
    4: "sorrowful deep indigo sky where stars are fading out",
    5: "vast, nearly starless void pressing with quiet weight",
  },

  anxiety: {
    1: "narrow band of light above a looming dark region",
    2: "uneasy flicker of distant lightning-like cosmic discharges",
    3: "restless streaks of charged particles racing across the sky",
    4: "wild, jagged arcs of cosmic lightning lashing through the void",
    5: "ferocious radiation storm ripping across the starfield",
  },

  anger: {
    1: "harsh red star glaring through thin dust",
    2: "dark red-brown cosmic clouds smoldering with inner heat",
    3: "sandstorm-like stream of cosmic grit scouring space",
    4: "roaring solar flare storm slashing across the scene",
    5: "cataclysmic cosmic tempest tearing space with violent light",
  },

  guilt: {
    1: "thin layer of dark dust dimming the stars",
    2: "ashen cloud band smearing the sky with grey",
    3: "slowly thickening cloud that muffles starlight",
    4: "heavy dark nebula blotting out whole sections of the sky",
    5: "ominous black cloud complex swallowing almost every star",
  },

  loneliness: {
    1: "large empty patch of space with one bright star",
    2: "dim sky with a single clearly visible planet glinting alone",
    3: "huge stretch of darkness with just a small scattering of stars",
    4: "one bright distant galaxy suspended in a wide black void",
    5: "immense, empty darkness broken only by one tiny, far-off point of light",
  },

  disappointment: {
    1: "thin, unimpressive star haze where a nebula should appear",
    2: "weak milky smudge of light instead of a bright galaxy",
    3: "washed-out nebula colors barely visible",
    4: "once-vivid star clouds now dull and faded",
    5: "grey, lifeless cosmic smear where brilliance was expected",
  },

  jealousy: {
    1: "murky patch of space beside a brighter starfield",
    2: "faint greenish nebula overshadowed by a vivid neighbor",
    3: "sour green glow beneath a blazing, distant star cluster",
    4: "angry green lightning skimming a darker side of a nebula",
    5: "brooding green-black sky watching a radiant galaxy just out of reach",
  },
}

export const WEATHER_MATRIX_BY_TYPE: Record<
  GardenType,
  Record<PrimaryEmotion, Record<NormalisedIntensity, Weather>>
> = {
  CLASSIC: WEATHER_MATRIX,
  UNDERWATER: UNDERWATER_WEATHER_MATRIX
  ,
  GALAXY: GALAXY_WEATHER_MATRIX,
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
