import { User, Users, Shield, BookOpen, MessageCircle, Calendar, BarChart, Settings } from 'lucide-react';

export default function FeaturesSection() {
  const features = [
    {
      title: 'For Students',
      icon: User,
      color: 'border-l-blue-500',
      items: [
        { icon: Calendar, text: 'Book, reschedule, or cancel appointments' },
        { icon: BookOpen, text: 'Access counseling resources and materials' },
        { icon: MessageCircle, text: 'Receive notifications and instant messages' },
      ],
    },
    {
      title: 'For Counselors',
      icon: Users,
      color: 'border-l-green-500',
      items: [
        { icon: Calendar, text: 'Manage appointments and availability' },
        { icon: MessageCircle, text: 'Send messages and share resources' },
        { icon: BarChart, text: 'Track student progress and history' },
      ],
    },
    {
      title: 'For Chairperson',
      icon: Shield,
      color: 'border-l-purple-500',
      items: [
        { icon: BarChart, text: 'Oversee system operations and reporting' },
        { icon: Users, text: 'Manage user accounts and permissions' },
        { icon: Settings, text: 'Policy enforcement and compliance' },
      ],
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-gray-50">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Comprehensive Counseling Solutions
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            The SCCP provides all the tools needed for effective student-counselor communication
            and collaboration in an educational environment.
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {features.map((feature, index) => (
            <div
              key={index}
              className={`bg-white rounded-xl shadow-lg border-l-4 ${feature.color} p-6 lg:p-8 transition-all duration-200 hover:shadow-xl`}
            >
              <div className="flex items-center mb-6">
                <feature.icon className="h-8 w-8 text-[#0056b3] mr-3" />
                <h3 className="text-xl font-bold text-gray-900">{feature.title}</h3>
              </div>
              
              <ul className="space-y-4">
                {feature.items.map((item, itemIndex) => (
                  <li key={itemIndex} className="flex items-start">
                    <item.icon className="h-5 w-5 text-gray-500 mr-3 mt-0.5 flex-shrink-0" />
                    <span className="text-gray-600 leading-relaxed">{item.text}</span>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}