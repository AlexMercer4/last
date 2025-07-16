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
import Header from "@/components/layout/Header";
import AddStudentDialog from "@/components/users/AddStudentDialog";
import AddCounselorDialog from "@/components/users/AddCounselorDialog";
import AddChairpersonDialog from "@/components/users/AddChairpersonDialog";
import EditUserDialog from "@/components/users/EditUserDialog";
import ViewUserDetailsDialog from "@/components/users/ViewUserDetailsDialog";
import UserManagementTable from "@/components/users/UserManagementTable";
import { useAuth } from "@/contexts/AuthContext";
import { usersApi } from "@/api/users";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export default function UserManagementPage() {
  const { user } = useAuth();
  const queryClient = useQueryClient();
  const [activeTab, setActiveTab] = useState("students");
  const [isAddStudentDialogOpen, setIsAddStudentDialogOpen] = useState(false);
  const [isAddCounselorDialogOpen, setIsAddCounselorDialogOpen] = useState(false);
  const [isAddChairpersonDialogOpen, setIsAddChairpersonDialogOpen] = useState(false);
  const [isEditDialogOpen, setIsEditDialogOpen] = useState(false);
  const [isViewDetailsDialogOpen, setIsViewDetailsDialogOpen] = useState(false);
  const [isDeleteDialogOpen, setIsDeleteDialogOpen] = useState(false);
  const [userToDelete, setUserToDelete] = useState(null);
  const [userToEdit, setUserToEdit] = useState(null);
  const [userToView, setUserToView] = useState(null);

  // Check if user has admin privileges
  const isAdmin = user?.role === "admin";
  const canManageUsers = user?.role === "admin" || user?.role === "chairperson";

  // Redirect if user doesn't have permission
  if (!canManageUsers) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userRole={user?.role} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <p className="text-red-600 mb-4">Access Denied</p>
              <p className="text-gray-600">You don't have permission to access user management.</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Fetch students data
  const { data: students = [], isLoading: studentsLoading } = useQuery({
    queryKey: ["students"],
    queryFn: async () => {
      const response = await usersApi.getStudents();
      return response;
    },
  });

  // Fetch counselors data
  const { data: counselors = [], isLoading: counselorsLoading } = useQuery({
    queryKey: ["counselors"],
    queryFn: async () => {
      const response = await usersApi.getCounselors();
      return response;
    },
  });

  // Fetch all users for admin (includes chairpersons)
  const { data: allUsers = [], isLoading: allUsersLoading } = useQuery({
    queryKey: ["allUsers"],
    queryFn: async () => {
      const response = await usersApi.getAllUsers();
      return response.data;
    },
    enabled: isAdmin,
  });

  // Filter chairpersons from all users
  const chairpersons = allUsers.filter(user => user.role === "CHAIRPERSON");

  // Create user mutation
  const createUserMutation = useMutation({
    mutationFn: async (userData) => {
      const response = await usersApi.createUser(userData);
      return response.data;
    },
    onSuccess: (newUser) => {
      if (newUser.role === "STUDENT") {
        queryClient.setQueryData(["students"], (old) => [newUser, ...(old || [])]);
      } else if (newUser.role === "COUNSELOR") {
        queryClient.setQueryData(["counselors"], (old) => [newUser, ...(old || [])]);
      } else if (newUser.role === "CHAIRPERSON") {
        queryClient.invalidateQueries(["allUsers"]);
      }
      toast.success(`${newUser.role.toLowerCase().charAt(0).toUpperCase() + newUser.role.toLowerCase().slice(1)} created successfully!`);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || "Failed to create user";
      toast.error(errorMessage);
    },
  });

  // Update user mutation
  const updateUserMutation = useMutation({
    mutationFn: async ({ id, userData }) => {
      const response = await usersApi.updateUser(id, userData);
      return response.data;
    },
    onSuccess: (updatedUser) => {
      if (updatedUser.role === "STUDENT") {
        queryClient.setQueryData(["students"], (old) =>
          (old || []).map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      } else if (updatedUser.role === "COUNSELOR") {
        queryClient.setQueryData(["counselors"], (old) =>
          (old || []).map((user) => (user.id === updatedUser.id ? updatedUser : user))
        );
      } else if (updatedUser.role === "CHAIRPERSON") {
        queryClient.invalidateQueries(["allUsers"]);
      }
      toast.success("User updated successfully!");
      setIsEditDialogOpen(false);
      setUserToEdit(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || "Failed to update user";
      toast.error(errorMessage);
    },
  });

  // Delete user mutation
  const deleteUserMutation = useMutation({
    mutationFn: async (userId) => {
      await usersApi.deleteUser(userId);
      return userId;
    },
    onSuccess: (deletedUserId) => {
      queryClient.setQueryData(["students"], (old) =>
        (old || []).filter((user) => user.id !== deletedUserId)
      );
      queryClient.setQueryData(["counselors"], (old) =>
        (old || []).filter((user) => user.id !== deletedUserId)
      );
      if (isAdmin) {
        queryClient.invalidateQueries(["allUsers"]);
      }
      toast.success("User deleted successfully!");
      setIsDeleteDialogOpen(false);
      setUserToDelete(null);
    },
    onError: (error) => {
      const errorMessage = error.response?.data?.error?.message || "Failed to delete user";
      toast.error(errorMessage);
    },
  });

  const handleAddStudent = async (studentData) => {
    createUserMutation.mutate({
      ...studentData,
      role: "student",
    });
  };

  const handleAddCounselor = async (counselorData) => {
    createUserMutation.mutate({
      ...counselorData,
      role: "counselor",
    });
  };

  const handleAddChairperson = async (chairpersonData) => {
    createUserMutation.mutate({
      ...chairpersonData,
      role: "chairperson",
    });
  };

  const handleEditUser = (user) => {
    setUserToEdit(user);
    setIsEditDialogOpen(true);
  };

  const handleUpdateUser = async (userData) => {
    if (!userToEdit) return;
    updateUserMutation.mutate({
      id: userToEdit.id,
      userData,
    });
  };

  const handleDeleteUser = (user) => {
    setUserToDelete(user);
    setIsDeleteDialogOpen(true);
  };

  const confirmDeleteUser = () => {
    if (!userToDelete) return;
    deleteUserMutation.mutate(userToDelete.id);
  };

  const handleToggleUserStatus = (user) => {
    updateUserMutation.mutate({
      id: user.id,
      userData: { isActive: !user.isActive },
    });
  };

  const handleViewUserDetails = (user) => {
    setUserToView(user);
    setIsViewDetailsDialogOpen(true);
  };

  const getStats = () => {
    const activeStudents = students.filter((s) => s.isActive !== false).length;
    const inactiveStudents = students.filter((s) => s.isActive === false).length;
    const activeCounselors = counselors.filter((c) => c.isActive !== false).length;
    const inactiveCounselors = counselors.filter((c) => c.isActive === false).length;
    const activeChairpersons = chairpersons.filter((c) => c.isActive !== false).length;
    const inactiveChairpersons = chairpersons.filter((c) => c.isActive === false).length;

    return {
      totalStudents: students.length,
      activeStudents,
      inactiveStudents,
      totalCounselors: counselors.length,
      activeCounselors,
      inactiveCounselors,
      totalChairpersons: chairpersons.length,
      activeChairpersons,
      inactiveChairpersons,
    };
  };

  const stats = getStats();

  if (studentsLoading || counselorsLoading || (isAdmin && allUsersLoading)) {
    return (
      <div className="min-h-screen bg-gray-50">
        <Header userRole={user?.role} />
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading users...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }



  return (
    <div className="min-h-screen bg-gray-50">
      <Header userRole={user?.role} />
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">User Management</h1>
          <p className="text-gray-600 mt-2">
            Manage students and counselors in the system.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-6 gap-6 mb-8">
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
                {stats.activeStudents} active
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
                {stats.activeCounselors} active
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

          {isAdmin && (
            <>
              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Total Chairpersons
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold">{stats.totalChairpersons}</div>
                  <p className="text-xs text-muted-foreground">
                    {stats.activeChairpersons} active
                  </p>
                </CardContent>
              </Card>

              <Card>
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                  <CardTitle className="text-sm font-medium">
                    Active Chairpersons
                  </CardTitle>
                  <Users className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent>
                  <div className="text-2xl font-bold text-purple-600">
                    {stats.activeChairpersons}
                  </div>
                  <p className="text-xs text-muted-foreground">
                    Currently active
                  </p>
                </CardContent>
              </Card>
            </>
          )}
        </div>

        {/* User Management Tabs */}
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="space-y-6"
        >
          <div className="flex items-center justify-between">
            <TabsList className={`grid w-full ${isAdmin ? 'max-w-lg grid-cols-3' : 'max-w-md grid-cols-2'}`}>
              <TabsTrigger value="students">
                Students ({students.length})
              </TabsTrigger>
              <TabsTrigger value="counselors">
                Counselors ({counselors.length})
              </TabsTrigger>
              {isAdmin && (
                <TabsTrigger value="chairpersons">
                  Chairpersons ({chairpersons.length})
                </TabsTrigger>
              )}
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

              {activeTab === "chairpersons" && isAdmin && (
                <Button
                  onClick={() => setIsAddChairpersonDialogOpen(true)}
                  className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
                >
                  <UserPlus className="h-4 w-4" />
                  <span>Add Chairperson</span>
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

          {isAdmin && (
            <TabsContent value="chairpersons" className="space-y-6">
              <UserManagementTable
                users={chairpersons}
                userType="chairperson"
                onEdit={handleEditUser}
                onDelete={handleDeleteUser}
                onToggleStatus={handleToggleUserStatus}
                onViewDetails={handleViewUserDetails}
              />
            </TabsContent>
          )}
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

        {/* Add Chairperson Dialog - Admin only */}
        {isAdmin && (
          <AddChairpersonDialog
            open={isAddChairpersonDialogOpen}
            onOpenChange={setIsAddChairpersonDialogOpen}
            onSubmit={handleAddChairperson}
          />
        )}

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
                {userToDelete?.role === "STUDENT" || userToDelete?.role === "student" 
                  ? "Student" 
                  : userToDelete?.role === "COUNSELOR" || userToDelete?.role === "counselor"
                  ? "Counselor"
                  : "Chairperson"}
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
