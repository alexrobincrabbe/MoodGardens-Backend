import { type PrimaryEmotion } from "../mood.types.js";

type IntensityBand = "low" | "medium" | "high";

// make pick work with readonly arrays
function pick<T>(arr: readonly T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const DEFAULT_FALLBACK: readonly string[] = [
  "flower meadow with path",
  "still pond with stepping stones",
  "walled herb garden",
];

export type GardenType = "CLASSIC" | "UNDERWATER" | "GALAXY";

type ArchetypeBands = Record<IntensityBand, readonly string[]>;
type ArchetypeByEmotion = Record<PrimaryEmotion, ArchetypeBands>;

export const ARCHETYPE_MATRIX: Record<GardenType, ArchetypeByEmotion> = {
      CLASSIC: {
  // ─────────────────────────────
  // POSITIVE EMOTIONS
  // ─────────────────────────────
  joy: {
    low:    ["light-dappled cottage garden, open wooden gate", "wildflower prairie meadow with mowed path", "traditional well tended lawn and flowerbed garden"],
    medium: ["tropical garden scene", "quaint English garden", "orchard with wooden bridge"],
    high:   ["paradise garden", "golden-lit Mediterranean garden", "formal garden"],
  },

  love: {
    low:    ["courtyard garden", "hidden arbor with swirling vines with flowers", "lantern lit beach garden"],
    medium: ["glowing romantic Japanese garden", "balcony garden with soft arches and fairylights", "ornate succulents garden with dragonflies"],
    high:   ["vertical flower walls, intimate courtyard with heart shaped gate", "lantern lit garden with pond of flowering lily pads", "pergola garden with cascading flowers and fireflies"],
  },

  hope: {
    low:    ["seedling terrace", "candle-lit straight stone garden path with lanterns in the distance", "minimalist spring courtyard garden with open gate"],
    medium: ["sky view over a lake garden", "mosaic path with multiple directions", "abundant potager garden"],
    high:   ["illuminated circular garden with statues and wishing pond", "fruiting grapevine", "mandala garden"],
  },

  excitement: {
    low:    ["balls of light, blooming garden", "coastal garden", "Persian garden"],
    medium: ["lantern festival garden", "colourful hillside terraces", "spring carnival garden"],
    high:   ["firework meadow garden", "blossom swirls garden", "floating celebration garden"],
  },

  serenity: {
    low:    ["meditative bamboo courtyard", "soft-moss garden with garden ornaments", "minimalist wildflower path garden"],
    medium: ["zen sand garden", "open-lake terrace with lantern-lit jetty", "calm fountain retreat with stone bridge"],
    high:   ["still-water sanctuary garden with big wide open gates", "sacred serenity garden", "vast open zen expanse garden"],
  },

  creativity: {
    low:    ["asymmetric sketch-garden", "cobbled courtyard garden with well", "garden of scattered shapes"],
    medium: ["spiral terraced garden", "topiary garden", "pattern-woven hillside garden"],
    high:   ["abstract sculpture garden with bridges and open gates", "surreal multi-layered terrace with colourful winding paths", "tunnel garden with bright open end"],
  },

  lust: {
    low:    ["cosy love nest garden", "velvet petal courtyard", "hidden archway retreat"],
    medium: ["twilight-moon garden with moss lawn", "secluded beach", "waterfall garden terraces"],
    high:   ["garden of fertility with butterflies", "fireflies and fire pit garden", "velvet-shadow enclave garden"],
  },

  resilience: {
    low:    ["weathered stone courtyard", "herb terrace garden", "steady hillside garden"],
    medium: ["windswept plateau garden", "endurance garden", "fortified ridge path garden"],
    high:   ["mountain rise garden", "unyielding cliff garden with bridge", "woodland garden with wooden walkway"],
  },

  silliness: {
    low:    ["roundabout garden", "playful topiary park", "mushroom ring garden"],
    medium: ["tiny whimsical gnome garden", "mini hedge maze with coloured glowing balls on stems", "balloon bush meadow"],
    high:   ["upside down garden", "candy-land garden", "bubble greenhouse garden"],
  },

  // ─────────────────────────────
  // NEUTRAL EMOTIONS
  // ─────────────────────────────
  curiosity: {
    low:    ["archway of hidden paths with unreadable signs", "peek-through hedge corners", "garden with butterfly house"],
    medium: ["beehive garden", "puzzle terrace garden", "charbagh garden"],
    high:   ["pretty garden labyrinth", "shifting passage garden", "concept garden"],
  },

  awe: {
    low:    ["wide-open horizon garden", "grand cliff outlook garden", "tall-arch viewpoint garden"],
    medium: ["monument terrace garden", "hanging garden", "vaulted arboretum"],
    high:   ["vast celestial garden", "colossal pillar garden", "great expanse sky terrace"],
  },

  contemplative: {
    low:    ["quiet bench garden", "reflected-stone courtyard", "shaded thinking nook"],
    medium: ["monastic garden walk", "philosopher’s terrace", "still-water reflection court"],
    high:   ["ancient cloister garden", "water garden with flower bridge", "infinite reflection garden"],
  },

  // ─────────────────────────────
  // NEGATIVE EMOTIONS
  // ─────────────────────────────
  confusion: {
    low:    ["forking path garden", "twist-lane courtyard", "crooked hedge walk"],
    medium: ["misaligned terrace garden", "mirror mismatch courtyard", "impossible staircase garden"],
    high:   ["fragmented garden maze", "disjointed reality terrace", "shifted geometry garden"],
  },

  boredom: {
    low:    ["flat lawn garden", "plain basic garden", "still, empty pond courtyard"],
    medium: ["monotone garden ", "symmetrical contemporary garden", "empty terrace garden with broken pots"],
    high:   ["endless tiled garden", "geometric concrete courtyard", "drab urban park garden"],
  },

  embarrassment: {
    low:    ["shy corner garden", "small hidden alcove", "soft-shade courtyard"],
    medium: ["narrow passage garden", "curtain-draped walkway", "folded-lattice enclave"],
    high:   ["maze of veils garden", "corridor of retreat", "curved-wall concealment garden"],
  },

  sadness: {
    low:    ["cypress walk", "weeping corner garden", "misty lakeside garden"],
    medium: ["cloistered courtyard", "shaded fern ravine", "sparse clearing"],
    high:   ["weed and rock garden", "muddy marsh garden with overgrown path", "overgrown ruins garden"],
  },

  anxiety: {
    low:    ["ridge garden", "pine terrace", "narrow cliffside path garden"],
    medium: ["tangled vine garden", "walled garden with broken gate", "thorn hedges garden"],
    high:   ["labyrinth hedge garden", "fractured rock garden", "suspended bridge canyon garden"],
  },

  anger: {
    low:    ["jagged rock garden with partly closed gate", "wild overgrowth grove", "smoldering earth patch"],
    medium: ["crimson ravine", "charcoal ridge garden", "thorn briar garden with closed iron gate"],
    high:   ["volcanic ridge garden", "firegrass expanse", "burnt stone plateau"],
  },

  guilt: {
    low:    ["shadowed courtyard", "ivy-overgrown gate", "stern statue garden"],
    medium: ["abandoned chapel garden", "ruins cracked path", "withered terrace"],
    high:   ["cracked mirror garden", "half-burned orchard", "labyrinth of remorse garden"],
  },

  loneliness: {
    low:    ["solitary pine hill garden", "empty bench garden", "empty pond garden"],
    medium: ["abandoned greenhouse", "single-tree plain", "dying lawn back yard"],
    high:   ["desert garden", "bare patio garden", "dry dead lawn garden"],
  },

  disappointment: {
    low:    ["wilted garden", "broken fountain garden", "dry pond garden"],
    medium: ["broken overgrown weeds swing-set garden", "cracked marble path", "chopped trees"],
    high:   ["crumbling terraces", "fallen leaves garden with overgrown path that abruptly ends", "broken gate garden"],
  },

  jealousy: {
    low:    ["shadowed twin garden", "mirrored murky green pond garden", "creeping dried leaves wall garden"],
    medium: ["thorn hedges with winding paths", "ivy garden with half closed gate", "spiked cactus garden"],
    high:   ["poisonous garden", "tangle-weed vine garden", "fractured mirror garden with big closed gate"],
  },
},
  UNDERWATER:  {
  // POSITIVE
  joy: {
    low: [
      "shallow coral garden with dappled sunlight",
      "reef-edge meadow with bright fish and gentle waves",
    ],
    medium: [
      "colourful mid-reef garden with dancing shoals",
      "arching coral canyon with playful bubbles rising",
    ],
    high: [
      "radiant reef festival with swirling schools of fish",
      "exploding coral amphitheatre full of motion and light",
    ],
  },

  love: {
    low: [
      "secluded coral alcove with soft blue light",
      "shell-lined cove with gently drifting seagrass",
    ],
    medium: [
      "moonlit underwater terrace with lantern-like jellyfish",
      "paired coral arches forming an intimate gateway",
    ],
    high: [
      "bioluminescent coral cathedral with entwined kelp columns",
      "heart-shaped reef basin lit by shimmering plankton",
    ],
  },

  hope: {
    low: [
      "seafloor sprout garden with tiny coral seedlings",
      "narrow sand path leading toward a bright surface glow",
    ],
    medium: [
      "ascending bubble trail through coral pillars",
      "open-water clearing with distant sunbeams",
    ],
    high: [
      "ringed reef halo around a bright blue opening",
      "spiral coral garden leading toward the surface light",
    ],
  },

  excitement: {
    low: [
      "sparkling shoal garden with quick darting fish",
      "reef ledge with sudden bursts of bubbles",
    ],
    medium: [
      "whirling fish-tornado above colourful coral",
      "current-swept reef ridge with racing silhouettes",
    ],
    high: [
      "chaotic festival reef with swirling rays and flashes",
      "bubble-storm garden with exploding colour everywhere",
    ],
  },

  serenity: {
    low: [
      "quiet seagrass meadow with slow drifting sand",
      "soft blue lagoon with faint ripples overhead",
    ],
    medium: [
      "still kelp forest with tall gently swaying fronds",
      "calm sandy hollow framed by smooth rocks",
    ],
    high: [
      "wide silent seafloor plain under a glassy surface",
      "vast tranquil lagoon with distant coral silhouettes",
    ],
  },

  creativity: {
    low: [
      "patchwork coral garden with mismatched shapes",
      "shell mosaic floor with scattered patterns",
    ],
    medium: [
      "spiral reef structure with branching passages",
      "stacked rock towers with coral growing in odd angles",
    ],
    high: [
      "surreal coral sculpture forest twisting in all directions",
      "impossible reef garden with floating rock fragments",
    ],
  },

  lust: {
    low: [
      "velvet-blue coral nook lit by soft bioluminescence",
      "curtained kelp alcove with drifting fronds",
    ],
    medium: [
      "moonbeam reef terrace with slow swirling plankton",
      "hidden underwater grotto with glowing shells",
    ],
    high: [
      "intense crimson coral chamber with pulsing light",
      "deep sapphire grotto with shimmering veils of bubbles",
    ],
  },

  resilience: {
    low: [
      "weathered reef with scars and regrowth",
      "sturdy rock outcrop wrapped in tough seaweed",
    ],
    medium: [
      "storm-shaped coral ridge facing the current",
      "wave-battered seafloor garden clinging to rock",
    ],
    high: [
      "unyielding reef wall rising into the darkness",
      "cliff-like ledge garden enduring crashing waves above",
    ],
  },

  silliness: {
    low: [
      "playful pufferfish garden with odd coral shapes",
      "patch of rock with funny shell arrangements",
    ],
    medium: [
      "whimsical reef playground with looping seaweed rings",
      "bubble-ring garden with curious fish peeking through",
    ],
    high: [
      "chaotic cartoon-reef with exaggerated coral shapes",
      "bubble circus with spinning fish and bright anemones",
    ],
  },

  // NEUTRAL
  curiosity: {
    low: [
      "half-open cave mouth with faint light inside",
      "peeking gap between coral towers with hidden shapes",
    ],
    medium: [
      "twisting canyon garden with branching paths",
      "rock archways leading into dim blue distance",
    ],
    high: [
      "maze-like reef complex disappearing into the deep",
      "labyrinth of coral corridors with shifting shadows",
    ],
  },

  awe: {
    low: [
      "wide-open seafloor vista under a hazy surface",
      "high kelp wall rising out of sight",
    ],
    medium: [
      "towering coral pillars reaching upward",
      "vast blue chasm with distant shimmering fish clouds",
    ],
    high: [
      "cathedral reef with monumental arches of coral",
      "colossal trench drop-off fading into dark blue",
    ],
  },

  contemplative: {
    low: [
      "single rock with resting starfish in quiet water",
      "small pocket of sand ringed by stones",
    ],
    medium: [
      "slow drifting kelp cloister with soft light shafts",
      "round sand circle with a single coral in the middle",
    ],
    high: [
      "endless-feeling seafloor plain with faint ripples",
      "deep silent basin with barely moving water",
    ],
  },

  // NEGATIVE
  confusion: {
    low: [
      "forking sand trails around scattered rocks",
      "misleading bubble streams crossing each other",
    ],
    medium: [
      "tilted coral formations with odd angles",
      "crisscrossing kelp corridors obscuring the view",
    ],
    high: [
      "dense coral maze with warped shapes",
      "distorted canyon garden with swirling silt clouds",
    ],
  },

  boredom: {
    low: [
      "flat sandy stretch with sparse stones",
      "plain seafloor with a few dull plants",
    ],
    medium: [
      "repetitive seagrass field with little variation",
      "long empty channel with similar rocks",
    ],
    high: [
      "endless monotone sand plain fading into blue",
      "uniform rubble field with barely any life",
    ],
  },

  embarrassment: {
    low: [
      "small shadowed nook behind a rock",
      "half-hidden coral corner with pale light",
    ],
    medium: [
      "narrow crevice garden retreating from open water",
      "thin canyon passage with obscured view outside",
    ],
    high: [
      "tight fissure garden pressed between looming walls",
      "folded cavern recess with layered shadows",
    ],
  },

  sadness: {
    low: [
      "soft grey-blue seafloor with drooping seagrass",
      "misty shallow area with sparse coral",
    ],
    medium: [
      "dim trench ledge with slow falling silt",
      "lonely coral skeleton rising from bare sand",
    ],
    high: [
      "wreck-fragment garden with broken beams and quiet water",
      "bleached coral field under muted light",
    ],
  },

  anxiety: {
    low: [
      "narrow ledge garden above a drop",
      "tight passage between rock walls",
    ],
    medium: [
      "tangled fishing-net caught on coral",
      "maze of sharp coral branches close to the face",
    ],
    high: [
      "steep drop-off into black depth",
      "constricted tunnel sloping downward into darkness",
    ],
  },

  anger: {
    low: [
      "jagged rock patch with scraped coral",
      "churned-up sand cloud around broken fragments",
    ],
    medium: [
      "dark red-tinged reef with harsh shadows",
      "splintered coral ridge in turbulent water",
    ],
    high: [
      "boiling surge zone with crashing waves overhead",
      "violent current tearing through shattered reef",
    ],
  },

  guilt: {
    low: [
      "shadowed seafloor patch with discarded net",
      "small broken coral piece lying alone",
    ],
    medium: [
      "abandoned anchor garden scarring the sand",
      "damaged reef section with exposed bone-white branches",
    ],
    high: [
      "graveyard of broken coral skeletons",
      "wide scar in the reef with no life growing",
    ],
  },

  loneliness: {
    low: [
      "single coral head in open sand",
      "isolated rock with one quiet fish",
    ],
    medium: [
      "abandoned wreck spar surrounded by emptiness",
      "lone pillar in a wide blue void",
    ],
    high: [
      "deserted deep basin with no visible life",
      "vast empty water column above a bare floor",
    ],
  },

  disappointment: {
    low: [
      "tired reef with dull colours",
      "small collapsed coral patch",
    ],
    medium: [
      "half-ruined seagrass meadow with torn blades",
      "broken shell garden scattered in disarray",
    ],
    high: [
      "crumbled reef wall that once held colour",
      "flattened coral field with only fragments left",
    ],
  },

  jealousy: {
    low: [
      "shadowed garden beside a brighter reef",
      "dim coral patch facing a glowing neighbour",
    ],
    medium: [
      "twisted kelp garden looking toward a lit opening",
      "murky pool reflecting a distant colourful reef",
    ],
    high: [
      "dark trench edge watching vivid reef above",
      "entangled seaweed garden clutching at absent light",
    ],
  },
},
   GALAXY: {
  // POSITIVE
  joy: {
    low: [
      "tiny planet garden bathed in warm starlight",
      "stardust meadow beneath gentle nebula glow",
    ],
    medium: [
      "ringed-planet terrace with bright constellations",
      "colourful aurora sky over a curved horizon garden",
    ],
    high: [
      "spiral galaxy fireworks above a radiant cosmic meadow",
      "bursting nebula carnival swirling around the garden",
    ],
  },

  love: {
    low: [
      "secluded moonlit crater garden with twin stars",
      "soft-lit asteroid alcove wrapped in glowing vines",
    ],
    medium: [
      "twin-planet balcony garden linked by a light bridge",
      "heart-shaped star cluster above a quiet terrace",
    ],
    high: [
      "intertwined nebulae forming a luminous cosmic arch",
      "celestial rose garden floating between two moons",
    ],
  },

  hope: {
    low: [
      "dim comet garden pointing toward a bright star",
      "narrow beam of starlight on a small rocky clearing",
    ],
    medium: [
      "spiral path of hovering stones leading to a star gate",
      "rising light column in a crater garden",
    ],
    high: [
      "halo garden around a radiant guiding star",
      "expanding ring garden at the edge of a glowing nebula",
    ],
  },

  excitement: {
    low: [
      "shooting-star trail streaking past a sky garden",
      "small meteors skipping joyfully over a cosmic field",
    ],
    medium: [
      "orbiting rock garden with rapidly circling fragments",
      "aurora storm racing across a space terrace",
    ],
    high: [
      "supernova burst sky over a wild starfield meadow",
      "hyperactive meteor shower crashing around a floating garden",
    ],
  },

  serenity: {
    low: [
      "quiet moon crater garden under a soft star veil",
      "slowly drifting stardust over dark soil",
    ],
    medium: [
      "calm ring garden suspended in deep space",
      "still cosmic lake reflecting distant galaxies",
    ],
    high: [
      "vast silent starfield with a tiny island garden",
      "infinite-feeling nebula haze around a tranquil platform",
    ],
  },

  creativity: {
    low: [
      "scattered asteroid garden forming odd shapes",
      "mismatched orbiting stones leaving faint light trails",
    ],
    medium: [
      "spiral constellation garden with patterned star paths",
      "fractured ring garden weaving around empty space",
    ],
    high: [
      "abstract geometry of floating shards and light ribbons",
      "surreal multi-layer cosmic terrace bending in impossible ways",
    ],
  },

  lust: {
    low: [
      "velvet-dark star alcove with soft crimson glow",
      "half-lit moon garden hidden behind a nebula curtain",
    ],
    medium: [
      "deep purple nebula terrace with slow swirling lights",
      "intimate crescent-moon balcony over glowing clouds",
    ],
    high: [
      "intense crimson-and-gold nebula chamber pulsing with light",
      "secluded eclipse garden ringed by radiant fire",
    ],
  },

  resilience: {
    low: [
      "pitted asteroid garden enduring countless impacts",
      "scarred tiny planet still holding a thin ring of life",
    ],
    medium: [
      "steady platform orbiting calmly through debris",
      "weathered moon ridge facing solar winds",
    ],
    high: [
      "indestructible black rock spire cutting through starwinds",
      "massive asteroid fortress garden holding against storms",
    ],
  },

  silliness: {
    low: [
      "bouncy meteor pebble garden in low gravity",
      "tiny cartoon planet with lumpy hills",
    ],
    medium: [
      "whimsical orbiting rock playground with looping tracks",
      "bubble-shaped domes floating around a giggling planet",
    ],
    high: [
      "chaotic candy-coloured nebula park with absurd shapes",
      "upside-down gravity garden with tumbling stars",
    ],
  },

  // NEUTRAL
  curiosity: {
    low: [
      "half-open star gate hovering above a small platform",
      "mysterious glowing crater with unreadable symbols",
    ],
    medium: [
      "branching asteroid tunnels lit by unknown lights",
      "multi-path space bridge disappearing into starlight",
    ],
    high: [
      "shifting constellation maze rearranging overhead",
      "labyrinth of floating cubes and light corridors",
    ],
  },

  awe: {
    low: [
      "wide view of a distant spiral galaxy from a ledge",
      "towering nebula wall above a simple rock garden",
    ],
    medium: [
      "grand cosmic terrace overlooking colliding galaxies",
      "arched platform suspended over a swirling star sea",
    ],
    high: [
      "cathedral-like nebula vault stretching in all directions",
      "colossal ringed-giant looming over a tiny garden",
    ],
  },

  contemplative: {
    low: [
      "single rock bench on a small moon outcrop",
      "quiet dust circle under a solitary star",
    ],
    medium: [
      "slowly rotating platform with a single tree-like structure",
      "inner ring cloister orbiting silently in space",
    ],
    high: [
      "endless star curtain surrounding a solitary island garden",
      "infinite reflection of stars in a black glass floor",
    ],
  },

  // NEGATIVE
  confusion: {
    low: [
      "forking asteroid paths weaving around each other",
      "misaligned floating steps going nowhere",
    ],
    medium: [
      "Escher-like floating staircase garden in zero gravity",
      "twisted constellations that refuse to align",
    ],
    high: [
      "broken geometry of space folding over itself",
      "fragmented star maze with shifting directions",
    ],
  },

  boredom: {
    low: [
      "flat grey moon plain with sparse craters",
      "uniform starfield with no bright features",
    ],
    medium: [
      "repeating pattern of identical rocks in orbit",
      "long monotonous ring of dull dust and stones",
    ],
    high: [
      "endless grid of identical tiles floating in space",
      "featureless grey planet surface stretching to the horizon",
    ],
  },

  embarrassment: {
    low: [
      "small shadowed crater tucked behind a larger ridge",
      "half-hidden corner of a moon base garden",
    ],
    medium: [
      "narrow cleft between two large asteroids",
      "curved wall of rock shielding a small patch from view",
    ],
    high: [
      "tight crescent gap squeezed between massive stone slabs",
      "folded asteroid pocket wrapped in overlapping shadows",
    ],
  },

  sadness: {
    low: [
      "pale blue starfield over a faded dust garden",
      "quiet crater with slow drifting particles",
    ],
    medium: [
      "abandoned satellite garden slowly tumbling in darkness",
      "lonely moon valley with faint distant lights",
    ],
    high: [
      "dark, almost starless void around a cracked platform",
      "shattered moon surface with cold, empty sky",
    ],
  },

  anxiety: {
    low: [
      "narrow ledge garden over a bottomless void",
      "tight rock corridor on a small asteroid",
    ],
    medium: [
      "maze of floating debris whirling unpredictably",
      "unstable platform garden with glowing cracks",
    ],
    high: [
      "fracturing ring garden breaking apart in slow motion",
      "vertiginous drop past spinning rocks into blackness",
    ],
  },

  anger: {
    low: [
      "jagged meteor garden glowing faint red",
      "scored surface with fresh impact scars",
    ],
    medium: [
      "red storm swirling around a cracked planet garden",
      "erupting fissures throwing sparks into dark space",
    ],
    high: [
      "raging solar flare lashing a burning terrace",
      "explosive asteroid belt torn apart by violent forces",
    ],
  },

  guilt: {
    low: [
      "dim crater marked by a single scorched patch",
      "abandoned probe garden casting a long shadow",
    ],
    medium: [
      "dark ring of debris circling a damaged planet",
      "ruined outpost garden drifting silently in orbit",
    ],
    high: [
      "graveyard of dead satellites around a blackened world",
      "broken world fragment surrounded by accusing stars",
    ],
  },

  loneliness: {
    low: [
      "single tiny moon garden in a huge starfield",
      "small light on a vast dark rock",
    ],
    medium: [
      "solitary planet floating far from any stars",
      "lone platform drifting between galaxies",
    ],
    high: [
      "isolated garden suspended in nearly empty void",
      "tiny light speck in an overwhelmingly black universe",
    ],
  },

  disappointment: {
    low: [
      "dusty crater garden with faded star view",
      "dull asteroid field lacking colour",
    ],
    medium: [
      "half-built ring garden left unfinished",
      "broken observatory terrace with dim instruments",
    ],
    high: [
      "collapsed star gate garden that no longer activates",
      "ruined cosmic theatre with extinguished lights",
    ],
  },

  jealousy: {
    low: [
      "shadowed side of a planet looking toward a bright neighbour",
      "dim moon garden facing a vibrant galaxy across the void",
    ],
    medium: [
      "murky nebula patch beside a vivid glowing cloud",
      "dark ring fragment orbiting a blazing central world",
    ],
    high: [
      "cold, blank planet watching a radiant twin in the distance",
      "distorted mirror nebula reflecting a brighter region nearby",
    ],
  },
},
};

export function selectArchetype(
  type: GardenType,
  primary: PrimaryEmotion,
  intensity: IntensityBand,
): string {
  const matrixForType = ARCHETYPE_MATRIX[type] ?? ARCHETYPE_MATRIX.CLASSIC;
  const row = matrixForType[primary];
  const band = row?.[intensity];

  if (band?.length) return pick(band);
  if (row?.medium?.length) return pick(row.medium);
  return pick(DEFAULT_FALLBACK);
}