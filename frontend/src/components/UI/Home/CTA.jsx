export default function CTA(){
    return(
      <>
        {/* CTA Section */}
        <section className="py-20 bg-black text-white">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 text-center">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Ready to transform your team's workflow?</h2>
            <p className="text-xl text-gray-400 mb-8 max-w-2xl mx-auto">
                Join thousands of teams already using TeamPaper to collaborate better.
            </p>
            <div className="flex flex-col sm:flex-row justify-center gap-4">
                <button className="bg-white text-black px-8 py-4 rounded-lg hover:bg-gray-100 transition">
                Start Free Trial
                </button>
                <button className="border border-gray-700 text-white px-8 py-4 rounded-lg hover:bg-gray-800 transition">
                Contact Sales
                </button>
            </div>
            </div>
        </section>
      </>
    );
}