import { useState } from "react";
import {
  User,
  GraduationCap,
  Phone,
  MapPin,
  UserCheck,
  Key,
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

export default function AddStudentDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    cmsId: "",
    department: "",
    batch: "",
    currentSemester: "",
    password: "",
    emergencyContact: {
      name: "",
      phone: "",
      relationship: "",
    },
  });
  const [isLoading, setIsLoading] = useState(false);

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

  const handleSubmit = async (e) => {
    e.preventDefault();
    setIsLoading(true);

    try {
      await onSubmit(formData);
      onOpenChange(false);
      resetForm();
    } catch (error) {
      console.error("Error adding student:", error);
    } finally {
      setIsLoading(false);
    }
  };

  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      phone: "",
      address: "",
      cmsId: "",
      department: "",
      batch: "",
      currentSemester: "",
      password: "",
      emergencyContact: {
        name: "",
        phone: "",
        relationship: "",
      },
    });
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.cmsId &&
    formData.department &&
    formData.batch &&
    formData.currentSemester &&
    formData.password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <GraduationCap className="h-5 w-5 text-[#0056b3]" />
            <span>Add New Student</span>
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
                  value={formData.name}
                  onChange={(e) => handleInputChange("name", e.target.value)}
                  placeholder="Enter student's full name"
                  required
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="email">Email Address *</Label>
                <Input
                  id="email"
                  type="email"
                  value={formData.email}
                  onChange={(e) => handleInputChange("email", e.target.value)}
                  placeholder="student@buitems.edu.pk"
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
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="cmsId">CMS ID *</Label>
                <Input
                  id="cmsId"
                  value={formData.cmsId}
                  onChange={(e) => handleInputChange("cmsId", e.target.value)}
                  placeholder="CS-2024-001"
                  required
                />
              </div>
            </div>

            <div className="space-y-2">
              <Label htmlFor="address" className="flex items-center space-x-1">
                <MapPin className="h-3 w-3" />
                <span>Address</span>
              </Label>
              <Textarea
                id="address"
                value={formData.address}
                onChange={(e) => handleInputChange("address", e.target.value)}
                placeholder="Enter student's address"
                rows={2}
              />
            </div>
          </div>

          {/* Academic Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <GraduationCap className="h-4 w-4" />
              <span>Academic Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div className="space-y-2">
                <Label>Department *</Label>
                <Select
                  value={formData.department}
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

              <div className="space-y-2">
                <Label>Batch *</Label>
                <Select
                  value={formData.batch}
                  onValueChange={(value) => handleInputChange("batch", value)}
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
                <Label>Current Semester *</Label>
                <Select
                  value={formData.currentSemester}
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
                    handleEmergencyContactChange("relationship", e.target.value)
                  }
                  placeholder="Father, Mother, etc."
                />
              </div>
            </div>
          </div>

          {/* Account Security */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Key className="h-4 w-4" />
              <span>Account Security</span>
            </h3>

            <div className="space-y-2">
              <Label htmlFor="password">Initial Password *</Label>
              <Input
                id="password"
                type="password"
                value={formData.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
                placeholder="Set initial password for student"
                required
              />
              <p className="text-xs text-gray-500">
                Student will be required to change this password on first login
              </p>
            </div>
          </div>

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
              {isLoading ? "Adding Student..." : "Add Student"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
