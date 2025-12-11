import {
    requireUser,
    type Context,
} from "../../../auth/lib/auth.js";
import { Services } from "../../services.js";
import type {
    UpdateUserSettingsArgs,
    UpdateProfileArgs,
    ChangePasswordArgs,
} from "../../../types.js";

export function createUpdateUserSettingsMutation(services: Services) {
    return async (_: unknown, args: UpdateUserSettingsArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.userService.updateSettings({
            userId,
            timezone: args.timezone,
            dayRolloverHour: args.dayRolloverHour,
        });
    };
}

export function createUpdateUserProfileMutation(services: Services) {
    return async (_: unknown, args: UpdateProfileArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.userService.updateProfile({
            userId,
            email: args.email,
            displayName: args.displayName,
        });
    };
}

export function createChangePasswordMutation(services: Services) {
    return async (_: unknown, args: ChangePasswordArgs, ctx: Context) => {
        const userId = requireUser(ctx);
        return services.userService.changePassword({
            userId,
            currentPassword: args.currentPassword,
            newPassword: args.newPassword,
        });
    };
}
