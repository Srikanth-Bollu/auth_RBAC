// middleware/roleMiddleware.js

/**
 * authorizeRole(...roles):
 * - a middleware factory that allows only the specified roles
 * - example: authorizeRole("admin")
 */
export const authorizeRole = (...roles) => {
  return (req, res, next) => {
    const userRole = req.user?.role;
    if (!userRole || !roles.includes(userRole)) {
      return res.status(403).json({ message: "Access denied: insufficient permissions" });
    }
    next();
  };
};
