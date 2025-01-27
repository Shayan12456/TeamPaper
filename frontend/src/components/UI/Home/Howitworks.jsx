import { ChevronRight } from 'lucide-react';

export default function Howitworks(){
    return (
      <>
        {/* How It Works Section */}
        <section className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">How TeamPaper Works</h2>
                <p className="text-xl text-gray-600 max-w-2xl mx-auto">
                Get started in minutes with our intuitive platform.
                </p>
            </div>
            <div className="grid md:grid-cols-4 gap-8">
                {[
                {
                    step: "01",
                    title: "Create Document",
                    description: "Start from scratch or use our smart templates"
                },
                {
                    step: "02",
                    title: "Invite Team",
                    description: "Add collaborators with custom permissions"
                },
                {
                    step: "03",
                    title: "Collaborate",
                    description: "Edit and comment in real-time"
                },
                {
                    step: "04",
                    title: "Track Changes",
                    description: "Review history and manage versions"
                }
                ].map((step, index) => (
                <div key={index} className="relative">
                    <div className="bg-gray-50 p-6 rounded-xl shadow-sm h-full border">
                    <div className="text-4xl font-bold text-black mb-4">{step.step}</div>
                    <h3 className="text-xl font-semibold text-black mb-2">{step.title}</h3>
                    <p className="text-gray-600">{step.description}</p>
                    </div>
                    {index < 3 && (
                    <div className="hidden md:block absolute top-1/2 -right-4 transform -translate-y-1/2">
                        <ChevronRight className="h-8 w-8 text-gray-400" />
                    </div>
                    )}
                </div>
                ))}
            </div>
            </div>
        </section>
      </>
    );
}