import { useState, useEffect } from "react";
import {
  User,
  GraduationCap,
  Phone,
  MapPin,
  UserCheck,
  Award,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
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
import { Badge } from "@/components/ui/badge";

export default function EditUserDialog({ open, onOpenChange, user, onSubmit }) {
  const [formData, setFormData] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState("");

  const departments = [
    "Computer Science",
    "Electrical Engineering",
    "Mechanical Engineering",
    "Civil Engineering",
    "Chemical Engineering",
    "Business Administration",
    "Economics",
    "Mathematics",
    "Physics",
    "Chemistry",
    "Psychology Department",
    "Student Affairs",
    "Academic Affairs",
    "Career Services",
    "Counseling Center",
    "Mental Health Services",
  ];

  const batches = [
    "Spring 2024",
    "Fall 2023",
    "Spring 2023",
    "Fall 2022",
    "Spring 2022",
    "Fall 2021",
    "Spring 2021",
    "Fall 2020",
  ];

  const semesters = [
    "1st Semester",
    "2nd Semester",
    "3rd Semester",
    "4th Semester",
    "5th Semester",
    "6th Semester",
    "7th Semester",
    "8th Semester",
  ];

  const commonSpecializations = [
    "Academic Counseling",
    "Career Guidance",
    "Personal Development",
    "Mental Health Support",
    "Study Skills",
    "Time Management",
    "Stress Management",
    "Relationship Counseling",
    "Financial Counseling",
    "Crisis Intervention",
  ];

  // Initialize form data when user changes
  useEffect(() => {
    if (user) {
      setFormData({
        name: user.name,
        email: user.email,
        phone: user.phone || "",
        address: user.address || "",
        department: user.department,
        ...(user.role === "student" && {
          batch: user.batch,
          currentSemester: user.currentSemester,
          assignedCounselor: user.assignedCounselor || "",
          emergencyContact: user.emergencyContact || {
            name: "",
            phone: "",
            relationship: "",
          },
        }),
        ...(user.role === "counselor" && {
          specialization: [...user.specialization],
          officeLocation: user.officeLocation || "",
          officeHours: user.officeHours || "",
          maxStudentsCapacity: user.maxStudentsCapacity,
        }),
      });
    }
  }, [user]);

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const handleEmergencyContactChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      emergencyContact: {
        ...prev.emergencyContact,
        [field]: value,
      },
    }));
  };

  const addSpecialization = (spec) => {
    if (
      spec &&
      formData.specialization &&
      !formData.specialization.includes(spec)
    ) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...(prev.specialization || []), spec],
      }));
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialization: (prev.specialization || []).filter((s) => s !== spec),
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
    } catch (error) {
      console.error("Error updating user:", error);
    } finally {
      setIsLoading(false);
    }
  };

  if (!user) return null;

  const isFormValid = formData.name && formData.email && formData.department;

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
              Edit {user.role === "student" ? "Student" : "Counselor"}
            </span>
          </DialogTitle>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Personal Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <User className="h-4 w-4" />
              <span>Personal Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="name">Full Name *</Label>
                <Input
                  id="name"
                  value={formData.name || ""}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email || ""}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="email@buitems.edu.pk"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone" className="flex items-center space-x-1">
                  <Phone className="h-3 w-3" />
                  <span>Phone Number</span>
                </Label>
                <Input
                  id="phone"
                  value={formData.phone || ""}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department || ""}
                  onValueChange={(value) =>
                    handleInputChange("department", value)
                  }
                >
                  <SelectTrigger>
                    <SelectValue placeholder="Select department" />
                  </SelectTrigger>
                  <SelectContent>
                    {departments.map((dept) => (
                      <SelectItem key={dept} value={dept}>
                        {dept}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Address</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address || ""}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter address"
                rows={2}
              />
            </div>
          </div>

          {/* Student-specific fields */}
          {user.role === "student" && (
            <>
              {/* Academic Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <GraduationCap className="h-4 w-4" />
                  <span>Academic Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Batch</Label>
                    <Select
                      value={formData.batch || ""}
                      onValueChange={(value) =>
                        handleInputChange("batch", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select batch" />
                      </SelectTrigger>
                      <SelectContent>
                        {batches.map((batch) => (
                          <SelectItem key={batch} value={batch}>
                            {batch}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="space-y-2">
                    <Label>Current Semester</Label>
                    <Select
                      value={formData.currentSemester || ""}
                      onValueChange={(value) =>
                        handleInputChange("currentSemester", value)
                      }
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Select semester" />
                      </SelectTrigger>
                      <SelectContent>
                        {semesters.map((semester) => (
                          <SelectItem key={semester} value={semester}>
                            {semester}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="assignedCounselor">Assigned Counselor</Label>
                  <Input
                    id="assignedCounselor"
                    value={formData.assignedCounselor || ""}
                    onChange={(e) =>
                      handleInputChange("assignedCounselor", e.target.value)
                    }
                    placeholder="Counselor name"
                  />
                </div>
              </div>

              {/* Emergency Contact */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <UserCheck className="h-4 w-4" />
                  <span>Emergency Contact</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="emergencyName">Contact Name</Label>
                    <Input
                      id="emergencyName"
                      value={formData.emergencyContact?.name || ""}
                      onChange={(e) =>
                        handleEmergencyContactChange("name", e.target.value)
                      }
                      placeholder="Emergency contact name"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyPhone">Contact Phone</Label>
                    <Input
                      id="emergencyPhone"
                      value={formData.emergencyContact?.phone || ""}
                      onChange={(e) =>
                        handleEmergencyContactChange("phone", e.target.value)
                      }
                      placeholder="+92 300 1234567"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="emergencyRelationship">Relationship</Label>
                    <Input
                      id="emergencyRelationship"
                      value={formData.emergencyContact?.relationship || ""}
                      onChange={(e) =>
                        handleEmergencyContactChange(
                          "relationship",
                          e.target.value
                        )
                      }
                      placeholder="Father, Mother, etc."
                    />
                  </div>
                </div>
              </div>
            </>
          )}

          {/* Counselor-specific fields */}
          {user.role === "counselor" && (
            <>
              {/* Professional Information */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
                  <Award className="h-4 w-4" />
                  <span>Professional Information</span>
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label
                      htmlFor="officeLocation"
                      className="flex items-center space-x-1"
                    >
                      <MapPin className="h-3 w-3" />
                      <span>Office Location</span>
                    </Label>
                    <Input
                      id="officeLocation"
                      value={formData.officeLocation || ""}
                      onChange={(e) =>
                        handleInputChange("officeLocation", e.target.value)
                      }
                      placeholder="Room 201, Counseling Center"
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officeHours">Office Hours</Label>
                    <Input
                      id="officeHours"
                      value={formData.officeHours || ""}
                      onChange={(e) =>
                        handleInputChange("officeHours", e.target.value)
                      }
                      placeholder="Mon-Fri: 9:00 AM - 5:00 PM"
                    />
                  </div>
                </div>

                <div className="space-y-2">
                  <Label htmlFor="maxStudentsCapacity">
                    Maximum Students Capacity
                  </Label>
                  <Input
                    id="maxStudentsCapacity"
                    type="number"
                    min="1"
                    max="100"
                    value={formData.maxStudentsCapacity || 30}
                    onChange={(e) =>
                      handleInputChange(
                        "maxStudentsCapacity",
                        parseInt(e.target.value) || 30
                      )
                    }
                    placeholder="30"
                  />
                </div>
              </div>

              {/* Specializations */}
              <div className="space-y-4">
                <h3 className="text-lg font-medium text-gray-900">
                  Specializations
                </h3>

                <div className="space-y-2">
                  <Label>Add Specialization</Label>
                  <div className="flex space-x-2">
                    <Select
                      value={newSpecialization}
                      onValueChange={setNewSpecialization}
                    >
                      <SelectTrigger className="flex-1">
                        <SelectValue placeholder="Select specialization" />
                      </SelectTrigger>
                      <SelectContent>
                        {commonSpecializations
                          .filter(
                            (spec) =>
                              !(formData.specialization || []).includes(spec)
                          )
                          .map((spec) => (
                            <SelectItem key={spec} value={spec}>
                              {spec}
                            </SelectItem>
                          ))}
                      </SelectContent>
                    </Select>
                    <Button
                      type="button"
                      onClick={() => addSpecialization(newSpecialization)}
                      disabled={!newSpecialization}
                      className="bg-[#0056b3] hover:bg-[#004494]"
                    >
                      Add
                    </Button>
                  </div>
                </div>

                {formData.specialization &&
                  formData.specialization.length > 0 && (
                    <div className="space-y-2">
                      <Label>Selected Specializations</Label>
                      <div className="flex flex-wrap gap-2">
                        {formData.specialization.map((spec) => (
                          <Badge
                            key={spec}
                            variant="secondary"
                            className="cursor-pointer hover:bg-red-100"
                            onClick={() => removeSpecialization(spec)}
                          >
                            {spec} ×
                          </Badge>
                        ))}
                      </div>
                    </div>
                  )}
              </div>
            </>
          )}

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => onOpenChange(false)}
              disabled={isLoading}
            >
              Cancel
            </Button>
            <Button
              type="submit"
              disabled={!isFormValid || isLoading}
              className="bg-[#0056b3] hover:bg-[#004494]"
            >
              {isLoading ? "Updating..." : "Update User"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
