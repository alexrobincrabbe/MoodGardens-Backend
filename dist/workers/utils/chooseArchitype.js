function pick(arr) {
    return arr[Math.floor(Math.random() * arr.length)];
}
export const ARCHETYPE_MATRIX = {
    // ─────────────────────────────
    // POSITIVE EMOTIONS
    // ─────────────────────────────
    joy: {
        low: ["light-dappled cottage garden, open wooden gate", "wildflower prairie meadow with mowed path", "traditional well tended lawn and flowerbed garden"],
        medium: ["tropical garden scene", "quaint English garden", "orchard with wooden bridge"],
        high: ["paradise garden", "golden-lit Mediterranean garden", "formal garden"],
    },
    love: {
        low: ["courtyard garden", "hidden arbor with swirling vines with flowers", "lantern lit beach garden"],
        medium: ["glowing romantic Japanese garden", "balcony garden with soft arches and fairylights", "ornate succulents garden with dragonflies"],
        high: ["vertical flower walls, intimate courtyard with heart shaped gate", "lantern lit garden with pond of flowering lily pads", "pergola garden with cascading flowers and fireflies"],
    },
    hope: {
        low: ["seedling terrace", "candle-lit straight stone garden path with lanterns in the distance", "minimalist spring courtyard garden with open gate"],
        medium: ["sky view over a lake garden", "mosaic path with multiple directions", "abundant potager garden"],
        high: ["illuminated circular garden with statues and wishing pond", "fruiting grapevine", "mandala garden"],
    },
    excitement: {
        low: ["balls of light, blooming garden", "coastal garden", "Persian garden"],
        medium: ["lantern festival garden", "colourful hillside terraces", "spring carnival garden"],
        high: ["firework meadow garden", "blossom swirls garden", "floating celebration garden"],
    },
    serenity: {
        low: ["meditative bamboo courtyard", "soft-moss garden with garden ornaments", "minimalist wildflower path garden"],
        medium: ["zen sand garden", "open-lake terrace with lantern-lit jetty", "calm fountain retreat with stone bridge"],
        high: ["still-water sanctuary garden with big wide open gates", "sacred serenity garden", "vast open zen expanse garden"],
    },
    creativity: {
        low: ["asymmetric sketch-garden", "cobbled courtyard garden with well", "garden of scattered shapes"],
        medium: ["spiral terraced garden", "topiary garden", "pattern-woven hillside garden"],
        high: ["abstract sculpture garden with bridges and open gates", "surreal multi-layered terrace with colourful winding paths", "tunnel garden with bright open end"],
    },
    lust: {
        low: ["cosy love nest garden", "velvet petal courtyard", "hidden archway retreat"],
        medium: ["twilight-moon garden with moss lawn", "secluded beach", "waterfall garden terraces"],
        high: ["garden of fertility with butterflies", "fireflies and fire pit garden", "velvet-shadow enclave garden"],
    },
    resilience: {
        low: ["weathered stone courtyard", "herb terrace garden", "steady hillside garden"],
        medium: ["windswept plateau garden", "endurance garden", "fortified ridge path garden"],
        high: ["mountain rise garden", "unyielding cliff garden with bridge", "woodland garden with wooden walkway"],
    },
    silliness: {
        low: ["roundabout garden", "playful topiary park", "mushroom ring garden"],
        medium: ["tiny whimsical gnome garden", "mini hedge maze with coloured glowing balls on stems", "balloon bush meadow"],
        high: ["upside down garden", "candy-land garden", "bubble greenhouse garden"],
    },
    // ─────────────────────────────
    // NEUTRAL EMOTIONS
    // ─────────────────────────────
    curiosity: {
        low: ["archway of hidden paths with unreadable signs", "peek-through hedge corners", "garden with butterfly house"],
        medium: ["beehive garden", "puzzle terrace garden", "charbagh garden"],
        high: ["pretty garden labyrinth", "shifting passage garden", "concept garden"],
    },
    awe: {
        low: ["wide-open horizon garden", "grand cliff outlook garden", "tall-arch viewpoint garden"],
        medium: ["monument terrace garden", "hanging garden", "vaulted arboretum"],
        high: ["vast celestial garden", "colossal pillar garden", "great expanse sky terrace"],
    },
    contemplative: {
        low: ["quiet bench garden", "reflected-stone courtyard", "shaded thinking nook"],
        medium: ["monastic garden walk", "philosopher’s terrace", "still-water reflection court"],
        high: ["ancient cloister garden", "water garden with flower bridge", "infinite reflection garden"],
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
        low: ["flat lawn garden", "plain basic garden", "still, empty pond courtyard"],
        medium: ["monotone garden ", "symmetrical contemporary garden", "empty terrace garden with broken pots"],
        high: ["endless tiled garden", "geometric concrete courtyard", "drab urban park garden"],
    },
    embarrassment: {
        low: ["shy corner garden", "small hidden alcove", "soft-shade courtyard"],
        medium: ["narrow passage garden", "curtain-draped walkway", "folded-lattice enclave"],
        high: ["maze of veils garden", "corridor of retreat", "curved-wall concealment garden"],
    },
    sadness: {
        low: ["cypress walk", "weeping corner garden", "misty lakeside garden"],
        medium: ["cloistered courtyard", "shaded fern ravine", "sparse clearing"],
        high: ["weed and rock garden", "muddy marsh garden with overgrown path", "overgrown ruins garden"],
    },
    anxiety: {
        low: ["ridge garden", "pine terrace", "narrow cliffside path garden"],
        medium: ["tangled vine garden", "walled garden with broken gate", "thorn hedges garden"],
        high: ["labyrinth hedge garden", "fractured rock garden", "suspended bridge canyon garden"],
    },
    anger: {
        low: ["jagged rock garden with partly closed gate", "wild overgrowth grove", "smoldering earth patch"],
        medium: ["crimson ravine", "charcoal ridge garden", "thorn briar garden with closed iron gate"],
        high: ["volcanic ridge garden", "firegrass expanse", "burnt stone plateau"],
    },
    guilt: {
        low: ["shadowed courtyard", "ivy-overgrown gate", "stern statue garden"],
        medium: ["abandoned chapel garden", "ruins cracked path", "withered terrace"],
        high: ["cracked mirror garden", "half-burned orchard", "labyrinth of remorse garden"],
    },
    loneliness: {
        low: ["solitary pine hill garden", "empty bench garden", "empty pond garden"],
        medium: ["abandoned greenhouse", "single-tree plain", "dying lawn back yard"],
        high: ["desert garden", "bare patio garden", "dry dead lawn garden"],
    },
    disappointment: {
        low: ["wilted garden", "broken fountain garden", "dry pond garden"],
        medium: ["broken overgrown weeds swing-set garden", "cracked marble path", "chopped trees"],
        high: ["crumbling terraces", "fallen leaves garden with overgrown path that abruptly ends", "broken gate garden"],
    },
    jealousy: {
        low: ["shadowed twin garden", "mirrored murky green pond garden", "creeping dried leaves wall garden"],
        medium: ["thorn hedges with winding paths", "ivy garden with half closed gate", "spiked cactus garden"],
        high: ["poisonous garden", "tangle-weed vine garden", "fractured mirror garden with big closed gate"],
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
