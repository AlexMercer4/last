import path from "path";

// Define allowed file types and their MIME types
export const ALLOWED_FILE_TYPES = {
  // Images
  'image/jpeg': ['.jpg', '.jpeg'],
  'image/png': ['.png'],
  'image/gif': ['.gif'],
  'image/webp': ['.webp'],
  
  // Documents
  'application/pdf': ['.pdf'],
  'application/msword': ['.doc'],
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': ['.docx'],
  'application/vnd.ms-excel': ['.xls'],
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': ['.xlsx'],
  'application/vnd.ms-powerpoint': ['.ppt'],
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': ['.pptx'],
  
  // Text files
  'text/plain': ['.txt'],
  'text/csv': ['.csv'],
  
  // Archives
  'application/zip': ['.zip'],
  'application/x-zip-compressed': ['.zip']
};

// Define dangerous file extensions that should never be allowed
export const DANGEROUS_EXTENSIONS = [
  '.exe', '.bat', '.cmd', '.com', '.pif', '.scr', '.vbs', '.js', '.jar',
  '.msi', '.dll', '.app', '.deb', '.rpm', '.dmg', '.pkg', '.run',
  '.ps1', '.sh', '.bash', '.zsh', '.fish', '.csh', '.tcsh'
];

// Maximum file size (10MB)
export const MAX_FILE_SIZE = 10 * 1024 * 1024;

/**
 * Validate file type and extension
 * @param {string} mimeType - File MIME type
 * @param {string} filename - Original filename
 * @returns {Object} Validation result
 */
export function validateFileType(mimeType, filename) {
  const fileExtension = path.extname(filename).toLowerCase();
  
  // Check for dangerous extensions first
  if (DANGEROUS_EXTENSIONS.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File type not allowed for security reasons'
    };
  }
  
  // Check if MIME type is allowed
  if (!ALLOWED_FILE_TYPES[mimeType]) {
    return {
      isValid: false,
      error: 'File type not supported'
    };
  }
  
  // Check if extension matches MIME type
  const allowedExtensions = ALLOWED_FILE_TYPES[mimeType];
  if (!allowedExtensions.includes(fileExtension)) {
    return {
      isValid: false,
      error: 'File extension does not match file type'
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Validate file size
 * @param {number} fileSize - File size in bytes
 * @returns {Object} Validation result
 */
export function validateFileSize(fileSize) {
  if (fileSize > MAX_FILE_SIZE) {
    return {
      isValid: false,
      error: `File size exceeds ${MAX_FILE_SIZE / (1024 * 1024)}MB limit`
    };
  }
  
  return {
    isValid: true,
    error: null
  };
}

/**
 * Sanitize filename to prevent path traversal attacks
 * @param {string} filename - Original filename
 * @returns {string} Sanitized filename
 */
export function sanitizeFilename(filename) {
  // Remove path separators and other dangerous characters
  return filename
    .replace(/[\/\\:*?"<>|]/g, '_')
    .replace(/\.\./g, '_')
    .replace(/^\.+/, '')
    .trim();
}

/**
 * Generate secure filename with timestamp and random string
 * @param {string} originalFilename - Original filename
 * @returns {string} Secure filename
 */
export function generateSecureFilename(originalFilename) {
  const sanitized = sanitizeFilename(originalFilename);
  const extension = path.extname(sanitized);
  const nameWithoutExt = path.basename(sanitized, extension);
  const timestamp = Date.now();
  const randomString = Math.random().toString(36).substring(2, 15);
  
  return `${nameWithoutExt}-${timestamp}-${randomString}${extension}`;
}

/**
 * Get human-readable file size
 * @param {number} bytes - File size in bytes
 * @returns {string} Human-readable size
 */
export function formatFileSize(bytes) {
  if (bytes === 0) return '0 Bytes';
  
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
}

/**
 * Check if file is an image
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is an image
 */
export function isImageFile(mimeType) {
  return mimeType.startsWith('image/');
}

/**
 * Check if file is a document
 * @param {string} mimeType - File MIME type
 * @returns {boolean} True if file is a document
 */
export function isDocumentFile(mimeType) {
  const documentTypes = [
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    'application/vnd.ms-powerpoint',
    'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    'text/plain',
    'text/csv'
  ];
  
  return documentTypes.includes(mimeType);
}

/**
 * Get file category based on MIME type
 * @param {string} mimeType - File MIME type
 * @returns {string} File category
 */
export function getFileCategory(mimeType) {
  if (isImageFile(mimeType)) return 'image';
  if (isDocumentFile(mimeType)) return 'document';
  if (mimeType.includes('zip')) return 'archive';
  return 'other';
}