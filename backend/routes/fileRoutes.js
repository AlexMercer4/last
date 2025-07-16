import express from "express";
import jwt from "jsonwebtoken";
import multer from "multer";
import path from "path";
import fs from "fs";
import { fileURLToPath } from "url";
import { PrismaClient } from "@prisma/client";
import {
  validateFileType,
  validateFileSize,
  MAX_FILE_SIZE
} from "../utils/fileValidation.js";
import { createFileSharedNotification } from "../utils/notificationService.js";

const router = express.Router();
const prisma = new PrismaClient();

// Get current directory for ES modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

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

// Create uploads directory if it doesn't exist
const uploadsDir = path.join(__dirname, '..', 'uploads');
if (!fs.existsSync(uploadsDir)) {
  fs.mkdirSync(uploadsDir, { recursive: true });
}

// Configure multer for file uploads
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, uploadsDir);
  },
  filename: (req, file, cb) => {
    // Generate unique filename with timestamp and random string
    const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1E9);
    const extension = path.extname(file.originalname);
    const filename = `${file.fieldname}-${uniqueSuffix}${extension}`;
    cb(null, filename);
  }
});

// File filter for security using validation utilities
const fileFilter = (req, file, cb) => {
  // Validate file type and extension
  const typeValidation = validateFileType(file.mimetype, file.originalname);
  if (!typeValidation.isValid) {
    cb(new Error(typeValidation.error), false);
    return;
  }

  // Validate file size
  const sizeValidation = validateFileSize(file.size);
  if (!sizeValidation.isValid) {
    cb(new Error(sizeValidation.error), false);
    return;
  }

  cb(null, true);
};

const upload = multer({
  storage: storage,
  fileFilter: fileFilter,
  limits: {
    fileSize: MAX_FILE_SIZE, // Use constant from validation utilities
    files: 1 // Single file upload only
  }
});

// POST /api/files/conversations/:id/upload - Upload file to conversation
router.post("/conversations/:id/upload", authenticateUser, (req, res) => {
  const { id: conversationId } = req.params;

  // Use multer middleware
  upload.single('file')(req, res, async (err) => {
    try {
      // Handle multer errors
      if (err instanceof multer.MulterError) {
        if (err.code === 'LIMIT_FILE_SIZE') {
          return res.status(400).json({
            success: false,
            error: {
              code: "FILE_TOO_LARGE",
              message: "File size exceeds 10MB limit"
            }
          });
        }
        if (err.code === 'LIMIT_FILE_COUNT') {
          return res.status(400).json({
            success: false,
            error: {
              code: "TOO_MANY_FILES",
              message: "Only one file can be uploaded at a time"
            }
          });
        }
        return res.status(400).json({
          success: false,
          error: {
            code: "UPLOAD_ERROR",
            message: err.message
          }
        });
      }

      // Handle other errors
      if (err) {
        return res.status(400).json({
          success: false,
          error: {
            code: "UPLOAD_ERROR",
            message: err.message
          }
        });
      }

      // Check if file was uploaded
      if (!req.file) {
        return res.status(400).json({
          success: false,
          error: {
            code: "NO_FILE",
            message: "No file was uploaded"
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
        // Delete uploaded file if conversation not found
        fs.unlinkSync(req.file.path);
        return res.status(404).json({
          success: false,
          error: {
            code: "NOT_FOUND",
            message: "Conversation not found or access denied"
          }
        });
      }

      // Save file information to database
      const sharedFile = await prisma.sharedFile.create({
        data: {
          filename: req.file.filename,
          originalName: req.file.originalname,
          mimeType: req.file.mimetype,
          size: req.file.size,
          path: req.file.path,
          conversationId: conversationId,
          uploadedById: req.user.id
        },
        include: {
          uploadedBy: {
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

      // Get Socket.io instance and broadcast file upload notification
      const io = req.app.get('io');
      if (io) {
        // Broadcast to conversation room
        io.to(`conversation-${conversationId}`).emit('file-shared', {
          id: sharedFile.id,
          filename: sharedFile.filename,
          originalName: sharedFile.originalName,
          mimeType: sharedFile.mimeType,
          size: sharedFile.size,
          conversationId: sharedFile.conversationId,
          uploadedById: sharedFile.uploadedById,
          uploadedBy: sharedFile.uploadedBy,
          createdAt: sharedFile.createdAt
        });

        // Create notifications for other participants using notification service
        const participantIds = conversation.participants.map(p => p.userId);
        await createFileSharedNotification(io, sharedFile, participantIds, req.user.name);
      }

      res.status(201).json({
        success: true,
        data: {
          file: sharedFile
        }
      });
    } catch (error) {
      console.error("Error uploading file:", error);

      // Clean up uploaded file on error
      if (req.file && fs.existsSync(req.file.path)) {
        fs.unlinkSync(req.file.path);
      }

      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to upload file"
        }
      });
    }
  });
});
// 
// GET /api/files/conversations/:id/files - Get conversation files
router.get("/conversations/:id/files", authenticateUser, async (req, res) => {
  try {
    const { id: conversationId } = req.params;
    const { page = 1, limit = 20 } = req.query;
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

    // Get files for the conversation
    const files = await prisma.sharedFile.findMany({
      where: {
        conversationId: conversationId
      },
      include: {
        uploadedBy: {
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
    const totalCount = await prisma.sharedFile.count({
      where: {
        conversationId: conversationId
      }
    });

    res.json({
      success: true,
      data: {
        files,
        pagination: {
          page: parseInt(page),
          limit: parseInt(limit),
          total: totalCount,
          pages: Math.ceil(totalCount / parseInt(limit))
        }
      }
    });
  } catch (error) {
    console.error("Error fetching files:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch files"
      }
    });
  }
});

// GET /api/files/:id/download - Download file
router.get("/:id/download", authenticateUser, async (req, res) => {
  try {
    const { id: fileId } = req.params;

    // Get file information and verify access
    const sharedFile = await prisma.sharedFile.findFirst({
      where: {
        id: fileId,
        conversation: {
          participants: {
            some: {
              userId: req.user.id
            }
          }
        }
      },
      include: {
        conversation: {
          include: {
            participants: {
              where: {
                userId: req.user.id
              }
            }
          }
        }
      }
    });

    if (!sharedFile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "File not found or access denied"
        }
      });
    }

    // Check if file exists on disk
    if (!fs.existsSync(sharedFile.path)) {
      return res.status(404).json({
        success: false,
        error: {
          code: "FILE_NOT_FOUND",
          message: "File not found on server"
        }
      });
    }

    // Set appropriate headers for file download
    res.setHeader('Content-Disposition', `attachment; filename="${sharedFile.originalName}"`);
    res.setHeader('Content-Type', sharedFile.mimeType);
    res.setHeader('Content-Length', sharedFile.size);

    // Stream the file
    const fileStream = fs.createReadStream(sharedFile.path);
    fileStream.pipe(res);

    fileStream.on('error', (error) => {
      console.error("Error streaming file:", error);
      if (!res.headersSent) {
        res.status(500).json({
          success: false,
          error: {
            code: "DOWNLOAD_ERROR",
            message: "Failed to download file"
          }
        });
      }
    });

  } catch (error) {
    console.error("Error downloading file:", error);
    if (!res.headersSent) {
      res.status(500).json({
        success: false,
        error: {
          code: "SERVER_ERROR",
          message: "Failed to download file"
        }
      });
    }
  }
});

// DELETE /api/files/:id - Delete shared file
router.delete("/:id", authenticateUser, async (req, res) => {
  try {
    const { id: fileId } = req.params;

    // Get file information and verify access
    const sharedFile = await prisma.sharedFile.findFirst({
      where: {
        id: fileId,
        conversation: {
          participants: {
            some: {
              userId: req.user.id
            }
          }
        }
      },
      include: {
        conversation: {
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
        },
        uploadedBy: {
          select: {
            id: true,
            name: true,
            email: true,
            role: true
          }
        }
      }
    });

    if (!sharedFile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "File not found or access denied"
        }
      });
    }

    // Check if user has permission to delete (uploader, admin, or chairperson)
    const canDelete = sharedFile.uploadedById === req.user.id ||
      req.user.role === 'ADMIN' ||
      req.user.role === 'CHAIRPERSON';

    if (!canDelete) {
      return res.status(403).json({
        success: false,
        error: {
          code: "FORBIDDEN",
          message: "You don't have permission to delete this file"
        }
      });
    }

    // Delete file from database
    await prisma.sharedFile.delete({
      where: { id: fileId }
    });

    // Delete file from disk
    if (fs.existsSync(sharedFile.path)) {
      fs.unlinkSync(sharedFile.path);
    }

    // Get Socket.io instance and broadcast file deletion
    const io = req.app.get('io');
    if (io) {
      // Broadcast to conversation room
      io.to(`conversation-${sharedFile.conversationId}`).emit('file-deleted', {
        fileId: fileId,
        conversationId: sharedFile.conversationId,
        deletedBy: {
          id: req.user.id,
          name: req.user.name
        }
      });

      // Create notifications for other participants using notification service
      const participantIds = sharedFile.conversation.participants
        .filter(p => p.userId !== req.user.id)
        .map(p => p.userId);
      
      if (participantIds.length > 0) {
        const { createNotification } = await import("../utils/notificationService.js");
        
        for (const participantId of participantIds) {
          await createNotification(
            io,
            participantId,
            `File deleted by ${req.user.name}`,
            `File: ${sharedFile.originalName}`,
            'SYSTEM_NOTIFICATION',
            {
              conversationId: sharedFile.conversationId,
              fileId: fileId,
              deletedById: req.user.id
            }
          );
        }
      }
    }

    res.json({
      success: true,
      data: {
        message: "File deleted successfully"
      }
    });
  } catch (error) {
    console.error("Error deleting file:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to delete file"
      }
    });
  }
});

// GET /api/files/:id/info - Get file information
router.get("/:id/info", authenticateUser, async (req, res) => {
  try {
    const { id: fileId } = req.params;

    // Get file information and verify access
    const sharedFile = await prisma.sharedFile.findFirst({
      where: {
        id: fileId,
        conversation: {
          participants: {
            some: {
              userId: req.user.id
            }
          }
        }
      },
      include: {
        uploadedBy: {
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

    if (!sharedFile) {
      return res.status(404).json({
        success: false,
        error: {
          code: "NOT_FOUND",
          message: "File not found or access denied"
        }
      });
    }

    // Check if file exists on disk
    const fileExists = fs.existsSync(sharedFile.path);

    res.json({
      success: true,
      data: {
        file: {
          ...sharedFile,
          path: undefined, // Don't expose file path
          fileExists
        }
      }
    });
  } catch (error) {
    console.error("Error fetching file info:", error);
    res.status(500).json({
      success: false,
      error: {
        code: "SERVER_ERROR",
        message: "Failed to fetch file information"
      }
    });
  }
});

export default router;