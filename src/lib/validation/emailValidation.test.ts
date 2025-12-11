import { describe, it, expect } from "vitest";
import { isValidEmail, validateEmail } from "./emailValidation.js";

describe("emailValidation", () => {
    describe("isValidEmail", () => {
        it("should return true for valid email addresses", () => {
            expect(isValidEmail("test@example.com")).toBe(true);
            expect(isValidEmail("user.name@example.co.uk")).toBe(true);
            expect(isValidEmail("user+tag@example.com")).toBe(true);
            expect(isValidEmail("user123@example-domain.com")).toBe(true);
        });

        it("should return false for invalid email addresses", () => {
            expect(isValidEmail("invalid")).toBe(false);
            expect(isValidEmail("invalid@")).toBe(false);
            expect(isValidEmail("@example.com")).toBe(false);
            expect(isValidEmail("user@")).toBe(false);
            expect(isValidEmail("user@example")).toBe(false);
            expect(isValidEmail("user space@example.com")).toBe(false);
            expect(isValidEmail("")).toBe(false);
        });
    });

    describe("validateEmail", () => {
        it("should return trimmed email for valid input", () => {
            expect(validateEmail("test@example.com")).toBe("test@example.com");
            expect(validateEmail("  test@example.com  ")).toBe("test@example.com");
        });

        it("should throw error for null or undefined", () => {
            expect(() => validateEmail(null)).toThrow("Email is required");
            expect(() => validateEmail(undefined)).toThrow("Email is required");
        });

        it("should throw error for empty string", () => {
            expect(() => validateEmail("")).toThrow("Email is required");
            expect(() => validateEmail("   ")).toThrow("Email is required");
        });

        it("should throw error for invalid email format", () => {
            expect(() => validateEmail("invalid")).toThrow("Please enter a valid email address");
            expect(() => validateEmail("invalid@")).toThrow("Please enter a valid email address");
            expect(() => validateEmail("@example.com")).toThrow("Please enter a valid email address");
        });
    });
});

