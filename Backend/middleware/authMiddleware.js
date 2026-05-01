import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "./asyncHandler.js";

/**
 * Protects routes by verifying the JWT token.
 * Token can be in:
 *   1. Authorization: Bearer <token> header
 *   2. HttpOnly cookie named "jwt"
 */
const protect = asyncHandler(async (req, res, next) => {
    let token;

    // Check Authorization header first
    if (
        req.headers.authorization &&
        req.headers.authorization.startsWith("Bearer")
    ) {
        token = req.headers.authorization.split(" ")[1];
    }

    // Fallback to cookie
    if (!token && req.cookies?.jwt) {
        token = req.cookies.jwt;
    }

    if (!token) {
        res.status(401);
        throw new Error("Not authorized — no token");
    }

    try {
        const decoded = jwt.verify(token, process.env.JWT_SECRET || "jobpulse_dev_secret");
        // Attach user (minus password) to request
        req.user = await User.findById(decoded.id).select("-password");

        if (!req.user) {
            res.status(401);
            throw new Error("Not authorized — user not found");
        }

        next();
    } catch (error) {
        res.status(401);
        throw new Error("Not authorized — token invalid");
    }
});

export default protect;
