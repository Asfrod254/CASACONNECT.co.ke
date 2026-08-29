const jwt = require("jsonwebtoken");
const { createError } = require("../utils/errors");

const authenticateToken = (req, res, next) => {
  const authHeader = req.headers.authorization || "";
  const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : null;

  if (!token) {
    return next(createError(401, "Authentication token is required."));
  }

  try {
    const decoded = jwt.verify(token, process.env.JWT_SECRET || "casaconnect-dev-secret");
    req.user = decoded;
    return next();
  } catch (error) {
    return next(createError(401, "Invalid or expired token."));
  }
};

const requireRole = (...allowedRoles) => (req, res, next) => {
  if (!req.user) {
    return next(createError(401, "Authentication is required."));
  }

  if (!allowedRoles.includes(req.user.role)) {
    return next(createError(403, "You do not have permission to access this route."));
  }

  return next();
};

module.exports = {
  authenticateToken,
  requireRole,
};
