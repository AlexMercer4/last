import { Button } from '@/components/ui/button';

export default function HeroSection() {
  return (
    <section className="bg-gradient-to-br from-[#0056b3] to-[#003d82] text-white py-20 lg:py-32">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h1 className="text-4xl sm:text-5xl lg:text-6xl font-bold leading-tight mb-6">
          Student Counselor
          <br />
          <span className="text-blue-200">Communication Platform</span>
        </h1>
        
        <p className="text-lg sm:text-xl lg:text-2xl text-blue-100 mb-8 max-w-4xl mx-auto leading-relaxed">
          Bridging the communication gap between students and counselors through a
          centralized platform for appointment scheduling, instant messaging, and resource
          sharing.
        </p>
        
        <Button 
          size="lg" 
          className="bg-white text-[#0056b3] hover:bg-blue-50 font-semibold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          Access Platform
        </Button>
      </div>
    </section>
  );
}