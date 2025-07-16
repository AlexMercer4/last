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
  Key,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import ChangePasswordDialog from "@/components/profile/ChangePasswordDialog";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users";
import { useQuery } from "@tanstack/react-query";

export default function ProfilePage() {
  const { id } = useParams();
  const [isChangePasswordDialogOpen, setIsChangePasswordDialogOpen] = useState(false);
  const { user } = useAuth();

  // Determine if viewing another user's profile
  const isViewingOtherProfile = id && id !== user?.id;
  const canViewOtherProfile = user?.role === "admin" || user?.role === "chairperson" || user?.role === "counselor";

  // Fetch user profile data
  const { data: userProfile, isLoading, error } = useQuery({
    queryKey: ["user", id || user?.id],
    queryFn: async () => {
      if (id && id !== user?.id) {
        // Viewing another user's profile
        if (!canViewOtherProfile) {
          throw new Error("Unauthorized to view other profiles");
        }
        const response = await usersApi.getUserById(id);
        return response.data;
      } else {
        // Viewing own profile - use current user data
        return user;
      }
    },
    enabled: !!user,
  });

  const handleChangePassword = () => {
    setIsChangePasswordDialogOpen(true);
  };

  // Show loading state
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading profile...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Show error state
  if (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Failed to load profile</p>
              <Button onClick={() => window.location.reload()}>
                Try Again
              </Button>
            </div>
          </div>
        </main>
      </div>
    );
  }

  if (!userProfile) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <p className="text-gray-600">Profile not found</p>
          </div>
        </main>
      </div>
    );
  }

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
              ? "View user information and details."
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

              {/* Show change password button only for own profile */}
              {!isViewingOtherProfile && (
                <div className="mt-4 md:mt-0">
                  <Button
                    onClick={handleChangePassword}
                    variant="outline"
                    className="border-white text-white hover:bg-white hover:text-[#0056b3] flex items-center space-x-2"
                  >
                    <Key className="h-4 w-4" />
                    <span>Change Password</span>
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
                    onClick={handleChangePassword}
                    variant="outline"
                    className="w-full border-[#0056b3] text-[#0056b3] hover:bg-[#0056b3] hover:text-white"
                  >
                    Change Password
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}
        </div>

        {/* Change Password Dialog - Only for own profile */}
        {!isViewingOtherProfile && (
          <ChangePasswordDialog
            open={isChangePasswordDialogOpen}
            onOpenChange={setIsChangePasswordDialogOpen}
          />
        )}
      </main>
    </div>
  );
}
