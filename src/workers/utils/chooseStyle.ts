import { type Valence, Energy } from "./mood.types.js";

type StyleId =
    | "watercolor_soft"
    | "oil_dreamy"
    | "ink_moody"
    | "lowpoly_diorama"
    | "isometric_pixel"
    | "flat_vector"
    | "ghibli_like"
    | "post_impressionism"
    | "graffiti"
    | "cubism"
    | "gothic";

export type StylePack = { id: StyleId; label: string };

const STYLE_CATALOG: Record<StyleId, StylePack> = {
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


const STYLE_MATRIX: Record<Valence, Record<Energy, StyleId[]>> = {
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


function pickFromTriplet<T>(triplet: [T, T, T] | T[]): T {
    return triplet[Math.floor(Math.random() * 3)];
}

export function selectStylePack(
    valence: Valence,
    energy: Energy,
): StylePack {
    const triplet = STYLE_MATRIX[valence]?.[energy];
    if (!triplet || triplet.length !== 3) {
        return STYLE_CATALOG["watercolor_soft"];
    }
    const id = pickFromTriplet(triplet as [StyleId, StyleId, StyleId]);
    return STYLE_CATALOG[id];
}
