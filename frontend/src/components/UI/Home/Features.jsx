import {
    Users,
    FileText,
    Zap,
    Shield,
    MessageCircle,
    Clock,
  } from 'lucide-react';

export default function Features(){
    return (
        <>
          {/* Features Section */}
          <section id="features" className="py-20 bg-gray-50">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
                <div className="text-center mb-16">
                    <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Everything you need for seamless collaboration</h2>
                    <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                        Powerful features that help your team work faster and smarter together.
                    </p>
                </div>
                <div className="grid md:grid-cols-3 gap-8">
                    {[
                    {
                            icon: <Users className="h-6 w-6" />,
                            title: "Real-time Collaboration",
                            description: "Work together with your team in real-time. See changes as they happen with instant sync."
                    },
                    {
                            icon: <Clock className="h-6 w-6" />,
                            title: "Version History",
                            description: "Track changes and restore previous versions with complete document history."
                    },
                    {
                            icon: <MessageCircle className="h-6 w-6" />,
                            title: "Smart Comments",
                            description: "Add context with inline comments, @mentions, and AI-powered suggestions."
                    },
                    {
                            icon: <Shield className="h-6 w-6" />,
                            title: "Enterprise Security",
                            description: "Bank-grade encryption, SSO, and advanced access controls for your data."
                    },
                    {
                            icon: <Zap className="h-6 w-6" />,
                            title: "Lightning Fast",
                            description: "Optimized performance ensures instant updates and smooth collaboration."
                    },
                    {
                            icon: <FileText className="h-6 w-6" />,
                            title: "Smart Templates",
                            description: "Start faster with customizable templates and AI-powered formatting."
                    }
                    ].map((feature, index) => (
                        <div key={index} className="p-6 bg-white rounded-xl hover:shadow-lg transition group border">
                            <div className="w-12 h-12 bg-gray-100 rounded-lg flex items-center justify-center mb-4 group-hover:scale-110 transition">
                            {feature.icon}
                            </div>
                            <h3 className="text-xl font-semibold text-black mb-2">{feature.title}</h3>
                            <p className="text-gray-600">{feature.description}</p>
                        </div>
                    ))}
                </div>
            </div>
          </section>
        </>
    );
}