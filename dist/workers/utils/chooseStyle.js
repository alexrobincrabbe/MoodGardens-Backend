const STYLE_CATALOG = {
    watercolor_soft: { id: "watercolor_soft", label: "soft watercolor illustration" },
    oil_dreamy: { id: "oil_dreamy", label: "dreamy oil painting" },
    ink_moody: { id: "ink_moody", label: "moody ink wash" },
    lowpoly_diorama: { id: "lowpoly_diorama", label: "low-poly 3D diorama" },
    isometric_pixel: { id: "isometric_pixel", label: "isometric pixel art" },
    flat_vector: { id: "flat_vector", label: "flat pastel vector art" },
    ghibli_like: { id: "ghibli_like", label: "Ghibli-like painterly scene" },
    post_impressionism: { id: "post_impressionism", label: "post impressionist painting" },
    graffiti: { id: "graffiti", label: "graffiti art" },
    cubism: { id: "cubism", label: "cubist painting" },
    gothic: { id: "gothic", label: "gothic, surrealist expressionism" },
};
const STYLE_MATRIX = {
    positive: {
        low: ["watercolor_soft", "ghibli_like", "flat_vector"],
        medium: ["graffiti", "watercolor_soft", "lowpoly_diorama"],
        high: ["post_impressionism", "isometric_pixel", "lowpoly_diorama"],
    },
    mixed: {
        low: ["oil_dreamy", "watercolor_soft", "ink_moody"],
        medium: ["oil_dreamy", "ghibli_like", "lowpoly_diorama"],
        high: ["lowpoly_diorama", "isometric_pixel", "oil_dreamy"],
    },
    negative: {
        low: ["oil_dreamy", "post_impressionism", "oil_dreamy"],
        medium: ["gothic", "gothic", "post_impressionism"],
        high: ["ink_moody", "ink_moody", "post_impressionism"],
    },
};
function pickFromTriplet(triplet) {
    return triplet[Math.floor(Math.random() * 3)];
}
export function selectStylePack(valence, energy) {
    const triplet = STYLE_MATRIX[valence]?.[energy];
    if (!triplet || triplet.length !== 3) {
        return STYLE_CATALOG["watercolor_soft"];
    }
    const id = pickFromTriplet(triplet);
    return STYLE_CATALOG[id];
}
