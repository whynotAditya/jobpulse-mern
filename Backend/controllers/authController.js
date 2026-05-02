import jwt from "jsonwebtoken";
import User from "../models/user.js";
import asyncHandler from "../middleware/asyncHandler.js";

const JWT_SECRET = () => process.env.JWT_SECRET || "jobpulse_dev_secret";
const JWT_EXPIRE = "7d";
const REFRESH_EXPIRE = "30d";

/**
 * Generate an access token.
 */
const generateAccessToken = (id) =>
    jwt.sign({ id }, JWT_SECRET(), { expiresIn: JWT_EXPIRE });

/**
 * Generate a refresh token.
 */
const generateRefreshToken = (id) =>
    jwt.sign({ id }, JWT_SECRET(), { expiresIn: REFRESH_EXPIRE });

/**
 * Set JWT as HttpOnly cookie + return it in the response body.
 */
const sendTokenResponse = (res, user, statusCode = 200) => {
    const accessToken = generateAccessToken(user._id);
    const refreshToken = generateRefreshToken(user._id);

    const isProduction = process.env.NODE_ENV === "production";

    res.cookie("jwt", accessToken, {
        httpOnly: true,
        secure: isProduction,
        sameSite: isProduction ? "none" : "lax",
        maxAge: 7 * 24 * 60 * 60 * 1000, // 7 days
    });

    res.status(statusCode).json({
        success: true,
        accessToken,
        refreshToken,
        user: {
            _id: user._id,
            name: user.name,
            email: user.email,
        },
    });
};

// ────────────────────────────────────────
// POST /api/auth/register
// ────────────────────────────────────────
export const register = asyncHandler(async (req, res) => {
    const { name, email, password } = req.body;

    if (!name || !email || !password) {
        res.status(400);
        throw new Error("Please provide name, email, and password");
    }

    const existingUser = await User.findOne({ email });
    if (existingUser) {
        res.status(400);
        throw new Error("A user with this email already exists");
    }

    const user = await User.create({ name, email, password });
    sendTokenResponse(res, user, 201);
});

// ────────────────────────────────────────
// POST /api/auth/login
// ────────────────────────────────────────
export const login = asyncHandler(async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        res.status(400);
        throw new Error("Please provide email and password");
    }

    // Explicitly select password for comparison
    const user = await User.findOne({ email }).select("+password");
    if (!user || !(await user.matchPassword(password))) {
        res.status(401);
        throw new Error("Invalid email or password");
    }

    sendTokenResponse(res, user);
});

// ────────────────────────────────────────
// POST /api/auth/logout
// ────────────────────────────────────────
export const logout = asyncHandler(async (_req, res) => {
    res.cookie("jwt", "", {
        httpOnly: true,
        expires: new Date(0),
    });

    res.json({ success: true, message: "Logged out successfully" });
});

// ────────────────────────────────────────
// GET /api/auth/me
// ────────────────────────────────────────
export const getMe = asyncHandler(async (req, res) => {
    res.json({
        success: true,
        user: {
            _id: req.user._id,
            name: req.user.name,
            email: req.user.email,
        },
    });
});

// ────────────────────────────────────────
// POST /api/auth/refresh
// ────────────────────────────────────────
export const refreshToken = asyncHandler(async (req, res) => {
    const { refreshToken: token } = req.body;

    if (!token) {
        res.status(400);
        throw new Error("Refresh token is required");
    }

    try {
        const decoded = jwt.verify(token, JWT_SECRET());
        const user = await User.findById(decoded.id);

        if (!user) {
            res.status(401);
            throw new Error("User not found");
        }

        const accessToken = generateAccessToken(user._id);

        const isProduction = process.env.NODE_ENV === "production";

        res.cookie("jwt", accessToken, {
            httpOnly: true,
            secure: isProduction,
            sameSite: isProduction ? "none" : "lax",
            maxAge: 7 * 24 * 60 * 60 * 1000,
        });

        res.json({ success: true, accessToken });
    } catch (error) {
        res.status(401);
        throw new Error("Invalid or expired refresh token");
    }
});

// ────────────────────────────────────────
// PUT /api/auth/profile
// ────────────────────────────────────────
export const updateProfile = asyncHandler(async (req, res) => {
    const user = await User.findById(req.user._id);

    if (!user) {
        res.status(404);
        throw new Error("User not found");
    }

    const { name, email } = req.body;

    if (email && email !== user.email) {
        const exists = await User.findOne({ email });
        if (exists) {
            res.status(400);
            throw new Error("Email already in use");
        }
        user.email = email;
    }

    if (name) user.name = name;

    const updated = await user.save();
    res.json({
        success: true,
        user: { _id: updated._id, name: updated.name, email: updated.email },
    });
});

// ────────────────────────────────────────
// PUT /api/auth/password
// ────────────────────────────────────────
export const changePassword = asyncHandler(async (req, res) => {
    const { currentPassword, newPassword } = req.body;

    if (!currentPassword || !newPassword) {
        res.status(400);
        throw new Error("Please provide current and new password");
    }

    if (newPassword.length < 6) {
        res.status(400);
        throw new Error("New password must be at least 6 characters");
    }

    const user = await User.findById(req.user._id).select("+password");

    if (!user || !(await user.matchPassword(currentPassword))) {
        res.status(401);
        throw new Error("Current password is incorrect");
    }

    user.password = newPassword;
    await user.save();

    res.json({ success: true, message: "Password updated successfully" });
});
