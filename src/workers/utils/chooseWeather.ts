import { type PrimaryEmotion, Intensity } from "./mood.types.js";

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



type Weather = (typeof WEATHERS)[keyof typeof WEATHERS];

const WEATHER_MATRIX: Record<PrimaryEmotion, Record<Intensity, Weather>> = {
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

// ─── Selector ─────────────────────────────────────────────────────────────
export function selectWeather(primary: string, intensity: number): Weather {
    const p = primary.toLowerCase().trim() as PrimaryEmotion;
    const i = (Math.min(5, Math.max(1, Math.round(intensity))) || 3) as Intensity;
    return WEATHER_MATRIX[p]?.[i] ?? WEATHERS.CLEAR_SKY;
}
