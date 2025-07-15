import { Button } from '@/components/ui/button';

export default function CTASection() {
  return (
    <section className="bg-gradient-to-r from-[#0056b3] to-[#003d82] text-white py-16 lg:py-20">
      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
        <h2 className="text-3xl lg:text-4xl font-bold mb-4">
          Ready to Transform Your Counseling Services?
        </h2>
        <p className="text-lg lg:text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
          Join educational institutions that have improved their student support with SCCP.
        </p>
        
        <Button 
          size="lg" 
          className="bg-white text-[#0056b3] hover:bg-blue-50 font-semibold px-8 py-3 text-lg rounded-lg shadow-lg transition-all duration-200 hover:shadow-xl"
        >
          Get Started Today
        </Button>
      </div>
    </section>
  );
}