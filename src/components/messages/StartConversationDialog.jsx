import { useState } from "react";
import { Search, User, Plus } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";

export default function StartConversationDialog({
  open,
  onOpenChange,
  userRole,
  onStartConversation,
}) {
  const [searchQuery, setSearchQuery] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Mock data - replace with actual API calls
  const counselors = [
    {
      id: "2",
      name: "Dr. Sarah Ahmed",
      email: "sarah@university.edu",
      role: "counselor",
      isOnline: true,
    },
    {
      id: "3",
      name: "Prof. Ahmad Hassan",
      email: "ahmad@university.edu",
      role: "counselor",
      isOnline: false,
    },
    {
      id: "4",
      name: "Dr. Fatima Sheikh",
      email: "fatima@university.edu",
      role: "counselor",
      isOnline: true,
    },
    {
      id: "5",
      name: "Dr. Ali Khan",
      email: "ali@university.edu",
      role: "counselor",
      isOnline: false,
    },
    {
      id: "6",
      name: "Prof. Zara Malik",
      email: "zara@university.edu",
      role: "counselor",
      isOnline: true,
    },
  ];

  const students = [
    {
      id: "7",
      name: "Ahmad Ali",
      email: "ahmad.ali@student.edu",
      role: "student",
      isOnline: true,
    },
    {
      id: "8",
      name: "Fatima Khan",
      email: "fatima.khan@student.edu",
      role: "student",
      isOnline: false,
    },
    {
      id: "9",
      name: "Hassan Ahmed",
      email: "hassan.ahmed@student.edu",
      role: "student",
      isOnline: true,
    },
    {
      id: "10",
      name: "Ayesha Malik",
      email: "ayesha.malik@student.edu",
      role: "student",
      isOnline: false,
    },
    {
      id: "11",
      name: "Omar Sheikh",
      email: "omar.sheikh@student.edu",
      role: "student",
      isOnline: true,
    },
  ];

  const availableUsers = userRole === "student" ? counselors : students;
  const filteredUsers = availableUsers.filter(
    (user) =>
      user.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      user.email.toLowerCase().includes(searchQuery.toLowerCase())
  );

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
            {filteredUsers.length === 0 ? (
              <div className="text-center py-8 text-gray-500">
                {searchQuery
                  ? "No users found matching your search"
                  : "No users available"}
              </div>
            ) : (
              filteredUsers.map((user) => (
                <div
                  key={user.id}
                  className="flex items-center justify-between p-3 rounded-lg border border-gray-200 hover:bg-gray-50 transition-colors duration-200"
                >
                  <div className="flex items-center space-x-3">
                    <div className="relative">
                      <div className="bg-gray-200 p-2 rounded-full">
                        <User className="h-5 w-5 text-gray-600" />
                      </div>
                      {user.isOnline && (
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
                      variant={user.isOnline ? "default" : "secondary"}
                      className={
                        user.isOnline
                          ? "bg-green-100 text-green-800"
                          : "bg-gray-100 text-gray-600"
                      }
                    >
                      {user.isOnline ? "Online" : "Offline"}
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
              ))
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
