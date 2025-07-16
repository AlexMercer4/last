import axiosInstance from '@/lib/axiosInstance';

export const filesApi = {
  // Upload file to conversation
  uploadFile: async (conversationId, file, onUploadProgress) => {
    const formData = new FormData();
    formData.append('file', file);

    const response = await axiosInstance.post(
      `/files/conversations/${conversationId}/upload`,
      formData,
      {
        headers: {
          'Content-Type': 'multipart/form-data',
        },
        onUploadProgress: onUploadProgress ? (progressEvent) => {
          const percentCompleted = Math.round(
            (progressEvent.loaded * 100) / progressEvent.total
          );
          onUploadProgress(percentCompleted);
        } : undefined,
      }
    );
    return response.data.data.file; // Extract file object from nested response
  },

  // Get conversation files
  getConversationFiles: async (conversationId) => {
    const response = await axiosInstance.get(`/files/conversations/${conversationId}/files`);
    return response.data.data.files; // Extract files array from nested response
  },

  // Delete shared file
  deleteFile: async (fileId) => {
    const response = await axiosInstance.delete(`/files/${fileId}`);
    return response.data;
  },

  // Download file
  downloadFile: async (fileId, filename) => {
    const response = await axiosInstance.get(`/files/${fileId}/download`, {
      responseType: 'blob',
    });
    
    // Create blob link to download
    const url = window.URL.createObjectURL(new Blob([response.data]));
    const link = document.createElement('a');
    link.href = url;
    link.setAttribute('download', filename);
    document.body.appendChild(link);
    link.click();
    link.remove();
    window.URL.revokeObjectURL(url);
    
    return response.data;
  },

  // Get file info
  getFileInfo: async (fileId) => {
    const response = await axiosInstance.get(`/files/${fileId}`);
    return response.data;
  },
};