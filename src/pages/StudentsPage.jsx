import { useState, useEffect, useMemo } from "react";
import { useNavigate } from "react-router-dom";
import { Users, Search, Loader2, AlertCircle } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent } from "@/components/ui/card";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useStudents } from "@/hooks/useUsers";
import { useSocket } from "@/contexts/SocketContext";
import { useQueryClient } from "@tanstack/react-query";
import { userKeys } from "@/hooks/useUsers";

export default function StudentsPage() {
  const navigate = useNavigate();
  const queryClient = useQueryClient();
  const { socket, isConnected } = useSocket();
  
  // State for search and filtering
  const [searchQuery, setSearchQuery] = useState("");
  const [departmentFilter, setDepartmentFilter] = useState("");
  const [semesterFilter, setSemesterFilter] = useState("");
  const [cgpaFilter, setCgpaFilter] = useState("");

  // Fetch students data using React Query
  const { 
    data: students = [], 
    isLoading, 
    isError, 
    error,
    refetch 
  } = useStudents();

  // Set up real-time updates via Socket.io
  useEffect(() => {
    if (socket && isConnected) {
      // Listen for student data updates
      const handleStudentUpdate = (updatedStudent) => {
        queryClient.setQueryData(userKeys.students, (oldData) => {
          if (!oldData) return oldData;
          return oldData.map(student => 
            student.id === updatedStudent.id ? { ...student, ...updatedStudent } : student
          );
        });
      };

      const handleStudentAdded = (newStudent) => {
        if (newStudent.role === 'STUDENT') {
          queryClient.setQueryData(userKeys.students, (oldData) => {
            if (!oldData) return [newStudent];
            return [...oldData, newStudent];
          });
        }
      };

      const handleStudentRemoved = (studentId) => {
        queryClient.setQueryData(userKeys.students, (oldData) => {
          if (!oldData) return oldData;
          return oldData.filter(student => student.id !== studentId);
        });
      };

      // Socket event listeners
      socket.on('student-updated', handleStudentUpdate);
      socket.on('student-added', handleStudentAdded);
      socket.on('student-removed', handleStudentRemoved);
      socket.on('user-updated', handleStudentUpdate); // Generic user update

      return () => {
        socket.off('student-updated', handleStudentUpdate);
        socket.off('student-added', handleStudentAdded);
        socket.off('student-removed', handleStudentRemoved);
        socket.off('user-updated', handleStudentUpdate);
      };
    }
  }, [socket, isConnected, queryClient]);

  // Get unique values for filter options
  const filterOptions = useMemo(() => {
    if (!students.length) return { departments: [], semesters: [], cgpaRanges: [] };
    
    const departments = [...new Set(students.map(s => s.department).filter(Boolean))].sort();
    const semesters = [...new Set(students.map(s => s.semester).filter(Boolean))].sort();
    const cgpaRanges = [
      { label: "3.5 and above", value: "high" },
      { label: "3.0 - 3.49", value: "medium" },
      { label: "Below 3.0", value: "low" }
    ];
    
    return { departments, semesters, cgpaRanges };
  }, [students]);



  const handleMessageStudent = (student) => {
    // Navigate to messages page with student ID as query parameter
    navigate(`/messages?userId=${student.id}`);
  };

  const handleViewProfile = (student) => {
    // Navigate to student profile page
    navigate(`/students/${student.id}`);
  };

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 3.5) return "text-green-600";
    if (cgpa >= 3.0) return "text-yellow-600";
    return "text-red-600";
  };

  // Comprehensive filtering logic
  const filteredStudents = useMemo(() => {
    return students.filter((student) => {
      // Search filter
      const matchesSearch = !searchQuery || 
        student.name?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.studentId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.email?.toLowerCase().includes(searchQuery.toLowerCase()) ||
        student.department?.toLowerCase().includes(searchQuery.toLowerCase());

      // Department filter
      const matchesDepartment = !departmentFilter || student.department === departmentFilter;

      // Semester filter
      const matchesSemester = !semesterFilter || student.semester === semesterFilter;

      // CGPA filter
      const matchesCGPA = !cgpaFilter || (() => {
        const cgpa = parseFloat(student.cgpa) || 0;
        switch (cgpaFilter) {
          case 'high': return cgpa >= 3.5;
          case 'medium': return cgpa >= 3.0 && cgpa < 3.5;
          case 'low': return cgpa < 3.0;
          default: return true;
        }
      })();

      return matchesSearch && matchesDepartment && matchesSemester && matchesCGPA;
    });
  }, [students, searchQuery, departmentFilter, semesterFilter, cgpaFilter]);

  // Clear all filters
  const clearFilters = () => {
    setSearchQuery("");
    setDepartmentFilter("");
    setSemesterFilter("");
    setCgpaFilter("");
  };

  // Check if any filters are active
  const hasActiveFilters = searchQuery || departmentFilter || semesterFilter || cgpaFilter;

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

        {/* Search and Filters */}
        <div className="mb-6 space-y-4">
          {/* Search Bar */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-gray-400" />
            <Input
              placeholder="Search students by name, ID, email, or department..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              className="pl-10"
            />
          </div>

          {/* Filter Controls */}
          <div className="flex flex-wrap gap-4 items-center">
            <div className="flex-1 min-w-[200px]">
              <Select value={departmentFilter} onValueChange={setDepartmentFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Department" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.departments.map((dept) => (
                    <SelectItem key={dept} value={dept}>
                      {dept}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={semesterFilter} onValueChange={setSemesterFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by Semester" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.semesters.map((semester) => (
                    <SelectItem key={semester} value={semester}>
                      {semester}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            <div className="flex-1 min-w-[150px]">
              <Select value={cgpaFilter} onValueChange={setCgpaFilter}>
                <SelectTrigger>
                  <SelectValue placeholder="Filter by CGPA" />
                </SelectTrigger>
                <SelectContent>
                  {filterOptions.cgpaRanges.map((range) => (
                    <SelectItem key={range.value} value={range.value}>
                      {range.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="whitespace-nowrap"
              >
                Clear Filters
              </Button>
            )}
          </div>

          {/* Filter Summary */}
          {hasActiveFilters && (
            <div className="text-sm text-gray-600">
              Showing {filteredStudents.length} of {students.length} students
              {searchQuery && ` matching "${searchQuery}"`}
            </div>
          )}
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="flex items-center justify-center py-12">
            <Loader2 className="h-8 w-8 animate-spin text-[#0056b3]" />
            <span className="ml-2 text-gray-600">Loading students...</span>
          </div>
        )}

        {/* Error State */}
        {isError && (
          <div className="text-center py-12">
            <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              Failed to load students
            </h3>
            <p className="text-gray-500 mb-4">
              {error?.response?.data?.error?.message || "Something went wrong while fetching student data."}
            </p>
            <Button 
              onClick={() => refetch()}
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              Try Again
            </Button>
          </div>
        )}

        {/* Students Grid */}
        {!isLoading && !isError && filteredStudents.length === 0 && (
          <div className="text-center py-12">
            <Users className="h-16 w-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-lg font-medium text-gray-900 mb-2">
              No students found
            </h3>
            <p className="text-gray-500">
              {hasActiveFilters
                ? "Try adjusting your search criteria or filters"
                : "No students assigned yet"}
            </p>
            {hasActiveFilters && (
              <Button
                variant="outline"
                onClick={clearFilters}
                className="mt-4"
              >
                Clear All Filters
              </Button>
            )}
          </div>
        )}

        {!isLoading && !isError && filteredStudents.length > 0 && (
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
                          {student.studentId || 'N/A'}
                        </p>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2 mb-4">
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Email:</span>
                      <span className="text-gray-900 truncate">
                        {student.email}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Department:</span>
                      <span className="text-gray-900">
                        {student.department || 'N/A'}
                      </span>
                    </div>
                    {student.semester && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Semester:</span>
                        <span className="text-gray-900">{student.semester}</span>
                      </div>
                    )}
                    {student.cgpa && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">CGPA:</span>
                        <span
                          className={`font-medium ${getCGPAColor(student.cgpa)}`}
                        >
                          {parseFloat(student.cgpa).toFixed(2)}
                        </span>
                      </div>
                    )}
                    {student.lastSession && (
                      <div className="flex justify-between text-sm">
                        <span className="text-gray-500">Last Session:</span>
                        <span className="text-gray-900">
                          {formatDate(student.lastSession)}
                        </span>
                      </div>
                    )}
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Total Sessions:</span>
                      <span className="text-gray-900">
                        {student.totalSessions || 0}
                      </span>
                    </div>
                    <div className="flex justify-between text-sm">
                      <span className="text-gray-500">Status:</span>
                      <span className={`font-medium ${(student.isActive !== false) ? 'text-green-600' : 'text-red-600'}`}>
                        {(student.isActive !== false) ? 'Active' : 'Inactive'}
                      </span>
                    </div>
                  </div>

                  <div className="flex space-x-2 mb-2">
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1"
                      onClick={() => handleMessageStudent(student)}
                    >
                      Message
                    </Button>
                    <Button
                      size="sm"
                      variant="outline"
                      className="flex-1 border-[#ffbc3b] text-[#ffbc3b] hover:bg-[#ffbc3b] hover:text-white"
                      onClick={() => handleViewProfile(student)}
                    >
                      View Profile
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
