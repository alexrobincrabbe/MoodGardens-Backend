import { GraphQLError } from "graphql";

export enum ErrorCode {
    BAD_USER_INPUT = "BAD_USER_INPUT",
    UNAUTHENTICATED = "UNAUTHENTICATED",
    EMAIL_NOT_VERIFIED = "EMAIL_NOT_VERIFIED",
    EMAIL_IN_USE = "EMAIL_IN_USE",
    INTERNAL_SERVER_ERROR = "INTERNAL_SERVER_ERROR",
}

/**
 * Creates a GraphQL error with a standard error code
 */
export function createGraphQLError(
    message: string,
    code: ErrorCode,
    extensions?: Record<string, unknown>
): GraphQLError {
    return new GraphQLError(message, {
        extensions: {
            code,
            ...extensions,
        },
    });
}

/**
 * Throws a BAD_USER_INPUT error
 */
export function throwBadInput(message: string, extensions?: Record<string, unknown>): never {
    throw createGraphQLError(message, ErrorCode.BAD_USER_INPUT, extensions);
}

/**
 * Throws an UNAUTHENTICATED error
 */
export function throwUnauthenticated(message: string = "Not authenticated"): never {
    throw createGraphQLError(message, ErrorCode.UNAUTHENTICATED);
}

/**
 * Throws an EMAIL_NOT_VERIFIED error
 */
export function throwEmailNotVerified(message: string = "Please verify your email before logging in."): never {
    throw createGraphQLError(message, ErrorCode.EMAIL_NOT_VERIFIED);
}

/**
 * Throws an EMAIL_IN_USE error
 */
export function throwEmailInUse(message: string = "Email already in use."): never {
    throw createGraphQLError(message, ErrorCode.EMAIL_IN_USE);
}

/**
 * Throws an INTERNAL_SERVER_ERROR
 */
export function throwInternalError(message: string = "An internal error occurred"): never {
    throw createGraphQLError(message, ErrorCode.INTERNAL_SERVER_ERROR);
}

