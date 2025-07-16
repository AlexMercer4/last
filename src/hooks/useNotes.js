import { useMutation, useQuery, useQueryClient } from '@tanstack/react-query';
import { notesApi } from '@/api/notes';
import { toast } from 'sonner';

// Query keys
export const noteKeys = {
  all: ['notes'],
  lists: () => [...noteKeys.all, 'list'],
  list: (studentId, filters) => [...noteKeys.lists(), studentId, { filters }],
  details: () => [...noteKeys.all, 'detail'],
  detail: (id) => [...noteKeys.details(), id],
  search: (query, filters) => [...noteKeys.all, 'search', query, { filters }],
};

// Get student notes
export const useStudentNotes = (studentId, filters = {}) => {
  return useQuery({
    queryKey: noteKeys.list(studentId, filters),
    queryFn: () => notesApi.getStudentNotes(studentId, filters),
    enabled: !!studentId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Get note by ID
export const useNote = (noteId) => {
  return useQuery({
    queryKey: noteKeys.detail(noteId),
    queryFn: () => notesApi.getNoteById(noteId),
    enabled: !!noteId,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
};

// Search notes
export const useSearchNotes = (query, filters = {}) => {
  return useQuery({
    queryKey: noteKeys.search(query, filters),
    queryFn: () => notesApi.searchNotes(query, filters),
    enabled: !!query && query.length >= 2, // Only search with 2+ characters
    staleTime: 1000 * 60 * 2, // 2 minutes
  });
};

// Create student note mutation
export const useCreateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ studentId, noteData }) => notesApi.createStudentNote(studentId, noteData),
    onSuccess: (response, { studentId }) => {
      const newNote = response.data;
      
      // Update all cached queries for this student
      queryClient.setQueriesData(
        { queryKey: [...noteKeys.lists(), studentId] },
        (old) => {
          if (!old) return old;
          
          // Handle the API response structure: { data: { notes: [...], student: {...} } }
          if (old.data && Array.isArray(old.data.notes)) {
            return {
              ...old,
              data: {
                ...old.data,
                notes: [newNote, ...old.data.notes]
              }
            };
          }
          
          return old;
        }
      );
      
      // Invalidate all lists for this student to ensure fresh data
      queryClient.invalidateQueries({ 
        queryKey: [...noteKeys.lists(), studentId] 
      });
      
      toast.success('Note created successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to create note';
      toast.error(message);
    },
  });
};

// Update note mutation
export const useUpdateNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: ({ noteId, noteData }) => notesApi.updateNote(noteId, noteData),
    onSuccess: (response, { noteId }) => {
      const updatedNote = response.data;
      
      // Update note in all relevant lists
      queryClient.setQueriesData(
        { queryKey: noteKeys.lists() },
        (old) => {
          if (!old) return old;
          
          // Handle the API response structure: { data: { notes: [...], student: {...} } }
          if (old.data && Array.isArray(old.data.notes)) {
            return {
              ...old,
              data: {
                ...old.data,
                notes: old.data.notes.map(note => 
                  note.id === noteId ? updatedNote : note
                )
              }
            };
          }
          
          return old;
        }
      );
      
      // Update individual note cache
      queryClient.setQueryData(noteKeys.detail(noteId), response);
      
      toast.success('Note updated successfully');
    },
    onError: (error) => {
      const message = error.response?.data?.error?.message || 'Failed to update note';
      toast.error(message);
    },
    onSettled: (data, error, { noteId }) => {
      // Always refetch after error or success
      queryClient.invalidateQueries({ queryKey: noteKeys.detail(noteId) });
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
};

// Delete note mutation
export const useDeleteNote = () => {
  const queryClient = useQueryClient();
  
  return useMutation({
    mutationFn: notesApi.deleteNote,
    onMutate: async (noteId) => {
      // Optimistically remove from all lists
      queryClient.setQueriesData(
        { queryKey: noteKeys.lists() },
        (old) => {
          if (!old) return old;
          
          // Handle the API response structure: { data: { notes: [...], student: {...} } }
          if (old.data && Array.isArray(old.data.notes)) {
            return {
              ...old,
              data: {
                ...old.data,
                notes: old.data.notes.filter(note => note.id !== noteId)
              }
            };
          }
          
          return old;
        }
      );
      
      // Remove detail
      queryClient.removeQueries({ queryKey: noteKeys.detail(noteId) });
      
      return { noteId };
    },
    onError: (error, noteId, context) => {
      // Rollback - invalidate queries to refetch
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
      
      const message = error.response?.data?.error?.message || 'Failed to delete note';
      toast.error(message);
    },
    onSuccess: (data, noteId) => {
      // Ensure note is removed from cache
      queryClient.removeQueries({ queryKey: noteKeys.detail(noteId) });
      
      // Invalidate search results
      queryClient.invalidateQueries({ 
        queryKey: [...noteKeys.all, 'search'] 
      });
      
      toast.success('Note deleted successfully');
    },
    onSettled: () => {
      // Always refetch lists to ensure consistency
      queryClient.invalidateQueries({ queryKey: noteKeys.lists() });
    },
  });
};