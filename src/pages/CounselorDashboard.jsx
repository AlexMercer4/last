import { Calendar, MessageCircle, Users, Clock } from "lucide-react";
import { Button } from "@/components/ui/button";
import StatsCard from "@/components/dashboard/StatsCard";
import AppointmentCard from "@/components/dashboard/AppointmentCard";
import MessageCard from "@/components/dashboard/MessageCard";

export default function CounselorDashboard() {
  const statsData = [
    {
      title: "Today's Appointments",
      value: "5",
      subtitle: "2 pending approval",
      icon: Calendar,
      borderColor: "border-l-blue-500",
      iconBgColor: "bg-blue-500",
    },
    {
      title: "Active Students",
      value: "28",
      subtitle: "This semester",
      icon: Users,
      borderColor: "border-l-green-500",
      iconBgColor: "bg-green-500",
    },
    {
      title: "Unread Messages",
      value: "7",
      subtitle: "From students",
      icon: MessageCircle,
      borderColor: "border-l-yellow-500",
      iconBgColor: "bg-yellow-500",
    },
    {
      title: "Session Hours",
      value: "42",
      subtitle: "This month",
      icon: Clock,
      borderColor: "border-l-purple-500",
      iconBgColor: "bg-purple-500",
    },
  ];

  const todayAppointments = [
    {
      date: "2024-06-25",
      time: "9:00 AM",
      counselor: "Ahmad Ali",
      location: "Room 201, Counseling Center",
      status: "scheduled",
    },
    {
      date: "2024-06-25",
      time: "11:00 AM",
      counselor: "Fatima Khan",
      location: "Room 201, Counseling Center",
      status: "pending",
    },
    {
      date: "2024-06-25",
      time: "2:00 PM",
      counselor: "Hassan Ahmed",
      location: "Room 201, Counseling Center",
      status: "scheduled",
    },
  ];

  const recentMessages = [
    {
      sender: "Ahmad Ali",
      message:
        "Thank you for the session today. The career guidance was very helpful.",
      timestamp: "30 minutes ago",
      isUnread: true,
    },
    {
      sender: "Fatima Khan",
      message:
        "Can we reschedule tomorrow's appointment? I have a class conflict.",
      timestamp: "2 hours ago",
      isUnread: true,
    },
    {
      sender: "Hassan Ahmed",
      message:
        "I've completed the assignments you suggested. When can we discuss them?",
      timestamp: "1 day ago",
    },
  ];

  return (
    <div className="min-h-screen bg-gray-50">
      <main className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header Section */}
        <div className="mb-8">
          <h1 className="text-3xl font-bold text-gray-900">
            Counselor Dashboard
          </h1>
          <p className="text-gray-600 mt-2">
            Welcome back, Dr. Sarah Ahmed! Here&apos;s your counseling activity
            overview.
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
          {/* Today's Appointments */}
          <div className="space-y-6">
            <div className="flex items-center justify-between">
              <h2 className="text-xl font-bold text-gray-900">
                Today&apos;s Appointments
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
              {todayAppointments.map((appointment, index) => (
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
                  isUnread={message.isUnread}
                />
              ))}
            </div>
          </div>
        </div>
      </main>
    </div>
  );
}
