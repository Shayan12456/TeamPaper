import { FileText, Menu, X } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/auth/check", {
          method: "GET",
          credentials: "include",
        });
        const data = await response.json();
        setIsAuthenticated(data.authenticated);
      } catch (error) {
        setIsAuthenticated(false);
      }
    };
    checkAuth();
  }, []);

  async function loggingOut() {
    try {
      await fetch(import.meta.env.VITE_API_URL + "/logout", {
        method: "POST",
        credentials: "include",
      });
      var backlen = history.length;
      history.go(-backlen);
      window.location.href = "/login";
    } catch (error) {
      console.error('Error fetching data:', error);
    }
  }

  return (
    <>
      <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <Link to="/home">
              <div className="flex items-center">
                <FileText className="h-8 w-8 text-black" />
                <span className="ml-2 text-xl font-bold text-black">TeamPaper</span>
              </div>
            </Link>

            {/* Hamburger */}
            <div className="md:hidden">
              <button onClick={() => setMenuOpen(!menuOpen)}>
                {menuOpen ? <X className="h-6 w-6" /> : <Menu className="h-6 w-6" />}
              </button>
            </div>

            {/* Desktop Nav */}
            <div className="hidden md:flex items-center space-x-8">
              <a href="/#features" className="text-gray-600 hover:text-black">Features</a>
              <a href="/#how-it-works" className="text-gray-600 hover:text-black">How it Works</a>
              <a href="/#testimonials" className="text-gray-600 hover:text-black">Testimonials</a>
              {isAuthenticated ? (
                <button onClick={loggingOut} className="bg-white text-black border border-black px-4 py-1.5 rounded-lg hover:bg-black hover:text-white transition">
                  Log out
                </button>
              ) : (
                <>
                  <a href="/login" className="bg-black text-white px-4 py-1.5 rounded-lg hover:bg-white hover:text-black border border-black transition">Log In</a>
                  <a href="/signup" className="bg-white text-black border border-black px-4 py-1.5 rounded-lg hover:bg-black hover:text-white transition">Sign Up</a>
                </>
              )}
            </div>
          </div>
        </div>

        {/* Mobile Nav */}
        {menuOpen && (
          <div className="md:hidden px-4 pb-4 space-y-3">
            <a href="#features" className="block text-gray-600 hover:text-black" onClick={()=>setMenuOpen(!open)}>Features</a>
            <a href="#how-it-works" className="block text-gray-600 hover:text-black" onClick={()=>setMenuOpen(!open)}>How it Works</a>
            <a href="#testimonials" className="block text-gray-600 hover:text-black" onClick={()=>setMenuOpen(!open)}>Testimonials</a>
            {isAuthenticated ? (
              <button onClick={loggingOut} className="w-full bg-white text-black border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">Log out</button>
            ) : (
              <>
                <a href="/login" className="block w-full text-center bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black border border-black transition">Log In</a>
                <a href="/signup" className="block w-full text-center bg-white text-black border border-black px-4 py-2 rounded-lg hover:bg-black hover:text-white transition">Sign Up</a>
              </>
            )}
          </div>
        )}
      </nav>
    </>
  );
}
