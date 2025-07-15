import { useState } from "react";
import { User, UserCheck, MapPin, Clock, Key, Award } from "lucide-react";
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

export default function AddCounselorDialog({ open, onOpenChange, onSubmit }) {
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    address: "",
    employeeId: "",
    department: "",
    specialization: [],
    officeLocation: "",
    officeHours: "",
    yearsOfExperience: 0,
    maxStudentsCapacity: 30,
    password: "",
  });
  const [isLoading, setIsLoading] = useState(false);
  const [newSpecialization, setNewSpecialization] = useState("");

  const departments = [
    "Psychology Department",
    "Student Affairs",
    "Academic Affairs",
    "Career Services",
    "Counseling Center",
    "Mental Health Services",
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

  const handleInputChange = (field, value) => {
    setFormData((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const addSpecialization = (spec) => {
    if (spec && !formData.specialization.includes(spec)) {
      setFormData((prev) => ({
        ...prev,
        specialization: [...prev.specialization, spec],
      }));
    }
    setNewSpecialization("");
  };

  const removeSpecialization = (spec) => {
    setFormData((prev) => ({
      ...prev,
      specialization: prev.specialization.filter((s) => s !== spec),
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
      console.error("Error adding counselor:", error);
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
      employeeId: "",
      department: "",
      specialization: [],
      officeLocation: "",
      officeHours: "",
      yearsOfExperience: 0,
      maxStudentsCapacity: 30,
      password: "",
    });
    setNewSpecialization("");
  };

  const isFormValid =
    formData.name &&
    formData.email &&
    formData.employeeId &&
    formData.department &&
    formData.specialization.length > 0 &&
    formData.password;

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-[700px] max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <UserCheck className="h-5 w-5 text-[#0056b3]" />
            <span>Add New Counselor</span>
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
                  placeholder="Dr. Sarah Ahmed"
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
                  placeholder="sarah.ahmed@buitems.edu.pk"
                  required
                />
              </div>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="phone">Phone Number</Label>
                <Input
                  id="phone"
                  value={formData.phone}
                  onChange={(e) => handleInputChange("phone", e.target.value)}
                  placeholder="+92 300 1234567"
                />
              </div>

              <div className="space-y-2">
                <Label htmlFor="employeeId">Employee ID *</Label>
                <Input
                  id="employeeId"
                  value={formData.employeeId}
                  onChange={(e) =>
                    handleInputChange("employeeId", e.target.value)
                  }
                  placeholder="EMP-2024-001"
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
                placeholder="Enter counselor's address"
                rows={2}
              />
            </div>
          </div>

          {/* Professional Information */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900 flex items-center space-x-2">
              <Award className="h-4 w-4" />
              <span>Professional Information</span>
            </h3>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
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
                <Label htmlFor="yearsOfExperience">Years of Experience</Label>
                <Input
                  id="yearsOfExperience"
                  type="number"
                  min="0"
                  value={formData.yearsOfExperience}
                  onChange={(e) =>
                    handleInputChange(
                      "yearsOfExperience",
                      parseInt(e.target.value) || 0
                    )
                  }
                  placeholder="5"
                />
              </div>
            </div>

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
                  value={formData.officeLocation}
                  onChange={(e) =>
                    handleInputChange("officeLocation", e.target.value)
                  }
                  placeholder="Room 201, Counseling Center"
                />
              </div>

              <div className="space-y-2">
                <Label
                  htmlFor="officeHours"
                  className="flex items-center space-x-1"
                >
                  <Clock className="h-3 w-3" />
                  <span>Office Hours</span>
                </Label>
                <Input
                  id="officeHours"
                  value={formData.officeHours}
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
                value={formData.maxStudentsCapacity}
                onChange={(e) =>
                  handleInputChange(
                    "maxStudentsCapacity",
                    parseInt(e.target.value) || 30
                  )
                }
                placeholder="30"
              />
              <p className="text-xs text-gray-500">
                Maximum number of students this counselor can handle
              </p>
            </div>
          </div>

          {/* Specializations */}
          <div className="space-y-4">
            <h3 className="text-lg font-medium text-gray-900">
              Specializations *
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
                      .filter((spec) => !formData.specialization.includes(spec))
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

            {formData.specialization.length > 0 && (
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
                placeholder="Set initial password for counselor"
                required
              />
              <p className="text-xs text-gray-500">
                Counselor will be required to change this password on first
                login
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
              {isLoading ? "Adding Counselor..." : "Add Counselor"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
