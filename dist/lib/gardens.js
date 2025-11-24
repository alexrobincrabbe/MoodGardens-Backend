import crypto from "crypto";
export function generateShareId() {
    return crypto.randomBytes(8).toString("hex");
}
export function mapGardenOut(garden) {
    if (!garden)
        return null;
    return {
        ...garden,
    };
}
