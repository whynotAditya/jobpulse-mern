/**
 * Wraps an async route handler so thrown errors are
 * forwarded to Express error middleware automatically.
 * Eliminates repetitive try-catch in every controller.
 */
const asyncHandler = (fn) => (req, res, next) => {
    Promise.resolve(fn(req, res, next)).catch(next);
};

export default asyncHandler;
