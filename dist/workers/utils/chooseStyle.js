const STYLE_CATALOG = {
    watercolor_soft: { id: "watercolor_soft", label: "soft watercolor illustration" },
    oil_dreamy: { id: "oil_dreamy", label: "dreamy oil painting" },
    ink_moody: { id: "ink_moody", label: "moody ink wash" },
    flat_vector: { id: "flat_vector", label: "flat pastel vector art" },
    ghibli_like: { id: "ghibli_like", label: "Ghibli-like painterly scene" },
    post_impressionism: { id: "post_impressionism", label: "post impressionist painting" },
    cubism: { id: "cubism", label: "cubist painting" },
    gothic: { id: "gothic", label: "gothic, surrealist expressionism" },
    art_nouveau: { id: "art_nouveau", label: "art nouveau painting" },
    dont_starve: { id: "dont_starve", label: "in the style of the game, Don't Starve" },
    renaissance: { id: "renaissance", label: "rennaissance painting" },
    pointilism: { id: "pointilism", label: "pointilist painting" },
    neoclassicism: { id: "pointilism", label: "neoclassicism painting" },
    contemporary_art_deco: { id: "contemporary_art_deco", label: "contemporary art deco painting" },
    vaporwave: { id: "vaporwave", label: "vaporwave art" },
    baroque: { id: "baroque", label: "baroque painting" },
    crayon: { id: "crayon", label: "crayon drawing" },
};
const STYLE_MATRIX = {
    positive: {
        low: ["flat_vector", "contemporary_art_deco", "pointilism"],
        medium: ["ghibli_like", "watercolor_soft", "crayon"],
        high: ["vaporwave", "post_impressionism", "renaissance"],
    },
    mixed: {
        low: ["crayon", "dont_starve", "art_nouveau"],
        medium: ["oil_dreamy", "ghibli_like", "renaissance"],
        high: ["post_impressionism", "neoclassicism", "cubism"],
    },
    negative: {
        low: ["dont_starve", "pointilism", "art_nouveau"],
        medium: ["gothic", "cubism", "post_impressionism"],
        high: ["ink_moody", "neoclassicism", "baroque"],
    },
};
function pickFromTriplet(triplet) {
    return triplet[Math.floor(Math.random() * 3)];
}
export function selectStylePack(valence, seriousness) {
    const triplet = STYLE_MATRIX[valence]?.[seriousness];
    if (!triplet || triplet.length !== 3) {
        return STYLE_CATALOG["watercolor_soft"];
    }
    const id = pickFromTriplet(triplet);
    return STYLE_CATALOG[id];
}
