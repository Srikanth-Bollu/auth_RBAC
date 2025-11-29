// controllers/authController.js
import User from "../models/User.js";
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

/**
 * Helper: signAccessToken(user)
 * - short-lived token (used in Authorization header)
 */
const signAccessToken = (user) => {
  return jwt.sign(
    { id: user._id.toString(), role: user.role },
    process.env.JWT_SECRET,
    { expiresIn: process.env.JWT_EXPIRES_IN || "15m" }
  );
};

/**
 * Helper: signRefreshToken(user)
 * - long-lived token stored server-side (in DB) and optionally in HttpOnly cookie
 */
const signRefreshToken = (user) => {
  return jwt.sign(
    { id: user._id.toString() },
    process.env.REFRESH_TOKEN_SECRET,
    { expiresIn: process.env.REFRESH_TOKEN_EXPIRES_IN || "7d" }
  );
};

/**
 * Register a new user
 * - expects { name, email, password, role? } in body
 */
export const register = async (req, res) => {
  try {
    const { name, email, password, role } = req.body;

    if (!name || !email || !password) {
      return res.status(400).json({ message: "Name, email and password are required" });
    }

    // Check existing
    const existing = await User.findOne({ email });
    if (existing) return res.status(400).json({ message: "Email already registered" });

    // Hash password
    const hashed = await bcrypt.hash(password, 10);

    // Create user
    const user = await User.create({ name, email, password: hashed, role });

    return res.status(201).json({
      message: "User registered",
      user: { id: user._id, name: user.name, email: user.email, role: user.role }
    });
  } catch (err) {
    console.error("Register error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Login
 * - expects { email, password } in body
 * - returns accessToken + refreshToken
 * - stores refreshToken in user.refreshTokens array
 */
export const login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) return res.status(400).json({ message: "Email and password required" });

    const user = await User.findOne({ email });
    if (!user) return res.status(400).json({ message: "Invalid credentials" });

    const match = await bcrypt.compare(password, user.password);
    if (!match) return res.status(400).json({ message: "Invalid credentials" });

    const accessToken = signAccessToken(user);
    const refreshToken = signRefreshToken(user);

    // Save refresh token to DB (so we can revoke it later)
    user.refreshTokens.push(refreshToken);
    await user.save();

    return res.json({
      message: "Login successful",
      user: { id: user._id, name: user.name, email: user.email, role: user.role },
      accessToken,
      refreshToken
    });
  } catch (err) {
    console.error("Login error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Refresh tokens
 * - accepts { token } in body "
 * - validates token, checks it exists in user's refreshTokens array
 * - issues new accessToken and new refreshToken (rotates)
 */
export const refresh = async (req, res) => {
  try {
    const tokenFromBody = req.body?.token;
    const tokenFromCookie = req.cookies?.refreshToken;
    const token = tokenFromBody || tokenFromCookie;

    if (!token) return res.status(400).json({ message: "Refresh token required" });

    // verify refresh token signature
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      return res.status(403).json({ message: "Invalid refresh token" });
    }

    const userId = decoded.id;
    const user = await User.findById(userId);
    if (!user) return res.status(404).json({ message: "User not found" });

    // Check token exists in DB (hasn't been revoked)
    if (!user.refreshTokens.includes(token)) {
      return res.status(403).json({ message: "Refresh token revoked or not recognized" });
    }

    // Rotate: remove old refresh token and issue a new one
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);

    const newAccessToken = signAccessToken(user);
    const newRefreshToken = signRefreshToken(user);
    user.refreshTokens.push(newRefreshToken);
    await user.save();

    return res.json({
      message: "Tokens refreshed",
      accessToken: newAccessToken,
      refreshToken: newRefreshToken
    });
  } catch (err) {
    console.error("Refresh error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Logout
 * - expects { token } in body
 */
export const logout = async (req, res) => {
  try {
    const token = req.body?.token;
    if (!token) return res.status(400).json({ message: "Refresh token required for logout" });

    // Verify token to get user id (but even without verification we can search user by token)
    let decoded;
    try {
      decoded = jwt.verify(token, process.env.REFRESH_TOKEN_SECRET);
    } catch (err) {
      // If token malformed just return success (idempotent)
      return res.status(200).json({ message: "Logged out" });
    }

    const user = await User.findById(decoded.id);
    if (!user) return res.status(200).json({ message: "Logged out" });

    // Remove the refresh token from DB
    user.refreshTokens = user.refreshTokens.filter(t => t !== token);
    await user.save();

    return res.status(200).json({ message: "Logged out" });
  } catch (err) {
    console.error("Logout error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get profile for logged-in user
 * - protected route (use authenticate middleware)
 */
export const getProfile = async (req, res) => {
  try {
    const user = await User.findById(req.user.id).select("-password -refreshTokens");
    if (!user) return res.status(404).json({ message: "User not found" });
    return res.json(user);
  } catch (err) {
    console.error("Profile error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};

/**
 * Get all users (admin-only)
 */
export const getAllUsers = async (req, res) => {
  try {
    const users = await User.find().select("-password -refreshTokens");
    return res.json(users);
  } catch (err) {
    console.error("getAllUsers error:", err);
    return res.status(500).json({ message: "Server error" });
  }
};
