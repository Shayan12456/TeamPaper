// Signup.jsx
import { useState } from 'react';
import { Button } from "../components/UI/Login.jsx/components/ui/button";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "../components/UI/Login.jsx/components/ui/card";
import { Input } from "../components/UI/Login.jsx/components/ui/input";
import { Label } from "../components/UI/Login.jsx/components/ui/label";
import { Chrome } from "lucide-react";
import { Link, Navigate } from 'react-router-dom';
import { useNavigate } from "react-router-dom";

function Signup() {
  const [formData, setFormData] = useState({});
  const navigate = useNavigate(); // Use React Router's navigate hook

  async function sendDataToBackend() {
    try {
      const response = await fetch("http://localhost:8080/signup", {
        method: "POST", // Specify the HTTP method
        headers: {
          "Content-Type": "application/json", // Set the content type to JSON
        },
        body: JSON.stringify(formData), // Convert the data to a JSON string
      });
      
      const data = await response.json();
      console.log(data); // Log the data received from the backend

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }else {
        window.location.href = "http://localhost:5173/home";
      }
    } catch (error) {
      console.error('Error fetching data:', error.message);
    }
  }

  return (
    <div className="min-h-screen w-full flex items-center justify-center bg-background">
      <Card className="w-full max-w-md mx-4">
        <CardHeader className="space-y-1">
          <CardTitle className="text-2xl font-bold tracking-tight">Create an account</CardTitle>
          <CardDescription>Enter your information to get started</CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="space-y-2">
            <Button variant="outline" className="w-full cursor-pointer hover:bg-black hover:text-[white]" type="button">
              <Chrome className="mr-2 h-4 w-4" />
              Continue with Google
            </Button>
          </div>

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
  );
}

export default Signup;
