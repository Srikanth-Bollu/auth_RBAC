// middleware/authMiddleware.js
import jwt from "jsonwebtoken";

/**
 * authenticate: verifies access token (Authorization: Bearer <token>)
 * If valid, attaches user info to req.user -> { id, role, iat, exp }
 */
export const authenticate = (req, res, next) => {
  try {
    const authHeader = req.headers.authorization || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

    if (!token) return res.status(401).json({ message: "No access token provided" });

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    req.user = { id: decoded.id, role: decoded.role };
    next();
  } catch (err) {
    return res.status(401).json({ message: "Invalid or expired access token" });
  }
};
