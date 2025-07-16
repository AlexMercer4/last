import express from "express";
import { PrismaClient } from "@prisma/client";
import { protect } from "../middlewares/authMiddleware.js";
import { broadcastNotification } from "../utils/socketUtils.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get user notifications with pagination and filtering
router.get("/", protect(), async (req, res) => {
  try {
    const { page = 1, limit = 20, type, isRead } = req.query;
    const userId = req.user.id;

    const skip = (parseInt(page) - 1) * parseInt(limit);
    const take = parseInt(limit);

    // Build filter conditions
    const where = {
      userId,
      ...(type && { type }),
      ...(isRead !== undefined && { isRead: isRead === 'true' })
    };

    // Get notifications with pagination
    const [notifications, totalCount] = await Promise.all([
      prisma.notification.findMany({
        where,
        orderBy: { createdAt: 'desc' },
        skip,
        take,
        include: {
          user: {
            select: { id: true, name: true, email: true }
          }
        }
      }),
      prisma.notification.count({ where })
    ]);

    // Get unread count
    const unreadCount = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      notifications,
      pagination: {
        currentPage: parseInt(page),
        totalPages: Math.ceil(totalCount / take),
        totalCount,
        hasNext: skip + take < totalCount,
        hasPrev: parseInt(page) > 1
      },
      unreadCount
    });
  } catch (error) {
    console.error("Error fetching notifications:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch notifications',
        details: error.message
      }
    });
  }
});

// Get notification by ID
router.get("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    const notification = await prisma.notification.findFirst({
      where: {
        id,
        userId // Ensure user can only access their own notifications
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    if (!notification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error fetching notification:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch notification',
        details: error.message
      }
    });
  }
});

// Create notification (internal use - typically called by other routes)
router.post("/", protect(), async (req, res) => {
  try {
    const { userId, title, message, type, data } = req.body;

    // Validate required fields
    if (!userId || !title || !message || !type) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Missing required fields: userId, title, message, type'
        }
      });
    }

    // Validate notification type
    const validTypes = [
      'APPOINTMENT_BOOKED',
      'APPOINTMENT_CANCELLED', 
      'APPOINTMENT_RESCHEDULED',
      'MESSAGE_RECEIVED',
      'FILE_SHARED',
      'SYSTEM_NOTIFICATION'
    ];

    if (!validTypes.includes(type)) {
      return res.status(400).json({
        success: false,
        error: {
          code: 'VALIDATION_ERROR',
          message: 'Invalid notification type'
        }
      });
    }

    // Check if target user exists
    const targetUser = await prisma.user.findUnique({
      where: { id: userId }
    });

    if (!targetUser) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Target user not found'
        }
      });
    }

    // Create notification
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data: data || {},
        isRead: false
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Broadcast notification via Socket.io
    broadcastNotification(req.io, userId, {
      id: notification.id,
      title: notification.title,
      message: notification.message,
      type: notification.type,
      data: notification.data,
      createdAt: notification.createdAt
    });

    res.status(201).json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error creating notification:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'CREATE_ERROR',
        message: 'Failed to create notification',
        details: error.message
      }
    });
  }
});

// Mark notification as read
router.put("/:id/read", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    // Update notification as read
    const notification = await prisma.notification.update({
      where: { id },
      data: { isRead: true },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    res.json({
      success: true,
      data: notification
    });
  } catch (error) {
    console.error("Error marking notification as read:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to mark notification as read',
        details: error.message
      }
    });
  }
});

// Mark all notifications as read for current user
router.put("/mark-all-read", protect(), async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.updateMany({
      where: {
        userId,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        message: `Marked ${result.count} notifications as read`
      }
    });
  } catch (error) {
    console.error("Error marking all notifications as read:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'UPDATE_ERROR',
        message: 'Failed to mark all notifications as read',
        details: error.message
      }
    });
  }
});

// Delete notification
router.delete("/:id", protect(), async (req, res) => {
  try {
    const { id } = req.params;
    const userId = req.user.id;

    // Check if notification exists and belongs to user
    const existingNotification = await prisma.notification.findFirst({
      where: {
        id,
        userId
      }
    });

    if (!existingNotification) {
      return res.status(404).json({
        success: false,
        error: {
          code: 'NOT_FOUND',
          message: 'Notification not found'
        }
      });
    }

    // Delete notification
    await prisma.notification.delete({
      where: { id }
    });

    res.json({
      success: true,
      data: {
        message: 'Notification deleted successfully'
      }
    });
  } catch (error) {
    console.error("Error deleting notification:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to delete notification',
        details: error.message
      }
    });
  }
});

// Get unread notification count
router.get("/unread-count", protect(), async (req, res) => {
  try {
    const userId = req.user.id;

    const count = await prisma.notification.count({
      where: {
        userId,
        isRead: false
      }
    });

    res.json({
      success: true,
      count
    });
  } catch (error) {
    console.error("Error fetching unread count:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'FETCH_ERROR',
        message: 'Failed to fetch unread count',
        details: error.message
      }
    });
  }
});

// Delete all read notifications for current user
router.delete("/clear-read", protect(), async (req, res) => {
  try {
    const userId = req.user.id;

    const result = await prisma.notification.deleteMany({
      where: {
        userId,
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        message: `Deleted ${result.count} read notifications`
      }
    });
  } catch (error) {
    console.error("Error clearing read notifications:", error);
    res.status(500).json({
      success: false,
      error: {
        code: 'DELETE_ERROR',
        message: 'Failed to clear read notifications',
        details: error.message
      }
    });
  }
});

export default router;