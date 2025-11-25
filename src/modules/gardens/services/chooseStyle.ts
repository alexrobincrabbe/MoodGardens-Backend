import { type Valence, Seriousness} from "../mood.types.js";

type StyleId =
    | "watercolor_soft"
    | "oil_dreamy"
    | "ink_moody"
    | "flat_vector"
    | "ghibli_like"
    | "post_impressionism"
    | "cubism"
    | "gothic"
    | "art_nouveau"
    | "dont_starve"
    | "renaissance"
    | "pointilism"
    | "neoclassicism"
    | "contemporary_art_deco"
    | "vaporwave"
    | "baroque"
    | "crayon";

export type StylePack = { id: StyleId; label: string };

const STYLE_CATALOG: Record<StyleId, StylePack> = {
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
    vaporwave:{ id: "vaporwave", label: "vaporwave art" },
    baroque: { id: "baroque", label: "baroque painting" },
    crayon: { id: "crayon", label: "crayon drawing" },
};


const STYLE_MATRIX: Record<Valence, Record<Seriousness, StyleId[]>> = {
    positive: {
        low: ["flat_vector", "contemporary_art_deco", "crayon"],
        medium: ["ghibli_like", "watercolor_soft", "pointilism"],
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


function pickFromTriplet<T>(triplet: [T, T, T] | T[]): T {
    return triplet[Math.floor(Math.random() * 3)];
}

export function selectStylePack(
    valence: Valence,
    seriousness: Seriousness,
): StylePack {
    const triplet = STYLE_MATRIX[valence]?.[seriousness];
    if (!triplet || triplet.length !== 3) {
        return STYLE_CATALOG["watercolor_soft"];
    }
    const id = pickFromTriplet(triplet as [StyleId, StyleId, StyleId]);
    return STYLE_CATALOG[id];
}
