import {
    clearAuthCookie,
    type Context,
} from "../../../auth/lib/auth.js";
import { Services } from "../../services.js";
import type {
    RegisterArgs,
    LoginArgs,
    LoginWithGoogleArgs,
} from "../../../types.js";

//QUERIES
//-----------------------------------------------------------------------------
export function createUserQuery(services: Services) {
    return async (_: unknown, __: unknown, ctx: Context) => {
        if (!ctx.userId) return null;
        return services.userRepository.findById(ctx.userId);
    };
}

//MUTATIONS
//-------------------------------------------------------------------------------
export function createRegisterMutation(services: Services) {
    return async (_: unknown, args: RegisterArgs, ctx: Context) => {
        return services.authService.register({
            email: args.email,
            password: args.password,
            displayName: args.displayName,
        });
    };
}

export function createLoginMutation(services: Services) {
    return async (_: unknown, args: LoginArgs, ctx: Context) => {
        const { setAuthCookie } = await import("../../../auth/lib/auth.js");
        return services.authService.login(
            {
                email: args.email,
                password: args.password,
            },
            (token) => setAuthCookie(ctx.res, token)
        );
    };
}

export function createLoginWithGoogleMutation(services: Services) {
    return async (_: unknown, args: LoginWithGoogleArgs, ctx: Context) => {
        const { setAuthCookie } = await import("../../../auth/lib/auth.js");
        return services.authService.loginWithGoogle(
            { idToken: args.idToken },
            (token) => setAuthCookie(ctx.res, token)
        );
    };
}

export function createLogoutMutation(services: Services) {
    return async (_: unknown, __: unknown, ctx: Context) => {
        clearAuthCookie(ctx.res);
        return true;
    };
}
