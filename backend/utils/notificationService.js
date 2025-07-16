import { PrismaClient } from "@prisma/client";
import { broadcastNotification } from "./socketUtils.js";

const prisma = new PrismaClient();

/**
 * Create and broadcast a notification
 * @param {Object} io - Socket.io server instance
 * @param {string} userId - Target user ID
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {string} type - Notification type
 * @param {Object} data - Additional notification data
 * @returns {Promise<Object>} Created notification
 */
export const createNotification = async (io, userId, title, message, type, data = {}) => {
  try {
    // Create notification in database
    const notification = await prisma.notification.create({
      data: {
        userId,
        title,
        message,
        type,
        data,
        isRead: false
      },
      include: {
        user: {
          select: { id: true, name: true, email: true }
        }
      }
    });

    // Broadcast notification via Socket.io if io instance is available
    if (io) {
      broadcastNotification(io, userId, {
        id: notification.id,
        title: notification.title,
        message: notification.message,
        type: notification.type,
        data: notification.data,
        createdAt: notification.createdAt
      });
    }

    return notification;
  } catch (error) {
    console.error("Error creating notification:", error);
    throw error;
  }
};

/**
 * Create appointment-related notifications
 * @param {Object} io - Socket.io server instance
 * @param {Object} appointment - Appointment data
 * @param {string} eventType - Event type (booked, cancelled, rescheduled)
 * @param {string} initiatorId - ID of user who initiated the action
 */
export const createAppointmentNotification = async (io, appointment, eventType, initiatorId) => {
  try {
    const { studentId, counselorId, date, startTime, endTime } = appointment;
    
    // Determine notification details based on event type
    const notificationConfig = {
      booked: {
        type: 'APPOINTMENT_BOOKED',
        title: 'Appointment Scheduled',
        message: `New appointment scheduled for ${new Date(date).toLocaleDateString()} at ${startTime}`
      },
      cancelled: {
        type: 'APPOINTMENT_CANCELLED',
        title: 'Appointment Cancelled',
        message: `Appointment on ${new Date(date).toLocaleDateString()} at ${startTime} has been cancelled`
      },
      rescheduled: {
        type: 'APPOINTMENT_RESCHEDULED',
        title: 'Appointment Rescheduled',
        message: `Appointment has been rescheduled to ${new Date(date).toLocaleDateString()} at ${startTime}`
      }
    };

    const config = notificationConfig[eventType];
    if (!config) {
      throw new Error(`Invalid appointment event type: ${eventType}`);
    }

    // Create notifications for both student and counselor (except the initiator)
    const notifications = [];
    const userIds = [studentId, counselorId].filter(id => id && id !== initiatorId);

    for (const userId of userIds) {
      const notification = await createNotification(
        io,
        userId,
        config.title,
        config.message,
        config.type,
        {
          appointmentId: appointment.id,
          date: appointment.date,
          startTime: appointment.startTime,
          endTime: appointment.endTime,
          eventType
        }
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating appointment notification:", error);
    throw error;
  }
};

/**
 * Create message-related notification
 * @param {Object} io - Socket.io server instance
 * @param {Object} message - Message data
 * @param {Array} recipientIds - Array of recipient user IDs
 * @param {string} senderName - Name of message sender
 */
export const createMessageNotification = async (io, message, recipientIds, senderName) => {
  try {
    const notifications = [];

    for (const recipientId of recipientIds) {
      // Don't notify the sender
      if (recipientId === message.senderId) continue;

      const notification = await createNotification(
        io,
        recipientId,
        'New Message',
        `${senderName} sent you a message`,
        'MESSAGE_RECEIVED',
        {
          messageId: message.id,
          conversationId: message.conversationId,
          senderId: message.senderId,
          senderName
        }
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating message notification:", error);
    throw error;
  }
};

/**
 * Create file sharing notification
 * @param {Object} io - Socket.io server instance
 * @param {Object} file - File data
 * @param {Array} participantIds - Array of conversation participant IDs
 * @param {string} uploaderName - Name of file uploader
 */
export const createFileSharedNotification = async (io, file, participantIds, uploaderName) => {
  try {
    const notifications = [];

    for (const participantId of participantIds) {
      // Don't notify the uploader
      if (participantId === file.uploadedById) continue;

      const notification = await createNotification(
        io,
        participantId,
        'File Shared',
        `${uploaderName} shared a file: ${file.originalName}`,
        'FILE_SHARED',
        {
          fileId: file.id,
          fileName: file.originalName,
          conversationId: file.conversationId,
          uploaderId: file.uploadedById,
          uploaderName
        }
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating file shared notification:", error);
    throw error;
  }
};

/**
 * Create system notification for all users or specific roles
 * @param {Object} io - Socket.io server instance
 * @param {string} title - Notification title
 * @param {string} message - Notification message
 * @param {Array} targetRoles - Array of roles to notify (optional, if empty notifies all users)
 * @param {Object} data - Additional notification data
 */
export const createSystemNotification = async (io, title, message, targetRoles = [], data = {}) => {
  try {
    // Get target users based on roles
    const whereClause = targetRoles.length > 0 
      ? { role: { in: targetRoles }, isActive: true }
      : { isActive: true };

    const targetUsers = await prisma.user.findMany({
      where: whereClause,
      select: { id: true }
    });

    const notifications = [];

    for (const user of targetUsers) {
      const notification = await createNotification(
        io,
        user.id,
        title,
        message,
        'SYSTEM_NOTIFICATION',
        data
      );
      notifications.push(notification);
    }

    return notifications;
  } catch (error) {
    console.error("Error creating system notification:", error);
    throw error;
  }
};

/**
 * Get notification statistics for a user
 * @param {string} userId - User ID
 * @returns {Promise<Object>} Notification statistics
 */
export const getNotificationStats = async (userId) => {
  try {
    const [totalCount, unreadCount, typeBreakdown] = await Promise.all([
      // Total notifications
      prisma.notification.count({
        where: { userId }
      }),
      
      // Unread notifications
      prisma.notification.count({
        where: { userId, isRead: false }
      }),
      
      // Breakdown by type
      prisma.notification.groupBy({
        by: ['type'],
        where: { userId },
        _count: { type: true }
      })
    ]);

    return {
      totalCount,
      unreadCount,
      readCount: totalCount - unreadCount,
      typeBreakdown: typeBreakdown.reduce((acc, item) => {
        acc[item.type] = item._count.type;
        return acc;
      }, {})
    };
  } catch (error) {
    console.error("Error getting notification stats:", error);
    throw error;
  }
};

/**
 * Clean up old notifications (older than specified days)
 * @param {number} daysOld - Number of days old to consider for cleanup
 * @param {boolean} readOnly - Whether to only delete read notifications
 * @returns {Promise<number>} Number of deleted notifications
 */
export const cleanupOldNotifications = async (daysOld = 30, readOnly = true) => {
  try {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const whereClause = {
      createdAt: { lt: cutoffDate },
      ...(readOnly && { isRead: true })
    };

    const result = await prisma.notification.deleteMany({
      where: whereClause
    });

    console.log(`Cleaned up ${result.count} old notifications`);
    return result.count;
  } catch (error) {
    console.error("Error cleaning up old notifications:", error);
    throw error;
  }
};