import { FileText } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';

export default function Navbar(){
    const [isAuthenticated, setIsAuthenticated] = useState(null);

    useEffect(() => {
      const checkAuth = async () => {
        try {
          const response = await fetch("http://localhost:8080/auth/check", {
            method: "GET",
            credentials: "include", // Include HTTP-only cookies
          });
  
            const data = await response.json();
            setIsAuthenticated(data.authenticated);
          
  
        } catch (error) {
          // console.error("Error verifying authentication:", error);
          setIsAuthenticated(false);
        }
      };
  
      checkAuth();
    }, []);

    async function loggingOut() {
      try {
        const response = await fetch("http://localhost:8080/logout", {
          method: "POST", // Specify the HTTP method
          credentials: "include", // ✅ Include credentials
        });
  
        // credentials: "include" ensures that:
        // ✅ The browser sends cookies (e.g., accessToken) with the request.
        // ✅ The browser accepts cookies sent from the server.
        
        // ✅ Prevent Back button from showing the protected page
        // window.history.replaceState(null, null, "/login");

        var backlen = history.length;
        console.log(backlen);
     history.go(-backlen);
     window.location.href = "http://localhost:5173/login"

        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`);
        }
  
        window.location.href = "http://localhost:5173/home";
        
      } catch (error) {
        console.error('Error fetching data:', error);
      }
    }

    return (
      <>
        {/* Navigation */}
        <nav className="fixed w-full bg-white/80 backdrop-blur-sm z-50 border-b">
            <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
            <div className="flex justify-between items-center h-16">
                <Link to="/home">
                    <div className="flex items-center">
                        <FileText className="h-8 w-8 text-black" />
                        <span className="ml-2 text-xl font-bold text-black">TeamPaper</span>
                    </div>
                </Link>               
                <div className="hidden md:flex items-center space-x-8">
                <a href="#features" className="text-gray-600 hover:text-black">Features</a>
                <a href="#solutions" className="text-gray-600 hover:text-black">Solutions</a>
                <a href="#pricing" className="text-gray-600 hover:text-black">Pricing</a>
                <a href="#testimonials" className="text-gray-600 hover:text-black">Testimonials</a>
                {isAuthenticated ? 
                  <button onClick={loggingOut} className="cursor-pointer bg-white text-black border border-solid border-black px-4 py-[6px] rounded-lg hover:bg-black hover:text-white transition">
                    Log out
                  </button>
                : 
                    <>
                      <button className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black border border-solid border-black px-4 py-[6px] transition">
                        <a href="/login">Log In</a>
                      </button>
                      <button className="cursor-pointer bg-white text-black border border-solid border-black px-4 py-[6px] rounded-lg hover:bg-black hover:text-white transition">
                        <a href="/signup">Sign Up</a>
                      </button>
                    </>
                }
                </div>
            </div>
            </div>
        </nav>
      </>
    );
}