import {
  Shield,
  ChevronRight,
  Globe,
  Award,
  Play,
} from 'lucide-react';

export default function Hero(){
    return (
      <>
        <section className="pt-32 pb-4 px-4">
          <div className="max-w-7xl mx-auto">
              <div className="text-center">
                    <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
                    Where Teams<br />
                    Create Together
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Transform your team's workflow with seamless document collaboration. 
                    Edit, comment, and create together in real-time with enterprise-grade security.
                    </p>
                    <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 mb-6">
                    <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Enterprise-grade security
                    </div>
                    </div>
              </div>
          </div>
        </section>
      </>
    );
}
