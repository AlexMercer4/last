import { useState } from "react";
import { Search, User, Plus, Loader2 } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { useStudents, useCounselors } from "@/hooks/useUsers";
import { useSocket } from "@/contexts/SocketContext";

export default function StartConversationDialog({
  open,
  onOpenChange,
  userRole,
  onStartConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  
  // Use hooks properly - they must be called at the top level
  const socketContext = useSocket();
  const isUserOnline = socketContext?.isUserOnline || (() => false);
  
  // Fetch real data from API
  const { data: counselors = [], isLoading: counselorsLoading, error: counselorsError } = useCounselors();
  const { data: students = [], isLoading: studentsLoading, error: studentsError } = useStudents();

  // Determine which users to show based on current user role
  const availableUsers = userRole === "student" ? (counselors || []) : (students || []);
  const isDataLoading = userRole === "student" ? counselorsLoading : studentsLoading;
  const hasError = userRole === "student" ? counselorsError : studentsError;

  // Filter users based on search query with null checks
  const filteredUsers = Array.isArray(availableUsers) ? availableUsers.filter(
    (user) =>
      user?.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user?.email?.toLowerCase().includes(searchQuery.toLowerCase())
  ) : [];

  const handleStartConversation = async (userId) => {
    setIsLoading(true);
    try {
      await onStartConversation(userId);
      onOpenChange(false);
      setSearchQuery("");
    } catch (error) {
      console.error("Error starting conversation:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetDialog = () => {
    setSearchQuery("");
  };

  return (
    <Dialog
      open={open}
      onOpenChange={(open) => {
        onOpenChange(open);
        if (!open) resetDialog();
      }}
    >
      <DialogContent className="sm:max-w-[500px] max-h-[600px]">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Plus className="h-5 w-5 text-[#0056b3]" />
            <span>
              Start New Conversation with{" "}
              {userRole === "student" ? "Counselor" : "Student"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-4">
          {/* Search Input */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder={`Search ${
                userRole === "student" ? "counselors" : "students"
              }...`}
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10 bg-gray-50 border-gray-200 focus:bg-white"
            />
          </div>

          {/* Users List */}
          <div className="max-h-80 overflow-y-auto space-y-2">
            {hasError ? (
              <div className="text-center py-8 text-red-500">
                <p>Failed to load {userRole === "student" ? "counselors" : "students"}</p>
                <p className="text-sm text-gray-500 mt-1">Please try again later</p>
              </div>
            ) : isDataLoading ? (
              <div className="flex items-center justify-center py-8">
                <Loader2 className="h-6 w-6 animate-spin text-gray-400" />
                <span className="ml-2 text-gray-600">Loading users...</span>
              </div>
            ) : filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? "No users found matching your search"
                  : `No ${userRole === "student" ? "counselors" : "students"} available`}
              </div>
            ) : (
              filteredUsers.map((user) => {
                const userIsOnline = isUserOnline ? isUserOnline(user.id) : false;
                return (
                  <div
                    key={user.id}
                    className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                  >
                    <div className="flex items-center space-x-3">
                      <div className="relative">
                        <div className="bg-gray-200 p-2 rounded-full">
                          <User className="h-5 w-5 text-gray-600" />
                        </div>
                        {userIsOnline && (
                          <div className="absolute -bottom-1 -right-1 w-3 h-3 bg-green-500 rounded-full border-2 border-white"></div>
                        )}
                      </div>

                      <div className="flex-1 min-w-0">
                        <h3 className="text-sm font-medium text-gray-900 truncate">
                          {user.name}
                        </h3>
                        <p className="text-xs text-gray-500 truncate">
                          {user.email}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge
                        variant={userIsOnline ? "default" : "secondary"}
                        className={
                          userIsOnline
                            ? "bg-green-100 text-green-800"
                            : "bg-gray-100 text-gray-600"
                        }
                      >
                        {userIsOnline ? "Online" : "Offline"}
                      </Badge>

                      <Button
                        size="sm"
                        onClick={() => handleStartConversation(user.id)}
                        disabled={isLoading}
                        className="bg-[#0056b3] hover:bg-[#004494] text-white"
                      >
                        {isLoading ? "Starting..." : "Start Chat"}
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
