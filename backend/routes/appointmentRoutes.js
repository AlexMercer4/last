import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";
import { createAppointmentNotification } from "../utils/notificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get appointments with filtering
router.get("/", protect(), async (req, res) => {
  try {
    const {
      status,
      counselorId,
      studentId,
      type,
      startDate,
      endDate,
      page = 1,
      limit = 10,
    } = req.query;

    const user = req.user;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Build where clause based on user role and filters
    let where = {};

    // Role-based filtering
    if (user.role === "STUDENT") {
      where.studentId = user.id;
    } else if (user.role === "COUNSELOR") {
      where.counselorId = user.id;
    }
    // CHAIRPERSON and ADMIN can see all appointments

    // Apply additional filters
    if (status) {
      where.status = status.toUpperCase();
    }
    if (counselorId && (user.role === "CHAIRPERSON" || user.role === "ADMIN")) {
      where.counselorId = counselorId;
    }
    if (studentId && (user.role === "COUNSELOR" || user.role === "CHAIRPERSON" || user.role === "ADMIN")) {
      where.studentId = studentId;
    }
    if (type) {
      where.type = { contains: type, mode: "insensitive" };
    }
    if (startDate || endDate) {
      where.date = {};
      if (startDate) {
        where.date.gte = new Date(startDate);
      }
      if (endDate) {
        where.date.lte = new Date(endDate);
      }
    }

    const [appointments, total] = await Promise.all([
      prisma.appointment.findMany({
        where,
        include: {
          student: {
            select: {
              id: true,
              name: true,
              email: true,
              studentId: true,
              department: true,
            },
          },
          counselor: {
            select: {
              id: true,
              name: true,
              email: true,
              employeeId: true,
              department: true,
            },
          },
        },
        orderBy: { date: "desc" },
        skip,
        take: parseInt(limit),
      }),
      prisma.appointment.count({ where }),
    ]);

    res.json({
      success: true,
      data: appointments,
      pagination: {
        page: parseInt(page),
        limit: parseInt(limit),
        total,
        pages: Math.ceil(total / parseInt(limit)),
      },
    });
  } catch (error) {
    console.error("Error fetching appointments:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch appointments",
      },
    });
  }
});

// Get appointment by ID
router.get("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    const appointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });

    if (!appointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    // Check access permissions
    const hasAccess =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      appointment.studentId === user.id ||
      appointment.counselorId === user.id;

    if (!hasAccess) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to view this appointment",
        },
      });
    }

    res.json({
      success: true,
      data: appointment,
    });
  } catch (error) {
    console.error("Error fetching appointment:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch appointment",
      },
    });
  }
});

// Create appointment
router.post("/", protect(["STUDENT", "COUNSELOR", "CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const {
      date,
      startTime,
      endTime,
      duration,
      location,
      type,
      notes,
      studentId,
      counselorId,
    } = req.body;

    const user = req.user;

    // Validation
    if (!date || !startTime || !endTime || !duration || !type || !counselorId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Date, start time, end time, duration, type, and counselor are required",
        },
      });
    }

    // Determine student ID based on user role
    let finalStudentId = studentId;
    if (user.role === "STUDENT") {
      finalStudentId = user.id; // Students can only book for themselves
    } else if (!studentId) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Student ID is required when booking for others",
        },
      });
    }

    // Verify counselor exists and is active
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId, role: "COUNSELOR", isActive: true },
    });

    if (!counselor) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid counselor selected",
        },
      });
    }

    // Verify student exists and is active
    const student = await prisma.user.findUnique({
      where: { id: finalStudentId, role: "STUDENT", isActive: true },
    });

    if (!student) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Invalid student selected",
        },
      });
    }

    // Check for conflicting appointments
    const appointmentDate = new Date(date);
    const conflictingAppointment = await prisma.appointment.findFirst({
      where: {
        counselorId,
        date: appointmentDate,
        startTime,
        status: {
          in: ["PENDING", "CONFIRMED"],
        },
      },
    });

    if (conflictingAppointment) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Counselor is not available at the selected time",
        },
      });
    }

    // Create appointment
    const appointment = await prisma.appointment.create({
      data: {
        date: appointmentDate,
        startTime,
        endTime,
        duration: parseInt(duration),
        location,
        type,
        notes,
        studentId: finalStudentId,
        counselorId,
        status: "PENDING",
      },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });

    // Create notifications using notification service
    await createAppointmentNotification(req.io, appointment, 'booked', user.id);

    res.status(201).json({
      success: true,
      data: appointment,
      message: "Appointment booked successfully",
    });
  } catch (error) {
    console.error("Error creating appointment:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create appointment",
      },
    });
  }
});
// Update appointment
router.put("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const {
      date,
      startTime,
      endTime,
      duration,
      location,
      type,
      notes,
      status,
    } = req.body;

    const user = req.user;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        student: true,
        counselor: true,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    // Check permissions
    const canUpdate =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      existingAppointment.studentId === user.id ||
      existingAppointment.counselorId === user.id;

    if (!canUpdate) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to update this appointment",
        },
      });
    }

    // Prepare update data
    const updateData = {};
    if (date !== undefined) updateData.date = new Date(date);
    if (startTime !== undefined) updateData.startTime = startTime;
    if (endTime !== undefined) updateData.endTime = endTime;
    if (duration !== undefined) updateData.duration = parseInt(duration);
    if (location !== undefined) updateData.location = location;
    if (type !== undefined) updateData.type = type;
    if (notes !== undefined) updateData.notes = notes;
    if (status !== undefined) updateData.status = status.toUpperCase();

    // Check for conflicts if time/date is being changed
    if (date || startTime) {
      const checkDate = date ? new Date(date) : existingAppointment.date;
      const checkStartTime = startTime || existingAppointment.startTime;

      const conflictingAppointment = await prisma.appointment.findFirst({
        where: {
          id: { not: id },
          counselorId: existingAppointment.counselorId,
          date: checkDate,
          startTime: checkStartTime,
          status: {
            in: ["PENDING", "CONFIRMED"],
          },
        },
      });

      if (conflictingAppointment) {
        return res.status(400).json({
          success: false,
          error: {
            code: "VALIDATION_ERROR",
            message: "Counselor is not available at the selected time",
          },
        });
      }
    }

    // Update appointment
    const updatedAppointment = await prisma.appointment.update({
      where: { id },
      data: updateData,
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });

    // Create notifications for rescheduling
    if (date || startTime) {
      await createAppointmentNotification(req.io, updatedAppointment, 'rescheduled', user.id);
    }

    res.json({
      success: true,
      data: updatedAppointment,
      message: "Appointment updated successfully",
    });
  } catch (error) {
    console.error("Error updating appointment:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to update appointment",
      },
    });
  }
});

// Cancel appointment
router.delete("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const user = req.user;

    // Get existing appointment
    const existingAppointment = await prisma.appointment.findUnique({
      where: { id },
      include: {
        student: true,
        counselor: true,
      },
    });

    if (!existingAppointment) {
      return res.status(404).json({
        success: false,
        error: {
          code: "APPOINTMENT_NOT_FOUND",
          message: "Appointment not found",
        },
      });
    }

    // Check permissions
    const canCancel =
      user.role === "ADMIN" ||
      user.role === "CHAIRPERSON" ||
      existingAppointment.studentId === user.id ||
      existingAppointment.counselorId === user.id;

    if (!canCancel) {
      return res.status(403).json({
        success: false,
        error: {
          code: "ACCESS_DENIED",
          message: "You don't have permission to cancel this appointment",
        },
      });
    }

    // Update appointment status to cancelled
    const cancelledAppointment = await prisma.appointment.update({
      where: { id },
      data: { status: "CANCELLED" },
      include: {
        student: {
          select: {
            id: true,
            name: true,
            email: true,
            studentId: true,
            department: true,
          },
        },
        counselor: {
          select: {
            id: true,
            name: true,
            email: true,
            employeeId: true,
            department: true,
          },
        },
      },
    });

    // Create notifications using notification service
    await createAppointmentNotification(req.io, cancelledAppointment, 'cancelled', user.id);

    res.json({
      success: true,
      data: cancelledAppointment,
      message: "Appointment cancelled successfully",
    });
  } catch (error) {
    console.error("Error cancelling appointment:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to cancel appointment",
      },
    });
  }
});

// Get counselor availability
router.get("/availability/:counselorId", protect(), async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { date, startDate, endDate } = req.query;

    // Verify counselor exists
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId, role: "COUNSELOR", isActive: true },
    });

    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: {
          code: "COUNSELOR_NOT_FOUND",
          message: "Counselor not found",
        },
      });
    }

    // Get counselor's availability schedule
    const availability = await prisma.availability.findMany({
      where: { userId: counselorId },
    });

    // Get existing appointments for the counselor
    let appointmentWhere = {
      counselorId,
      status: {
        in: ["PENDING", "CONFIRMED"],
      },
    };

    if (date) {
      appointmentWhere.date = new Date(date);
    } else if (startDate && endDate) {
      appointmentWhere.date = {
        gte: new Date(startDate),
        lte: new Date(endDate),
      };
    }

    const existingAppointments = await prisma.appointment.findMany({
      where: appointmentWhere,
      select: {
        date: true,
        startTime: true,
        endTime: true,
      },
    });

    res.json({
      success: true,
      data: {
        counselor: {
          id: counselor.id,
          name: counselor.name,
          department: counselor.department,
        },
        availability,
        bookedSlots: existingAppointments,
      },
    });
  } catch (error) {
    console.error("Error fetching availability:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch availability",
      },
    });
  }
});

// Set counselor availability (Admin/Chairperson only)
router.post("/availability/:counselorId", protect(["ADMIN", "CHAIRPERSON"]), async (req, res) => {
  try {
    const { counselorId } = req.params;
    const { availability } = req.body;

    // Verify counselor exists
    const counselor = await prisma.user.findUnique({
      where: { id: counselorId, role: "COUNSELOR", isActive: true },
    });

    if (!counselor) {
      return res.status(404).json({
        success: false,
        error: {
          code: "COUNSELOR_NOT_FOUND",
          message: "Counselor not found",
        },
      });
    }

    // Validate availability data
    if (!Array.isArray(availability)) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Availability must be an array",
        },
      });
    }

    // Delete existing availability
    await prisma.availability.deleteMany({
      where: { userId: counselorId },
    });

    // Create new availability records
    const availabilityRecords = availability.map(slot => ({
      userId: counselorId,
      dayOfWeek: slot.dayOfWeek.toUpperCase(),
      startTime: slot.startTime,
      endTime: slot.endTime,
    }));

    await prisma.availability.createMany({
      data: availabilityRecords,
    });

    // Fetch updated availability
    const updatedAvailability = await prisma.availability.findMany({
      where: { userId: counselorId },
    });

    res.json({
      success: true,
      data: updatedAvailability,
      message: "Availability updated successfully",
    });
  } catch (error) {
    console.error("Error setting availability:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to set availability",
      },
    });
  }
});

export default router;