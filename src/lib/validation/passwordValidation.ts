const MIN_PASSWORD_LENGTH = 8;

/**
 * Validates password meets minimum requirements
 */
export function validatePassword(password: string | null | undefined): string {
    if (!password) {
        throw new Error("Password is required");
    }
    if (password.length < MIN_PASSWORD_LENGTH) {
        throw new Error(`Password must be at least ${MIN_PASSWORD_LENGTH} characters long`);
    }
    return password;
}

/**
 * Validates new password for password change operations
 */
export function validateNewPassword(password: string | null | undefined): string {
    return validatePassword(password);
}

