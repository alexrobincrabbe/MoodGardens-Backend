import { type PrimaryEmotion, NormalisedIntensity } from "../../mood.types.js";


export const UNDERWATER_WEATHER:  Record<PrimaryEmotion, Record<NormalisedIntensity, string>> = {
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