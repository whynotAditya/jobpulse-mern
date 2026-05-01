/**
 * Centralized error handler.
 * Handles Mongoose validation, cast (bad ObjectId), duplicate key,
 * and generic errors with consistent JSON responses.
 */
const errorHandler = (err, req, res, _next) => {
    let statusCode = res.statusCode === 200 ? 500 : res.statusCode;
    let message = err.message;

    // Mongoose bad ObjectId (CastError)
    if (err.name === "CastError" && err.kind === "ObjectId") {
        statusCode = 404;
        message = "Resource not found";
    }

    // Mongoose validation error
    if (err.name === "ValidationError") {
        statusCode = 400;
        const fields = Object.values(err.errors).map((e) => e.message);
        message = fields.join(", ");
    }

    // Mongoose duplicate key error
    if (err.code === 11000) {
        statusCode = 400;
        const field = Object.keys(err.keyValue)[0];
        message = `Duplicate value for field: ${field}`;
    }

    res.status(statusCode).json({
        success: false,
        message,
        ...(process.env.NODE_ENV !== "production" && { stack: err.stack }),
    });
};

/**
 * Catch-all for undefined routes.
 */
const notFound = (req, res, next) => {
    const error = new Error(`Not Found — ${req.originalUrl}`);
    res.status(404);
    next(error);
};

export { errorHandler, notFound };