import { type PrimaryEmotion } from "./mood.types.js";

type IntensityBand = "low" | "medium" | "high";

function pick<T>(arr: T[]): T {
  return arr[Math.floor(Math.random() * arr.length)];
}

const ARCHETYPE_MATRIX: Record<PrimaryEmotion, Record<IntensityBand, string[]>> = {
    joy: {
        low:    ["sun-dappled cottage garden", "flower meadow with winding path", "terraced hillside garden"],
        medium: ["floating island garden", "riverside willow garden", "orchard with lanterns"],
        high:   ["sky garden on clouds", "clifftop wildflower garden", "sunflower labyrinth"],
    },
  sadness: {
    low:    ["moonlit forest clearing", "weeping willow by pond", "misty lakeside garden"],
    medium: ["overgrown ruins garden", "shaded fern ravine", "cypress walk"],
    high:   ["rain-soaked stone garden", "twilight marsh garden", "cloistered courtyard garden"],
  },
  anxiety: {
    low:    ["labyrinth hedge garden", "foggy pine terrace", "narrow cliffside path garden"],
    medium: ["tangled vine garden", "walled garden with closed gate", "thorn maze garden"],
    high:   ["storm-lit ridge garden", "fractured rock garden", "suspended bridge canyon garden"],
  },
  anger: {
    low:    ["thorn briar garden", "wind-bent cypress garden", "charcoal lava garden"],
    medium: ["crimson maple ravine", "volcanic ridge garden", "burnt agave desert garden"],
    high:   ["tempest cliff garden", "firegrass savanna garden", "red sandstone labyrinth"],
  },
  love: {
    low:    ["rose courtyard garden", "hidden arbor with vines", "lantern-lit gazebo garden"],
    medium: ["terraced vineyard garden", "balcony garden with heart-shaped topiary", "orchid pavilion garden"],
    high:   ["cascading floral arch garden", "glowing rose labyrinth", "floating heart island garden"],
  },
  guilt: {
    low:    ["shadowed courtyard garden", "ivy-overgrown gate garden", "fog-filled orchard"],
    medium: ["wilted rose garden", "abandoned chapel garden", "sunlight breaking through ruins"],
    high:   ["cracked mirror garden", "half-burned orchard", "stone labyrinth under stormy sky"],
  },
  hope: {
    low:    ["seedling planter terrace", "lantern-lit garden path", "spring sprout garden"],
    medium: ["sunbreak forest clearing", "hillside tulip garden", "morning dew meadow"],
    high:   ["rain-to-rainbow garden", "floating terraces in light", "sky-arch bridge garden"],
  },
  loneliness: {
    low:    ["solitary pine on hill garden", "empty bench garden", "moonlit pond garden"],
    medium: ["abandoned greenhouse garden", "wide plain garden with single tree", "twilight courtyard garden"],
    high:   ["island garden in mist", "frozen lake garden", "endless dune garden"],
  },
  silliness: {
    low:    ["tiny whimsical gnome garden", "playful topiary park", "mushroom ring garden"],
    medium: ["checkerboard flower beds", "miniature hedge maze garden", "balloon bush meadow"],
    high:   ["gravity-defying garden", "floating candyland garden", "bubble-filled greenhouse garden"],
  },
  disappointment: {
    low:    ["wilted daisy patch", "broken fountain courtyard", "dry pond garden"],
    medium: ["abandoned fairground garden", "cracked marble path garden", "half-grown orchard"],
    high:   ["storm-drenched terrace", "fallen petals garden", "collapsed archway garden"],
  },
  excitement: {
    low:    ["morning bloom garden", "bright orchard path", "sunrise terrace garden"],
    medium: ["lantern festival garden", "colorful hillside terraces", "spring carnival garden"],
    high:   ["firework meadow garden", "blossom whirlwind garden", "floating celebration garden"],
  },
  jealousy: {
    low:    ["shadowed twin garden", "mirrored pond garden", "ivy creeping wall garden"],
    medium: ["thorn hedge maze", "walled dual courtyard garden", "twisted vine garden"],
    high:   ["storm-torn castle garden", "flame vine fortress garden", "fractured mirror garden"],
  },
  overwhelm: {
    low:    ["dense fern ravine", "mossy gulley garden", "fog-layered terrace garden"],
    medium: ["river delta garden", "cascading stepwell garden", "wildflower maze garden"],
    high:   ["multi-level hanging gardens", "storm-spray cliff gardens", "sprawling root cathedral"],
  },
  boredom: {
    low:    ["flat lawn garden", "plain hedge square", "still pond courtyard"],
    medium: ["monotone shrub maze", "symmetrical plaza garden", "empty terrace garden"],
    high:   ["endless tiled garden", "geometric concrete courtyard", "grey fog park garden"],
  },
};

// ---- public selector
export function selectArchetype(primary: PrimaryEmotion, intensity: IntensityBand): string {
  const row = ARCHETYPE_MATRIX[primary];
  const triplet = row?.[intensity];
  if (triplet) return pick(triplet);

  // fallback if not found
  if (row?.medium) return pick(row.medium);
  return pick(["flower meadow with path", "still pond with stepping stones", "walled herb garden"]);
}
