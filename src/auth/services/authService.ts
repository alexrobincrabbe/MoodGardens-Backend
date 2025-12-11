import { type PrismaClient, type User } from "@prisma/client";
import bcrypt from "bcryptjs";
import { UserRepository, type UserPublic } from "../repositories/userRepository.js";
import { validateEmail } from "../../lib/validation/emailValidation.js";
import { validatePassword } from "../../lib/validation/passwordValidation.js";
import { throwBadInput, throwUnauthenticated, throwEmailNotVerified, throwEmailInUse } from "../../lib/errors/GraphQLErrors.js";
import { signJwt } from "../lib/auth.js";
import { sendVerificationEmail } from "../emailFlows.js";
import { verifyGoogleIdToken } from "../lib/verify-google-auth-token.js";
import { logger } from "../../lib/logger.js";

export class AuthService {
    private userRepository: UserRepository;

    constructor(private prisma: PrismaClient) {
        this.userRepository = new UserRepository(prisma);
    }

    async register(args: {
        email: string;
        password: string;
        displayName: string;
    }): Promise<{ user: UserPublic }> {
        const email = validateEmail(args.email?.trim());
        const password = validatePassword(args.password);
        const displayName = args.displayName?.trim();

        if (!displayName) {
            throwBadInput("Display name is required");
        }

        // Check if email already in use
        const existing = await this.userRepository.findByEmail(email);
        if (existing) {
            throwEmailInUse();
        }

        const passwordHash = await bcrypt.hash(password, 12);

        const user = await this.userRepository.create({
            email,
            passwordHash,
            displayName,
            emailVerified: false,
        });

        // Send verification email (fire and forget)
        sendVerificationEmail(user).catch((err) =>
            logger.error("Failed to send verification email", err, { userId: user.id, email: user.email })
        );

        return { user };
    }

    async login(args: {
        email: string;
        password: string;
    }, setCookie: (token: string) => void): Promise<{ user: { id: string; email: string; createdAt: Date; displayName: string }; token: string }> {
        const user = await this.userRepository.findByEmailWithPassword(args.email);

        if (!user || !user.passwordHash) {
            throwUnauthenticated("Invalid credentials");
        }

        const ok = await bcrypt.compare(args.password, user.passwordHash);
        if (!ok) {
            throwUnauthenticated("Invalid credentials");
        }

        if (!user.emailVerified) {
            throwEmailNotVerified();
        }

        const token = signJwt({ sub: user.id });
        setCookie(token);

        return {
            user: {
                id: user.id,
                email: user.email,
                createdAt: user.createdAt,
                displayName: user.displayName,
            },
            token,
        };
    }

    async loginWithGoogle(args: {
        idToken: string;
    }, setCookie: (token: string) => void): Promise<{ user: UserPublic; token: string }> {
        const { googleId, email, displayName } = await verifyGoogleIdToken(args.idToken);

        // Try to find existing user by googleId or email
        let user = await this.userRepository.findByGoogleId(googleId);

        if (!user) {
            const existingByEmail = await this.userRepository.findByEmail(email);
            if (existingByEmail) {
                // Link Google to existing account
                user = await this.userRepository.update({
                    id: existingByEmail.id,
                    googleId,
                    emailVerified: true,
                });
            } else {
                // Create new user, no passwordHash
                user = await this.userRepository.create({
                    email,
                    displayName,
                    googleId,
                    emailVerified: true,
                });
            }
        }

        const token = signJwt({ sub: user.id });
        setCookie(token);

        return { user, token };
    }
}

