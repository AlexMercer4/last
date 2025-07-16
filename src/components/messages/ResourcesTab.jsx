import { useState, useRef } from 'react';
import { 
  Upload, 
  Download, 
  Trash2, 
  File, 
  FileText, 
  Image, 
  FileArchive,
  X,
  Loader2
} from 'lucide-react';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { useConversationFiles, useUploadFile, useDeleteFile, useDownloadFile } from '@/hooks/useFiles';
import { formatFileSize, formatDate } from '@/utils/formatters';
import ErrorBoundary from '@/components/ErrorBoundary';

const getFileIcon = (mimeType) => {
  if (mimeType.startsWith('image/')) return Image;
  if (mimeType.includes('pdf') || mimeType.includes('document')) return FileText;
  if (mimeType.includes('zip') || mimeType.includes('archive')) return FileArchive;
  return File;
};

const getFileTypeColor = (mimeType) => {
  if (mimeType.startsWith('image/')) return 'bg-green-100 text-green-800';
  if (mimeType.includes('pdf')) return 'bg-red-100 text-red-800';
  if (mimeType.includes('document')) return 'bg-blue-100 text-blue-800';
  if (mimeType.includes('zip') || mimeType.includes('archive')) return 'bg-purple-100 text-purple-800';
  return 'bg-gray-100 text-gray-800';
};

export default function ResourcesTab({ conversationId, onClose }) {
  const [uploadProgress, setUploadProgress] = useState(null);
  const fileInputRef = useRef(null);
  
  const { data: files = [], isLoading, error } = useConversationFiles(conversationId);
  const uploadFileMutation = useUploadFile();
  const deleteFileMutation = useDeleteFile();
  const downloadFileMutation = useDownloadFile();

  const handleFileSelect = (e) => {
    const file = e.target.files?.[0];
    if (file) {
      handleUpload(file);
      e.target.value = '';
    }
  };

  const handleUpload = async (file) => {
    try {
      setUploadProgress(0);
      await uploadFileMutation.mutateAsync({
        conversationId,
        file,
        onUploadProgress: setUploadProgress,
      });
    } catch (error) {
      console.error('Upload failed:', error);
    } finally {
      setUploadProgress(null);
    }
  };

  const handleDownload = async (file) => {
    try {
      await downloadFileMutation.mutateAsync({
        fileId: file.id,
        filename: file.originalName,
      });
    } catch (error) {
      console.error('Download failed:', error);
    }
  };

  const handleDelete = async (fileId) => {
    if (window.confirm('Are you sure you want to delete this file? This action cannot be undone.')) {
      try {
        await deleteFileMutation.mutateAsync(fileId);
      } catch (error) {
        console.error('Delete failed:', error);
      }
    }
  };

  const handleDragOver = (e) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    
    const files = Array.from(e.dataTransfer.files);
    if (files.length > 0) {
      handleUpload(files[0]); // Only handle first file for single upload
    }
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <ErrorBoundary fallbackMessage="There was an error loading the resources tab. Please try again.">
        <Card className="w-full max-w-4xl max-h-[80vh] mx-4">
        <CardHeader className="flex flex-row items-center justify-between">
          <CardTitle className="text-xl font-semibold">Resources</CardTitle>
          <Button
            variant="ghost"
            size="sm"
            onClick={onClose}
            className="h-8 w-8 p-0"
          >
            <X className="h-4 w-4" />
          </Button>
        </CardHeader>
        
        <CardContent className="space-y-4">
          {/* Upload Area */}
          <div
            className="border-2 border-dashed border-gray-300 rounded-lg p-6 text-center hover:border-gray-400 transition-colors"
            onDragOver={handleDragOver}
            onDrop={handleDrop}
          >
            <input
              type="file"
              ref={fileInputRef}
              onChange={handleFileSelect}
              className="hidden"
              accept=".pdf,.doc,.docx,.txt,.jpg,.jpeg,.png,.gif,.zip,.rar"
            />
            
            {uploadProgress !== null ? (
              <div className="space-y-2">
                <Loader2 className="h-8 w-8 animate-spin mx-auto text-blue-500" />
                <p className="text-sm text-gray-600">Uploading... {uploadProgress}%</p>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div 
                    className="bg-blue-500 h-2 rounded-full transition-all duration-300"
                    style={{ width: `${uploadProgress}%` }}
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-2">
                <Upload className="h-8 w-8 mx-auto text-gray-400" />
                <div>
                  <p className="text-sm text-gray-600">
                    Drag and drop a file here, or{' '}
                    <button
                      onClick={() => fileInputRef.current?.click()}
                      className="text-blue-600 hover:text-blue-700 font-medium"
                      disabled={uploadFileMutation.isPending}
                    >
                      browse to upload
                    </button>
                  </p>
                  <p className="text-xs text-gray-500 mt-1">
                    Supports: PDF, DOC, DOCX, TXT, JPG, PNG, GIF, ZIP (Max 10MB)
                  </p>
                </div>
              </div>
            )}
          </div>

          {/* Files List */}
          <div className="space-y-2 max-h-96 overflow-y-auto">
            {error ? (
              <div className="text-center py-8 text-red-500">
                <File className="h-12 w-12 mx-auto mb-2 text-red-300" />
                <p>Failed to load files</p>
                <p className="text-sm">Please try refreshing or contact support</p>
              </div>
            ) : isLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading files...</span>
              </div>
            ) : files.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                <File className="h-12 w-12 mx-auto mb-2 text-gray-300" />
                <p>No files shared yet</p>
                <p className="text-sm">Upload a file to get started</p>
              </div>
            ) : (
              files.map((file) => {
                // Safety checks for file object
                if (!file || !file.id) return null;
                
                const FileIcon = getFileIcon(file.mimeType || 'application/octet-stream');
                const fileTypeColor = getFileTypeColor(file.mimeType || 'application/octet-stream');
                
                return (
                  <div
                    key={file.id}
                    className="flex items-center justify-between p-3 border border-gray-200 rounded-lg hover:bg-gray-50"
                  >
                    <div className="flex items-center space-x-3 flex-1 min-w-0">
                      <FileIcon className="h-8 w-8 text-gray-400 flex-shrink-0" />
                      <div className="flex-1 min-w-0">
                        <p className="text-sm font-medium text-gray-900 truncate">
                          {file.originalName}
                        </p>
                        <div className="flex items-center space-x-2 mt-1">
                          <Badge variant="secondary" className={`text-xs ${fileTypeColor}`}>
                            {(file.mimeType || 'unknown').split('/')[1]?.toUpperCase() || 'FILE'}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            {formatFileSize(file.size)}
                          </span>
                          <span className="text-xs text-gray-500">
                            {formatDate(file.createdAt)}
                          </span>
                        </div>
                        <p className="text-xs text-gray-500 mt-1">
                          Uploaded by {file.uploadedBy?.name || 'Unknown'}
                        </p>
                      </div>
                    </div>
                    
                    <div className="flex items-center space-x-2 flex-shrink-0">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDownload(file)}
                        disabled={downloadFileMutation.isPending}
                        className="h-8 w-8 p-0"
                      >
                        <Download className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDelete(file.id)}
                        disabled={deleteFileMutation.isPending}
                        className="h-8 w-8 p-0 text-red-600 hover:text-red-700 hover:bg-red-50"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </CardContent>
        </Card>
      </ErrorBoundary>
    </div>
  );
}