import {
  Users,
  UserCheck,
  Calendar,
  BarChart3,
  TrendingUp,
  Clock,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import StatsCard from "@/components/dashboard/StatsCard";

export default function ChairpersonDashboard() {
  // Mock departmental statistics
  const departmentStats = [
    {
      title: "Total Students",
      value: "342",
      subtitle: "Computer Science Dept.",
      icon: Users,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-500",
    },
    {
      title: "Active Counselors",
      value: "8",
      subtitle: "Currently assigned",
      icon: UserCheck,
      borderColor: "border-l-green-500",
      iconBgColor: "bg-green-500",
    },
    {
      title: "Monthly Appointments",
      value: "156",
      subtitle: "This month",
      icon: Calendar,
      borderColor: "border-l-purple-500",
      iconBgColor: "bg-purple-500",
    },
    {
      title: "Avg. Response Time",
      value: "2.4h",
      subtitle: "Counselor response",
      icon: Clock,
      borderColor: "border-l-orange-500",
      iconBgColor: "bg-orange-500",
    },
  ];

  // Mock counselor performance data
  const counselorPerformance = [
    {
      id: "1",
      name: "Dr. Sarah Ahmed",
      specialization: "Academic Counseling",
      studentsAssigned: 45,
      appointmentsThisMonth: 28,
      avgSessionDuration: "42 min",
      responseRate: "98%",
      status: "active",
    },
    {
      id: "2",
      name: "Prof. Ahmad Hassan",
      specialization: "Career Guidance",
      studentsAssigned: 38,
      appointmentsThisMonth: 22,
      avgSessionDuration: "38 min",
      responseRate: "95%",
      status: "active",
    },
    {
      id: "3",
      name: "Dr. Fatima Sheikh",
      specialization: "Personal Development",
      studentsAssigned: 41,
      appointmentsThisMonth: 31,
      avgSessionDuration: "45 min",
      responseRate: "97%",
      status: "active",
    },
    {
      id: "4",
      name: "Dr. Ali Khan",
      specialization: "Academic Planning",
      studentsAssigned: 35,
      appointmentsThisMonth: 18,
      avgSessionDuration: "40 min",
      responseRate: "92%",
      status: "on_leave",
    },
  ];

  // Mock recent activities
  const recentActivities = [
    {
      id: "1",
      type: "assignment",
      description: "Assigned 5 new students to Dr. Sarah Ahmed",
      timestamp: "2 hours ago",
      priority: "normal",
    },
    {
      id: "2",
      type: "counselor_added",
      description: "Added new counselor: Dr. Zara Malik",
      timestamp: "1 day ago",
      priority: "normal",
    },
    {
      id: "3",
      type: "report_generated",
      description: "Monthly department report generated",
      timestamp: "2 days ago",
      priority: "low",
    },
    {
      id: "4",
      type: "policy_update",
      description: "Updated counseling session duration policy",
      timestamp: "3 days ago",
      priority: "high",
    },
  ];

  const getStatusColor = (status) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "on_leave":
        return "bg-yellow-100 text-yellow-800";
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
          <h1 className="text-3xl font-bold text-gray-900">
            Chairperson Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, Prof. Ahmad Hassan! Monitor and manage your
            department&apos;s counseling activities.
          </p>
        </div>

        {/* Department Statistics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {departmentStats.map((stat, index) => (
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

        {/* Main Content Grid */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Counselor Performance Overview */}
          <div className="lg:col-span-2 space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Counselor Performance Overview
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-[#0056b3] border-[#0056b3] hover:bg-[#0056b3] hover:text-white"
              >
                View Detailed Analytics
              </Button>
            </div>

            <div className="space-y-4">
              {counselorPerformance.map((counselor) => (
                <Card
                  key={counselor.id}
                  className="hover:shadow-md transition-shadow duration-200"
                >
                  <CardContent className="p-6">
                    <div className="flex items-start justify-between mb-4">
                      <div className="flex items-center space-x-3">
                        <div className="bg-[#0056b3] text-white p-2 rounded-full">
                          <UserCheck className="h-4 w-4" />
                        </div>
                        <div>
                          <h3 className="font-medium text-gray-900">
                            {counselor.name}
                          </h3>
                          <p className="text-sm text-gray-500">
                            {counselor.specialization}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(counselor.status)}>
                        {counselor.status === "on_leave"
                          ? "On Leave"
                          : "Active"}
                      </Badge>
                    </div>

                    <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                      <div>
                        <p className="text-gray-500">Students Assigned</p>
                        <p className="font-medium text-gray-900">
                          {counselor.studentsAssigned}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Monthly Sessions</p>
                        <p className="font-medium text-gray-900">
                          {counselor.appointmentsThisMonth}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Avg. Duration</p>
                        <p className="font-medium text-gray-900">
                          {counselor.avgSessionDuration}
                        </p>
                      </div>
                      <div>
                        <p className="text-gray-500">Response Rate</p>
                        <p className="font-medium text-green-600">
                          {counselor.responseRate}
                        </p>
                      </div>
                    </div>

                    <div className="flex space-x-2 mt-4">
                      <Button
                        size="sm"
                        variant="outline"
                        className="text-[#0056b3] border-[#0056b3] hover:bg-[#0056b3] hover:text-white"
                      >
                        View Details
                      </Button>
                      <Button size="sm" variant="outline">
                        Manage Students
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </div>

          {/* Recent Activities & Department Insights */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Activities
              </h2>
              <Button
                variant="outline"
                size="sm"
                className="text-[#0056b3] border-[#0056b3] hover:bg-[#0056b3] hover:text-white"
              >
                View All
              </Button>
            </div>

            <div className="space-y-4">
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
                        <BarChart3 className="h-4 w-4 text-gray-600" />
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

            {/* Department Insights */}
            <Card className="bg-gradient-to-r from-[#0056b3] to-[#004494] text-white">
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5" />
                  <span>Department Insights</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Student Engagement</span>
                    <span className="font-medium">↑ 12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">
                      Appointment Completion
                    </span>
                    <span className="font-medium">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-blue-100">Counselor Utilization</span>
                    <span className="font-medium">87%</span>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  className="w-full mt-4 border-white text-white hover:bg-white hover:text-[#0056b3]"
                >
                  View Full Analytics
                </Button>
              </CardContent>
            </Card>
          </div>
        </div>
      </main>
    </div>
  );
}
