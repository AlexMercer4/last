import { useState } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";

export default function StudentsPage() {
  const navigate = useNavigate();
  const [searchQuery, setSearchQuery] = useState("");

  // Mock students data - replace with actual API calls
  const [students] = useState([
    {
      id: "1",
      name: "Ahmad Ali",
      studentId: "CS-2024-001",
      email: "ahmad.ali@student.edu",
      department: "Computer Science",
      semester: "6th",
      cgpa: 3.85,
      lastSession: "2024-06-20",
      totalSessions: 8,
    },
    {
      id: "2",
      name: "Fatima Khan",
      studentId: "EE-2024-015",
      email: "fatima.khan@student.edu",
      department: "Electrical Engineering",
      semester: "4th",
      cgpa: 3.92,
      lastSession: "2024-06-18",
      totalSessions: 5,
    },
    {
      id: "3",
      name: "Hassan Ahmed",
      studentId: "ME-2024-032",
      email: "hassan.ahmed@student.edu",
      department: "Mechanical Engineering",
      semester: "8th",
      cgpa: 2.95,
      lastSession: "2024-06-15",
      totalSessions: 12,
    },
    {
      id: "4",
      name: "Ayesha Malik",
      studentId: "CS-2024-045",
      email: "ayesha.malik@student.edu",
      department: "Computer Science",
      semester: "2nd",
      cgpa: 3.67,
      lastSession: "2024-06-10",
      totalSessions: 3,
    },
    {
      id: "5",
      name: "Omar Sheikh",
      studentId: "CE-2024-021",
      email: "omar.sheikh@student.edu",
      department: "Civil Engineering",
      semester: "6th",
      cgpa: 3.45,
      totalSessions: 2,
    },
  ]);

  const handleViewDetails = (student) => {
    // Navigate to student profile page
    navigate(`/profile/${student.id}`);
  };

  const handleMessageStudent = (student) => {
    // Navigate to messages page with student ID as query parameter
    navigate(`/messages?userId=${student.id}`);
  };

  const handleViewNotes = (student) => {
    // Navigate to student notes page
    navigate(`/students/${student.id}/notes`);
  };

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 3.5) return "text-green-600";
    if (cgpa >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  const filteredStudents = students.filter((student) => {
    const matchesSearch =
      student.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.studentId.toLowerCase().includes(searchQuery.toLowerCase()) ||
      student.email.toLowerCase().includes(searchQuery.toLowerCase());

    return matchesSearch;
  });

  const formatDate = (dateString) => {
    if (!dateString) return "Never";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "short",
      day: "numeric",
      year: "numeric",
    });
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Students</h1>
          <p className="text-gray-600 mt-2">
            Manage and track your assigned student&apos;s progress.
          </p>
        </div>

        {/* Search */}
        <div className="mb-6">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name, ID, or email..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>

        {/* Students Grid */}
        {filteredStudents.length === 0 ? (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-500">
              {searchQuery
                ? "Try adjusting your search criteria"
                : "No students assigned yet"}
            </p>
          </div>
        ) : (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {filteredStudents.map((student) => (
              <Card
                key={student.id}
                className="hover:shadow-md transition-shadow duration-200"
              >
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <div className="bg-[#0056b3] text-white p-2 rounded-full">
                        <Users className="h-4 w-4" />
                      </div>
                      <div>
                        <h3 className="font-medium text-gray-900">
                          {student.name}
                        </h3>
                        <p className="text-sm text-gray-500">
                          {student.studentId}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Department:</span>
                      <span className="text-gray-900">
                        {student.department}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Semester:</span>
                      <span className="text-gray-900">{student.semester}</span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">CGPA:</span>
                      <span
                        className={`font-medium ${getCGPAColor(student.cgpa)}`}
                      >
                        {student.cgpa.toFixed(2)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Last Session:</span>
                      <span className="text-gray-900">
                        {formatDate(student.lastSession)}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Sessions:</span>
                      <span className="text-gray-900">
                        {student.totalSessions}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <Button
                      size="sm"
                      className="bg-[#0056b3] hover:bg-[#004494] flex-1"
                      onClick={() => handleViewDetails(student)}
                    >
                      View Details
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleMessageStudent(student)}
                    >
                      Message
                    </Button>
                  </div>

                  <div>
                    <Button
                      size="sm"
                      variant="outline"
                      className="w-full border-[#ffbc3b] text-[#ffbc3b] hover:bg-[#ffbc3b] hover:text-white"
                      onClick={() => handleViewNotes(student)}
                    >
                      View Notes
                    </Button>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
