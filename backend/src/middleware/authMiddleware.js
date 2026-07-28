// backend/src/middleware/authMiddleware.js

import jwt from "jsonwebtoken";
import { AppDataSource } from "../data-source.js";
import { User } from "../entities/User.js";

const JWT_SECRET = "11090708";

export const authMiddleware = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;

    if (!authHeader || !authHeader.startsWith("Bearer ")) {
      return res.status(401).json({ message: "No token provided" });
    }

    const token = authHeader.split(" ")[1];

    // Verify token
    const decoded = jwt.verify(token, JWT_SECRET);

    const userRepository = AppDataSource.getRepository(User);
    const user = await userRepository.findOne({
      where: { id: decoded.id },
      relations: ["student", "admin"],
    });

    if (!user) {
      return res.status(401).json({ message: "Invalid token user" });
    }

    // attach user to request
    req.user = user;
    next();
  } catch (err) {
    console.error("Auth Middleware Error:", err);
    return res.status(403).json({ message: "Invalid or expired token" });
  }
};
