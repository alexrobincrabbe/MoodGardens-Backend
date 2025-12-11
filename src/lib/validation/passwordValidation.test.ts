import { describe, it, expect } from "vitest";
import { validatePassword, validateNewPassword } from "./passwordValidation.js";

describe("passwordValidation", () => {
    describe("validatePassword", () => {
        it("should return password for valid input", () => {
            expect(validatePassword("password123")).toBe("password123");
            expect(validatePassword("a".repeat(8))).toBe("a".repeat(8));
            expect(validatePassword("a".repeat(100))).toBe("a".repeat(100));
        });

        it("should throw error for null or undefined", () => {
            expect(() => validatePassword(null)).toThrow("Password is required");
            expect(() => validatePassword(undefined)).toThrow("Password is required");
        });

        it("should throw error for empty string", () => {
            expect(() => validatePassword("")).toThrow("Password is required");
        });

        it("should throw error for password shorter than 8 characters", () => {
            expect(() => validatePassword("short")).toThrow("Password must be at least 8 characters long");
            expect(() => validatePassword("1234567")).toThrow("Password must be at least 8 characters long");
        });

        it("should accept password with exactly 8 characters", () => {
            expect(validatePassword("12345678")).toBe("12345678");
        });
    });

    describe("validateNewPassword", () => {
        it("should behave the same as validatePassword", () => {
            expect(validateNewPassword("password123")).toBe("password123");
            expect(() => validateNewPassword(null)).toThrow("Password is required");
            expect(() => validateNewPassword("short")).toThrow("Password must be at least 8 characters long");
        });
    });
});

