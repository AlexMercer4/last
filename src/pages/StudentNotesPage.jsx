import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  FileText,
  Plus,
  Edit,
  Trash2,
  Eye,
  EyeOff,
  Calendar,
  User,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
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
import { toast } from "sonner";

export default function StudentNotesPage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const [notes, setNotes] = useState([]);
  const [filteredNotes, setFilteredNotes] = useState([]);
  const [searchQuery, setSearchQuery] = useState("");
  const [filterCategory, setFilterCategory] = useState("all");
  const [isAddEditDialogOpen, setIsAddEditDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [editingNote, setEditingNote] = useState(null);
  const [noteToDelete, setNoteToDelete] = useState(null);
  const [isLoading, setIsLoading] = useState(false);

  // Form state
  const [noteContent, setNoteContent] = useState("");
  const [noteCategory, setNoteCategory] = useState("");
  const [isPrivate, setIsPrivate] = useState(true);

  const noteCategories = [
    { value: "academic", label: "Academic Progress" },
    { value: "behavioral", label: "Behavioral Observation" },
    { value: "career", label: "Career Guidance" },
    { value: "personal", label: "Personal Development" },
    { value: "attendance", label: "Attendance & Engagement" },
    { value: "general", label: "General Notes" },
  ];

  // Mock student data - replace with actual API call
  const studentData = {
    id: studentId,
    name:
      studentId === "1"
        ? "Ahmad Ali"
        : studentId === "2"
        ? "Fatima Khan"
        : "Hassan Ahmed",
    studentId:
      studentId === "1"
        ? "CS-2024-001"
        : studentId === "2"
        ? "EE-2024-015"
        : "ME-2024-032",
    department:
      studentId === "1"
        ? "Computer Science"
        : studentId === "2"
        ? "Electrical Engineering"
        : "Mechanical Engineering",
    semester: studentId === "1" ? "6th" : studentId === "2" ? "4th" : "8th",
  };

  // Mock notes data - replace with actual API call
  useEffect(() => {
    const mockNotes = [
      {
        id: "1",
        studentId: studentId || "1",
        studentName: studentData.name,
        category: "academic",
        content:
          "Student is showing excellent progress in programming courses. Particularly strong in data structures and algorithms. Recommended for advanced courses next semester.",
        isPrivate: false,
        createdAt: "2024-06-20T10:00:00Z",
        updatedAt: "2024-06-20T10:00:00Z",
        createdBy: "Dr. Sarah Ahmed",
      },
      {
        id: "2",
        studentId: studentId || "1",
        studentName: studentData.name,
        category: "career",
        content:
          "Discussed career opportunities in software development. Student expressed interest in full-stack development and AI/ML. Provided resources for internship applications.",
        isPrivate: true,
        createdAt: "2024-06-18T14:30:00Z",
        updatedAt: "2024-06-18T14:30:00Z",
        createdBy: "Dr. Sarah Ahmed",
      },
      {
        id: "3",
        studentId: studentId || "1",
        studentName: studentData.name,
        category: "personal",
        content:
          "Student mentioned feeling overwhelmed with course load. Discussed time management strategies and stress reduction techniques. Follow-up scheduled.",
        isPrivate: true,
        createdAt: "2024-06-15T11:15:00Z",
        updatedAt: "2024-06-15T11:15:00Z",
        createdBy: "Dr. Sarah Ahmed",
      },
      {
        id: "4",
        studentId: studentId || "1",
        studentName: studentData.name,
        category: "behavioral",
        content:
          "Student has been actively participating in class discussions and group projects. Shows good leadership qualities and helps fellow students.",
        isPrivate: false,
        createdAt: "2024-06-10T09:45:00Z",
        updatedAt: "2024-06-10T09:45:00Z",
        createdBy: "Prof. Ahmad Hassan",
      },
    ];

    setNotes(mockNotes);
  }, [studentId]);

  // Filter notes based on search and category
  useEffect(() => {
    let filtered = notes;

    if (searchQuery) {
      filtered = filtered.filter(
        (note) =>
          note.content.toLowerCase().includes(searchQuery.toLowerCase()) ||
          note.category.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    if (filterCategory !== "all") {
      filtered = filtered.filter((note) => note.category === filterCategory);
    }

    setFilteredNotes(filtered);
  }, [notes, searchQuery, filterCategory]);

  const handleAddNote = () => {
    setEditingNote(null);
    setNoteContent("");
    setNoteCategory("");
    setIsPrivate(true);
    setIsAddEditDialogOpen(true);
  };

  const handleEditNote = (note) => {
    setEditingNote(note);
    setNoteContent(note.content);
    setNoteCategory(note.category);
    setIsPrivate(note.isPrivate);
    setIsAddEditDialogOpen(true);
  };

  const handleDeleteNote = (note) => {
    setNoteToDelete(note);
    setIsDeleteDialogOpen(true);
  };

  const handleSaveNote = async () => {
    if (!noteContent.trim() || !noteCategory) return;

    setIsLoading(true);
    try {
      if (editingNote) {
        // Update existing note
        const updatedNote = {
          ...editingNote,
          content: noteContent.trim(),
          category: noteCategory,
          isPrivate,
          updatedAt: new Date().toISOString(),
        };

        setNotes((prev) =>
          prev.map((note) => (note.id === editingNote.id ? updatedNote : note))
        );
        toast.success("Note updated successfully");
      } else {
        // Add new note
        const newNote = {
          id: Date.now().toString(),
          studentId: studentId || "1",
          studentName: studentData.name,
          category: noteCategory,
          content: noteContent.trim(),
          isPrivate,
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
          createdBy: "Dr. Sarah Ahmed",
        };

        setNotes((prev) => [newNote, ...prev]);
        toast.success("Note added successfully");
      }

      setIsAddEditDialogOpen(false);
      resetForm();
    } catch (error) {
      console.log(error);

      toast.error("Failed to save note. Please try again.");
    } finally {
      setIsLoading(false);
    }
  };

  const confirmDeleteNote = async () => {
    if (!noteToDelete) return;

    try {
      setNotes((prev) => prev.filter((note) => note.id !== noteToDelete.id));
      toast.success("Note deleted successfully");
      setIsDeleteDialogOpen(false);
      setNoteToDelete(null);
    } catch (error) {
      console.log(error);
      toast.error("Failed to delete note. Please try again.");
    }
  };

  const resetForm = () => {
    setNoteContent("");
    setNoteCategory("");
    setIsPrivate(true);
    setEditingNote(null);
  };

  const getCategoryColor = (category) => {
    switch (category) {
      case "academic":
        return "bg-blue-100 text-blue-800";
      case "behavioral":
        return "bg-green-100 text-green-800";
      case "career":
        return "bg-purple-100 text-purple-800";
      case "personal":
        return "bg-orange-100 text-orange-800";
      case "attendance":
        return "bg-red-100 text-red-800";
      case "general":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
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

  const isFormValid = noteContent.trim() && noteCategory;

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex items-center space-x-4 mb-8">
          <Button
            variant="ghost"
            onClick={() => navigate("/students")}
            className="flex items-center space-x-2 text-gray-600 hover:text-gray-900"
          >
            <ArrowLeft className="h-4 w-4" />
            <span>Back to Students</span>
          </Button>
        </div>

        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Notes for {studentData.name}
            </h1>
            <p className="text-gray-600 mt-2">
              {studentData.studentId} • {studentData.department} •{" "}
              {studentData.semester} Semester
            </p>
          </div>

          <Button
            onClick={handleAddNote}
            className="mt-4 sm:mt-0 bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
          >
            <Plus className="h-4 w-4" />
            <span>Add Note</span>
          </Button>
        </div>

        {/* Search and Filters */}
        <div className="flex flex-col sm:flex-row gap-4 mb-6">
          <div className="flex-1">
            <Input
              placeholder="Search notes..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="w-full"
            />
          </div>

          <Select value={filterCategory} onValueChange={setFilterCategory}>
            <SelectTrigger className="w-full sm:w-48">
              <SelectValue placeholder="Filter by category" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">All Categories</SelectItem>
              {noteCategories.map((category) => (
                <SelectItem key={category.value} value={category.value}>
                  {category.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Notes List */}
        {filteredNotes.length === 0 ? (
          <div className="text-center py-12">
            <FileText className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              {searchQuery || filterCategory !== "all"
                ? "No notes found"
                : "No notes yet"}
            </h3>
            <p className="text-gray-500 mb-4">
              {searchQuery || filterCategory !== "all"
                ? "Try adjusting your search or filter criteria"
                : "Start by adding the first note for this student"}
            </p>
            {!searchQuery && filterCategory === "all" && (
              <Button
                onClick={handleAddNote}
                className="bg-[#0056b3] hover:bg-[#004494]"
              >
                Add First Note
              </Button>
            )}
          </div>
        ) : (
          <div className="space-y-6">
            {filteredNotes.map((note) => (
              <Card
                key={note.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardHeader className="pb-3">
                  <div className="flex items-start justify-between">
                    <div className="flex items-center space-x-3">
                      <Badge className={getCategoryColor(note.category)}>
                        {noteCategories.find(
                          (cat) => cat.value === note.category
                        )?.label || note.category}
                      </Badge>
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
                        className="text-gray-500 hover:text-gray-700"
                      >
                        <Edit className="h-4 w-4" />
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleDeleteNote(note)}
                        className="text-red-500 hover:text-red-700"
                      >
                        <Trash2 className="h-4 w-4" />
                      </Button>
                    </div>
                  </div>
                </CardHeader>

                <CardContent>
                  <p className="text-gray-900 mb-4 leading-relaxed">
                    {note.content}
                  </p>

                  <div className="flex items-center justify-between text-sm text-gray-500">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center space-x-1">
                        <User className="h-3 w-3" />
                        <span>{note.createdBy}</span>
                      </div>
                      <div className="flex items-center space-x-1">
                        <Calendar className="h-3 w-3" />
                        <span>{formatDate(note.createdAt)}</span>
                      </div>
                    </div>

                    {note.updatedAt !== note.createdAt && (
                      <span className="text-xs">
                        Updated: {formatDate(note.updatedAt)}
                      </span>
                    )}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}

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
                  {studentData.name}
                </span>
              </DialogTitle>
            </DialogHeader>

            <div className="space-y-6 py-4">
              {/* Note Category */}
              <div className="space-y-2">
                <Label htmlFor="category">Note Category</Label>
                <Select value={noteCategory} onValueChange={setNoteCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Select note category" />
                  </SelectTrigger>
                  <SelectContent>
                    {noteCategories.map((category) => (
                      <SelectItem key={category.value} value={category.value}>
                        {category.label}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
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
      </main>
    </div>
  );
}
