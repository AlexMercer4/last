import { Calendar, MessageCircle, BookOpen, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import MessageCard from "@/components/dashboard/MessageCard";

export default function StudentDashboard() {
  const statsData = [
    {
      title: "Upcoming Appointments",
      value: "2",
      subtitle: "This week",
      icon: Calendar,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-orange-500",
    },
    {
      title: "Unread Messages",
      value: "3",
      subtitle: "From counselors",
      icon: MessageCircle,
      borderColor: "border-l-green-500",
      iconBgColor: "bg-yellow-500",
    },
    {
      title: "Resources Available",
      value: "12",
      subtitle: "New this month",
      icon: BookOpen,
      borderColor: "border-l-purple-500",
      iconBgColor: "bg-yellow-600",
    },
    {
      title: "Session Hours",
      value: "8.5",
      subtitle: "This semester",
      icon: Clock,
      borderColor: "border-l-red-500",
      iconBgColor: "bg-orange-600",
    },
  ];

  const upcomingAppointments = [
    {
      date: "2024-06-25",
      time: "10:00 AM",
      counselor: "Dr. Sarah Ahmed",
      location: "Room 201, Counseling Center",
      status: "scheduled",
    },
    {
      date: "2024-06-28",
      time: "2:00 PM",
      counselor: "Prof. Ahmad Hassan",
      location: "Room 105, Student Services",
      status: "pending",
    },
  ];

  const recentMessages = [
    {
      sender: "Dr. Sarah Ahmed",
      message:
        "Remember to bring your academic transcript for our meeting tomorrow.",
      timestamp: "2 hours ago",
    },
    {
      sender: "Prof. Ahmad Hassan",
      message:
        "I have approved your course selection. Check the resources section for additional materials.",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Student Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back! Here&apos;s what&apos;s happening with your counseling
            activities.
          </p>
        </div>

        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          {statsData.map((stat, index) => (
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
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Upcoming Appointments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Upcoming Appointments
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
              {upcomingAppointments.map((appointment, index) => (
                <AppointmentCard
                  key={index}
                  date={appointment.date}
                  time={appointment.time}
                  counselor={appointment.counselor}
                  location={appointment.location}
                  status={appointment.status}
                />
              ))}
            </div>
          </div>

          {/* Recent Messages */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Recent Messages
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
              {recentMessages.map((message, index) => (
                <MessageCard
                  key={index}
                  sender={message.sender}
                  message={message.message}
                  timestamp={message.timestamp}
                  isUnread={index === 0}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
