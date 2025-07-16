import { useParams, useNavigate } from "react-router-dom";
import {
  ArrowLeft,
  User,
  Mail,
  Building,
  Calendar,
  GraduationCap,
  Phone,
  MapPin,
  Loader2,
  AlertCircle,
  MessageCircle,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { useUser } from "@/hooks/useUsers";
import { StudentNotesCard } from "@/components/StudentNotes";

export default function StudentProfilePage() {
  const { studentId } = useParams();
  const navigate = useNavigate();

  const {
    data: studentResponse,
    isLoading,
    isError,
    error,
    refetch,
  } = useUser(studentId);

  const student = studentResponse?.data;

  const handleMessageStudent = () => {
    navigate(`/messages?userId=${studentId}`);
  };

  const handleViewAllNotes = () => {
    navigate(`/students/${studentId}/notes`);
  };

  const formatDate = (dateString) => {
    if (!dateString) return "Not specified";
    return new Date(dateString).toLocaleDateString("en-US", {
      month: "long",
      day: "numeric",
      year: "numeric",
    });
  };

  const getCGPAColor = (cgpa) => {
    if (cgpa >= 3.5) return "text-green-600 bg-green-50";
    if (cgpa >= 3.0) return "text-yellow-600 bg-yellow-50";
    return "text-red-600 bg-red-50";
  };

  // Loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="flex items-center space-x-2">
          <Loader2 className="h-8 w-8 animate-spin text-[#0056b3]" />
          <span className="text-gray-600">Loading student profile...</span>
        </div>
      </div>
    );
  }

  // Error state
  if (isError) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Failed to load student profile
          </h3>
          <p className="text-gray-500 mb-4">
            {error?.response?.data?.error?.message || "Something went wrong while fetching student data."}
          </p>
          <div className="space-x-2">
            <Button 
              onClick={() => refetch()}
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              Try Again
            </Button>
            <Button 
              variant="outline"
              onClick={() => navigate("/students")}
            >
              Back to Students
            </Button>
          </div>
        </div>
      </div>
    );
  }

  // Student not found
  if (!student) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <User className="h-16 w-16 text-gray-400 mx-auto mb-4" />
          <h3 className="text-lg font-medium text-gray-900 mb-2">
            Student not found
          </h3>
          <p className="text-gray-500 mb-4">
            The student you're looking for doesn't exist or you don't have permission to view their profile.
          </p>
          <Button 
            onClick={() => navigate("/students")}
            className="bg-[#0056b3] hover:bg-[#004494]"
          >
            Back to Students
          </Button>
        </div>
      </div>
    );
  }

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

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Left Column - Student Information */}
          <div className="lg:col-span-1 space-y-6">
            {/* Basic Information Card */}
            <Card>
              <CardHeader>
                <div className="flex items-center space-x-4">
                  <div className="bg-[#0056b3] text-white p-3 rounded-full">
                    <User className="h-6 w-6" />
                  </div>
                  <div>
                    <CardTitle className="text-xl">{student.name}</CardTitle>
                    <p className="text-gray-600">{student.studentId}</p>
                  </div>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">{student.email}</span>
                </div>

                <div className="flex items-center space-x-3">
                  <Building className="h-4 w-4 text-gray-400" />
                  <span className="text-sm text-gray-600">
                    {student.department || 'Not specified'}
                  </span>
                </div>

                {student.semester && (
                  <div className="flex items-center space-x-3">
                    <GraduationCap className="h-4 w-4 text-gray-400" />
                    <span className="text-sm text-gray-600">
                      {student.semester} Semester
                    </span>
                  </div>
                )}

                {student.cgpa && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">CGPA:</span>
                    <Badge className={getCGPAColor(student.cgpa)}>
                      {parseFloat(student.cgpa).toFixed(2)}
                    </Badge>
                  </div>
                )}

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Status:</span>
                  <Badge variant={student.isActive ? "default" : "destructive"}>
                    {student.isActive ? "Active" : "Inactive"}
                  </Badge>
                </div>

                <div className="flex items-center justify-between">
                  <span className="text-sm text-gray-600">Total Sessions:</span>
                  <span className="text-sm font-medium">
                    {student.totalSessions || 0}
                  </span>
                </div>

                {student.lastSession && (
                  <div className="flex items-center justify-between">
                    <span className="text-sm text-gray-600">Last Session:</span>
                    <span className="text-sm font-medium">
                      {formatDate(student.lastSession)}
                    </span>
                  </div>
                )}

                <div className="pt-4 border-t">
                  <Button
                    onClick={handleMessageStudent}
                    className="w-full bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
                  >
                    <MessageCircle className="h-4 w-4" />
                    <span>Send Message</span>
                  </Button>
                </div>
              </CardContent>
            </Card>

            {/* Contact Information Card */}
            {(student.phone || student.address || student.emergencyContact) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Contact Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-400" />
                      <span className="text-sm text-gray-600">{student.phone}</span>
                    </div>
                  )}

                  {student.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-400 mt-0.5" />
                      <span className="text-sm text-gray-600">{student.address}</span>
                    </div>
                  )}

                  {student.emergencyContact && (
                    <div className="pt-2 border-t">
                      <h4 className="text-sm font-medium text-gray-900 mb-2">
                        Emergency Contact
                      </h4>
                      <div className="space-y-1">
                        {student.emergencyContact.name && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Name:</span> {student.emergencyContact.name}
                          </p>
                        )}
                        {student.emergencyContact.phone && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Phone:</span> {student.emergencyContact.phone}
                          </p>
                        )}
                        {student.emergencyContact.relationship && (
                          <p className="text-sm text-gray-600">
                            <span className="font-medium">Relationship:</span> {student.emergencyContact.relationship}
                          </p>
                        )}
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}

            {/* Academic Information Card */}
            {(student.enrollmentDate || student.expectedGraduation || student.academicAdvisor) && (
              <Card>
                <CardHeader>
                  <CardTitle className="text-lg">Academic Information</CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  {student.enrollmentDate && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Enrollment Date:</span>
                      <span className="text-sm font-medium">
                        {formatDate(student.enrollmentDate)}
                      </span>
                    </div>
                  )}

                  {student.expectedGraduation && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Expected Graduation:</span>
                      <span className="text-sm font-medium">
                        {formatDate(student.expectedGraduation)}
                      </span>
                    </div>
                  )}

                  {student.academicAdvisor && (
                    <div className="flex items-center justify-between">
                      <span className="text-sm text-gray-600">Academic Advisor:</span>
                      <span className="text-sm font-medium">
                        {student.academicAdvisor}
                      </span>
                    </div>
                  )}
                </CardContent>
              </Card>
            )}
          </div>

          {/* Right Column - Student Notes */}
          <div className="lg:col-span-2">
            <div className="space-y-6">
              {/* Notes Header */}
              <div className="flex items-center justify-between">
                <h2 className="text-2xl font-bold text-gray-900">Student Notes</h2>
                <Button
                  onClick={handleViewAllNotes}
                  variant="outline"
                  className="flex items-center space-x-2"
                >
                  <FileText className="h-4 w-4" />
                  <span>View All Notes</span>
                </Button>
              </div>

              {/* Student Notes Component */}
              <StudentNotesCard
                studentId={studentId}
                studentName={student.name}
                compact={true}
                maxNotes={5}
              />
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}