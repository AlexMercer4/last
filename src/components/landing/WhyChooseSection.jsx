import { Calendar, MessageSquare, FolderOpen, BarChart } from 'lucide-react';

export default function WhyChooseSection() {
  const reasons = [
    {
      title: 'Streamlined Scheduling',
      description: 'Eliminate scheduling conflicts with our intelligent appointment system that shows real-time availability.',
      icon: Calendar,
      color: 'bg-[#0056b3]',
    },
    {
      title: 'Resource Sharing',
      description: 'Centralized repository for educational materials, guides, and counseling resources.',
      icon: FolderOpen,
      color: 'bg-purple-600',
    },
    {
      title: 'Instant Communication',
      description: 'Real-time messaging ensures quick responses to urgent student needs and concerns.',
      icon: MessageSquare,
      color: 'bg-green-600',
    },
    {
      title: 'Comprehensive Reporting',
      description: 'Detailed analytics and reports help institutions track counseling effectiveness and student engagement.',
      icon: BarChart,
      color: 'bg-orange-600',
    },
  ];

  return (
    <section className="py-16 lg:py-24 bg-white">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-16">
          <h2 className="text-3xl lg:text-4xl font-bold text-gray-900 mb-4">
            Why Choose SCCP?
          </h2>
          <p className="text-lg text-gray-600 max-w-3xl mx-auto">
            Designed specifically for educational institutions to enhance counseling services.
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
          {reasons.map((reason, index) => (
            <div
              key={index}
              className="flex items-start space-x-4 p-6 rounded-xl hover:bg-gray-50 transition-all duration-200"
            >
              <div className={`${reason.color} p-3 rounded-lg flex-shrink-0`}>
                <reason.icon className="h-6 w-6 text-white" />
              </div>
              <div>
                <h3 className="text-xl font-bold text-gray-900 mb-2">{reason.title}</h3>
                <p className="text-gray-600 leading-relaxed">{reason.description}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}