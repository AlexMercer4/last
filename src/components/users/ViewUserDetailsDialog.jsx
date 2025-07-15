import {
  User,
  Mail,
  Phone,
  MapPin,
  Calendar,
  GraduationCap,
  UserCheck,
  Award,
  Clock,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent } from "@/components/ui/card";

export default function ViewUserDetailsDialog({ open, onOpenChange, user }) {
  if (!user) return null;

  const formatDate = (dateString) => {
    return new Date(dateString).toLocaleDateString("en-US", {
      year: "numeric",
      month: "long",
      day: "numeric",
    });
  };

  const getStatusColor = (isActive) => {
    return isActive ? "bg-green-100 text-green-800" : "bg-red-100 text-red-800";
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            {user.role === "student" ? (
              <GraduationCap className="h-5 w-5 text-[#0056b3]" />
            ) : (
              <UserCheck className="h-5 w-5 text-[#0056b3]" />
            )}
            <span>
              {user.role === "student" ? "Student" : "Counselor"} Details
            </span>
          </DialogTitle>
        </DialogHeader>

        <div className="space-y-6">
          {/* Header Card */}
          <Card className="bg-gradient-to-r from-[#0056b3] to-[#004494] text-white">
            <CardContent className="p-6">
              <div className="flex items-center space-x-4">
                <div className="bg-[#ffbc3b] p-3 rounded-full">
                  <User className="h-6 w-6 text-white" />
                </div>
                <div className="flex-1">
                  <h2 className="text-xl font-bold">{user.name}</h2>
                  <div className="flex items-center space-x-2 mt-1">
                    <Badge className={getStatusColor(user.isActive)}>
                      {user.isActive ? "Active" : "Inactive"}
                    </Badge>
                    <span className="text-blue-100">
                      {user.role === "student" ? user.cmsId : user.employeeId}
                    </span>
                    <span className="text-blue-100">• {user.department}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
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
                      <p className="text-gray-900">{user.email}</p>
                    </div>
                  </div>

                  {user.phone && (
                    <div className="flex items-center space-x-3">
                      <Phone className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Phone</p>
                        <p className="text-gray-900">{user.phone}</p>
                      </div>
                    </div>
                  )}

                  {user.address && (
                    <div className="flex items-start space-x-3">
                      <MapPin className="h-4 w-4 text-gray-500 mt-1" />
                      <div>
                        <p className="text-sm text-gray-500">Address</p>
                        <p className="text-gray-900">{user.address}</p>
                      </div>
                    </div>
                  )}

                  <div className="flex items-center space-x-3">
                    <Calendar className="h-4 w-4 text-gray-500" />
                    <div>
                      <p className="text-sm text-gray-500">Created</p>
                      <p className="text-gray-900">
                        {formatDate(user.createdAt)}
                      </p>
                    </div>
                  </div>

                  {user.lastLogin && (
                    <div className="flex items-center space-x-3">
                      <Clock className="h-4 w-4 text-gray-500" />
                      <div>
                        <p className="text-sm text-gray-500">Last Login</p>
                        <p className="text-gray-900">
                          {formatDate(user.lastLogin)}
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
                  {user.role === "student" ? (
                    <GraduationCap className="h-5 w-5 text-[#0056b3]" />
                  ) : (
                    <Award className="h-5 w-5 text-[#0056b3]" />
                  )}
                  <span>
                    {user.role === "student"
                      ? "Academic Information"
                      : "Professional Information"}
                  </span>
                </h3>

                <div className="space-y-4">
                  {user.role === "student" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Batch</p>
                        <p className="text-gray-900">{user.batch}</p>
                      </div>

                      <div>
                        <p className="text-sm text-gray-500">
                          Current Semester
                        </p>
                        <p className="text-gray-900">{user.currentSemester}</p>
                      </div>

                      {user.cgpa && (
                        <div>
                          <p className="text-sm text-gray-500">CGPA</p>
                          <p className="text-gray-900 font-semibold text-lg text-[#ffbc3b]">
                            {user.cgpa?.toFixed(2)}
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500">Enrollment Date</p>
                        <p className="text-gray-900">
                          {formatDate(user.enrollmentDate)}
                        </p>
                      </div>

                      {user.assignedCounselor && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Assigned Counselor
                          </p>
                          <p className="text-gray-900">
                            {user.assignedCounselor}
                          </p>
                        </div>
                      )}
                    </>
                  )}

                  {user.role === "counselor" && (
                    <>
                      <div>
                        <p className="text-sm text-gray-500">Specializations</p>
                        <div className="flex flex-wrap gap-2 mt-1">
                          {user.specialization.map((spec, index) => (
                            <Badge key={index} variant="secondary">
                              {spec}
                            </Badge>
                          ))}
                        </div>
                      </div>

                      {user.officeLocation && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Office Location
                          </p>
                          <p className="text-gray-900">{user.officeLocation}</p>
                        </div>
                      )}

                      {user.officeHours && (
                        <div>
                          <p className="text-sm text-gray-500">Office Hours</p>
                          <p className="text-gray-900">{user.officeHours}</p>
                        </div>
                      )}

                      {user.yearsOfExperience && (
                        <div>
                          <p className="text-sm text-gray-500">
                            Years of Experience
                          </p>
                          <p className="text-gray-900">
                            {user.yearsOfExperience} years
                          </p>
                        </div>
                      )}

                      <div>
                        <p className="text-sm text-gray-500">
                          Student Capacity
                        </p>
                        <p className="text-gray-900">
                          {user.currentStudentsCount} /{" "}
                          {user.maxStudentsCapacity}
                        </p>
                      </div>
                    </>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Emergency Contact (for students) */}
            {user.role === "student" && user.emergencyContact && (
              <Card className="lg:col-span-2">
                <CardContent className="p-6">
                  <h3 className="text-lg font-semibold text-gray-900 mb-4 flex items-center space-x-2">
                    <UserCheck className="h-5 w-5 text-[#0056b3]" />
                    <span>Emergency Contact</span>
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    <div>
                      <p className="text-sm text-gray-500">Name</p>
                      <p className="text-gray-900">
                        {user.emergencyContact?.name}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Phone</p>
                      <p className="text-gray-900">
                        {user.emergencyContact?.phone}
                      </p>
                    </div>

                    <div>
                      <p className="text-sm text-gray-500">Relationship</p>
                      <p className="text-gray-900">
                        {user.emergencyContact?.relationship}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
