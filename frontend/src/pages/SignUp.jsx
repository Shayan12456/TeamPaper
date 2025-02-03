// Signup.jsx
import { useState , useEffect} from 'react';
import { Button } from "../components/UI/Login.jsx/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/UI/Login.jsx/components/ui/card";
import { Input } from "../components/UI/Login.jsx/components/ui/input";
import { Label } from "../components/UI/Login.jsx/components/ui/label";
import { Chrome } from "lucide-react";
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({});
  const [isAuthenticated, setIsAuthenticated] = useState(null);

  async function sendDataToBackend() {
    try {
      const response = await fetch("http://localhost:8080/signup", {
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

      window.location.href = "http://localhost:5173/document"
      
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

// asynchronous function when dealt with async awit leads the sequential exec of operations either synchronous or asynchronous
  return (
    <>
      {isAuthenticated ? window.location.href = "http://localhost:5173/tool" :
        <div className="min-h-screen w-full flex items-center justify-center bg-background">
          <Card className="w-full max-w-md mx-4">
            <CardHeader className="space-y-1">
              <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
              <CardDescription>Enter your information to get started</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* <div className="space-y-2">
                <Button variant="outline" className="w-full cursor-pointer hover:bg-black hover:text-[white]" type="button">
                  <Chrome className="mr-2 h-4 w-4" />
                  Continue with Google
                </Button>
              </div> */}

              <form onSubmit={(e) => { e.preventDefault(); sendDataToBackend(); }}>
                <div className="space-y-2">
                  <Label htmlFor="name">Username</Label>
                  <Input
                    id="name"
                    type="text"
                    placeholder="Username"
                    onChange={(e) => { setFormData({ ...formData, name: e.target.value }); }}
                    required
                  />
                </div>

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
                  Create account
                </Button>
              </form>

            </CardContent>
            <CardFooter className="flex flex-col space-y-4">
              <p className="text-sm text-center text-muted-foreground">
                Already have an account?{" "}
                <Link to="/login" className="cursor-pointer underline text-primary hover:text-primary/90 font-medium">
                  Sign In
                </Link>
              </p>
            </CardFooter>
          </Card>
        </div>
      }
    </>
  );
}

export default Signup;
