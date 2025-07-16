// Socket.io utility functions for notification broadcasting and real-time features

/**
 * Broadcast notification to a specific user
 * @param {Object} io - Socket.io server instance
 * @param {string} userId - Target user ID
 * @param {Object} notificationData - Notification data to send
 */
export const broadcastNotification = (io, userId, notificationData) => {
  // Get connected users from the server instance
  const connectedUsers = io.connectedUsers || new Map();
  const targetUser = connectedUsers.get(userId);

  console.log(`Broadcasting notification to user ${userId}:`, notificationData);
  console.log(`Target user connection:`, targetUser);

  if (targetUser && targetUser.isOnline) {
    // Send directly to the user's socket
    io.to(targetUser.socketId).emit('notification', notificationData);
    console.log(`✅ Notification sent to user ${userId} via socket ${targetUser.socketId}`);
  } else {
    console.log(`⚠️ User ${userId} is not online, notification will be queued`);
    // Notification is already saved to database, will be retrieved when user comes online
  }
};

/**
 * Broadcast message to conversation participants
 * @param {Object} io - Socket.io server instance
 * @param {string} conversationId - Conversation ID
 * @param {Object} messageData - Message data to broadcast
 */
export const broadcastMessage = (io, conversationId, messageData) => {
  io.to(`conversation-${conversationId}`).emit('message-received', messageData);
};

/**
 * Broadcast appointment notification to relevant users
 * @param {Object} io - Socket.io server instance
 * @param {Array} userIds - Array of user IDs to notify
 * @param {Object} appointmentData - Appointment data
 * @param {string} type - Notification type (booked, cancelled, rescheduled)
 */
export const broadcastAppointmentNotification = (io, userIds, appointmentData, type) => {
  const notificationTypes = {
    booked: 'APPOINTMENT_BOOKED',
    cancelled: 'APPOINTMENT_CANCELLED',
    rescheduled: 'APPOINTMENT_RESCHEDULED'
  };

  const messages = {
    booked: `New appointment scheduled for ${appointmentData.date} at ${appointmentData.time}`,
    cancelled: `Appointment on ${appointmentData.date} at ${appointmentData.time} has been cancelled`,
    rescheduled: `Appointment has been rescheduled to ${appointmentData.date} at ${appointmentData.time}`
  };

  userIds.forEach(userId => {
    broadcastNotification(io, userId, {
      title: 'Appointment Update',
      message: messages[type],
      type: notificationTypes[type],
      data: appointmentData
    });
  });
};

/**
 * Broadcast file sharing notification
 * @param {Object} io - Socket.io server instance
 * @param {string} conversationId - Conversation ID
 * @param {Array} participantIds - Array of participant user IDs
 * @param {Object} fileData - File data
 * @param {string} uploaderName - Name of user who uploaded the file
 */
export const broadcastFileShared = (io, conversationId, participantIds, fileData, uploaderName) => {
  // Notify conversation participants about new file
  io.to(`conversation-${conversationId}`).emit('file-shared', {
    conversationId,
    file: fileData,
    uploaderName
  });

  // Send notifications to participants
  participantIds.forEach(userId => {
    broadcastNotification(io, userId, {
      title: 'File Shared',
      message: `${uploaderName} shared a file: ${fileData.originalName}`,
      type: 'FILE_SHARED',
      data: {
        conversationId,
        fileId: fileData.id,
        fileName: fileData.originalName
      }
    });
  });
};

/**
 * Get online users status
 * @param {Map} connectedUsers - Map of connected users
 * @param {Array} userIds - Array of user IDs to check
 * @returns {Object} Object with user online status
 */
export const getOnlineStatus = (connectedUsers, userIds) => {
  const onlineStatus = {};
  userIds.forEach(userId => {
    const userInfo = connectedUsers.get(userId);
    onlineStatus[userId] = {
      isOnline: userInfo ? userInfo.isOnline : false,
      lastSeen: userInfo ? userInfo.lastSeen : null
    };
  });
  return onlineStatus;
};

/**
 * Broadcast system notification to all users
 * @param {Object} io - Socket.io server instance
 * @param {Object} notificationData - System notification data
 */
export const broadcastSystemNotification = (io, notificationData) => {
  io.emit('system-notification', {
    title: notificationData.title,
    message: notificationData.message,
    type: 'SYSTEM_NOTIFICATION',
    data: notificationData.data || {}
  });
};