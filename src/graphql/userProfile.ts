import { PrismaClient } from "@prisma/client";
import {
    requireUser,
    type Context,
} from "../lib/auth/auth.js";
import { UserPublicFields } from "./const.js";
import { GraphQLError } from "graphql";
import bcrypt from "bcryptjs";


type UpdateUserSettingsArgs = { timezone: string; dayRolloverHour: number; };
type UpdateProfileArgs = { email: string; displayName: string; }

export function createUpdateUserSettingsMutation(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: UpdateUserSettingsArgs,
            ctx: Context,
        ) => {
            const userId = requireUser(ctx);
            const safeHour = Math.min(23, Math.max(0, Math.floor(args.dayRolloverHour)));
            const updated = await prisma.user.update({
                where: { id: userId },
                data: {
                    timezone: args.timezone,
                    dayRolloverHour: safeHour,
                },
                select: UserPublicFields,
            });
            return updated;
        }
    )
}

export function createUpdateUserProfileMutation(prisma: PrismaClient) {
    return (
        async (_: unknown, args: UpdateProfileArgs, ctx: Context) => {
            const userId = requireUser(ctx);
            const email = args.email.trim();
            const displayName = args.displayName.trim();
            if (!email) {
                throw new GraphQLError("Email cannot be empty.", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            if (!displayName) {
                throw new GraphQLError("Display name cannot be empty.", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }
            try {
                const updated = await prisma.user.update({
                    where: { id: userId },
                    data: { email, displayName },
                    select: {
                        id: true,
                        email: true,
                        displayName: true,
                    },
                });
                return updated;
            } catch (err: any) {
                console.error("[updateUserProfile] prisma error:", err);
                if (err.code === "P2002") {
                    const target = err.meta?.target;
                    const isEmailTarget =
                        typeof target === "string"
                            ? target.includes("email")
                            : Array.isArray(target) && target.includes("email");
                    if (isEmailTarget) {
                        throw new GraphQLError("That email address is already in use.", {
                            extensions: { code: "BAD_USER_INPUT" },
                        });
                    }
                }
                throw new GraphQLError("Could not update profile.", {
                    extensions: { code: "INTERNAL_SERVER_ERROR" },
                });
            }
        }
    )
}

export function createChangePasswordMutation(prisma: PrismaClient) {
    return (
        async (
            _: unknown,
            args: { currentPassword: string; newPassword: string },
            ctx: Context
        ) => {
            const userId = requireUser(ctx);

            const user = await prisma.user.findUnique({
                where: { id: userId },
                select: { passwordHash: true },
            });

            if (!user || !user.passwordHash) {
                throw new GraphQLError("User not found.", {
                    extensions: { code: "UNAUTHENTICATED" },
                });
            }

            // 1. Check current password
            const ok = await bcrypt.compare(args.currentPassword, user.passwordHash);
            if (!ok) {
                throw new GraphQLError("Your current password is incorrect.", {
                    extensions: { code: "BAD_USER_INPUT" },
                });
            }

            // 2. Basic strength check
            if (args.newPassword.length < 8) {
                throw new GraphQLError(
                    "New password must be at least 8 characters long.",
                    { extensions: { code: "BAD_USER_INPUT" } }
                );
            }

            // 3. Hash and save new password
            const newHash = await bcrypt.hash(args.newPassword, 12);

            await prisma.user.update({
                where: { id: userId },
                data: { passwordHash: newHash },
            });

            return true;
        }
    )
}
