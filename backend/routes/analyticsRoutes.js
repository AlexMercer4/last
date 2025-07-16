import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get dashboard statistics
router.get("/dashboard", protect(["CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Get basic counts
    const [
      totalStudents,
      totalCounselors,
      totalAppointments,
      pendingAppointments,
      confirmedAppointments,
      completedAppointments,
      cancelledAppointments,
      totalNotes,
      totalConversations,
      totalMessages,
    ] = await Promise.all([
      // User counts
      prisma.user.count({
        where: { role: "STUDENT", isActive: true },
      }),
      prisma.user.count({
        where: { role: "COUNSELOR", isActive: true },
      }),

      // Appointment counts
      prisma.appointment.count({
        where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {},
      }),
      prisma.appointment.count({
        where: {
          status: "PENDING",
          ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
        },
      }),
      prisma.appointment.count({
        where: {
          status: "CONFIRMED",
          ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
        },
      }),
      prisma.appointment.count({
        where: {
          status: "COMPLETED",
          ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
        },
      }),
      prisma.appointment.count({
        where: {
          status: "CANCELLED",
          ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
        },
      }),

      // Other counts
      prisma.studentNote.count({
        where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      }),
      prisma.conversation.count({
        where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      }),
      prisma.message.count({
        where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
      }),
    ]);

    // Get appointment completion rate
    const completionRate = totalAppointments > 0
      ? ((completedAppointments / totalAppointments) * 100).toFixed(2)
      : 0;

    // Get most active counselors
    const activeCounselors = await prisma.appointment.groupBy({
      by: ['counselorId'],
      where: {
        status: { in: ['CONFIRMED', 'COMPLETED'] },
        ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
      take: 5,
    });

    // Get counselor details for active counselors
    const counselorIds = activeCounselors.map(c => c.counselorId).filter(Boolean);
    const counselorDetails = await prisma.user.findMany({
      where: {
        id: { in: counselorIds },
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
      },
    });

    const activeCounselorsWithDetails = activeCounselors.map(counselor => {
      const details = counselorDetails.find(c => c.id === counselor.counselorId);
      return {
        ...details,
        appointmentCount: counselor._count.id,
      };
    });

    // Get department-wise statistics
    const departmentStats = await prisma.user.groupBy({
      by: ['department'],
      where: {
        role: 'STUDENT',
        isActive: true,
      },
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          totalCounselors,
          totalAppointments,
          completionRate: parseFloat(completionRate),
          totalNotes,
          totalConversations,
          totalMessages,
        },
        appointments: {
          total: totalAppointments,
          pending: pendingAppointments,
          confirmed: confirmedAppointments,
          completed: completedAppointments,
          cancelled: cancelledAppointments,
          completionRate: parseFloat(completionRate),
        },
        activeCounselors: activeCounselorsWithDetails,
        departmentStats,
      },
    });
  } catch (error) {
    console.error("Error fetching dashboard statistics:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch dashboard statistics",
      },
    });
  }
});

// Get appointment analytics
router.get("/appointments", protect(["CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate, counselorId, groupBy = "month" } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Build where clause
    let where = {
      ...(dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {}),
      ...(counselorId ? { counselorId } : {}),
    };

    // Get appointment trends over time
    const appointments = await prisma.appointment.findMany({
      where,
      select: {
        date: true,
        status: true,
        type: true,
        counselorId: true,
        studentId: true,
      },
      orderBy: { date: 'asc' },
    });

    // Group appointments by time period
    const groupedData = {};
    appointments.forEach(appointment => {
      let key;
      const date = new Date(appointment.date);

      switch (groupBy) {
        case 'day':
          key = date.toISOString().split('T')[0];
          break;
        case 'week':
          const weekStart = new Date(date);
          weekStart.setDate(date.getDate() - date.getDay());
          key = weekStart.toISOString().split('T')[0];
          break;
        case 'month':
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
          break;
        case 'year':
          key = date.getFullYear().toString();
          break;
        default:
          key = `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, '0')}`;
      }

      if (!groupedData[key]) {
        groupedData[key] = {
          period: key,
          total: 0,
          pending: 0,
          confirmed: 0,
          completed: 0,
          cancelled: 0,
        };
      }

      groupedData[key].total++;
      groupedData[key][appointment.status.toLowerCase()]++;
    });

    const trends = Object.values(groupedData).sort((a, b) => a.period.localeCompare(b.period));

    // Get appointment types distribution
    const typeDistribution = await prisma.appointment.groupBy({
      by: ['type'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get counselor performance
    const counselorPerformance = await prisma.appointment.groupBy({
      by: ['counselorId'],
      where,
      _count: {
        id: true,
      },
      orderBy: {
        _count: {
          id: 'desc',
        },
      },
    });

    // Get counselor details
    const counselorIds = counselorPerformance.map(c => c.counselorId).filter(Boolean);
    const counselorDetails = await prisma.user.findMany({
      where: {
        id: { in: counselorIds },
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
      },
    });

    const counselorStats = counselorPerformance.map(perf => {
      const details = counselorDetails.find(c => c.id === perf.counselorId);
      return {
        ...details,
        totalAppointments: perf._count.id,
      };
    });

    res.json({
      success: true,
      data: {
        trends,
        typeDistribution: typeDistribution.map(item => ({
          type: item.type,
          count: item._count.id,
        })),
        counselorStats,
        summary: {
          totalAppointments: appointments.length,
          averagePerPeriod: trends.length > 0 ? (appointments.length / trends.length).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching appointment analytics:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch appointment analytics",
      },
    });
  }
});

// Get student engagement metrics
router.get("/students", protect(["CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate, department } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Get student engagement data
    const studentEngagement = await prisma.user.findMany({
      where: {
        role: 'STUDENT',
        isActive: true,
        ...(department ? { department: { contains: department, mode: 'insensitive' } } : {}),
      },
      select: {
        id: true,
        name: true,
        studentId: true,
        department: true,
        StudentAppointments: {
          where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {},
          select: {
            id: true,
            status: true,
            date: true,
          },
        },
        StudentNotes: {
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            createdAt: true,
          },
        },
        SentMessages: {
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Process engagement metrics
    const engagementMetrics = studentEngagement.map(student => {
      const totalAppointments = student.StudentAppointments.length;
      const completedAppointments = student.StudentAppointments.filter(
        app => app.status === 'COMPLETED'
      ).length;
      const totalNotes = student.StudentNotes.length;
      const totalMessages = student.SentMessages.length;

      return {
        id: student.id,
        name: student.name,
        studentId: student.studentId,
        department: student.department,
        metrics: {
          totalAppointments,
          completedAppointments,
          completionRate: totalAppointments > 0 ?
            ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0,
          totalNotes,
          totalMessages,
          engagementScore: totalAppointments + totalMessages + (totalNotes * 2), // Weighted score
        },
      };
    });

    // Sort by engagement score
    engagementMetrics.sort((a, b) => b.metrics.engagementScore - a.metrics.engagementScore);

    // Get department-wise engagement
    const departmentEngagement = {};
    engagementMetrics.forEach(student => {
      if (!departmentEngagement[student.department]) {
        departmentEngagement[student.department] = {
          department: student.department,
          studentCount: 0,
          totalAppointments: 0,
          totalMessages: 0,
          totalNotes: 0,
          averageEngagement: 0,
        };
      }

      const dept = departmentEngagement[student.department];
      dept.studentCount++;
      dept.totalAppointments += student.metrics.totalAppointments;
      dept.totalMessages += student.metrics.totalMessages;
      dept.totalNotes += student.metrics.totalNotes;
      dept.averageEngagement += student.metrics.engagementScore;
    });

    // Calculate averages for departments
    Object.values(departmentEngagement).forEach(dept => {
      dept.averageEngagement = dept.studentCount > 0 ?
        (dept.averageEngagement / dept.studentCount).toFixed(2) : 0;
    });

    // Get overall statistics
    const totalStudents = engagementMetrics.length;
    const activeStudents = engagementMetrics.filter(s => s.metrics.engagementScore > 0).length;
    const averageAppointments = totalStudents > 0 ?
      (engagementMetrics.reduce((sum, s) => sum + s.metrics.totalAppointments, 0) / totalStudents).toFixed(2) : 0;

    res.json({
      success: true,
      data: {
        overview: {
          totalStudents,
          activeStudents,
          engagementRate: totalStudents > 0 ? ((activeStudents / totalStudents) * 100).toFixed(2) : 0,
          averageAppointments: parseFloat(averageAppointments),
        },
        studentMetrics: engagementMetrics.slice(0, 20), // Top 20 most engaged students
        departmentEngagement: Object.values(departmentEngagement),
        lowEngagementStudents: engagementMetrics.filter(s => s.metrics.engagementScore === 0).slice(0, 10),
      },
    });
  } catch (error) {
    console.error("Error fetching student engagement metrics:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch student engagement metrics",
      },
    });
  }
});

// Get counselor performance analytics
router.get("/counselors", protect(["CHAIRPERSON", "ADMIN"]), async (req, res) => {
  try {
    const { startDate, endDate, counselorId } = req.query;

    // Build date filter
    let dateFilter = {};
    if (startDate || endDate) {
      dateFilter = {};
      if (startDate) {
        dateFilter.gte = new Date(startDate);
      }
      if (endDate) {
        dateFilter.lte = new Date(endDate);
      }
    }

    // Get counselor performance data
    const counselors = await prisma.user.findMany({
      where: {
        role: 'COUNSELOR',
        isActive: true,
        ...(counselorId ? { id: counselorId } : {}),
      },
      select: {
        id: true,
        name: true,
        employeeId: true,
        department: true,
        CounselorAppointments: {
          where: dateFilter.gte || dateFilter.lte ? { date: dateFilter } : {},
          select: {
            id: true,
            status: true,
            date: true,
            type: true,
          },
        },
        CounselorNotes: {
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            createdAt: true,
          },
        },
        ReceivedMessages: {
          where: dateFilter.gte || dateFilter.lte ? { createdAt: dateFilter } : {},
          select: {
            id: true,
            createdAt: true,
          },
        },
      },
    });

    // Process counselor metrics
    const counselorMetrics = counselors.map(counselor => {
      const totalAppointments = counselor.CounselorAppointments.length;
      const completedAppointments = counselor.CounselorAppointments.filter(
        app => app.status === 'COMPLETED'
      ).length;
      const cancelledAppointments = counselor.CounselorAppointments.filter(
        app => app.status === 'CANCELLED'
      ).length;
      const totalNotes = counselor.CounselorNotes.length;
      const totalMessages = counselor.ReceivedMessages.length;

      return {
        id: counselor.id,
        name: counselor.name,
        employeeId: counselor.employeeId,
        department: counselor.department,
        metrics: {
          totalAppointments,
          completedAppointments,
          cancelledAppointments,
          completionRate: totalAppointments > 0 ?
            ((completedAppointments / totalAppointments) * 100).toFixed(2) : 0,
          cancellationRate: totalAppointments > 0 ?
            ((cancelledAppointments / totalAppointments) * 100).toFixed(2) : 0,
          totalNotes,
          totalMessages,
          notesPerAppointment: completedAppointments > 0 ?
            (totalNotes / completedAppointments).toFixed(2) : 0,
        },
      };
    });

    // Sort by total appointments
    counselorMetrics.sort((a, b) => b.metrics.totalAppointments - a.metrics.totalAppointments);

    res.json({
      success: true,
      data: {
        counselorMetrics,
        summary: {
          totalCounselors: counselorMetrics.length,
          averageAppointments: counselorMetrics.length > 0 ?
            (counselorMetrics.reduce((sum, c) => sum + c.metrics.totalAppointments, 0) / counselorMetrics.length).toFixed(2) : 0,
          averageCompletionRate: counselorMetrics.length > 0 ?
            (counselorMetrics.reduce((sum, c) => sum + parseFloat(c.metrics.completionRate), 0) / counselorMetrics.length).toFixed(2) : 0,
        },
      },
    });
  } catch (error) {
    console.error("Error fetching counselor performance analytics:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch counselor performance analytics",
      },
    });
  }
});

export default router;