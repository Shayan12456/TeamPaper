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
        <section className="pt-32 pb-20 px-4">
          <div className="max-w-7xl mx-auto">
              <div className="text-center">
                    <div className="inline-block mb-4">
                    <span className="px-4 py-1.5 rounded-full text-sm font-medium bg-gray-100 text-gray-900">
                        New: AI-Powered Document Insights →
                    </span>
                    </div>
                    <h1 className="text-5xl md:text-7xl font-bold text-black mb-6 leading-tight">
                    Where Teams<br />
                    Create Together
                    </h1>
                    <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
                    Transform your team's workflow with seamless document collaboration. 
                    Edit, comment, and create together in real-time with enterprise-grade security.
                    </p>
                    <div className="flex flex-col sm:flex-row justify-center gap-4 mb-12">
                    <button className="bg-black text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition flex items-center justify-center group">
                        Start Free Trial
                        <ChevronRight className="ml-2 h-5 w-5 group-hover:translate-x-1 transition-transform" />
                    </button>
                    <button 
                        onClick={() => setVideoModal(true)}
                        className="border border-gray-200 text-gray-600 px-8 py-4 rounded-lg hover:bg-gray-50 transition flex items-center justify-center"
                    >
                        <Play className="mr-2 h-5 w-5" />
                        Watch Demo
                    </button>
                    </div>
                    <div className="flex justify-center items-center space-x-8 text-sm text-gray-500 mb-12">
                    <div className="flex items-center">
                        <Shield className="h-5 w-5 mr-2" />
                        Enterprise-grade security
                    </div>
                    <div className="flex items-center">
                        <Globe className="h-5 w-5 mr-2" />
                        Used by 10,000+ teams
                    </div>
                    <div className="flex items-center">
                        <Award className="h-5 w-5 mr-2" />
                        Leader in G2 Grid
                    </div>
                    </div>
              </div>
              <div className="relative">
                    <img
                    src="https://images.unsplash.com/photo-1600267185393-e158a98703de?auto=format&fit=crop&w=2070&q=80"
                    alt="TeamPaper Interface"
                    className="rounded-xl shadow-2xl border"
                    />
                    <div className="absolute -bottom-6 left-1/2 transform -translate-x-1/2 bg-white px-6 py-3 rounded-full shadow-lg flex items-center z-20 border">
                    <div className="flex -space-x-2">
                        <img src="https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                        <img src="https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                        <img src="https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop" alt="User" className="w-8 h-8 rounded-full border-2 border-white" />
                    </div>
                    <div className="ml-3">
                        <span className="text-sm text-gray-900">Sarah and 2 others are editing</span>
                        <span className="flex items-center text-xs text-gray-500">
                        <span className="w-2 h-2 bg-green-500 rounded-full mr-1"></span>
                        Live now
                        </span>
                    </div>
                    </div>
              </div>
          </div>
        </section>
      </>
    );
}
