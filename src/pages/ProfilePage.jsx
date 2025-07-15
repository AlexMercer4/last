import { useState } from "react";
import { useParams } from "react-router-dom";
import {
  User,
  Mail,
  Phone,
  Calendar,
  MapPin,
  UserCheck,
  BookOpen,
  GraduationCap,
  Edit,
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { toast } from "sonner";
import Header from "@/components/layout/Header";
import EditProfileDialog from "@/components/profile/EditProfileDialog";
import { useAuth } from "@/contexts/AuthContext";

export default function ProfilePage() {
  const { id } = useParams();
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const { user } = useAuth();
  const userRole = user?.role;

  // Mock function to get student data by ID
  const getStudentById = (studentId) => {
    const mockStudents = {
      1: {
        id: "1",
        name: "Ahmad Ali",
        email: "ahmad.ali@student.buitems.edu.pk",
        phone: "+92 300 1234567",
        role: "student",
        studentId: "CS-2024-001",
        department: "Computer Science",
        currentSemester: "6th Semester",
        cgpa: 3.85,
        enrollmentDate: "September 2022",
        academicAdvisor: "Dr. Sarah Ahmed",
        address: "House 123, Street 45, Quetta, Balochistan",
        emergencyContact: {
          name: "Muhammad Ali",
          phone: "+92 300 9876543",
          relationship: "Father",
        },
        createdAt: "2022-09-01T00:00:00Z",
        updatedAt: "2024-06-20T10:00:00Z",
        lastLogin: "2024-06-20T14:30:00Z",
      },
      2: {
        id: "2",
        name: "Fatima Khan",
        email: "fatima.khan@student.buitems.edu.pk",
        phone: "+92 301 2345678",
        role: "student",
        studentId: "EE-2024-015",
        department: "Electrical Engineering",
        currentSemester: "4th Semester",
        cgpa: 3.92,
        enrollmentDate: "September 2023",
        academicAdvisor: "Prof. Ahmad Hassan",
        address: "House 456, Street 78, Quetta, Balochistan",
        emergencyContact: {
          name: "Abdul Khan",
          phone: "+92 301 8765432",
          relationship: "Father",
        },
        createdAt: "2023-09-01T00:00:00Z",
        updatedAt: "2024-06-18T10:00:00Z",
        lastLogin: "2024-06-18T16:20:00Z",
      },
    };

    return mockStudents[studentId] || null;
  };

  // Mock user profile data - replace with actual API calls
  const [userProfile, setUserProfile] = useState(() => {
    // If viewing another user's profile (counselor viewing student)
    if (id && userRole === "counselor") {
      const studentProfile = getStudentById(id);
      if (studentProfile) {
        return studentProfile;
      }
    }

    // Default to current user's profile
    return {
      id: userRole === "counselor" ? "100" : "1",
      name: userRole === "counselor" ? "Dr. Sarah Ahmed" : "Ahmad Ali",
      email:
        userRole === "counselor"
          ? "sarah.ahmed@buitems.edu.pk"
          : "ahmad.ali@student.buitems.edu.pk",
      phone: userRole === "counselor" ? "+92 302 1234567" : "+92 300 1234567",
      role: userRole,
      studentId: userRole === "student" ? "CS-2024-001" : undefined,
      department:
        userRole === "student" ? "Computer Science" : "Psychology Department",
      currentSemester: userRole === "student" ? "6th Semester" : undefined,
      cgpa: userRole === "student" ? 3.85 : undefined,
      enrollmentDate: userRole === "student" ? "September 2022" : undefined,
      academicAdvisor: userRole === "student" ? "Dr. Sarah Ahmed" : undefined,
      employeeId: userRole === "counselor" ? "EMP-2020-045" : undefined,
      specialization:
        userRole === "counselor"
          ? ["Academic Counseling", "Career Guidance"]
          : undefined,
      officeLocation:
        userRole === "counselor" ? "Room 201, Counseling Center" : undefined,
      officeHours:
        userRole === "counselor" ? "Mon-Fri: 9:00 AM - 5:00 PM" : undefined,
      yearsOfExperience: userRole === "counselor" ? 8 : undefined,
      address: "House 123, Street 45, Quetta, Balochistan",
      emergencyContact: {
        name: userRole === "counselor" ? "Dr. Ahmad Ahmed" : "Muhammad Ali",
        phone: userRole === "counselor" ? "+92 302 9876543" : "+92 300 9876543",
        relationship: userRole === "counselor" ? "Spouse" : "Father",
      },
      createdAt: "2022-09-01T00:00:00Z",
      updatedAt: "2024-06-20T10:00:00Z",
      lastLogin: "2024-06-20T14:30:00Z",
    };
  });

  const isViewingOtherProfile = id && userRole === "counselor";

  const handleSaveProfile = async (updatedFields) => {
    try {
      // Simulate API call
      await new Promise((resolve) => setTimeout(resolve, 1000));

      setUserProfile((prev) => ({
        ...prev,
        ...updatedFields,
        updatedAt: new Date().toISOString(),
      }));

      toast.success("Profile updated successfully!");
    } catch (error) {
      toast.error("Failed to update profile. Please try again.");
      throw error;
    }
  };

  const handleResetPassword = () => {
    // This would typically open a password reset dialog or redirect to a password reset page
    toast.info("Password reset functionality would be implemented here");
  };

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getRoleColor = (role) => {
    switch (role) {
      case "student":
        return "bg-blue-100 text-blue-800";
      case "counselor":
        return "bg-green-100 text-green-800";
      case "chairperson":
        return "bg-purple-100 text-purple-800";
      case "super_admin":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={userRole} />

      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            {isViewingOtherProfile
              ? `${userProfile.name}'s Profile`
              : "Profile"}
          </h1>
          <p className="text-gray-600 mt-2">
            {isViewingOtherProfile
              ? "View student information and academic details."
              : "Manage your account information and settings."}
          </p>
        </div>

        {/* Profile Header Card */}
        <Card className="mb-8 bg-gradient-to-r from-[#0056b3] to-[#004494] text-white">
          <CardContent className="p-8">
            <div className="flex flex-col md:flex-row md:items-center md:justify-between">
              <div className="flex items-center space-x-4">
                <div className="bg-[#ffbc3b] p-4 rounded-full">
                  <User className="h-8 w-8 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold">{userProfile.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getRoleColor(userProfile.role)}>
                      {userProfile.role.charAt(0).toUpperCase() +
                        userProfile.role.slice(1)}
                    </Badge>
                    {userProfile.studentId && (
                      <span className="text-blue-100">
                        ID: {userProfile.studentId}
                      </span>
                    )}
                    {userProfile.employeeId && (
                      <span className="text-blue-100">
                        ID: {userProfile.employeeId}
                      </span>
                    )}
                    {userProfile.department && (
                      <span className="text-blue-100">
                        • {userProfile.department}
                      </span>
                    )}
                  </div>
                </div>
              </div>

              {!isViewingOtherProfile && (
                <div className="mt-4 md:mt-0 flex space-x-2">
                  <Button
                    onClick={() => setIsEditDialogOpen(true)}
                    className="bg-[#ffbc3b] hover:bg-[#e6a834] text-white flex items-center space-x-2"
                  >
                    <Edit className="h-4 w-4" />
                    <span>Edit Profile</span>
                  </Button>
                </div>
              )}
            </div>
          </CardContent>
        </Card>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Personal Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                <User className="h-5 w-5 text-[#0056b3]" />
                <span>Personal Information</span>
              </h3>

              <div className="space-y-4">
                <div className="flex items-center space-x-3">
                  <Mail className="h-4 w-4 text-gray-500" />
                  <div>
                    <p className="text-sm text-gray-500">Email</p>
                    <p className="text-gray-900">{userProfile.email}</p>
                  </div>
                </div>

                {userProfile.phone && (
                  <div className="flex items-center space-x-3">
                    <Phone className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">{userProfile.phone}</p>
                    </div>
                  </div>
                )}

                {userProfile.address && (
                  <div className="flex items-start space-x-3">
                    <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                    <div>
                      <p className="text-sm text-gray-500">Address</p>
                      <p className="text-gray-900">{userProfile.address}</p>
                    </div>
                  </div>
                )}

                {userProfile.enrollmentDate && (
                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Enrollment Date</p>
                      <p className="text-gray-900">
                        {userProfile.enrollmentDate}
                      </p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Academic/Professional Information */}
          <Card>
            <CardContent className="p-6">
              <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                {userProfile.role === "student" ? (
                  <BookOpen className="h-5 w-5 text-[#0056b3]" />
                ) : (
                  <GraduationCap className="h-5 w-5 text-[#0056b3]" />
                )}
                <span>
                  {userProfile.role === "student"
                    ? "Academic Information"
                    : "Professional Information"}
                </span>
              </h3>

              <div className="space-y-4">
                {userProfile.role === "student" && (
                  <>
                    {userProfile.currentSemester && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Current Semester
                        </p>
                        <p className="text-gray-900">
                          {userProfile.currentSemester}
                        </p>
                      </div>
                    )}

                    {userProfile.cgpa && (
                      <div>
                        <p className="text-sm text-gray-500">CGPA</p>
                        <p className="text-gray-900 font-semibold text-lg text-[#ffbc3b]">
                          {userProfile.cgpa.toFixed(2)}
                        </p>
                      </div>
                    )}

                    {userProfile.academicAdvisor && (
                      <div>
                        <p className="text-sm text-gray-500">
                          Academic Advisor
                        </p>
                        <p className="text-gray-900">
                          {userProfile.academicAdvisor}
                        </p>
                      </div>
                    )}
                  </>
                )}

                {userProfile.role === "counselor" && (
                  <>
                    {userProfile.specialization && (
                      <div>
                        <p className="text-sm text-gray-500">Specialization</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {userProfile.specialization.map((spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>
                    )}

                    {userProfile.officeLocation && (
                      <div>
                        <p className="text-sm text-gray-500">Office Location</p>
                        <p className="text-gray-900">
                          {userProfile.officeLocation}
                        </p>
                      </div>
                    )}

                    {userProfile.officeHours && (
                      <div>
                        <p className="text-sm text-gray-500">Office Hours</p>
                        <p className="text-gray-900">
                          {userProfile.officeHours}
                        </p>
                      </div>
                    )}
                  </>
                )}
              </div>
            </CardContent>
          </Card>

          {/* Emergency Contact */}
          {userProfile.emergencyContact && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <UserCheck className="h-5 w-5 text-[#0056b3]" />
                  <span>Emergency Contact</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Name</p>
                    <p className="text-gray-900">
                      {userProfile.emergencyContact.name}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Phone</p>
                    <p className="text-gray-900">
                      {userProfile.emergencyContact.phone}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Relationship</p>
                    <p className="text-gray-900">
                      {userProfile.emergencyContact.relationship}
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Account Security - Only show for own profile */}
          {!isViewingOtherProfile && (
            <Card>
              <CardContent className="p-6">
                <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                  <Key className="h-5 w-5 text-[#0056b3]" />
                  <span>Account Security</span>
                </h3>

                <div className="space-y-4">
                  <div>
                    <p className="text-sm text-gray-500">Last Login</p>
                    <p className="text-gray-900">
                      {userProfile.lastLogin
                        ? formatDate(userProfile.lastLogin)
                        : "Never"}
                    </p>
                  </div>

                  <div>
                    <p className="text-sm text-gray-500">Account Created</p>
                    <p className="text-gray-900">
                      {formatDate(userProfile.createdAt)}
                    </p>
                  </div>

                  <Button
                    onClick={handleResetPassword}
                    variant="outline"
                    className="w-full border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3] hover:text-white"
                  >
                    Reset Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Edit Profile Dialog - Only show for own profile */}
        {!isViewingOtherProfile && (
          <EditProfileDialog
            open={isEditDialogOpen}
            onOpenChange={setIsEditDialogOpen}
            userProfile={userProfile}
            onSave={handleSaveProfile}
          />
        )}
      </main>
    </div>
  );
}
