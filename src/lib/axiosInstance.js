import axios from 'axios';

// Create axios instance with base configuration
const axiosInstance = axios.create({
  baseURL: import.meta.env.NODE_ENV === 'production' 
    ? 'https://your-backend-url.com/api' 
    : 'http://localhost:5000/api',
  timeout: 15000, // Increased timeout for file uploads
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token and handle retries
axiosInstance.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('authToken');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    
    // Add retry configuration
    config.retry = config.retry || 0;
    config.retryDelay = config.retryDelay || 1000;
    
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors and retries
axiosInstance.interceptors.response.use(
  (response) => response,
  async (error) => {
    const config = error.config;
    
    // Handle authentication errors
    if (error.response?.status === 401) {
      // Token expired or invalid
      localStorage.removeItem('authToken');
      localStorage.removeItem('user');
      window.location.href = '/login';
      return Promise.reject(error);
    }
    
    // Handle network errors and 5xx server errors with retry logic
    const shouldRetry = (
      !error.response || // Network error
      error.response.status >= 500 || // Server error
      error.code === 'ECONNABORTED' // Timeout
    ) && config.retry < 3; // Max 3 retries
    
    if (shouldRetry) {
      config.retry += 1;
      
      // Exponential backoff
      const delay = config.retryDelay * Math.pow(2, config.retry - 1);
      
      await new Promise(resolve => setTimeout(resolve, delay));
      
      return axiosInstance(config);
    }
    
    // Format error for consistent handling
    const formattedError = {
      ...error,
      message: getErrorMessage(error),
      isNetworkError: !error.response,
      statusCode: error.response?.status,
    };
    
    return Promise.reject(formattedError);
  }
);

// Helper function to extract user-friendly error messages
function getErrorMessage(error) {
  // Network error
  if (!error.response) {
    return 'Network error. Please check your connection and try again.';
  }
  
  // Server provided error message
  if (error.response.data?.error?.message) {
    return error.response.data.error.message;
  }
  
  // Generic error message based on status code
  switch (error.response.status) {
    case 400:
      return 'Invalid request. Please check your input and try again.';
    case 401:
      return 'Authentication required. Please log in again.';
    case 403:
      return 'You do not have permission to perform this action.';
    case 404:
      return 'The requested resource was not found.';
    case 409:
      return 'Conflict. The resource already exists or is in use.';
    case 422:
      return 'Validation error. Please check your input.';
    case 429:
      return 'Too many requests. Please wait a moment and try again.';
    case 500:
      return 'Server error. Please try again later.';
    case 503:
      return 'Service temporarily unavailable. Please try again later.';
    default:
      return 'An unexpected error occurred. Please try again.';
  }
}

export default axiosInstance;