const WEATHERS = {
    //joy
    FLUFFY_CLOUDS: "fluffy clouds",
    CLEAR_SKY: "clear sky",
    SUNSHINE: "sunshine",
    RAINBOW: "rainbow",
    DOUBLE_RAINBOW: "double rainbow",
    //sadness
    VIRGA: "virga",
    LIGHT_FOG: "light fog",
    GLOOMY_FOG: "gloomy fog",
    DOWNPOUR: "downpour",
    FLOOD: "flood",
    //anxiety
    DISTANT_STORM: "distant storm",
    LOW_MIST: "gloomy creeping mist",
    GALE_WINDS: "gale winds",
    LIGHTING_STORM: "lightning storm",
    TORNADOES: "tornadoes",
    //anger
    HEAT_SHIMMER: "heat shimmer",
    DARK_SKIES: "dark skies",
    SANDSTORM: "sandstorms",
    HURRICANE: "hurricane",
    TSUNAMI: "tsunamis",
    //love
    WARM_GLOW: "warm glow sunshine",
    PINK_SUNSET: "pink sunset",
    STARRY_SKY: "starry sky",
    SHOOTING_STAR: "shooting star",
    FIRE_RAINBOW: "fire rainbow",
    //guilt
    SCATTERED_CLOUDS: "scattered clouds",
    OVERCAST: "overcast",
    LIGHT_MIST: "light mist",
    DENSE_FOG: "dense fog",
    BLOOD_MOON: "blood moon cover in mist",
    //hope
    BLUE_SKY: "blue skies",
    HAZE: "haze",
    SUN_SHOWER: "sun shower",
    SILVER_LINING: "silver lined clouds",
    RAY_OF_SUN: "Rays of sun bursting through the clouds",
    //Loneliness
    DRIZZLE: "drizzle",
    FROST: "frost",
    LONE_STAR: "night sky with a lone star",
    SNOWFALL: "snowfall",
    GLACIERS: "glaciers and icicles",
    //silliness
    SPIRAL_CLOUDS: "spiral clouds",
    CANDY_CLOUDS: "candy floss clouds",
    PINK_CLOUDS: "pink clouds",
    SPARKLY_CLOUDS: "sparkly clouds",
    ELEPHANT_CLOUDS: "elephant shaped clouds",
    //disappointment
    //same as sadness
    //excitement
    LENTICULAR_CLOUDS: "lenticular clouds",
    EARTHQUAKE_LIGHTS: "earthquake lights",
    LIGHT_PILLARS: "light pillars",
    AURORA: "aurora",
    METEOR_SHOWER: "meteor shower",
    // Jealousy
    MURKY: "murky skies",
    GREEN_LIGHTNING: "green lightning",
    HAIL: "hail",
    HEATWAVE: "heat wave",
    GREEN_SKIES: "green angry skies",
    //borededom
    STRATUS: "stratus clouds",
    GREY: "grey skies",
    GLOOM: "dusky gloom",
    WHITE: "blank white sky",
    BLACK: "black night sky, no clouds, stars or moon",
};
const WEATHER_MATRIX = {
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
    overwhelm: {
        1: WEATHERS.VIRGA,
        2: WEATHERS.LIGHT_FOG,
        3: WEATHERS.GLOOMY_FOG,
        4: WEATHERS.DOWNPOUR,
        5: WEATHERS.FLOOD,
    },
    boredom: {
        1: WEATHERS.STRATUS,
        2: WEATHERS.GREY,
        3: WEATHERS.GLOOM,
        4: WEATHERS.WHITE,
        5: WEATHERS.BLACK,
    },
};
// ─── Selector ─────────────────────────────────────────────────────────────
export function selectWeather(primary, intensity) {
    const p = primary.toLowerCase().trim();
    const i = (Math.min(5, Math.max(1, Math.round(intensity))) || 3);
    return WEATHER_MATRIX[p]?.[i] ?? WEATHERS.CLEAR_SKY;
}
