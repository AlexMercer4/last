import { useState, useCallback } from 'react';
import { handleApiError } from '@/lib/errorHandling';

// Custom hook for managing API call states
export function useApiState(initialLoading = false) {
  const [isLoading, setIsLoading] = useState(initialLoading);
  const [error, setError] = useState(null);
  
  const execute = useCallback(async (apiCall, context = '', options = {}) => {
    const { 
      showErrorToast = true, 
      onSuccess, 
      onError,
      resetErrorOnStart = true 
    } = options;
    
    try {
      if (resetErrorOnStart) {
        setError(null);
      }
      setIsLoading(true);
      
      const result = await apiCall();
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorInfo = handleApiError(err, context, { showToast: showErrorToast });
      setError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw err; // Re-throw for caller to handle if needed
    } finally {
      setIsLoading(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsLoading(false);
    setError(null);
  }, []);
  
  return {
    isLoading,
    error,
    execute,
    reset,
    hasError: !!error,
  };
}

// Hook for managing form submission states
export function useFormSubmission() {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [submitError, setSubmitError] = useState(null);
  const [submitSuccess, setSubmitSuccess] = useState(false);
  
  const submit = useCallback(async (submitFn, options = {}) => {
    const { 
      onSuccess, 
      onError, 
      successMessage = 'Operation completed successfully',
      resetOnStart = true 
    } = options;
    
    try {
      if (resetOnStart) {
        setSubmitError(null);
        setSubmitSuccess(false);
      }
      setIsSubmitting(true);
      
      const result = await submitFn();
      
      setSubmitSuccess(true);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorInfo = handleApiError(err, 'Form submission failed');
      setSubmitError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw err;
    } finally {
      setIsSubmitting(false);
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsSubmitting(false);
    setSubmitError(null);
    setSubmitSuccess(false);
  }, []);
  
  return {
    isSubmitting,
    submitError,
    submitSuccess,
    submit,
    reset,
    hasError: !!submitError,
  };
}

// Hook for managing file upload states
export function useFileUpload() {
  const [uploadProgress, setUploadProgress] = useState(0);
  const [isUploading, setIsUploading] = useState(false);
  const [uploadError, setUploadError] = useState(null);
  
  const upload = useCallback(async (uploadFn, options = {}) => {
    const { onSuccess, onError, onProgress } = options;
    
    try {
      setUploadError(null);
      setIsUploading(true);
      setUploadProgress(0);
      
      const result = await uploadFn((progress) => {
        setUploadProgress(progress);
        if (onProgress) {
          onProgress(progress);
        }
      });
      
      setUploadProgress(100);
      
      if (onSuccess) {
        onSuccess(result);
      }
      
      return result;
    } catch (err) {
      const errorInfo = handleApiError(err, 'File upload failed');
      setUploadError(errorInfo);
      
      if (onError) {
        onError(errorInfo);
      }
      
      throw err;
    } finally {
      setIsUploading(false);
      // Keep progress at 100% briefly to show completion
      setTimeout(() => setUploadProgress(0), 1000);
    }
  }, []);
  
  const reset = useCallback(() => {
    setIsUploading(false);
    setUploadProgress(0);
    setUploadError(null);
  }, []);
  
  return {
    uploadProgress,
    isUploading,
    uploadError,
    upload,
    reset,
    hasError: !!uploadError,
  };
}