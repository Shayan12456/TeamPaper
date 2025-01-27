export default function Logos(){
    return(
      <>
        {/* Logos Section */}
        <section className="py-12 border-y">
          <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <p className="text-center text-gray-500 mb-8">Trusted by leading companies worldwide</p>
            <div className="grid grid-cols-2 md:grid-cols-6 gap-8 items-center justify-items-center opacity-50">
                {[
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80",
                "https://images.unsplash.com/photo-1611162617474-5b21e879e113?w=100&h=40&fit=crop&q=80"
                ].map((logo, index) => (
                <img key={index} src={logo} alt="Company logo" className="h-8 object-contain" />
                ))}
            </div>
          </div>
        </section>
      </>
    );
}