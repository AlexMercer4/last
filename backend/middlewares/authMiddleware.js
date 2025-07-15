import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";

const prisma = new PrismaClient();

export const protect = (roles = []) => {
  return async (req, res, next) => {
    try {
      // Get token from header
      const token = req.header("Authorization")?.replace("Bearer ", "");

      if (!token) {
        return res
          .status(401)
          .json({ message: "No token, authorization denied" });
      }

      // Verify token
      const decoded = jwt.verify(token, process.env.JWT_SECRET);

      // Check if user still exists
      const user = await prisma.user.findUnique({
        where: { id: decoded.id },
      });

      if (!user) {
        return res.status(401).json({ message: "User not found" });
      }

      // Check if user role is allowed (if roles are specified)
      if (roles.length > 0 && !roles.includes(user.role)) {
        return res.status(403).json({ message: "Access denied" });
      }

      // Attach user and token to request
      req.user = user;
      req.token = token;

      next();
    } catch (err) {
      console.error("Authentication error:", err);

      res.status(500).json({ message: "Server error during authentication" });
    }
  };
};
