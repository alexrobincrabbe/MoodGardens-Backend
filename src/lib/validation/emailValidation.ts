/**
 * Validates email format
 * Simple but effective email validation
 */
export function isValidEmail(email: string): boolean {
    return /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email);
}

/**
 * Validates that email is not empty and has valid format
 */
export function validateEmail(email: string | null | undefined): string {
    const trimmed = email?.trim();
    if (!trimmed) {
        throw new Error("Email is required");
    }
    if (!isValidEmail(trimmed)) {
        throw new Error("Please enter a valid email address");
    }
    return trimmed;
}

