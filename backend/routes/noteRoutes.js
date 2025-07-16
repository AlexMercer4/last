import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get student notes for a specific student
router.get("/students/:studentId", protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { search, startDate, endDate, page = 1, limit = 10 } = req.query;
    const user = req.user;

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: "STUDENT", isActive: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: "STUDENT_NOT_FOUND",
          message: "Student not found",
        },
      });
    }

    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause
    let where = {
      studentId,
    };

    // Role-based filtering for privacy
    if (user.role === "COUNSELOR") {
      // Counselors can only see their own notes or non-private notes
      where.OR = [
        { counselorId: user.id },
        { isPrivate: false },
      ];
    }
    // CHAIRPERSON and ADMIN can see all notes

    // Apply search filter
    if (search) {
      where.OR = [
        ...(where.OR || []),
        { title: { contains: search, mode: "insensitive" } },
        { content: { contains: search, mode: "insensitive" } },
      ];
    }

    // Apply date filter
    if (startDate || endDate) {
      where.sessionDate = {};
      if (startDate) {
        where.sessionDate.gte = new Date(startDate);
      }
      if (endDate) {
        where.sessionDate.lte = new Date(endDate);
      }
    }

    const [notes, total] = await Promise.all([
      prisma.studentNote.findMany({
        where,
        include: {
          counselor: {
            select: {
              id: true,
              name: true,
              employeeId: true,
            },
          },
        },
        orderBy: { sessionDate: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.studentNote.count({ where }),
    ]);

    res.json({
      success: true,
      data: {
        student: {
          id: student.id,
          name: student.name,
          studentId: student.studentId,
          department: student.department,
        },
        notes,
      },
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching student notes:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch student notes",
      },
    });
  }
});

// Create a new student note
router.post("/students/:studentId", protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { studentId } = req.params;
    const { title, content, sessionDate, isPrivate = false } = req.body;
    const user = req.user;

    // Validation
    if (!title || !content || !sessionDate) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Title, content, and session date are required",
        },
      });
    }

    // Verify student exists
    const student = await prisma.user.findUnique({
      where: { id: studentId, role: "STUDENT", isActive: true },
    });

    if (!student) {
      return res.status(404).json({
        success: false,
        error: {
          code: "STUDENT_NOT_FOUND",
          message: "Student not found",
        },
      });
    }

    // Create note
    const note = await prisma.studentNote.create({
      data: {
        studentId,
        counselorId: user.id,
        title,
        content,
        sessionDate: new Date(sessionDate),
        isPrivate: Boolean(isPrivate),
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    res.status(201).json({
      success: true,
      data: note,
      message: "Student note created successfully",
    });
  } catch (error) {
    console.error("Error creating student note:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create student note",
      },
    });
  }
});

// Get a specific note by ID
router.get("/:id", protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const note = await prisma.studentNote.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    if (!note) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTE_NOT_FOUND",
          message: "Note not found",
        },
      });
    }

    // Check access permissions
    const hasAccess =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      note.counselorId === user.id ||
      (user.role === "COUNSELOR" && !note.isPrivate);

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to view this note",
        },
      });
    }

    res.json({
      success: true,
      data: note,
    });
  } catch (error) {
    console.error("Error fetching note:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch note",
      },
    });
  }
});

// Update a student note
router.put("/:id", protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const { title, content, sessionDate, isPrivate } = req.body;
    const user = req.user;

    // Get existing note
    const existingNote = await prisma.studentNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTE_NOT_FOUND",
          message: "Note not found",
        },
      });
    }

    // Check permissions - only the counselor who created the note or admin/chairperson can update
    const canUpdate =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      existingNote.counselorId === user.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to update this note",
        },
      });
    }

    // Prepare update data
    const updateData = {};
    if (title !== undefined) updateData.title = title;
    if (content !== undefined) updateData.content = content;
    if (sessionDate !== undefined) updateData.sessionDate = new Date(sessionDate);
    if (isPrivate !== undefined) updateData.isPrivate = Boolean(isPrivate);

    // Update note
    const updatedNote = await prisma.studentNote.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            employeeId: true,
          },
        },
      },
    });

    res.json({
      success: true,
      data: updatedNote,
      message: "Note updated successfully",
    });
  } catch (error) {
    console.error("Error updating note:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to update note",
      },
    });
  }
});

// Delete a student note
router.delete("/:id", protect(["COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get existing note
    const existingNote = await prisma.studentNote.findUnique({
      where: { id },
    });

    if (!existingNote) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOTE_NOT_FOUND",
          message: "Note not found",
        },
      });
    }

    // Check permissions - only the counselor who created the note or admin/chairperson can delete
    const canDelete =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      existingNote.counselorId === user.id;

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to delete this note",
        },
      });
    }

    // Delete note
    await prisma.studentNote.delete({
      where: { id },
    });

    res.json({
      success: true,
      message: "Note deleted successfully",
    });
  } catch (error) {
    console.error("Error deleting note:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to delete note",
      },
    });
  }
});

export default router;