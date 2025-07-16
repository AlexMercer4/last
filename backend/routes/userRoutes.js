import express from "express";
import bcrypt from "bcrypt";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get all users (Admin/Chairperson only)
router.get("/", protect(["ADMIN", "CHAIRPERSON"]), async (req, res) => {
  try {
    const { role, search, department } = req.query;

    const where = {
      isActive: true,
      ...(role && { role: role.toUpperCase() }),
      ...(department && {
        department: { contains: department, mode: "insensitive" },
      }),
      ...(search && {
        OR: [
          { name: { contains: search, mode: "insensitive" } },
          { email: { contains: search, mode: "insensitive" } },
          { studentId: { contains: search, mode: "insensitive" } },
          { employeeId: { contains: search, mode: "insensitive" } },
        ],
      }),
    };

    const users = await prisma.user.findMany({
      where,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        studentId: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
      orderBy: { createdAt: "desc" },
    });

    res.json({
      success: true,
      data: users,
    });
  } catch (error) {
    console.error("Error fetching users:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch users",
      },
    });
  }
});

// Get students (Counselor/Chairperson/Admin)
router.get(
  "/students",
  protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]),
  async (req, res) => {
    try {
      const { search, department } = req.query;

      const where = {
        role: "STUDENT",
        isActive: true,
        ...(department && {
          department: { contains: department, mode: "insensitive" },
        }),
        ...(search && {
          OR: [
            { name: { contains: search, mode: "insensitive" } },
            { email: { contains: search, mode: "insensitive" } },
            { studentId: { contains: search, mode: "insensitive" } },
          ],
        }),
      };

      const students = await prisma.user.findMany({
        where,
        select: {
          id: true,
          name: true,
          email: true,
          department: true,
          studentId: true,
          createdAt: true,
        },
        orderBy: { name: "asc" },
      });

      res.json({
        success: true,
        data: students,
      });
    } catch (error) {
      console.error("Error fetching students:", error);
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to fetch students",
        },
      });
    }
  }
);

// Get counselors (All roles)
router.get("/counselors", protect(), async (req, res) => {
  try {
    const counselors = await prisma.user.findMany({
      where: {
        role: "COUNSELOR",
        isActive: true,
      },
      select: {
        id: true,
        name: true,
        email: true,
        department: true,
        employeeId: true,
      },
      orderBy: { name: "asc" },
    });

    res.json({
      success: true,
      data: counselors,
    });
  } catch (error) {
    console.error("Error fetching counselors:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch counselors",
      },
    });
  }
});

// Get user by ID
router.get("/:id", protect(["ADMIN", "CHAIRPERSON", "COUNSELOR"]), async (req, res) => {
  try {
    const { id } = req.params;

    const user = await prisma.user.findUnique({
      where: { id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        studentId: true,
        employeeId: true,
        isActive: true,
        createdAt: true,
        updatedAt: true,
      },
    });

    if (!user) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    res.json({
      success: true,
      data: user,
    });
  } catch (error) {
    console.error("Error fetching user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch user",
      },
    });
  }
});

// Create user (Admin only for chairpersons, Admin/Chairperson for others)
router.post("/", protect(["ADMIN", "CHAIRPERSON"]), async (req, res) => {
  try {
    const { name, email, password, role, department, studentId, employeeId } =
      req.body;

    // Validation
    if (!name || !email || !password || !role || !department) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Name, email, password, role, and department are required",
        },
      });
    }

    const roleUpper = role.toUpperCase();

    // Check if trying to create chairperson - only admins can do this
    if (roleUpper === "CHAIRPERSON" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Only admins can create chairperson accounts",
        },
      });
    }

    // Check if trying to create admin - not allowed
    if (roleUpper === "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Admin accounts cannot be created through this endpoint",
        },
      });
    }

    // Validate role
    if (!["STUDENT", "COUNSELOR", "CHAIRPERSON"].includes(roleUpper)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid role specified",
        },
      });
    }

    // Check if email already exists
    const existingUser = await prisma.user.findUnique({
      where: { email },
    });

    if (existingUser) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Email already exists",
        },
      });
    }

    // Hash password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create user
    const user = await prisma.user.create({
      data: {
        name,
        email,
        password: hashedPassword,
        role: roleUpper,
        department,
        studentId: studentId || null,
        employeeId: employeeId || null,
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        studentId: true,
        employeeId: true,
        createdAt: true,
      },
    });

    res.status(201).json({
      success: true,
      data: user,
      message: "User created successfully",
    });
  } catch (error) {
    console.error("Error creating user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create user",
      },
    });
  }
});

// Update user (Admin/Chairperson for profile updates)
router.put("/:id", protect(["ADMIN", "CHAIRPERSON"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { name, email, role, department, studentId, employeeId, isActive } =
      req.body;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    // Prevent chairpersons from editing admin accounts
    if (existingUser.role === "ADMIN" && req.user.role !== "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Cannot edit admin accounts",
        },
      });
    }

    // Check if trying to change role to chairperson - only admins can do this
    if (
      role &&
      role.toUpperCase() === "CHAIRPERSON" &&
      req.user.role !== "ADMIN"
    ) {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Only admins can assign chairperson role",
        },
      });
    }

    // Check if trying to change role to admin - not allowed
    if (role && role.toUpperCase() === "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Cannot assign admin role through this endpoint",
        },
      });
    }

    // Check if email is being changed and already exists
    if (email && email !== existingUser.email) {
      const emailExists = await prisma.user.findUnique({
        where: { email },
      });

      if (emailExists) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Email already exists",
          },
        });
      }
    }

    // Prepare update data
    const updateData = {};
    if (name !== undefined) updateData.name = name;
    if (email !== undefined) updateData.email = email;
    if (role !== undefined) updateData.role = role.toUpperCase();
    if (department !== undefined) updateData.department = department;
    if (studentId !== undefined) updateData.studentId = studentId || null;
    if (employeeId !== undefined) updateData.employeeId = employeeId || null;
    if (isActive !== undefined) updateData.isActive = isActive;

    // Update user
    const updatedUser = await prisma.user.update({
      where: { id },
      data: updateData,
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        studentId: true,
        employeeId: true,
        isActive: true,
        updatedAt: true,
      },
    });

    res.json({
      success: true,
      data: updatedUser,
      message: "User updated successfully",
    });
  } catch (error) {
    console.error("Error updating user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to update user",
      },
    });
  }
});

// Delete user (Admin only)
router.delete("/:id", protect(["ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;

    // Check if user exists
    const existingUser = await prisma.user.findUnique({
      where: { id },
    });

    if (!existingUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: "USER_NOT_FOUND",
          message: "User not found",
        },
      });
    }

    // Prevent deleting admin accounts
    if (existingUser.role === "ADMIN") {
      return res.status(403).json({
        success: false,
        error: {
          code: "AUTHORIZATION_ERROR",
          message: "Cannot delete admin accounts",
        },
      });
    }

    // Soft delete by setting isActive to false
    await prisma.user.update({
      where: { id },
      data: { isActive: false },
    });

    res.json({
      success: true,
      message: "User deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting user:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to delete user",
      },
    });
  }
});

export default router;
