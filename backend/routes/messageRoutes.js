import express from "express";
import jwt from "jsonwebtoken";
import { PrismaClient } from "@prisma/client";
import { createMessageNotification } from "../utils/notificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

// Middleware to authenticate and get user from token
const authenticateUser = async (req, res, next) => {
  try {
    const token = req.header("Authorization")?.replace("Bearer ", "");

    if (!token) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "No token, authorization denied"
        }
      });
    }

    const decoded = jwt.verify(token, process.env.JWT_SECRET);
    
    // Get full user data
    const user = await prisma.user.findUnique({
      where: { id: decoded.id },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        department: true,
        studentId: true,
        employeeId: true,
        isActive: true
      }
    });

    if (!user || !user.isActive) {
      return res.status(401).json({
        success: false,
        error: {
          code: "AUTHENTICATION_ERROR",
          message: "User not found or inactive"
        }
      });
    }

    req.user = user;
    next();
  } catch (error) {
    console.error("Authentication error:", error);
    res.status(401).json({
      success: false,
      error: {
        code: "AUTHENTICATION_ERROR",
        message: "Invalid token"
      }
    });
  }
};

// GET /api/messages/conversations - Get user conversations
router.get("/conversations", authenticateUser, async (req, res) => {
  try {
    const { page = 1, limit = 20 } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    const conversations = await prisma.conversation.findMany({
      where: {
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        },
        messages: {
          orderBy: {
            createdAt: 'desc'
          },
          take: 1,
          include: {
            sender: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        },
        _count: {
          select: {
            messages: true
          }
        }
      },
      orderBy: {
        updatedAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalCount = await prisma.conversation.count({
      where: {
        participants: {
          some: {
            userId: req.user.id
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        conversations,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error("Error fetching conversations:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch conversations"
      }
    });
  }
});

// POST /api/messages/conversations - Create/start conversation
router.post("/conversations", authenticateUser, async (req, res) => {
  try {
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Participant IDs are required and must be an array"
        }
      });
    }

    // Add current user to participants if not already included
    const allParticipantIds = [...new Set([req.user.id, ...participantIds])];

    // Validate that all participants exist and are active
    const participants = await prisma.user.findMany({
      where: {
        id: { in: allParticipantIds },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (participants.length !== allParticipantIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more participants not found or inactive"
        }
      });
    }

    // Check if conversation already exists with same participants
    const existingConversation = await prisma.conversation.findFirst({
      where: {
        participants: {
          every: {
            userId: { in: allParticipantIds }
          }
        },
        AND: {
          participants: {
            none: {
              userId: { notIn: allParticipantIds }
            }
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        }
      }
    });

    if (existingConversation) {
      return res.json({
        success: true,
        data: {
          conversation: existingConversation,
          isNew: false
        }
      });
    }

    // Create new conversation
    const conversation = await prisma.conversation.create({
      data: {
        participants: {
          create: allParticipantIds.map(userId => ({
            userId
          }))
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        }
      }
    });

    res.status(201).json({
      success: true,
      data: {
        conversation,
        isNew: true
      }
    });
  } catch (error) {
    console.error("Error creating conversation:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to create conversation"
      }
    });
  }
});

// GET /api/messages/conversations/:id/messages - Get conversation messages with pagination
router.get("/conversations/:id/messages", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { page = 1, limit = 50, before } = req.query;
    const skip = (parseInt(page) - 1) * parseInt(limit);

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    // Build where clause for pagination
    const whereClause = {
      conversationId
    };

    // If 'before' timestamp is provided, get messages before that time
    if (before) {
      whereClause.createdAt = {
        lt: new Date(before)
      };
    }

    const messages = await prisma.message.findMany({
      where: whereClause,
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        }
      },
      orderBy: {
        createdAt: 'desc'
      },
      skip,
      take: parseInt(limit)
    });

    // Get total count for pagination
    const totalCount = await prisma.message.count({
      where: {
        conversationId
      }
    });

    res.json({
      success: true,
      data: {
        messages: messages, // Keep desc order (newest first) for consistency
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit)),
          hasMore: skip + messages.length < totalCount
        }
      }
    });
  } catch (error) {
    console.error("Error fetching messages:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch messages"
      }
    });
  }
});

// POST /api/messages/conversations/:id/messages - Send message
router.post("/conversations/:id/messages", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { content } = req.body;

    if (!content || content.trim().length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Message content is required"
        }
      });
    }

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    // Create message
    const message = await prisma.message.create({
      data: {
        content: content.trim(),
        senderId: req.user.id,
        conversationId,
        receiverId: conversation.participants.find(p => p.userId !== req.user.id)?.userId || req.user.id
      },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true,
            department: true
          }
        }
      }
    });

    // Update conversation timestamp
    await prisma.conversation.update({
      where: { id: conversationId },
      data: { updatedAt: new Date() }
    });

    // Get Socket.io instance and broadcast message
    const io = req.app.get('io');
    if (io) {
      // Broadcast to conversation room
      io.to(`conversation-${conversationId}`).emit('message-received', {
        id: message.id,
        content: message.content,
        senderId: message.senderId,
        conversationId: message.conversationId,
        createdAt: message.createdAt,
        sender: message.sender
      });

      // Create notifications for other participants using notification service
      const recipientIds = conversation.participants
        .filter(p => p.userId !== req.user.id)
        .map(p => p.userId);
      
      if (recipientIds.length > 0) {
        await createMessageNotification(io, message, recipientIds, req.user.name);
      }
    }

    res.status(201).json({
      success: true,
      data: {
        message
      }
    });
  } catch (error) {
    console.error("Error sending message:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to send message"
      }
    });
  }
});

// PUT /api/messages/:id/read - Mark message as read
router.put("/:id/read", authenticateUser, async (req, res) => {
  try {
    const { id: messageId } = req.params;

    // Verify message exists and user is the receiver
    const message = await prisma.message.findFirst({
      where: {
        id: messageId,
        receiverId: req.user.id
      }
    });

    if (!message) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Message not found or access denied"
        }
      });
    }

    // Update message as read
    const updatedMessage = await prisma.message.update({
      where: { id: messageId },
      data: { isRead: true },
      include: {
        sender: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        message: updatedMessage
      }
    });
  } catch (error) {
    console.error("Error marking message as read:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to mark message as read"
      }
    });
  }
});

// PUT /api/messages/conversations/:id/read-all - Mark all messages in conversation as read
router.put("/conversations/:id/read-all", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    // Mark all unread messages in conversation as read for current user
    const result = await prisma.message.updateMany({
      where: {
        conversationId,
        receiverId: req.user.id,
        isRead: false
      },
      data: {
        isRead: true
      }
    });

    res.json({
      success: true,
      data: {
        updatedCount: result.count
      }
    });
  } catch (error) {
    console.error("Error marking all messages as read:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to mark messages as read"
      }
    });
  }
});

// GET /api/messages/conversations/:id/participants - Get conversation participants
router.get("/conversations/:id/participants", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true,
                studentId: true,
                employeeId: true,
                isActive: true
              }
            }
          }
        }
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    res.json({
      success: true,
      data: {
        participants: conversation.participants
      }
    });
  } catch (error) {
    console.error("Error fetching participants:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch participants"
      }
    });
  }
});

// POST /api/messages/conversations/:id/participants - Add participants to conversation
router.post("/conversations/:id/participants", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { participantIds } = req.body;

    if (!participantIds || !Array.isArray(participantIds) || participantIds.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Participant IDs are required and must be an array"
        }
      });
    }

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: true
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    // Validate that all new participants exist and are active
    const newParticipants = await prisma.user.findMany({
      where: {
        id: { in: participantIds },
        isActive: true
      },
      select: {
        id: true,
        name: true,
        email: true,
        role: true
      }
    });

    if (newParticipants.length !== participantIds.length) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "One or more participants not found or inactive"
        }
      });
    }

    // Filter out participants who are already in the conversation
    const existingParticipantIds = conversation.participants.map(p => p.userId);
    const participantsToAdd = participantIds.filter(id => !existingParticipantIds.includes(id));

    if (participantsToAdd.length === 0) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "All specified participants are already in the conversation"
        }
      });
    }

    // Add new participants
    await prisma.conversationParticipant.createMany({
      data: participantsToAdd.map(userId => ({
        conversationId,
        userId
      }))
    });

    // Get updated conversation with all participants
    const updatedConversation = await prisma.conversation.findUnique({
      where: { id: conversationId },
      include: {
        participants: {
          include: {
            user: {
              select: {
                id: true,
                name: true,
                email: true,
                role: true,
                department: true
              }
            }
          }
        }
      }
    });

    res.json({
      success: true,
      data: {
        conversation: updatedConversation,
        addedCount: participantsToAdd.length
      }
    });
  } catch (error) {
    console.error("Error adding participants:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to add participants"
      }
    });
  }
});

// DELETE /api/messages/conversations/:id/participants/:userId - Remove participant from conversation
router.delete("/conversations/:id/participants/:userId", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId, userId: participantId } = req.params;

    // Verify user is participant in conversation
    const conversation = await prisma.conversation.findFirst({
      where: {
        id: conversationId,
        participants: {
          some: {
            userId: req.user.id
          }
        }
      },
      include: {
        participants: true
      }
    });

    if (!conversation) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Conversation not found or access denied"
        }
      });
    }

    // Check if participant exists in conversation
    const participantToRemove = conversation.participants.find(p => p.userId === participantId);
    if (!participantToRemove) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "Participant not found in conversation"
        }
      });
    }

    // Prevent removing the last participant
    if (conversation.participants.length <= 1) {
      return res.status(400).json({
        success: false,
        error: {
          code: "VALIDATION_ERROR",
          message: "Cannot remove the last participant from conversation"
        }
      });
    }

    // Remove participant
    await prisma.conversationParticipant.delete({
      where: {
        id: participantToRemove.id
      }
    });

    res.json({
      success: true,
      data: {
        message: "Participant removed successfully"
      }
    });
  } catch (error) {
    console.error("Error removing participant:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to remove participant"
      }
    });
  }
});

export default router;