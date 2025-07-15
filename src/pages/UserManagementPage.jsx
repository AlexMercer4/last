import { useState } from "react";
import { Users, UserPlus, GraduationCap, UserCheck } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { toast } from "sonner";
import AddStudentDialog from "@/components/users/AddStudentDialog";
import AddCounselorDialog from "@/components/users/AddCounselorDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import ViewUserDetailsDialog from "@/components/users/ViewUserDetailsDialog";
import UserManagementTable from "@/components/users/UserManagementTable";

export default function UserManagementPage() {
  const [activeTab, setActiveTab] = useState("students");
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddCounselorDialogOpen, setIsAddCounselorDialogOpen] =
    useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToView, setUserToView] = useState(null);

  // Mock data - replace with actual API calls
  const [students, setStudents] = useState([
    {
      id: "1",
      name: "Ahmad Ali",
      email: "ahmad.ali@student.buitems.edu.pk",
      phone: "+92 300 1234567",
      role: "student",
      cmsId: "CS-2024-001",
      department: "Computer Science",
      batch: "Fall 2021",
      currentSemester: "6th Semester",
      cgpa: 3.85,
      enrollmentDate: "2021-09-01",
      isActive: true,
      createdAt: "2021-09-01T00:00:00Z",
      updatedAt: "2024-06-20T10:00:00Z",
      lastLogin: "2024-06-20T14:30:00Z",
      address: "House 123, Street 45, Quetta",
      assignedCounselor: "Dr. Sarah Ahmed",
      emergencyContact: {
        name: "Muhammad Ali",
        phone: "+92 300 9876543",
        relationship: "Father",
      },
    },
    {
      id: "2",
      name: "Fatima Khan",
      email: "fatima.khan@student.buitems.edu.pk",
      phone: "+92 301 2345678",
      role: "student",
      cmsId: "EE-2024-015",
      department: "Electrical Engineering",
      batch: "Spring 2022",
      currentSemester: "4th Semester",
      cgpa: 3.92,
      enrollmentDate: "2022-02-01",
      isActive: true,
      createdAt: "2022-02-01T00:00:00Z",
      updatedAt: "2024-06-18T10:00:00Z",
      lastLogin: "2024-06-18T16:20:00Z",
      address: "House 456, Street 78, Quetta",
      assignedCounselor: "Prof. Ahmad Hassan",
    },
    {
      id: "3",
      name: "Hassan Ahmed",
      email: "hassan.ahmed@student.buitems.edu.pk",
      phone: "+92 302 3456789",
      role: "student",
      cmsId: "ME-2024-032",
      department: "Mechanical Engineering",
      batch: "Fall 2020",
      currentSemester: "8th Semester",
      cgpa: 2.95,
      enrollmentDate: "2020-09-01",
      isActive: false,
      createdAt: "2020-09-01T00:00:00Z",
      updatedAt: "2024-06-15T10:00:00Z",
      lastLogin: "2024-06-10T12:15:00Z",
      address: "House 789, Street 90, Quetta",
    },
  ]);

  const [counselors, setCounselors] = useState([
    {
      id: "100",
      name: "Dr. Sarah Ahmed",
      email: "sarah.ahmed@buitems.edu.pk",
      phone: "+92 302 1234567",
      role: "counselor",
      employeeId: "EMP-2020-045",
      department: "Psychology Department",
      specialization: ["Academic Counseling", "Career Guidance"],
      officeLocation: "Room 201, Counseling Center",
      officeHours: "Mon-Fri: 9:00 AM - 5:00 PM",
      yearsOfExperience: 8,
      maxStudentsCapacity: 40,
      currentStudentsCount: 28,
      isActive: true,
      createdAt: "2020-08-15T00:00:00Z",
      updatedAt: "2024-06-20T10:00:00Z",
      lastLogin: "2024-06-20T08:30:00Z",
      address: "House 789, Street 12, Quetta",
    },
    {
      id: "101",
      name: "Prof. Ahmad Hassan",
      email: "ahmad.hassan@buitems.edu.pk",
      phone: "+92 303 2345678",
      role: "counselor",
      employeeId: "EMP-2019-032",
      department: "Academic Affairs",
      specialization: ["Academic Planning", "Study Skills"],
      officeLocation: "Room 105, Student Services",
      officeHours: "Mon-Thu: 10:00 AM - 4:00 PM",
      yearsOfExperience: 12,
      maxStudentsCapacity: 35,
      currentStudentsCount: 22,
      isActive: false,
      createdAt: "2019-07-20T00:00:00Z",
      updatedAt: "2024-06-15T10:00:00Z",
      lastLogin: "2024-06-10T15:45:00Z",
      address: "House 321, Street 67, Quetta",
    },
  ]);

  const handleAddStudent = async (studentData) => {
    try {
      const newStudent = {
        id: Date.now().toString(),
        ...studentData,
        role: "student",
        cgpa: 0,
        enrollmentDate: new Date().toISOString().split("T")[0],
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setStudents((prev) => [newStudent, ...prev]);
      toast.success("Student added successfully!");
    } catch (error) {
      toast.error("Failed to add student. Please try again.");
      throw error;
    }
  };

  const handleAddCounselor = async (counselorData) => {
    try {
      const newCounselor = {
        id: Date.now().toString(),
        ...counselorData,
        role: "counselor",
        currentStudentsCount: 0,
        isActive: true,
        createdAt: new Date().toISOString(),
        updatedAt: new Date().toISOString(),
      };

      setCounselors((prev) => [newCounselor, ...prev]);
      toast.success("Counselor added successfully!");
    } catch (error) {
      toast.error("Failed to add counselor. Please try again.");
      throw error;
    }
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (userData) => {
    if (!userToEdit) return;

    try {
      const updatedUser = {
        ...userToEdit,
        ...userData,
        updatedAt: new Date().toISOString(),
      };

      if (userToEdit.role === "student") {
        setStudents((prev) =>
          prev.map((s) => (s.id === userToEdit.id ? updatedUser : s))
        );
      } else {
        setCounselors((prev) =>
          prev.map((c) => (c.id === userToEdit.id ? updatedUser : c))
        );
      }

      toast.success(
        `${
          userToEdit.role === "student" ? "Student" : "Counselor"
        } updated successfully!`
      );
      setUserToEdit(null);
    } catch (error) {
      toast.error("Failed to update user. Please try again.");
      throw error;
    }
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;

    if (userToDelete.role === "student") {
      setStudents((prev) => prev.filter((s) => s.id !== userToDelete.id));
    } else {
      setCounselors((prev) => prev.filter((c) => c.id !== userToDelete.id));
    }

    toast.success(
      `${
        userToDelete.role === "student" ? "Student" : "Counselor"
      } deleted successfully`
    );
    setIsDeleteDialogOpen(false);
    setUserToDelete(null);
  };

  const handleToggleUserStatus = (user) => {
    const updateUser = (prev) =>
      prev.map((u) =>
        u.id === user.id
          ? { ...u, isActive: !u.isActive, updatedAt: new Date().toISOString() }
          : u
      );

    if (user.role === "student") {
      setStudents(updateUser);
    } else {
      setCounselors(updateUser);
    }

    toast.success(
      `${user.role === "student" ? "Student" : "Counselor"} ${
        user.isActive ? "blocked" : "activated"
      } successfully`
    );
  };

  const handleViewUserDetails = (user) => {
    setUserToView(user);
    setIsViewDetailsDialogOpen(true);
  };

  const getStats = () => {
    const activeStudents = students.filter((s) => s.isActive).length;
    const inactiveStudents = students.filter((s) => !s.isActive).length;
    const activeCounselors = counselors.filter((c) => c.isActive).length;
    const inactiveCounselors = counselors.filter((c) => !c.isActive).length;

    return {
      totalStudents: students.length,
      activeStudents,
      inactiveStudents,
      totalCounselors: counselors.length,
      activeCounselors,
      inactiveCounselors,
    };
  };

  const stats = getStats();

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage students and counselors in the system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Students
              </CardTitle>
              <GraduationCap className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalStudents}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeStudents} active, {stats.inactiveStudents} inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Students
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeStudents}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently enrolled
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Total Counselors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCounselors}</div>
              <p className="text-xs text-muted-foreground">
                {stats.activeCounselors} active, {stats.inactiveCounselors}{" "}
                inactive
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Active Counselors
              </CardTitle>
              <UserCheck className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {stats.activeCounselors}
              </div>
              <p className="text-xs text-muted-foreground">
                Currently available
              </p>
            </CardContent>
          </Card>
        </div>

        {/* User Management Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList className="grid w-full max-w-md grid-cols-2">
              <TabsTrigger value="students">
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="counselors">
                Counselors ({counselors.length})
              </TabsTrigger>
            </TabsList>

            <div className="flex space-x-2">
              {activeTab === "students" && (
                <Button
                  onClick={() => setIsAddStudentDialogOpen(true)}
                  className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Student</span>
                </Button>
              )}

              {activeTab === "counselors" && (
                <Button
                  onClick={() => setIsAddCounselorDialogOpen(true)}
                  className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Counselor</span>
                </Button>
              )}
            </div>
          </div>

          <TabsContent value="students" className="space-y-6">
            <UserManagementTable
              users={students}
              userType="student"
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleUserStatus}
              onViewDetails={handleViewUserDetails}
            />
          </TabsContent>

          <TabsContent value="counselors" className="space-y-6">
            <UserManagementTable
              users={counselors}
              userType="counselor"
              onEdit={handleEditUser}
              onDelete={handleDeleteUser}
              onToggleStatus={handleToggleUserStatus}
              onViewDetails={handleViewUserDetails}
            />
          </TabsContent>
        </Tabs>

        {/* Add Student Dialog */}
        <AddStudentDialog
          open={isAddStudentDialogOpen}
          onOpenChange={setIsAddStudentDialogOpen}
          onSubmit={handleAddStudent}
        />

        {/* Add Counselor Dialog */}
        <AddCounselorDialog
          open={isAddCounselorDialogOpen}
          onOpenChange={setIsAddCounselorDialogOpen}
          onSubmit={handleAddCounselor}
        />

        {/* Edit User Dialog */}
        <EditUserDialog
          open={isEditDialogOpen}
          onOpenChange={setIsEditDialogOpen}
          user={userToEdit}
          onSubmit={handleUpdateUser}
        />

        {/* View User Details Dialog */}
        <ViewUserDetailsDialog
          open={isViewDetailsDialogOpen}
          onOpenChange={setIsViewDetailsDialogOpen}
          user={userToView}
        />

        {/* Delete Confirmation Dialog */}
        <AlertDialog
          open={isDeleteDialogOpen}
          onOpenChange={setIsDeleteDialogOpen}
        >
          <AlertDialogContent>
            <AlertDialogHeader>
              <AlertDialogTitle>
                Delete{" "}
                {userToDelete?.role === "student" ? "Student" : "Counselor"}
              </AlertDialogTitle>
              <AlertDialogDescription>
                Are you sure you want to delete {userToDelete?.name}? This
                action cannot be undone and will remove all associated data.
              </AlertDialogDescription>
            </AlertDialogHeader>
            <AlertDialogFooter>
              <AlertDialogCancel onClick={() => setUserToDelete(null)}>
                Cancel
              </AlertDialogCancel>
              <AlertDialogAction
                onClick={confirmDeleteUser}
                className="bg-red-600 hover:bg-red-700"
              >
                Delete
              </AlertDialogAction>
            </AlertDialogFooter>
          </AlertDialogContent>
        </AlertDialog>
      </main>
    </div>
  );
}
