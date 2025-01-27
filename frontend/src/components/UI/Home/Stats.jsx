export default function Stats(){
    return (
      <>
        {/* Stats Section */}
        <section className="py-20 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="grid md:grid-cols-4 gap-8 text-center">
                {[
                { number: "10M+", label: "Documents Created" },
                { number: "150k+", label: "Active Users" },
                { number: "99.9%", label: "Uptime" },
                { number: "5x", label: "Faster Collaboration" }
                ].map((stat, index) => (
                <div key={index}>
                    <div className="text-4xl font-bold mb-2">{stat.number}</div>
                    <div className="text-gray-400">{stat.label}</div>
                </div>
                ))}
            </div>
            </div>
        </section>
      </>
    );
}