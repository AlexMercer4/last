import { toast } from 'sonner';

// Error types
export const ERROR_TYPES = {
  NETWORK: 'NETWORK',
  VALIDATION: 'VALIDATION',
  AUTHENTICATION: 'AUTHENTICATION',
  AUTHORIZATION: 'AUTHORIZATION',
  NOT_FOUND: 'NOT_FOUND',
  CONFLICT: 'CONFLICT',
  SERVER: 'SERVER',
  UNKNOWN: 'UNKNOWN',
};

// Classify error type based on status code and error properties
export function classifyError(error) {
  if (!error.response) {
    return ERROR_TYPES.NETWORK;
  }

  const status = error.response.status;
  
  switch (status) {
    case 400:
    case 422:
      return ERROR_TYPES.VALIDATION;
    case 401:
      return ERROR_TYPES.AUTHENTICATION;
    case 403:
      return ERROR_TYPES.AUTHORIZATION;
    case 404:
      return ERROR_TYPES.NOT_FOUND;
    case 409:
      return ERROR_TYPES.CONFLICT;
    case 500:
    case 502:
    case 503:
    case 504:
      return ERROR_TYPES.SERVER;
    default:
      return ERROR_TYPES.UNKNOWN;
  }
}

// Get user-friendly error message
export function getErrorMessage(error, context = '') {
  const errorType = classifyError(error);
  const serverMessage = error.response?.data?.error?.message;
  
  // Use server message if available and user-friendly
  if (serverMessage && serverMessage.length < 200) {
    return serverMessage;
  }
  
  // Fallback to generic messages based on error type
  const contextPrefix = context ? `${context}: ` : '';
  
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      return `${contextPrefix}Network error. Please check your connection and try again.`;
    case ERROR_TYPES.VALIDATION:
      return `${contextPrefix}Please check your input and try again.`;
    case ERROR_TYPES.AUTHENTICATION:
      return `${contextPrefix}Please log in to continue.`;
    case ERROR_TYPES.AUTHORIZATION:
      return `${contextPrefix}You don't have permission to perform this action.`;
    case ERROR_TYPES.NOT_FOUND:
      return `${contextPrefix}The requested item was not found.`;
    case ERROR_TYPES.CONFLICT:
      return `${contextPrefix}This action conflicts with existing data.`;
    case ERROR_TYPES.SERVER:
      return `${contextPrefix}Server error. Please try again later.`;
    default:
      return `${contextPrefix}An unexpected error occurred.`;
  }
}

// Show error toast with appropriate styling
export function showErrorToast(error, context = '') {
  const message = getErrorMessage(error, context);
  const errorType = classifyError(error);
  
  // Different toast styles based on error type
  switch (errorType) {
    case ERROR_TYPES.NETWORK:
      toast.error(message, {
        description: 'Check your internet connection',
        duration: 5000,
      });
      break;
    case ERROR_TYPES.VALIDATION:
      toast.error(message, {
        description: 'Please review the form and try again',
        duration: 4000,
      });
      break;
    case ERROR_TYPES.AUTHORIZATION:
      toast.error(message, {
        description: 'Contact your administrator if you need access',
        duration: 6000,
      });
      break;
    case ERROR_TYPES.SERVER:
      toast.error(message, {
        description: 'Our team has been notified',
        duration: 5000,
      });
      break;
    default:
      toast.error(message, {
        duration: 4000,
      });
  }
}

// Log error for debugging (in development) or monitoring (in production)
export function logError(error, context = '', additionalData = {}) {
  const errorInfo = {
    message: error.message,
    status: error.response?.status,
    statusText: error.response?.statusText,
    url: error.config?.url,
    method: error.config?.method,
    context,
    timestamp: new Date().toISOString(),
    ...additionalData,
  };
  
  if (import.meta.env.NODE_ENV === 'development') {
    console.group(`🚨 API Error: ${context || 'Unknown'}`);
    console.error('Error details:', errorInfo);
    console.error('Full error object:', error);
    console.groupEnd();
  } else {
    // In production, you might want to send to error monitoring service
    // Example: Sentry, LogRocket, etc.
    console.error('API Error:', errorInfo);
  }
}

// Comprehensive error handler that combines logging and user notification
export function handleApiError(error, context = '', options = {}) {
  const {
    showToast = true,
    logError: shouldLog = true,
    additionalData = {},
  } = options;
  
  if (shouldLog) {
    logError(error, context, additionalData);
  }
  
  if (showToast) {
    showErrorToast(error, context);
  }
  
  return {
    type: classifyError(error),
    message: getErrorMessage(error, context),
    originalError: error,
  };
}