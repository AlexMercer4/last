import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { filesApi } from '@/api/files';
import { toast } from 'sonner';

// Query keys
export const fileKeys = {
  all: ['files'],
  conversation: (conversationId) => [...fileKeys.all, 'conversation', conversationId],
  file: (fileId) => [...fileKeys.all, 'file', fileId],
};

// Get conversation files
export const useConversationFiles = (conversationId) => {
  return useQuery({
    queryKey: fileKeys.conversation(conversationId),
    queryFn: () => filesApi.getConversationFiles(conversationId),
    enabled: !!conversationId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Upload file mutation
export const useUploadFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ conversationId, file, onUploadProgress }) => 
      filesApi.uploadFile(conversationId, file, onUploadProgress),
    onSuccess: (newFile, { conversationId }) => {
      // Add to conversation files list (ensure newFile is valid)
      if (newFile && newFile.id) {
        queryClient.setQueryData(fileKeys.conversation(conversationId), (old) => {
          if (!old) return [newFile];
          // Check if file already exists to avoid duplicates
          const fileExists = old.some(f => f.id === newFile.id);
          if (fileExists) return old;
          return [newFile, ...old];
        });
      }
      
      toast.success('File uploaded successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to upload file';
      toast.error(message);
    },
  });
};

// Delete file mutation
export const useDeleteFile = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: filesApi.deleteFile,
    onSuccess: (data, fileId) => {
      // Remove from all conversation files lists
      queryClient.setQueriesData(
        { queryKey: fileKeys.all },
        (old) => {
          if (!Array.isArray(old)) return old;
          return old.filter(file => file.id !== fileId);
        }
      );
      
      toast.success('File deleted successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to delete file';
      toast.error(message);
    },
  });
};

// Download file mutation
export const useDownloadFile = () => {
  return useMutation({
    mutationFn: ({ fileId, filename }) => filesApi.downloadFile(fileId, filename),
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to download file';
      toast.error(message);
    },
  });
};

// Get file info
export const useFileInfo = (fileId) => {
  return useQuery({
    queryKey: fileKeys.file(fileId),
    queryFn: () => filesApi.getFileInfo(fileId),
    enabled: !!fileId,
    staleTime: 1000 * 60 * 10, // 10 minutes
  });
};