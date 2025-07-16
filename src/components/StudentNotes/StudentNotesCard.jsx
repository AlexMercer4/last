import { useState } from "react";
import {
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
  Loader2,
  AlertCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { useStudentNotes, useCreateNote, useUpdateNote, useDeleteNote } from "@/hooks/useNotes";

export default function StudentNotesCard({ studentId, studentName, compact = false, maxNotes = 5 }) {
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [startDate, setStartDate] = useState("");
  const [endDate, setEndDate] = useState("");
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);

  // Form state
  const [noteTitle, setNoteTitle] = useState("");
  const [noteContent, setNoteContent] = useState("");
  const [sessionDate, setSessionDate] = useState("");
  const [isPrivate, setIsPrivate] = useState(false);

  // API hooks
  const filters = {
    search: searchQuery || undefined,
    startDate: startDate || undefined,
    endDate: endDate || undefined,
    limit: compact ? maxNotes : undefined,
  };

  const {
    data: notesResponse,
    isLoading: isLoadingNotes,
    isError: isNotesError,
    error: notesError,
    refetch: refetchNotes,
  } = useStudentNotes(studentId, filters);

  const createNoteMutation = useCreateNote();
  const updateNoteMutation = useUpdateNote();
  const deleteNoteMutation = useDeleteNote();

  const notes = notesResponse?.data?.notes || [];
  const studentData = notesResponse?.data?.student;

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteTitle("");
    setNoteContent("");
    setSessionDate("");
    setIsPrivate(false);
    setIsAddEditDialogOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteTitle(note.title);
    setNoteContent(note.content);
    setSessionDate(note.sessionDate ? new Date(note.sessionDate).toISOString().split('T')[0] : "");
    setIsPrivate(note.isPrivate);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteTitle.trim() || !noteContent.trim() || !sessionDate) return;

    const noteData = {
      title: noteTitle.trim(),
      content: noteContent.trim(),
      sessionDate: sessionDate,
      isPrivate,
    };

    try {
      if (editingNote) {
        await updateNoteMutation.mutateAsync({
          noteId: editingNote.id,
          noteData,
        });
      } else {
        await createNoteMutation.mutateAsync({
          studentId,
          noteData,
        });
      }

      setIsAddEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.error("Error saving note:", error);
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      await deleteNoteMutation.mutateAsync(noteToDelete.id);
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.error("Error deleting note:", error);
    }
  };

  const resetForm = () => {
    setNoteTitle("");
    setNoteContent("");
    setSessionDate("");
    setIsPrivate(false);
    setEditingNote(null);
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const isFormValid = noteTitle.trim() && noteContent.trim() && sessionDate;
  const isLoading = createNoteMutation.isPending || updateNoteMutation.isPending || deleteNoteMutation.isPending;

  if (isLoadingNotes) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Student Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-center py-8">
            <Loader2 className="h-6 w-6 animate-spin text-[#0056b3]" />
            <span className="ml-2 text-gray-600">Loading notes...</span>
          </div>
        </CardContent>
      </Card>
    );
  }

  if (isNotesError) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <FileText className="h-5 w-5" />
            <span>Student Notes</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="text-center py-8">
            <AlertCircle className="h-8 w-8 text-red-400 mx-auto mb-2" />
            <p className="text-gray-500 mb-4">
              {notesError?.response?.data?.error?.message || "Failed to load notes"}
            </p>
            <Button 
              onClick={() => refetchNotes()}
              size="sm"
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              Try Again
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5" />
              <span>Student Notes</span>
              {notes.length > 0 && (
                <span className="text-sm font-normal text-gray-500">
                  ({notes.length})
                </span>
              )}
            </CardTitle>
            <Button
              onClick={handleAddNote}
              size="sm"
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              <Plus className="h-4 w-4 mr-1" />
              Add Note
            </Button>
          </div>
        </CardHeader>

        <CardContent>
          {!compact && (
            <div className="flex flex-col sm:flex-row gap-4 mb-6">
              <div className="flex-1">
                <Input
                  placeholder="Search notes..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  className="w-full"
                />
              </div>

              <div className="flex gap-2">
                <Input
                  type="date"
                  placeholder="Start date"
                  value={startDate}
                  onChange={(e) => setStartDate(e.target.value)}
                  className="w-full sm:w-40"
                />
                <Input
                  type="date"
                  placeholder="End date"
                  value={endDate}
                  onChange={(e) => setEndDate(e.target.value)}
                  className="w-full sm:w-40"
                />
              </div>
            </div>
          )}

          {notes.length === 0 ? (
            <div className="text-center py-8">
              <FileText className="h-12 w-12 text-gray-400 mx-auto mb-4" />
              <h3 className="text-lg font-medium text-gray-900 mb-2">
                {searchQuery || startDate || endDate
                  ? "No notes found"
                  : "No notes yet"}
              </h3>
              <p className="text-gray-500 mb-4">
                {searchQuery || startDate || endDate
                  ? "Try adjusting your search or filter criteria"
                  : "Start by adding the first note for this student"}
              </p>
              {!searchQuery && !startDate && !endDate && (
                <Button
                  onClick={handleAddNote}
                  className="bg-[#0056b3] hover:bg-[#004494]"
                >
                  Add First Note
                </Button>
              )}
            </div>
          ) : (
            <div className="space-y-4">
              {notes.map((note) => (
                <div
                  key={note.id}
                  className="border rounded-lg p-4 hover:shadow-sm transition-shadow duration-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center space-x-3">
                      <h4 className="font-semibold text-gray-900">
                        {note.title}
                      </h4>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        {note.isPrivate ? (
                          <div className="flex items-center space-x-1">
                            <EyeOff className="h-3 w-3" />
                            <span>Private</span>
                          </div>
                        ) : (
                          <div className="flex items-center space-x-1">
                            <Eye className="h-3 w-3" />
                            <span>Shared</span>
                          </div>
                        )}
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleEditNote(note)}
                        className="text-gray-500 hover:text-gray-700 h-8 w-8 p-0"
                      >
                        <Edit className="h-3 w-3" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note)}
                        className="text-red-500 hover:text-red-700 h-8 w-8 p-0"
                      >
                        <Trash2 className="h-3 w-3" />
                      </Button>
                    </div>
                  </div>

                  <p className="text-gray-700 mb-3 text-sm leading-relaxed">
                    {compact && note.content.length > 150
                      ? `${note.content.substring(0, 150)}...`
                      : note.content}
                  </p>

                  <div className="flex items-center justify-between text-xs text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{note.counselor?.name || 'Counselor'}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>Session: {formatDate(note.sessionDate)}</span>
                      </div>
                    </div>

                    <div>
                      <div>Created: {formatDate(note.createdAt)}</div>
                      {note.updatedAt !== note.createdAt && (
                        <div>Updated: {formatDate(note.updatedAt)}</div>
                      )}
                    </div>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Add/Edit Note Dialog */}
      <Dialog
        open={isAddEditDialogOpen}
        onOpenChange={setIsAddEditDialogOpen}
      >
        <DialogContent className="sm:max-w-[600px] max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <FileText className="h-5 w-5 text-[#0056b3]" />
              <span>
                {editingNote ? "Edit Note" : "Add Note"} for{" "}
                {studentName || studentData?.name || 'Student'}
              </span>
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-6 py-4">
            {/* Note Title */}
            <div className="space-y-2">
              <Label htmlFor="title">Note Title</Label>
              <Input
                id="title"
                placeholder="Enter a title for this note..."
                value={noteTitle}
                onChange={(e) => setNoteTitle(e.target.value)}
              />
            </div>

            {/* Session Date */}
            <div className="space-y-2">
              <Label htmlFor="sessionDate">Session Date</Label>
              <Input
                id="sessionDate"
                type="date"
                value={sessionDate}
                onChange={(e) => setSessionDate(e.target.value)}
              />
            </div>

            {/* Note Content */}
            <div className="space-y-2">
              <Label htmlFor="content">Note Content</Label>
              <Textarea
                id="content"
                placeholder="Enter your note about the student's progress, behavior, or any observations..."
                value={noteContent}
                onChange={(e) => setNoteContent(e.target.value)}
                rows={6}
                className="resize-none"
              />
              <p className="text-xs text-gray-500">
                {noteContent.length}/1000 characters
              </p>
            </div>

            {/* Privacy Setting */}
            <div className="space-y-2">
              <Label>Privacy Setting</Label>
              <Select
                value={isPrivate ? "private" : "shared"}
                onValueChange={(value) => setIsPrivate(value === "private")}
              >
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="private">
                    Private (Only visible to you)
                  </SelectItem>
                  <SelectItem value="shared">
                    Shared (Visible to other counselors)
                  </SelectItem>
                </SelectContent>
              </Select>
              <p className="text-xs text-gray-500">
                {isPrivate
                  ? "This note will only be visible to you"
                  : "This note will be visible to other counselors working with this student"}
              </p>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => {
                setIsAddEditDialogOpen(false);
                resetForm();
              }}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="button"
              onClick={handleSaveNote}
              disabled={!isFormValid || isLoading}
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              {isLoading
                ? "Saving..."
                : editingNote
                ? "Update Note"
                : "Save Note"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Delete Confirmation Dialog */}
      <AlertDialog
        open={isDeleteDialogOpen}
        onOpenChange={setIsDeleteDialogOpen}
      >
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Delete Note</AlertDialogTitle>
            <AlertDialogDescription>
              Are you sure you want to delete this note? This action cannot be
              undone.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setNoteToDelete(null)}>
              Cancel
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={confirmDeleteNote}
              className="bg-red-600 hover:bg-red-700"
            >
              Delete
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </>
  );
}