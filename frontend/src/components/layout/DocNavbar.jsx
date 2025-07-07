import { FileText, QrCode, Search } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect, useRef } from 'react';

export default function Navbar() {
  const [isAuthenticated, setIsAuthenticated] = useState(null);
  const [searchQueryResult, setSearchQueryResult] = useState([]);
  const [docs, setDocs] = useState([]);
  const searchRef = useRef(null);

  const handleSearchChange = (e) => {
    const query = e.target.value;
    setSearchQueryResult(
      docs.filter(doc =>
        doc.title.toLowerCase().includes(query.toLowerCase())
      )
    );
  };

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
        console.error("Error verifying authentication:", error);
        setIsAuthenticated(false);
      }
    };

    const Documents = async () => {
      try {
        const res = await fetch(import.meta.env.VITE_API_URL + "/document", {
          method: "GET",
          credentials: "include",
        });

        const docs = await res.json();
        setDocs(docs.docs);
      } catch (error) {
        console.error('Error fetching documents:', error);
      }
    };

    checkAuth();
    Documents();
  }, []);

  // 🔹 Hide search results when clicked outside
  useEffect(() => {
    const handleClickOutside = (event) => {
      if (searchRef.current && !searchRef.current.contains(event.target)) {
        setSearchQueryResult([]);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  async function loggingOut() {
    try {
      const response = await fetch(import.meta.env.VITE_API_URL + "/logout", {
        method: "POST",
        credentials: "include",
      });

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.location.href = "http://localhost:5173/home";
    } catch (error) {
      console.error('Error logging out:', error);
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

            <div className="flex flex-col relative" ref={searchRef}>
              {/* 🔍 Search Bar */}
              <div className="flex items-center w-[50vw] bg-gray-100 rounded-full p-3 shadow-sm">
                <Search className="text-black w-5 h-5 ml-2" />
                <input
                  type="text"
                  placeholder="Search"
                  onChange={handleSearchChange}
                  className="w-[70%] flex-1 bg-transparent outline-none text-gray-700 px-3"
                />
              </div>

              {/* 🔍 Search Results Dropdown */}
              {searchQueryResult.length > 0 && (
                <div className="absolute top-full left-0 w-[50vw] bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-10">
                  {searchQueryResult.map((res) => (
                    <div
                      key={res._id}
                      className="px-3 py-2 hover:bg-gray-100 cursor-pointer"
                      onClick={() => {
                        window.location.href = `${window.location.origin}/text-editor/${res._id}`;
                      }}
                    >
                      <h3 className="text-black">{res.title}</h3>
                    </div>
                  ))}
                </div>
              )}
            </div>

            <div className="hidden md:flex items-center space-x-8">
              {isAuthenticated ? (
                <button
                  onClick={loggingOut}
                  className="cursor-pointer bg-white text-black border border-solid border-black px-4 py-[6px] rounded-lg hover:bg-black hover:text-white transition"
                >
                  Log out
                </button>
              ) : (
                <>
                  <button className="cursor-pointer bg-black text-white px-4 py-2 rounded-lg hover:bg-white hover:text-black border border-solid border-black px-4 py-[6px] transition">
                    <a href="/login">Log In</a>
                  </button>
                  <button className="cursor-pointer bg-white text-black border border-solid border-black px-4 py-[6px] rounded-lg hover:bg-black hover:text-white transition">
                    <a href="/signup">Sign Up</a>
                  </button>
                </>
              )}
            </div>
          </div>
        </div>
      </nav>
    </>
  );
}
