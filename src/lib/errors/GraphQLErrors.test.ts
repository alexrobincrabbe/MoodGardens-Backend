import { describe, it, expect } from "vitest";
import { GraphQLError } from "graphql";
import {
    ErrorCode,
    createGraphQLError,
    throwBadInput,
    throwUnauthenticated,
    throwEmailNotVerified,
    throwEmailInUse,
    throwInternalError,
} from "./GraphQLErrors.js";

describe("GraphQLErrors", () => {
    describe("createGraphQLError", () => {
        it("should create GraphQL error with correct code", () => {
            const error = createGraphQLError("Test message", ErrorCode.BAD_USER_INPUT);
            expect(error).toBeInstanceOf(GraphQLError);
            expect(error.message).toBe("Test message");
            expect(error.extensions?.code).toBe(ErrorCode.BAD_USER_INPUT);
        });

        it("should include custom extensions", () => {
            const error = createGraphQLError("Test", ErrorCode.BAD_USER_INPUT, {
                field: "email",
                custom: "value",
            });
            expect(error.extensions?.field).toBe("email");
            expect(error.extensions?.custom).toBe("value");
        });
    });

    describe("throwBadInput", () => {
        it("should throw GraphQL error with BAD_USER_INPUT code", () => {
            expect(() => throwBadInput("Invalid input")).toThrow(GraphQLError);
            try {
                throwBadInput("Invalid input");
            } catch (error) {
                expect(error).toBeInstanceOf(GraphQLError);
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.code).toBe(ErrorCode.BAD_USER_INPUT);
                    expect(error.message).toBe("Invalid input");
                }
            }
        });

        it("should include custom extensions", () => {
            try {
                throwBadInput("Invalid", { field: "email" });
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.field).toBe("email");
                }
            }
        });
    });

    describe("throwUnauthenticated", () => {
        it("should throw GraphQL error with UNAUTHENTICATED code", () => {
            expect(() => throwUnauthenticated()).toThrow(GraphQLError);
            try {
                throwUnauthenticated("Custom message");
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.code).toBe(ErrorCode.UNAUTHENTICATED);
                    expect(error.message).toBe("Custom message");
                }
            }
        });

        it("should use default message if not provided", () => {
            try {
                throwUnauthenticated();
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.message).toBe("Not authenticated");
                }
            }
        });
    });

    describe("throwEmailNotVerified", () => {
        it("should throw GraphQL error with EMAIL_NOT_VERIFIED code", () => {
            expect(() => throwEmailNotVerified()).toThrow(GraphQLError);
            try {
                throwEmailNotVerified("Custom message");
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.code).toBe(ErrorCode.EMAIL_NOT_VERIFIED);
                    expect(error.message).toBe("Custom message");
                }
            }
        });
    });

    describe("throwEmailInUse", () => {
        it("should throw GraphQL error with EMAIL_IN_USE code", () => {
            expect(() => throwEmailInUse()).toThrow(GraphQLError);
            try {
                throwEmailInUse("Custom message");
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.code).toBe(ErrorCode.EMAIL_IN_USE);
                    expect(error.message).toBe("Custom message");
                }
            }
        });
    });

    describe("throwInternalError", () => {
        it("should throw GraphQL error with INTERNAL_SERVER_ERROR code", () => {
            expect(() => throwInternalError()).toThrow(GraphQLError);
            try {
                throwInternalError("Custom message");
            } catch (error) {
                if (error instanceof GraphQLError) {
                    expect(error.extensions?.code).toBe(ErrorCode.INTERNAL_SERVER_ERROR);
                    expect(error.message).toBe("Custom message");
                }
            }
        });
    });
});

