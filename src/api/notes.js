import axiosInstance from '@/lib/axiosInstance';

export const notesApi = {
  // Get student notes
  getStudentNotes: async (studentId, filters = {}) => {
    const params = new URLSearchParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(
      `/notes/students/${studentId}?${params.toString()}`
    );
    return response.data;
  },

  // Create student note
  createStudentNote: async (studentId, noteData) => {
    const response = await axiosInstance.post(`/notes/students/${studentId}`, noteData);
    return response.data;
  },

  // Update note
  updateNote: async (noteId, noteData) => {
    const response = await axiosInstance.put(`/notes/${noteId}`, noteData);
    return response.data;
  },

  // Delete note
  deleteNote: async (noteId) => {
    const response = await axiosInstance.delete(`/notes/${noteId}`);
    return response.data;
  },

  // Get note by ID
  getNoteById: async (noteId) => {
    const response = await axiosInstance.get(`/notes/${noteId}`);
    return response.data;
  },

  // Search notes
  searchNotes: async (query, filters = {}) => {
    const params = new URLSearchParams();
    params.append('q', query);
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null && value !== '') {
        params.append(key, value);
      }
    });
    
    const response = await axiosInstance.get(`/notes/search?${params.toString()}`);
    return response.data;
  },
};