import { useState, useMemo } from "react";
import {
  TrendingUp,
  BarChart3,
  PieChart,
  Calendar,
  Users,
  Clock,
  Award,
  Download,
  Filter,
  RefreshCw,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";
import { useAuth } from "@/contexts/AuthContext";
import {
  useDashboardStats,
  useAppointmentAnalytics,
  useStudentAnalytics,
  useCounselorAnalytics,
} from "@/hooks/useAnalytics";

export default function AnalyticsPage() {
  const { user } = useAuth();
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCounselor, setSelectedCounselor] = useState("all");

  // Check if user has access to analytics (chairperson or admin only)
  const hasAnalyticsAccess = user?.role === "chairperson" || user?.role === "admin";
  
  // Debug log to verify user role
  console.log("Current user role:", user?.role, "Has access:", hasAnalyticsAccess);

  // Calculate date filters based on selected time range
  const dateFilters = useMemo(() => {
    const now = new Date();
    let startDate, endDate;

    switch (selectedTimeRange) {
      case "1month":
        startDate = new Date(now.getFullYear(), now.getMonth() - 1, now.getDate());
        break;
      case "3months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 3, now.getDate());
        break;
      case "6months":
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
        break;
      case "1year":
        startDate = new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
        break;
      default:
        startDate = new Date(now.getFullYear(), now.getMonth() - 6, now.getDate());
    }

    endDate = now;

    return {
      startDate: startDate.toISOString().split('T')[0],
      endDate: endDate.toISOString().split('T')[0],
      ...(selectedDepartment !== "all" && { department: selectedDepartment }),
      ...(selectedCounselor !== "all" && { counselorId: selectedCounselor }),
    };
  }, [selectedTimeRange, selectedDepartment, selectedCounselor]);

  // Fetch analytics data using React Query hooks
  const {
    data: dashboardData,
    isLoading: dashboardLoading,
    error: dashboardError,
    refetch: refetchDashboard,
  } = useDashboardStats(dateFilters);

  const {
    data: appointmentData,
    isLoading: appointmentLoading,
    error: appointmentError,
  } = useAppointmentAnalytics(dateFilters);

  const {
    data: studentData,
    isLoading: studentLoading,
    error: studentError,
  } = useStudentAnalytics(dateFilters);

  const {
    data: counselorData,
    isLoading: counselorLoading,
    error: counselorError,
  } = useCounselorAnalytics(dateFilters);

  // Loading state
  const isLoading = dashboardLoading || appointmentLoading || studentLoading || counselorLoading;

  // Error state
  const hasError = dashboardError || appointmentError || studentError || counselorError;

  const timeRanges = [
    { value: "1month", label: "Last Month" },
    { value: "3months", label: "Last 3 Months" },
    { value: "6months", label: "Last 6 Months" },
    { value: "1year", label: "Last Year" },
    { value: "custom", label: "Custom Range" },
  ];

  const departments = [
    { value: "all", label: "All Departments" },
    { value: "cs", label: "Computer Science" },
    { value: "ee", label: "Electrical Engineering" },
    { value: "me", label: "Mechanical Engineering" },
    { value: "ce", label: "Civil Engineering" },
    { value: "ba", label: "Business Administration" },
  ];

  const counselors = [
    { value: "all", label: "All Counselors" },
    { value: "1", label: "Dr. Sarah Ahmed" },
    { value: "2", label: "Prof. Ahmad Hassan" },
    { value: "3", label: "Dr. Fatima Sheikh" },
    { value: "4", label: "Dr. Ali Khan" },
  ];

  const getPerformanceColor = (value, type) => {
    if (type === "satisfaction") {
      if (value >= 4.5) return "text-green-600";
      if (value >= 4.0) return "text-yellow-600";
      return "text-red-600";
    }
    return "text-gray-600";
  };

  const exportReport = () => {
    // Implementation for exporting analytics report
    console.log("Exporting analytics report...");
  };

  const refreshData = () => {
    refetchDashboard();
  };

  // If user doesn't have access, show access denied
  if (!hasAnalyticsAccess) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <AlertCircle className="h-16 w-16 text-red-500 mx-auto mb-4" />
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Access Denied</h1>
          <p className="text-gray-600">
            You don't have permission to view analytics. Only chairpersons and admins can access this page.
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between mb-8">
          <div>
            <h1 className="text-3xl font-bold text-gray-900">
              Analytics & Insights
            </h1>
            <p className="text-gray-600 mt-2">
              Comprehensive analytics for counseling services and student
              engagement.
            </p>
          </div>

          <div className="flex items-center space-x-2 mt-4 sm:mt-0">
            <Button
              variant="outline"
              onClick={refreshData}
              disabled={isLoading}
              className="flex items-center space-x-2"
            >
              {isLoading ? (
                <Loader2 className="h-4 w-4 animate-spin" />
              ) : (
                <RefreshCw className="h-4 w-4" />
              )}
              <span>Refresh</span>
            </Button>
            <Button
              onClick={exportReport}
              className="bg-[#0056b3] hover:bg-[#004494] flex items-center space-x-2"
            >
              <Download className="h-4 w-4" />
              <span>Export Report</span>
            </Button>
          </div>
        </div>

        {/* Error Alert */}
        {hasError && (
          <Alert className="mb-6">
            <AlertCircle className="h-4 w-4" />
            <AlertDescription>
              Failed to load analytics data. Please try refreshing the page.
            </AlertDescription>
          </Alert>
        )}

        {/* Filters */}
        <div className="flex flex-wrap gap-4 mb-8 p-4 bg-white rounded-lg border">
          <div className="flex items-center space-x-2">
            <Filter className="h-4 w-4 text-gray-500" />
            <span className="text-sm font-medium text-gray-700">Filters:</span>
          </div>

          <Select
            value={selectedTimeRange}
            onValueChange={setSelectedTimeRange}
          >
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {timeRanges.map((range) => (
                <SelectItem key={range.value} value={range.value}>
                  {range.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedDepartment}
            onValueChange={setSelectedDepartment}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {departments.map((dept) => (
                <SelectItem key={dept.value} value={dept.value}>
                  {dept.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>

          <Select
            value={selectedCounselor}
            onValueChange={setSelectedCounselor}
          >
            <SelectTrigger className="w-48">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              {counselors.map((counselor) => (
                <SelectItem key={counselor.value} value={counselor.value}>
                  {counselor.label}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        {/* Overview Metrics */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Total Students
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      dashboardData?.data?.overview?.totalStudents || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardData?.data?.overview?.totalCounselors || 0} counselors
                  </p>
                </div>
                <div className="bg-blue-500 p-3 rounded-lg">
                  <Users className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Appointments
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      dashboardData?.data?.appointments?.total || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardData?.data?.appointments?.completionRate || 0}% completion rate
                  </p>
                </div>
                <div className="bg-green-500 p-3 rounded-lg">
                  <Calendar className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Total Messages
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      dashboardData?.data?.overview?.totalMessages || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {dashboardData?.data?.overview?.totalConversations || 0} conversations
                  </p>
                </div>
                <div className="bg-yellow-500 p-3 rounded-lg">
                  <Clock className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-sm font-medium text-gray-600 uppercase tracking-wide">
                    Student Notes
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {isLoading ? (
                      <Loader2 className="h-8 w-8 animate-spin" />
                    ) : (
                      dashboardData?.data?.overview?.totalNotes || 0
                    )}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Session notes</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
            <TabsTrigger value="students">Students</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#0056b3]" />
                    <span>Department Statistics</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {isLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {dashboardData?.data?.departmentStats?.map((dept, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {dept.department}
                            </span>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{dept._count.id} students</span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#0056b3] h-2 rounded-full"
                              style={{
                                width: `${Math.min((dept._count.id / (dashboardData?.data?.overview?.totalStudents || 1)) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No department data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Appointment Types Distribution */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <PieChart className="h-5 w-5 text-[#0056b3]" />
                    <span>Appointment Types</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {appointmentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {appointmentData?.data?.typeDistribution?.map((type, index) => {
                        const total = appointmentData?.data?.summary?.totalAppointments || 1;
                        const percentage = Math.round((type.count / total) * 100);
                        return (
                          <div key={index} className="space-y-2">
                            <div className="flex justify-between text-sm">
                              <span className="font-medium text-gray-900">
                                {type.type}
                              </span>
                              <div className="flex items-center space-x-2">
                                <span className="text-gray-600">
                                  {type.count} ({percentage}%)
                                </span>
                              </div>
                            </div>
                            <div className="w-full bg-gray-200 rounded-full h-2">
                              <div
                                className="bg-[#0056b3] h-2 rounded-full"
                                style={{ width: `${percentage}%` }}
                              ></div>
                            </div>
                          </div>
                        );
                      }) || (
                        <p className="text-gray-500 text-center py-4">No appointment type data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Appointment Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#0056b3]" />
                  <span>Appointment Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {appointmentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                    {appointmentData?.data?.trends?.slice(-6).map((trend, index) => (
                      <div
                        key={index}
                        className="text-center p-4 bg-gray-50 rounded-lg"
                      >
                        <h4 className="font-medium text-gray-900 mb-2">
                          {trend.period}
                        </h4>
                        <div className="space-y-1 text-sm">
                          <div>
                            <span className="text-gray-500">Total:</span>
                            <span className="font-medium text-gray-900 ml-1">
                              {trend.total}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Completed:</span>
                            <span className="font-medium text-green-600 ml-1">
                              {trend.completed}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Pending:</span>
                            <span className="font-medium text-yellow-600 ml-1">
                              {trend.pending}
                            </span>
                          </div>
                          <div>
                            <span className="text-gray-500">Cancelled:</span>
                            <span className="font-medium text-red-600 ml-1">
                              {trend.cancelled}
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-4 col-span-6">No trend data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counselors Tab */}
          <TabsContent value="counselors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#0056b3]" />
                  <span>Counselor Performance Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {counselorLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-6">
                    {counselorData?.data?.counselorMetrics?.map((counselor) => (
                      <div
                        key={counselor.id}
                        className="p-6 border rounded-lg hover:shadow-md transition-shadow"
                      >
                        <div className="flex items-start justify-between mb-4">
                          <div>
                            <h3 className="font-semibold text-gray-900">
                              {counselor.name}
                            </h3>
                            <p className="text-sm text-gray-500">
                              {counselor.department}
                            </p>
                            <p className="text-xs text-gray-400">
                              ID: {counselor.employeeId}
                            </p>
                          </div>
                          <Badge
                            variant="outline"
                            className={`${
                              parseFloat(counselor.metrics.completionRate) >= 80
                                ? "text-green-600 border-green-600"
                                : parseFloat(counselor.metrics.completionRate) >= 60
                                ? "text-yellow-600 border-yellow-600"
                                : "text-red-600 border-red-600"
                            }`}
                          >
                            {counselor.metrics.completionRate}% Completion
                          </Badge>
                        </div>

                        <div className="grid grid-cols-2 md:grid-cols-5 gap-4 text-sm">
                          <div>
                            <p className="text-gray-500">Total Appointments</p>
                            <p className="font-medium text-gray-900">
                              {counselor.metrics.totalAppointments}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Completed</p>
                            <p className="font-medium text-green-600">
                              {counselor.metrics.completedAppointments}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Cancelled</p>
                            <p className="font-medium text-red-600">
                              {counselor.metrics.cancelledAppointments}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Notes Written</p>
                            <p className="font-medium text-gray-900">
                              {counselor.metrics.totalNotes}
                            </p>
                          </div>
                          <div>
                            <p className="text-gray-500">Notes/Session</p>
                            <p className="font-medium text-blue-600">
                              {counselor.metrics.notesPerAppointment}
                            </p>
                          </div>
                        </div>

                        {/* Performance indicators */}
                        <div className="mt-4 flex items-center space-x-4 text-xs">
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                parseFloat(counselor.metrics.completionRate) >= 80
                                  ? "bg-green-500"
                                  : parseFloat(counselor.metrics.completionRate) >= 60
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-gray-500">
                              Completion Rate: {counselor.metrics.completionRate}%
                            </span>
                          </div>
                          <div className="flex items-center space-x-1">
                            <div
                              className={`w-2 h-2 rounded-full ${
                                parseFloat(counselor.metrics.cancellationRate) <= 10
                                  ? "bg-green-500"
                                  : parseFloat(counselor.metrics.cancellationRate) <= 20
                                  ? "bg-yellow-500"
                                  : "bg-red-500"
                              }`}
                            ></div>
                            <span className="text-gray-500">
                              Cancellation Rate: {counselor.metrics.cancellationRate}%
                            </span>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No counselor data available</p>
                    )}

                    {/* Summary Statistics */}
                    {counselorData?.data?.summary && (
                      <div className="mt-8 p-6 bg-gray-50 rounded-lg">
                        <h4 className="font-semibold text-gray-900 mb-4">Summary Statistics</h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                          <div className="text-center">
                            <p className="text-gray-500">Total Counselors</p>
                            <p className="text-2xl font-bold text-gray-900">
                              {counselorData.data.summary.totalCounselors}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Avg. Appointments</p>
                            <p className="text-2xl font-bold text-blue-600">
                              {counselorData.data.summary.averageAppointments}
                            </p>
                          </div>
                          <div className="text-center">
                            <p className="text-gray-500">Avg. Completion Rate</p>
                            <p className="text-2xl font-bold text-green-600">
                              {counselorData.data.summary.averageCompletionRate}%
                            </p>
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          {/* Students Tab */}
          <TabsContent value="students" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 mb-6">
              {/* Student Engagement Overview */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <Users className="h-5 w-5 text-[#0056b3]" />
                    <span>Student Engagement Overview</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="grid grid-cols-2 gap-4">
                      <div className="text-center p-4 bg-blue-50 rounded-lg">
                        <p className="text-2xl font-bold text-blue-600">
                          {studentData?.data?.overview?.totalStudents || 0}
                        </p>
                        <p className="text-sm text-gray-600">Total Students</p>
                      </div>
                      <div className="text-center p-4 bg-green-50 rounded-lg">
                        <p className="text-2xl font-bold text-green-600">
                          {studentData?.data?.overview?.activeStudents || 0}
                        </p>
                        <p className="text-sm text-gray-600">Active Students</p>
                      </div>
                      <div className="text-center p-4 bg-purple-50 rounded-lg">
                        <p className="text-2xl font-bold text-purple-600">
                          {studentData?.data?.overview?.engagementRate || 0}%
                        </p>
                        <p className="text-sm text-gray-600">Engagement Rate</p>
                      </div>
                      <div className="text-center p-4 bg-yellow-50 rounded-lg">
                        <p className="text-2xl font-bold text-yellow-600">
                          {studentData?.data?.overview?.averageAppointments || 0}
                        </p>
                        <p className="text-sm text-gray-600">Avg. Appointments</p>
                      </div>
                    </div>
                  )}
                </CardContent>
              </Card>

              {/* Department Engagement */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#0056b3]" />
                    <span>Department Engagement</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {studentLoading ? (
                    <div className="flex items-center justify-center py-8">
                      <Loader2 className="h-8 w-8 animate-spin" />
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {studentData?.data?.departmentEngagement?.map((dept, index) => (
                        <div key={index} className="space-y-2">
                          <div className="flex justify-between items-center">
                            <span className="text-sm font-medium text-gray-900">
                              {dept.department}
                            </span>
                            <div className="flex items-center space-x-4 text-sm text-gray-600">
                              <span>{dept.studentCount} students</span>
                              <span>{dept.totalAppointments} appointments</span>
                              <span className="text-blue-600">
                                {dept.averageEngagement} avg score
                              </span>
                            </div>
                          </div>
                          <div className="w-full bg-gray-200 rounded-full h-2">
                            <div
                              className="bg-[#0056b3] h-2 rounded-full"
                              style={{
                                width: `${Math.min((dept.averageEngagement / 10) * 100, 100)}%`,
                              }}
                            ></div>
                          </div>
                        </div>
                      )) || (
                        <p className="text-gray-500 text-center py-4">No department engagement data available</p>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>

            {/* Top Engaged Students */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Award className="h-5 w-5 text-[#0056b3]" />
                  <span>Most Engaged Students</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                {studentLoading ? (
                  <div className="flex items-center justify-center py-8">
                    <Loader2 className="h-8 w-8 animate-spin" />
                  </div>
                ) : (
                  <div className="space-y-4">
                    {studentData?.data?.studentMetrics?.slice(0, 10).map((student, index) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-4 border rounded-lg hover:shadow-sm transition-shadow"
                      >
                        <div className="flex items-center space-x-4">
                          <div className="flex items-center justify-center w-8 h-8 bg-blue-100 text-blue-600 rounded-full text-sm font-medium">
                            {index + 1}
                          </div>
                          <div>
                            <h4 className="font-medium text-gray-900">{student.name}</h4>
                            <p className="text-sm text-gray-500">
                              {student.studentId} • {student.department}
                            </p>
                          </div>
                        </div>
                        <div className="text-right">
                          <div className="grid grid-cols-4 gap-4 text-sm">
                            <div className="text-center">
                              <p className="font-medium text-gray-900">
                                {student.metrics.totalAppointments}
                              </p>
                              <p className="text-xs text-gray-500">Appointments</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-green-600">
                                {student.metrics.completionRate}%
                              </p>
                              <p className="text-xs text-gray-500">Completion</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-blue-600">
                                {student.metrics.totalMessages}
                              </p>
                              <p className="text-xs text-gray-500">Messages</p>
                            </div>
                            <div className="text-center">
                              <p className="font-medium text-purple-600">
                                {student.metrics.engagementScore}
                              </p>
                              <p className="text-xs text-gray-500">Score</p>
                            </div>
                          </div>
                        </div>
                      </div>
                    )) || (
                      <p className="text-gray-500 text-center py-8">No student engagement data available</p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Low Engagement Students */}
            {studentData?.data?.lowEngagementStudents?.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <AlertCircle className="h-5 w-5 text-red-500" />
                    <span>Students Needing Attention</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-3">
                    {studentData.data.lowEngagementStudents.map((student) => (
                      <div
                        key={student.id}
                        className="flex items-center justify-between p-3 bg-red-50 border border-red-200 rounded-lg"
                      >
                        <div>
                          <h4 className="font-medium text-gray-900">{student.name}</h4>
                          <p className="text-sm text-gray-500">
                            {student.studentId} • {student.department}
                          </p>
                        </div>
                        <div className="text-right">
                          <p className="text-sm text-red-600 font-medium">No recent activity</p>
                          <p className="text-xs text-gray-500">Consider reaching out</p>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
