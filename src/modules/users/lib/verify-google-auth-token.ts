import { GraphQLError } from "graphql";
import { OAuth2Client } from "google-auth-library";


const GOOGLE_CLIENT_ID = process.env.GOOGLE_CLIENT_ID!;
const googleClient = new OAuth2Client(GOOGLE_CLIENT_ID);

export async function verifyGoogleIdToken(idToken: string) {
    const ticket = await googleClient.verifyIdToken({
        idToken,
        audience: GOOGLE_CLIENT_ID,
    });

    const payload = ticket.getPayload();
    if (!payload || !payload.sub || !payload.email) {
        throw new GraphQLError("Could not verify Google account.", {
            extensions: { code: "UNAUTHENTICATED" },
        });
    }

    return {
        googleId: payload.sub,
        email: payload.email.toLowerCase(),
        displayName: payload.name ?? payload.email.split("@")[0],
    };
}