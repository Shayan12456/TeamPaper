export default function Testimonials(){
    return (
      <>
        {/* Testimonials Section */}
        <section id="testimonials" className="py-20 bg-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="text-center mb-16">
                <h2 className="text-3xl md:text-4xl font-bold text-black mb-4">Loved by teams worldwide</h2>
                <p className="text-xl text-gray-600">See what others are saying about TeamPaper</p>
            </div>
            <div className="grid md:grid-cols-3 gap-8">
                {[
                {
                    quote: "TeamPaper has transformed how our team collaborates on documents. The AI features are incredibly powerful and intuitive.",
                    author: "Sarah Johnson",
                    role: "Product Manager at TechCorp",
                    image: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=100&h=100&fit=crop"
                },
                {
                    quote: "The real-time collaboration features are game-changing. We've cut our document review time in half and improved quality.",
                    author: "Michael Chen",
                    role: "Design Lead at CreativeStudio",
                    image: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=100&h=100&fit=crop"
                },
                {
                    quote: "Best investment we've made for our remote team. The interface is beautiful and the security features give us peace of mind.",
                    author: "Emily Rodriguez",
                    role: "CEO at StartupX",
                    image: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=100&h=100&fit=crop"
                }
                ].map((testimonial, index) => (
                <div key={index} className="bg-gray-50 p-8 rounded-xl border">
                    <div className="flex items-center mb-6">
                    <img
                        src={testimonial.image}
                        alt={testimonial.author}
                        className="w-12 h-12 rounded-full"
                    />
                    <div className="ml-4">
                        <p className="font-semibold text-black">{testimonial.author}</p>
                        <p className="text-sm text-gray-500">{testimonial.role}</p>
                    </div>
                    </div>
                    <p className="text-gray-600 italic mb-4">"{testimonial.quote}"</p>
                    <div className="flex text-yellow-400">
                    {[...Array(5)].map((_, i) => (
                        <svg key={i} className="h-5 w-5 fill-current" viewBox="0 0 20 20">
                        <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
                        </svg>
                    ))}
                    </div>
                </div>
                ))}
            </div>
            </div>
        </section>
      </>
    );
}