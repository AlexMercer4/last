import { useState } from "react";
import {
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
  Shield,
  UserPlus,
  Settings,
  Activity,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useQuery } from "@tanstack/react-query";
import { useNavigate } from "react-router-dom";
import { analyticsApi } from "@/api/analytics";
import { usersApi } from "@/api/users";
import StatsCard from "@/components/dashboard/StatsCard";

export default function AdminDashboard() {
  const navigate = useNavigate();
  const [activeTab, setActiveTab] = useState("overview");

  // Fetch dashboard statistics
  const { data: dashboardStats, isLoading: statsLoading } = useQuery({
    queryKey: ["admin-dashboard-stats"],
    queryFn: analyticsApi.getDashboardStats,
  });

  // Fetch all users for admin overview
  const { data: allUsersData, isLoading: usersLoading } = useQuery({
    queryKey: ["admin-all-users"],
    queryFn: async () => {
      const response = await usersApi.getAllUsers();
      return response.data;
    },
  });

  // Fetch appointment analytics
  const { data: appointmentAnalytics, isLoading: appointmentsLoading } = useQuery({
    queryKey: ["admin-appointment-analytics"],
    queryFn: () => analyticsApi.getAppointmentAnalytics(),
  });

  // Fetch student analytics
  const { data: studentAnalytics, isLoading: studentsAnalyticsLoading } = useQuery({
    queryKey: ["admin-student-analytics"],
    queryFn: () => analyticsApi.getStudentAnalytics(),
  });

  if (statsLoading || usersLoading || appointmentsLoading || studentsAnalyticsLoading) {
    return (
      <div className="min-h-screen bg-gray-50">
        <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
          <div className="flex items-center justify-center h-64">
            <div className="text-center">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-[#0056b3] mx-auto"></div>
              <p className="mt-4 text-gray-600">Loading admin dashboard...</p>
            </div>
          </div>
        </main>
      </div>
    );
  }

  // Process user data
  const users = allUsersData || [];
  const students = users.filter(user => user.role === "STUDENT");
  const counselors = users.filter(user => user.role === "COUNSELOR");
  const chairpersons = users.filter(user => user.role === "CHAIRPERSON");
  const admins = users.filter(user => user.role === "ADMIN");

  // Calculate system statistics
  const systemStats = [
    {
      title: "Total Users",
      value: users.length.toString(),
      subtitle: `${users.filter(u => u.isActive !== false).length} active`,
      icon: Users,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-500",
    },
    {
      title: "Students",
      value: students.length.toString(),
      subtitle: `${students.filter(s => s.isActive !== false).length} active`,
      icon: Users,
      borderColor: "border-l-green-500",
      iconBgColor: "bg-green-500",
    },
    {
      title: "Counselors",
      value: counselors.length.toString(),
      subtitle: `${counselors.filter(c => c.isActive !== false).length} active`,
      icon: UserCheck,
      borderColor: "border-l-purple-500",
      iconBgColor: "bg-purple-500",
    },
    {
      title: "Chairpersons",
      value: chairpersons.length.toString(),
      subtitle: `${chairpersons.filter(c => c.isActive !== false).length} active`,
      icon: Shield,
      borderColor: "border-l-orange-500",
      iconBgColor: "bg-orange-500",
    },
  ];

  // System activity stats
  const activityStats = [
    {
      title: "Total Appointments",
      value: dashboardStats?.totalAppointments?.toString() || "0",
      subtitle: "All time",
      icon: Calendar,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-500",
    },
    {
      title: "This Month",
      value: dashboardStats?.monthlyAppointments?.toString() || "0",
      subtitle: "Appointments",
      icon: TrendingUp,
      borderColor: "border-l-green-500",
      iconBgColor: "bg-green-500",
    },
    {
      title: "Active Sessions",
      value: dashboardStats?.activeSessions?.toString() || "0",
      subtitle: "Currently ongoing",
      icon: Activity,
      borderColor: "border-l-purple-500",
      iconBgColor: "bg-purple-500",
    },
    {
      title: "System Uptime",
      value: "99.9%",
      subtitle: "Last 30 days",
      icon: Clock,
      borderColor: "border-l-orange-500",
      iconBgColor: "bg-orange-500",
    },
  ];

  // Recent system activities (mock data for now)
  const recentActivities = [
    {
      id: "1",
      type: "user_created",
      description: "New counselor account created: Dr. Ahmed Hassan",
      timestamp: "2 hours ago",
      priority: "normal",
    },
    {
      id: "2",
      type: "chairperson_created",
      description: "New chairperson account created: Prof. Sarah Khan",
      timestamp: "1 day ago",
      priority: "high",
    },
    {
      id: "3",
      type: "system_update",
      description: "System maintenance completed successfully",
      timestamp: "2 days ago",
      priority: "low",
    },
    {
      id: "4",
      type: "user_deactivated",
      description: "User account deactivated: student@example.com",
      timestamp: "3 days ago",
      priority: "normal",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getActivityColor = (priority) => {
    switch (priority) {
      case "high":
        return "border-l-red-500";
      case "normal":
        return "border-l-blue-500";
      case "low":
        return "border-l-gray-500";
      default:
        return "border-l-gray-500";
    }
  };

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">Admin Dashboard</h1>
          <p className="text-gray-600 mt-2">
            System administration and user management overview
          </p>
        </div>

        {/* Quick Actions */}
        <div className="mb-8">
          <div className="flex flex-wrap gap-4">
            <Button
              onClick={() => navigate("/user-management")}
              className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
            >
              <UserPlus className="h-4 w-4" />
              <span>Manage Users</span>
            </Button>
            <Button
              onClick={() => navigate("/analytics")}
              variant="outline"
              className="text-[#0056b3] border-[#0056b3] hover:bg-[#0056b3] hover:text-white flex items-center space-x-2"
            >
              <BarChart3 className="h-4 w-4" />
              <span>View Analytics</span>
            </Button>
            <Button
              variant="outline"
              className="text-gray-600 border-gray-300 hover:bg-gray-50 flex items-center space-x-2"
            >
              <Settings className="h-4 w-4" />
              <span>System Settings</span>
            </Button>
          </div>
        </div>

        {/* Dashboard Tabs */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList className="grid w-full max-w-md grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="users">Users</TabsTrigger>
            <TabsTrigger value="analytics">Analytics</TabsTrigger>
          </TabsList>

          <TabsContent value="overview" className="space-y-6">
            {/* System Statistics */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Overview</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {systemStats.map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    borderColor={stat.borderColor}
                    iconBgColor={stat.iconBgColor}
                  />
                ))}
              </div>
            </div>

            {/* Activity Statistics */}
            <div>
              <h2 className="text-xl font-bold text-gray-900 mb-4">System Activity</h2>
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
                {activityStats.map((stat, index) => (
                  <StatsCard
                    key={index}
                    title={stat.title}
                    value={stat.value}
                    subtitle={stat.subtitle}
                    icon={stat.icon}
                    borderColor={stat.borderColor}
                    iconBgColor={stat.iconBgColor}
                  />
                ))}
              </div>
            </div>

            {/* Recent Activities */}
            <div>
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">Recent System Activities</h2>
                <Button
                  variant="outline"
                  size="sm"
                  className="text-[#0056b3] border-[#0056b3] hover:bg-[#0056b3] hover:text-white"
                >
                  View All Logs
                </Button>
              </div>

              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {recentActivities.map((activity) => (
                  <Card
                    key={activity.id}
                    className={`border-l-4 ${getActivityColor(
                      activity.priority
                    )} hover:shadow-md transition-shadow duration-200`}
                  >
                    <CardContent className="p-4">
                      <div className="flex items-start space-x-3">
                        <div className="bg-gray-100 p-2 rounded-full">
                          <Activity className="h-4 w-4 text-gray-600" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <p className="text-sm text-gray-900 leading-relaxed">
                            {activity.description}
                          </p>
                          <p className="text-xs text-gray-500 mt-1">
                            {activity.timestamp}
                          </p>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            </div>
          </TabsContent>

          <TabsContent value="users" className="space-y-6">
            {/* User Management Overview */}
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
              {/* User Statistics */}
              <div className="lg:col-span-2 space-y-6">
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-bold text-gray-900">User Management</h2>
                  <Button
                    onClick={() => navigate("/user-management")}
                    className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
                  >
                    <UserPlus className="h-4 w-4" />
                    <span>Manage All Users</span>
                  </Button>
                </div>

                {/* Role Distribution */}
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Users className="h-5 w-5 text-blue-500" />
                        <span>Students</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-blue-600 mb-2">
                        {students.length}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active</span>
                          <span className="font-medium text-green-600">
                            {students.filter(s => s.isActive !== false).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inactive</span>
                          <span className="font-medium text-red-600">
                            {students.filter(s => s.isActive === false).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <UserCheck className="h-5 w-5 text-green-500" />
                        <span>Counselors</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-green-600 mb-2">
                        {counselors.length}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active</span>
                          <span className="font-medium text-green-600">
                            {counselors.filter(c => c.isActive !== false).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inactive</span>
                          <span className="font-medium text-red-600">
                            {counselors.filter(c => c.isActive === false).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-purple-500" />
                        <span>Chairpersons</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-purple-600 mb-2">
                        {chairpersons.length}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active</span>
                          <span className="font-medium text-green-600">
                            {chairpersons.filter(c => c.isActive !== false).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inactive</span>
                          <span className="font-medium text-red-600">
                            {chairpersons.filter(c => c.isActive === false).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle className="flex items-center space-x-2">
                        <Shield className="h-5 w-5 text-red-500" />
                        <span>Admins</span>
                      </CardTitle>
                    </CardHeader>
                    <CardContent>
                      <div className="text-3xl font-bold text-red-600 mb-2">
                        {admins.length}
                      </div>
                      <div className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Active</span>
                          <span className="font-medium text-green-600">
                            {admins.filter(a => a.isActive !== false).length}
                          </span>
                        </div>
                        <div className="flex justify-between text-sm">
                          <span className="text-gray-600">Inactive</span>
                          <span className="font-medium text-red-600">
                            {admins.filter(a => a.isActive === false).length}
                          </span>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                </div>
              </div>

              {/* Quick Actions */}
              <div className="space-y-6">
                <Card className="bg-gradient-to-r from-[#0056b3] to-[#004494] text-white">
                  <CardHeader>
                    <CardTitle className="flex items-center space-x-2">
                      <UserPlus className="h-5 w-5" />
                      <span>Quick Actions</span>
                    </CardTitle>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <Button
                      onClick={() => navigate("/user-management")}
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-[#0056b3]"
                    >
                      Add New User
                    </Button>
                    <Button
                      onClick={() => navigate("/user-management")}
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-[#0056b3]"
                    >
                      Manage Chairpersons
                    </Button>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full border-white text-white hover:bg-white hover:text-[#0056b3]"
                    >
                      Export User Data
                    </Button>
                  </CardContent>
                </Card>
              </div>
            </div>
          </TabsContent>

          <TabsContent value="analytics" className="space-y-6">
            {/* Analytics Overview */}
            <div className="flex items-center justify-between mb-6">
              <h2 className="text-xl font-bold text-gray-900">System Analytics</h2>
              <Button
                onClick={() => navigate("/analytics")}
                className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
              >
                <BarChart3 className="h-4 w-4" />
                <span>View Detailed Analytics</span>
              </Button>
            </div>

            {/* Analytics Cards */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Calendar className="h-5 w-5 text-blue-500" />
                    <span>Appointments</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Total</span>
                      <span className="font-medium">
                        {appointmentAnalytics?.total || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">This Month</span>
                      <span className="font-medium text-green-600">
                        {appointmentAnalytics?.thisMonth || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Completion Rate</span>
                      <span className="font-medium text-blue-600">
                        {appointmentAnalytics?.completionRate || "0%"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-green-500" />
                    <span>Student Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Students</span>
                      <span className="font-medium">
                        {studentAnalytics?.activeStudents || 0}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Avg. Sessions</span>
                      <span className="font-medium text-green-600">
                        {studentAnalytics?.avgSessions || "0"}
                      </span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Satisfaction</span>
                      <span className="font-medium text-blue-600">
                        {studentAnalytics?.satisfaction || "N/A"}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <TrendingUp className="h-5 w-5 text-purple-500" />
                    <span>System Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    <div className="flex justify-between">
                      <span className="text-gray-600">Uptime</span>
                      <span className="font-medium text-green-600">99.9%</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Response Time</span>
                      <span className="font-medium">120ms</span>
                    </div>
                    <div className="flex justify-between">
                      <span className="text-gray-600">Active Sessions</span>
                      <span className="font-medium text-blue-600">
                        {dashboardStats?.activeSessions || 0}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}