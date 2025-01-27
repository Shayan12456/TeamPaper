import React, { useState } from 'react';
import { Play } from 'lucide-react';
import { Hero, Logos, Features, Howitworks, Stats, Animation, Testimonials, CTA } from '../components/UI/index';
import Navbar from '../components/layout/Navbar';
import Footer from '../components/layout/Footer';

function Home() {
  const [videoModal, setVideoModal] = useState(false);

  return (
    <div className="min-h-screen bg-white">
      <Hero />
      <Logos />
      <Features />
      <Howitworks />
      <Stats />      
      {/* <Animation /> */}
      <Testimonials />
      <CTA />

      {/* Video Modal */}
      {videoModal && (
        <div className="fixed inset-0 bg-black/60 backdrop-blur-sm z-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-2xl p-4 max-w-3xl w-full border">
            <div className="flex justify-between items-center mb-4">
              <h3 className="text-xl font-semibold text-black">Watch Demo</h3>
              <button
                onClick={() => setVideoModal(false)}
                className="text-gray-400 hover:text-gray-600"
              >
                <svg className="w-6 h-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
                </svg>
              </button>
            </div>
            <div className="aspect-video bg-gray-100 rounded-lg flex items-center justify-center border">
              <Play className="h-12 w-12 text-gray-400" />
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

export default Home;