import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "sih-coop-os-secure-production-jwt-key-2026";

/**
 * Authenticate JWT Token middleware
 * Attaches decoded user payload to req.user ({ id, role, email, name })
 */
export const authenticateToken = (req, res, next) => {
  const authHeader = req.headers["authorization"];
  const token = authHeader && authHeader.startsWith("Bearer ") ? authHeader.split(" ")[1] : null;

  if (!token) {
    return res.status(401).json({
      success: false,
      error: { code: "UNAUTHORIZED", message: "Authentication token required" },
    });
  }

  try {
    const decoded = jwt.verify(token, JWT_SECRET);
    req.user = decoded;
    next();
  } catch (err) {
    return res.status(403).json({
      success: false,
      error: { code: "INVALID_TOKEN", message: "Invalid or expired authentication token" },
    });
  }
};

/**
 * Role-Based Access Control (RBAC) middleware
 * Ensures user has one of the required roles
 */
export const requireRole = (...allowedRoles) => {
  return (req, res, next) => {
    if (!req.user || !req.user.role) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "User context not found" },
      });
    }

    if (!allowedRoles.includes(req.user.role) && req.user.role !== "platform_admin") {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You do not have permission to perform this action",
        },
      });
    }

    next();
  };
};

/**
 * Object-Level Ownership Authorization middleware
 * Verifies if user owns the record or is a platform admin
 */
export const checkOwnership = (paramKey = "id") => {
  return (req, res, next) => {
    if (!req.user) {
      return res.status(401).json({
        success: false,
        error: { code: "UNAUTHORIZED", message: "Authentication required" },
      });
    }

    const targetId = req.params[paramKey];
    if (req.user.role === "platform_admin") {
      return next();
    }

    if (req.user.id === targetId || req.user.workerId === targetId) {
      return next();
    }

    return res.status(403).json({
      success: false,
      error: {
        code: "FORBIDDEN",
        message: "You are not authorized to access or modify this record",
      },
    });
  };
};

export { JWT_SECRET };
