// backend/src/middleware/roleMiddleware.js

export const roleMiddleware = (allowedRoles = []) => {
  return (req, res, next) => {
    try {
      const userRole = req.user?.role;

      if (!userRole) {
        return res.status(403).json({ message: "User role not found" });
      }

      if (!allowedRoles.includes(userRole)) {
        return res.status(403).json({ message: "Access denied: insufficient permissions" });
      }

      next();
    } catch (error) {
      console.error("Role Middleware Error:", error);
      return res.status(500).json({ message: "Server error in role check" });
    }
  };
};
