import express from "express";
import jwt from "jsonwebtoken";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";

// =========================================================================

const router = express.Router();
const prisma = new PrismaClient();

// =========================================================================

router.get("/me", async (req, res) => {

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

    if (!decoded) {
      return res.status(401).json({ valid: false, message: "User not found" });
    }

    res.json({
      valid: true,
      user: {
        id: decoded.id,
        name: decoded.name,
        email: decoded.email,
        role: decoded.role.toLowerCase(),
      },
    });
  } catch (err) {
    res.status(401).json({ valid: false, message: "Invalid token" });
  }
});

// =========================================================================

router.post("/register", async (req, res) => {
  // console.log(req.body);

  const { name, email, password, role, department, studentId, employeeId } =
    req.body;

  try {
    if (!["STUDENT", "COUNSELOR", "CHAIRPERSON", 'ADMIN'].includes(role.toUpperCase())) {
      return res.status(400).json({ message: "Invalid role specified" });
    }

    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({ message: "email already exists" });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Insert into the appropriate table
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: role ? role.toUpperCase() : "STUDENT",
        department,
        studentId: studentId !== "" ? studentId : undefined,
        employeeId: employeeId !== "" ? employeeId : undefined,
      },
    });

    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role.toLowerCase(),
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    res.status(201).json({
      token,
      message: "Registration successful",
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// =========================================================================

router.post("/login", async (req, res) => {
  const { email, password } = req.body;

  try {
    const user = await prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      return res.status(400).json({ message: "Access Denied" });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(400).json({ message: "Access Denied" });
    }

    const token = jwt.sign(
      {
        email: user.email,
        id: user.id,
        role: user.role.toLowerCase(),
        name: user.name,
      },
      process.env.JWT_SECRET,
      { expiresIn: "1h" }
    );

    // console.log(user);
    res.status(200).json({
      message: "User logged in successfully",
      token,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
        role: user.role.toLowerCase(),
      },
    });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// =========================================================================

router.post("/logout", async (req, res) => {
  try {
    res.status(200).json({ message: "Logged out successfully" });
  } catch (err) {
    console.error(err);
    res.status(500).json({ message: "Server Error" });
  }
});

// =========================================================================

// Change password (All authenticated users)
router.post("/change-password", async (req, res) => {
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

    const { currentPassword, newPassword } = req.body;

    // Validation
    if (!currentPassword || !newPassword) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Current password and new password are required"
        }
      });
    }

    if (newPassword.length < 6) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "New password must be at least 6 characters long"
        }
      });
    }

    // Verify current password
    const isCurrentPasswordValid = await bcrypt.compare(currentPassword, user.password);
    if (!isCurrentPasswordValid) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Current password is incorrect"
        }
      });
    }

    // Hash new password
    const hashedNewPassword = await bcrypt.hash(newPassword, 10);

    // Update password
    await prisma.user.update({
      where: { id: user.id },
      data: { password: hashedNewPassword }
    });

    res.json({
      success: true,
      message: "Password changed successfully"
    });
  } catch (error) {
    console.error("Error changing password:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to change password"
      }
    });
  }
});

// =========================================================================

export default router;
