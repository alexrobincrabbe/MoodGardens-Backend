function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export const ARCHETYPE_MATRIX = {
    // ─────────────────────────────
    // POSITIVE EMOTIONS
    // ─────────────────────────────
    joy: {
        low: ["sun-dappled cottage garden", "flower meadow with winding path", "terraced hillside garden"],
        medium: ["floating island garden", "riverside garden", "orchard"],
        high: ["dreamy garden scene", "golden valley garden", "sunlit hillside expanse"],
    },
    love: {
        low: ["courtyard garden", "hidden arbor with vines", "lantern-lit gazebo garden"],
        medium: ["glowing romantic garden", "balcony garden with soft arches", "ornate pavilion garden"],
        high: ["cascading blossom archways", "ivory fortress garden", "moonlit pavilion garden"],
    },
    hope: {
        low: ["seedling terrace", "lantern-lit garden path", "spring sprout garden"],
        medium: ["sunbreak clearing", "hillside garden terraces", "morning meadow"],
        high: ["illuminated sky garden", "floating terraces of light garden", "archway of renewal garden"],
    },
    excitement: {
        low: ["morning bloom garden", "bright orchard path", "sunrise terrace garden"],
        medium: ["lantern festival garden", "colorful hillside terraces", "spring carnival garden"],
        high: ["firework meadow garden", "blossom whirlwind garden", "floating celebration garden"],
    },
    serenity: {
        low: ["quiet bamboo courtyard", "soft-moss garden", "minimalist stone path garden"],
        medium: ["zen sand garden", "open-lake terrace", "calm hillside retreat"],
        high: ["still-water sanctuary garden", "floating serenity garden", "vast open zen expanse garden"],
    },
    creativity: {
        low: ["asymmetric sketch-garden", "cobbled courtyard garden", "garden of scattered shapes"],
        medium: ["spiral terraced garden", "mosaic path garden", "pattern-woven hillside garden"],
        high: ["abstract dreamscape garden", "surreal multi-layered terrace", "impossible geometric garden"],
    },
    lust: {
        low: ["intimate vine alcove garden", "velvet petal courtyard", "hidden archway retreat"],
        medium: ["sensual lantern path", "lush secluded pavilion", "curved garden terraces"],
        high: ["garden of fertility", "forbidden grove garden", "velvet-shadow enclave garden"],
    },
    resilience: {
        low: ["weathered stone courtyard", "young sprout terrace garden", "steady hillside garden"],
        medium: ["windswept plateau garden", "terraced endurance garden", "fortified ridge path garden"],
        high: ["mountain rise garden", "unyielding cliff garden", "endurance pillar terraces garden"],
    },
    silliness: {
        low: ["roundabout garden", "playful topiary park", "mushroom ring garden"],
        medium: ["tiny whimsical gnome garden", "mini hedge maze", "balloon bush meadow"],
        high: ["gravity-defying garden", "floating candyland garden", "bubble greenhouse garden"],
    },
    // ─────────────────────────────
    // NEUTRAL EMOTIONS
    // ─────────────────────────────
    curiosity: {
        low: ["archway of hidden paths", "peek-through hedge corners", "garden with small mysteries"],
        medium: ["multi-route courtyard", "puzzle terrace garden", "split-path forest garden"],
        high: ["garden labyrinth of secrets", "shifting passage garden", "garden maze of unknown openings"],
    },
    awe: {
        low: ["wide-open horizon garden", "grand cliff outlook garden", "tall-arch viewpoint garden"],
        medium: ["monument terrace garden", "cathedral-height grove", "vaulted arboretum"],
        high: ["vast celestial garden", "colossal pillar garden", "great expanse sky terrace"],
    },
    contemplative: {
        low: ["quiet bench garden", "reflected-stone courtyard", "shaded reading nook"],
        medium: ["monastic garden walk", "philosopher’s terrace", "still-water reflection court"],
        high: ["ancient cloister garden", "echoing stone hall garden", "infinite reflection garden"],
    },
    // ─────────────────────────────
    // NEGATIVE EMOTIONS
    // ─────────────────────────────
    confusion: {
        low: ["forking path garden", "twist-lane courtyard", "crooked hedge walk"],
        medium: ["misaligned terrace garden", "mirror mismatch courtyard", "impossible staircase garden"],
        high: ["fragmented garden maze", "disjointed reality terrace", "shifted geometry garden"],
    },
    boredom: {
        low: ["flat lawn garden", "plain hedge square", "still pond courtyard"],
        medium: ["monotone shrub maze", "symmetrical plaza garden", "empty terrace garden"],
        high: ["endless tiled garden", "geometric concrete courtyard", "drab urban park garden"],
    },
    embarrassment: {
        low: ["shy corner garden", "small hidden alcove", "soft-shade courtyard"],
        medium: ["narrow passage garden", "curtain-draped walkway", "folded-lattice enclave"],
        high: ["maze of veils garden", "corridor of retreat", "curved-wall concealment garden"],
    },
    sadness: {
        low: ["cypress walk", "weeping corner garden", "misty lakeside garden"],
        medium: ["cloistered courtyard", "shaded fern ravine", "moonlit clearing"],
        high: ["stone garden", "marsh garden", "overgrown ruins garden"],
    },
    anxiety: {
        low: ["ridge garden", "foggy pine terrace", "narrow cliffside path garden"],
        medium: ["tangled vine garden", "walled garden with closed gate", "thorn maze garden"],
        high: ["labyrinth hedge garden", "fractured rock garden", "suspended bridge canyon garden"],
    },
    anger: {
        low: ["hilltop garden", "wild overgrowth grove", "smoldering earth patch"],
        medium: ["crimson ravine", "charcoal ridge garden", "thorn briar garden"],
        high: ["volcanic ridge garden", "firegrass expanse", "burnt stone plateau"],
    },
    guilt: {
        low: ["shadowed courtyard", "ivy-overgrown gate", "fog-filled orchard"],
        medium: ["abandoned chapel garden", "sunlight-through-ruins path", "withered terrace"],
        high: ["cracked mirror garden", "half-burned orchard", "labyrinth of remorse garden"],
    },
    loneliness: {
        low: ["solitary pine hill garden", "empty bench garden", "moonlit pond garden"],
        medium: ["abandoned greenhouse", "single-tree plain", "twilight courtyard garden"],
        high: ["island in mist", "frozen lake garden", "endless dune garden"],
    },
    disappointment: {
        low: ["wilted garden", "broken fountain court", "dry pond garden"],
        medium: ["abandoned fairground garden", "cracked marble path", "half-grown orchard"],
        high: ["storm-drenched terrace", "fallen petals garden", "collapsed archway garden"],
    },
    jealousy: {
        low: ["shadowed twin garden", "mirrored pond garden", "creeping wall garden"],
        medium: ["thorn hedge maze", "dual courtyard garden", "twisted vine garden"],
        high: ["poisonous garden", "flame vine fortress", "fractured mirror garden"],
    },
};
// ---- public selector
export function selectArchetype(primary, intensity) {
    const row = ARCHETYPE_MATRIX[primary];
    const triplet = row?.[intensity];
    if (triplet)
        return pick(triplet);
    // fallback if not found
    if (row?.medium)
        return pick(row.medium);
    return pick(["flower meadow with path", "still pond with stepping stones", "walled herb garden"]);
}
