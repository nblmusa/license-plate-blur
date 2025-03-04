"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.errorHandler = exports.ApiError = void 0;
class ApiError extends Error {
    constructor(statusCode, message, isOperational = true) {
        super(message);
        this.statusCode = statusCode;
        this.isOperational = isOperational;
        Object.setPrototypeOf(this, ApiError.prototype);
    }
}
exports.ApiError = ApiError;
const errorHandler = (err, req, res, next) => {
    if (err instanceof ApiError) {
        res.status(err.statusCode).json({
            error: err.message,
            isOperational: err.isOperational
        });
        return;
    }
    // Log unexpected errors
    console.error('Unexpected error:', err);
    // Don't leak error details in production
    const message = process.env.NODE_ENV === 'production'
        ? 'Internal server error'
        : err.message;
    res.status(500).json({
        error: message,
        isOperational: false
    });
};
exports.errorHandler = errorHandler;
