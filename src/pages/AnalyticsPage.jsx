import { useState } from "react";
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

export default function AnalyticsPage() {
  const [selectedTimeRange, setSelectedTimeRange] = useState("6months");
  const [selectedDepartment, setSelectedDepartment] = useState("all");
  const [selectedCounselor, setSelectedCounselor] = useState("all");

  // Mock analytics data - replace with actual API calls
  const analyticsData = {
    overview: {
      totalStudents: 342,
      activeStudents: 298,
      totalCounselors: 8,
      activeCounselors: 7,
      totalAppointments: 1247,
      completedAppointments: 1156,
      averageSessionDuration: 45,
      studentSatisfaction: 4.7,
      responseTime: 2.4,
      utilizationRate: 87,
    },

    departmentMetrics: [
      {
        department: "Computer Science",
        students: 89,
        counselors: 2,
        appointments: 342,
        satisfaction: 4.8,
      },
      {
        department: "Electrical Engineering",
        students: 76,
        counselors: 2,
        appointments: 298,
        satisfaction: 4.6,
      },
      {
        department: "Mechanical Engineering",
        students: 68,
        counselors: 1,
        appointments: 245,
        satisfaction: 4.5,
      },
      {
        department: "Civil Engineering",
        students: 54,
        counselors: 1,
        appointments: 189,
        satisfaction: 4.7,
      },
      {
        department: "Business Administration",
        students: 55,
        counselors: 2,
        appointments: 173,
        satisfaction: 4.9,
      },
    ],

    monthlyTrends: [
      {
        month: "Jan",
        appointments: 89,
        students: 45,
        completion: 92,
        satisfaction: 4.5,
      },
      {
        month: "Feb",
        appointments: 102,
        students: 58,
        completion: 94,
        satisfaction: 4.6,
      },
      {
        month: "Mar",
        appointments: 125,
        students: 67,
        completion: 89,
        satisfaction: 4.4,
      },
      {
        month: "Apr",
        appointments: 143,
        students: 78,
        completion: 96,
        satisfaction: 4.8,
      },
      {
        month: "May",
        appointments: 156,
        students: 82,
        completion: 93,
        satisfaction: 4.7,
      },
      {
        month: "Jun",
        appointments: 178,
        students: 95,
        completion: 95,
        satisfaction: 4.9,
      },
    ],

    counselorPerformance: [
      {
        id: "1",
        name: "Dr. Sarah Ahmed",
        department: "Psychology",
        studentsAssigned: 45,
        appointmentsCompleted: 156,
        avgSessionDuration: 48,
        satisfaction: 4.9,
      },
      {
        id: "2",
        name: "Prof. Ahmad Hassan",
        department: "Academic Affairs",
        studentsAssigned: 38,
        appointmentsCompleted: 134,
        avgSessionDuration: 42,
        satisfaction: 4.6,
      },
      {
        id: "3",
        name: "Dr. Fatima Sheikh",
        department: "Career Services",
        studentsAssigned: 41,
        appointmentsCompleted: 145,
        avgSessionDuration: 45,
        satisfaction: 4.8,
      },
      {
        id: "4",
        name: "Dr. Ali Khan",
        department: "Mental Health",
        studentsAssigned: 35,
        appointmentsCompleted: 98,
        avgSessionDuration: 52,
        satisfaction: 4.5,
      },
    ],

    appointmentTypes: [
      { type: "Academic Guidance", count: 445, percentage: 36, trend: "+12%" },
      { type: "Career Counseling", count: 378, percentage: 30, trend: "+8%" },
      {
        type: "Personal Development",
        count: 298,
        percentage: 24,
        trend: "+15%",
      },
      {
        type: "Mental Health Support",
        count: 126,
        percentage: 10,
        trend: "+22%",
      },
    ],
  };

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
    // Implementation for refreshing analytics data
    console.log("Refreshing analytics data...");
  };

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
              className="flex items-center space-x-2"
            >
              <RefreshCw className="h-4 w-4" />
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
                    {analyticsData.overview.totalStudents}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {analyticsData.overview.activeStudents} active
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
                    {analyticsData.overview.totalAppointments}
                  </p>
                  <p className="text-sm text-gray-500 mt-1">
                    {Math.round(
                      (analyticsData.overview.completedAppointments /
                        analyticsData.overview.totalAppointments) *
                        100
                    )}
                    % completion rate
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
                    Avg. Session Duration
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analyticsData.overview.averageSessionDuration}m
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Per session</p>
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
                    Satisfaction Rate
                  </p>
                  <p className="text-3xl font-bold text-gray-900 mt-2">
                    {analyticsData.overview.studentSatisfaction}/5
                  </p>
                  <p className="text-sm text-gray-500 mt-1">Student feedback</p>
                </div>
                <div className="bg-purple-500 p-3 rounded-lg">
                  <Award className="h-6 w-6 text-white" />
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Main Analytics Tabs - Removed Students, Trends, and Insights for chairperson */}
        <Tabs defaultValue="overview" className="space-y-6">
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="overview">Overview</TabsTrigger>
            <TabsTrigger value="counselors">Counselors</TabsTrigger>
          </TabsList>

          {/* Overview Tab */}
          <TabsContent value="overview" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Department Performance */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center space-x-2">
                    <BarChart3 className="h-5 w-5 text-[#0056b3]" />
                    <span>Department Performance</span>
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-4">
                    {analyticsData.departmentMetrics.map((dept, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between items-center">
                          <span className="text-sm font-medium text-gray-900">
                            {dept.department}
                          </span>
                          <div className="flex items-center space-x-4 text-sm text-gray-600">
                            <span>{dept.students} students</span>
                            <span>{dept.appointments} sessions</span>
                            <span
                              className={getPerformanceColor(
                                dept.satisfaction,
                                "satisfaction"
                              )}
                            >
                              {dept.satisfaction}/5
                            </span>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0056b3] h-2 rounded-full"
                            style={{
                              width: `${(dept.appointments / 350) * 100}%`,
                            }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
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
                  <div className="space-y-4">
                    {analyticsData.appointmentTypes.map((type, index) => (
                      <div key={index} className="space-y-2">
                        <div className="flex justify-between text-sm">
                          <span className="font-medium text-gray-900">
                            {type.type}
                          </span>
                          <div className="flex items-center space-x-2">
                            <span className="text-gray-600">
                              {type.count} ({type.percentage}%)
                            </span>
                            <Badge
                              variant="outline"
                              className="text-green-600 border-green-600"
                            >
                              {type.trend}
                            </Badge>
                          </div>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-[#0056b3] h-2 rounded-full"
                            style={{ width: `${type.percentage}%` }}
                          ></div>
                        </div>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Monthly Trends */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-[#0056b3]" />
                  <span>Monthly Trends</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-6 gap-4">
                  {analyticsData.monthlyTrends.map((month, index) => (
                    <div
                      key={index}
                      className="text-center p-4 bg-gray-50 rounded-lg"
                    >
                      <h4 className="font-medium text-gray-900 mb-2">
                        {month.month}
                      </h4>
                      <div className="space-y-1 text-sm">
                        <div>
                          <span className="text-gray-500">Appointments:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {month.appointments}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Students:</span>
                          <span className="font-medium text-gray-900 ml-1">
                            {month.students}
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Completion:</span>
                          <span className="font-medium text-green-600 ml-1">
                            {month.completion}%
                          </span>
                        </div>
                        <div>
                          <span className="text-gray-500">Rating:</span>
                          <span className="font-medium text-purple-600 ml-1">
                            {month.satisfaction}
                          </span>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>

          {/* Counselors Tab - Removed Response Time and Utilization */}
          <TabsContent value="counselors" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Users className="h-5 w-5 text-[#0056b3]" />
                  <span>Counselor Performance Dashboard</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-6">
                  {analyticsData.counselorPerformance.map((counselor) => (
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
                        </div>
                        <Badge
                          className={getPerformanceColor(
                            counselor.satisfaction,
                            "satisfaction"
                          )}
                        >
                          {counselor.satisfaction}/5 Rating
                        </Badge>
                      </div>

                      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                        <div>
                          <p className="text-gray-500">Students</p>
                          <p className="font-medium text-gray-900">
                            {counselor.studentsAssigned}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Sessions</p>
                          <p className="font-medium text-gray-900">
                            {counselor.appointmentsCompleted}
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Avg. Duration</p>
                          <p className="font-medium text-gray-900">
                            {counselor.avgSessionDuration}m
                          </p>
                        </div>
                        <div>
                          <p className="text-gray-500">Satisfaction</p>
                          <p
                            className={`font-medium ${getPerformanceColor(
                              counselor.satisfaction,
                              "satisfaction"
                            )}`}
                          >
                            {counselor.satisfaction}/5
                          </p>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </main>
    </div>
  );
}
