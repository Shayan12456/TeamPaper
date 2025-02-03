// Signin.jsx
import { useState, useEffect } from 'react';
import { Button } from "../components/UI/Login.jsx/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/UI/Login.jsx/components/ui/card";
import { Input } from "../components/UI/Login.jsx/components/ui/input";
import { Label } from "../components/UI/Login.jsx/components/ui/label";
import { Chrome } from "lucide-react";
import { Link } from 'react-router-dom';

function Signin() {
  const [formData, setFormData] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  async function sendDataToBackend() {
    try {
      const response = await fetch("http://localhost:8080/login", {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify(formData), // Convert the data to a JSON string
        credentials: "include", // ✅ Include credentials
      });

      // credentials: "include" ensures that:
      // ✅ The browser sends cookies (e.g., accessToken) with the request.
      // ✅ The browser accepts cookies sent from the server.
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }

      window.location.href = "http://localhost:5173/document";
      
    } catch (error) {
      console.error('Error fetching data:', error);
      window.location.href = "http://localhost:5173/signup";
    }
  }
  
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
    
        checkAuth();
      }, []);

  return (
    <>
      {isAuthenticated ?      window.location.href = "http://localhost:5173/document" :
          <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Welcome back</CardTitle>
              <CardDescription>Enter your credentials to access your account</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
          
    
              <form onSubmit={(e)=>{e.preventDefault();sendDataToBackend();}}>
    
                <div className="space-y-2">
                  <Label htmlFor="email">Email</Label>
                  <Input
                    id="email"
                    type="email"
                    placeholder="name@example.com"
                    onChange={(e) => { setFormData({ ...formData, email: e.target.value }); }}
                    required
                  />
                </div>
    
                <div className="space-y-2">
                  <Label htmlFor="password">Password</Label>
                  <Input
                    id="password"
                    type="password"
                    placeholder="••••••••"
                    onChange={(e) => { setFormData({ ...formData, password: e.target.value }); }}
                    required
                  />
                </div>
                <br />
                <Button className="w-full cursor-pointer hover:bg-black hover:text-[white]" type="submit">
                  Sign In
                </Button>
              </form>
    
            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Don't have an account?{" "}
                <Link to="/signup" className="cursor-pointer underline text-primary hover:text-primary/90 font-medium">
                  Sign Up
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      }
    </>
  );
}

export default Signin;
