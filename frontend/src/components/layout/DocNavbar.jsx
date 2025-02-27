import { FileText, QrCode } from 'lucide-react';
import { BrowserRouter as Router, Routes, Route, Link } from 'react-router-dom';
import { useState, useEffect } from 'react';
import { Search } from "lucide-react";

export default function Navbar(){
    const [isAuthenticated, setIsAuthenticated] = useState(null);
    const [searchQueryResult, setSearchQueryResult] = useState([]);
    const [docs, setDocs] = useState([]);
    console.log("docs", docs);
    // Handle search query change
    const handleSearchChange = (e) => {
      const query = e.target.value;
      setSearchQueryResult((docs.filter(doc => doc.title.toLowerCase().includes(query.toLowerCase()))));
      console.log(searchQueryResult)
    };

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
          console.error("Error verifying authentication:", error);
          setIsAuthenticated(false);
        }
      };
  

        // Fetch documents and filter based on search query
    const Documents = async (query) => {
      try {
        const res = await fetch("http://localhost:8080/document", {
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

    async function loggingOut() {
      try {
        const response = await fetch("http://localhost:8080/logout", {
          method: "POST", // Specify the HTTP method
          credentials: "include", // ✅ Include credentials
        });
  
        // credentials: "include" ensures that:
        // ✅ The browser sends cookies (e.g., accessToken) with the request.
        // ✅ The browser accepts cookies sent from the server.
        
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
                    {/* <div className='flex flex-col'>
                      <div className="flex items-center w-[50vw] bg-gray-100 rounded-full p-3 shadow-sm">
                          <Search className="text-black w-5 h-5 ml-2" />
                          <input
                              type="text"
                              placeholder="Search"
                              onChange={handleSearchChange} // Handle search input change
                              className="w-[70%] flex-1 bg-transparent outline-none text-gray-700 px-3"
                          />
                      </div>  
                      
                        {searchQueryResult && 
                        searchQueryResult.map((res)=>
                          (
                          
                            <div 
                            id={Math.random()}
                            className="w-[70%] bg-transparent outline-none text-gray-700 px-3"
                            >"s"</div>
                          )
                        )
                        }     
                    </div>     */}
                    <div className="flex flex-col relative">
                      {/* Search Bar */}
                      <div className="flex items-center w-[50vw] bg-gray-100 rounded-full p-3 shadow-sm">
                        <Search className="text-black w-5 h-5 ml-2" />
                        <input
                          type="text"
                          placeholder="Search"
                          onChange={handleSearchChange} // Handle search input change
                          className="w-[70%] flex-1 bg-transparent outline-none text-gray-700 px-3"
                        />
                      </div>  

                      {/* Search Results */}
                      {searchQueryResult && searchQueryResult.length > 0 && (
                        <div className="absolute top-full left-0 w-[50vw] bg-white border border-gray-300 rounded-lg shadow-lg mt-2 z-10">
                          {searchQueryResult.map((res) => (
                            <div key={res._id} className="px-3 py-2 hover:bg-gray-100 cursor-pointer" onClick={()=>{window.location.href = window.location.origin + "/text-editor/" + res._id}}>
                              <h3 className="text-black">{res.title}</h3>
                            </div>
                          ))}
                        </div>
                      )}
                    </div>
                    <div className="hidden md:flex items-center space-x-8">
                    {/* <a href="#features" className="text-gray-600 hover:text-black">Features</a>
                    <a href="#solutions" className="text-gray-600 hover:text-black">Solutions</a>
                    <a href="#pricing" className="text-gray-600 hover:text-black">Pricing</a>
                    <a href="#testimonials" className="text-gray-600 hover:text-black">Testimonials</a> */}
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