import React, { useState, useEffect } from "react";
import { Navigate, useLocation } from "react-router-dom";

const ProtectedRoute = ({ children }) => {
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  useEffect(() => {
    const checkAuth = async () => {
      try {
        const response = await fetch(import.meta.env.VITE_API_URL + "/auth/check", {
          method: "GET",
          credentials: "include", // Include HTTP-only cookies
        });

          const data = await response.json();
          setIsAuthenticated(data.authenticated);
          console.log(data)
        
      } catch (error) {
        console.error("Error verifying authentication:", error);
        setIsAuthenticated(false);
      }
    };

    checkAuth()
    // Re-check when route changes
  }, []); // Add pathname as dependency

  if (isAuthenticated === null) {
    // Show a loading spinner or placeholder while the check is in progress
    return <div>Loading...</div>;
  }

  return isAuthenticated ? children : <Navigate to="/login" />;
};

export default ProtectedRoute;