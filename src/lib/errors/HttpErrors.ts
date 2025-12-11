/**
 * Standard HTTP error for REST routes
 */
export class HttpError extends Error {
    constructor(
        message: string,
        public statusCode: number = 500,
        public code?: string
    ) {
        super(message);
        this.name = "HttpError";
    }
}

/**
 * Creates a 401 Unauthorized error
 */
export function createUnauthorizedError(message: string = "Not authenticated"): HttpError {
    return new HttpError(message, 401, "UNAUTHENTICATED");
}

/**
 * Creates a 400 Bad Request error
 */
export function createBadRequestError(message: string, code?: string): HttpError {
    return new HttpError(message, 400, code);
}

/**
 * Creates a 404 Not Found error
 */
export function createNotFoundError(message: string = "Resource not found"): HttpError {
    return new HttpError(message, 404, "NOT_FOUND");
}

/**
 * Creates a 500 Internal Server Error
 */
export function createInternalError(message: string = "An internal error occurred"): HttpError {
    return new HttpError(message, 500, "INTERNAL_SERVER_ERROR");
}

