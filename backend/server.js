const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const cookieParser = require("cookie-parser");
const app = express();
const User = require('./models/userModel');
const Document = require('./models/documentModel');
const jwt = require("jsonwebtoken");//For creating and verifying JSON Web Tokens.
env.config();

const PORT = process.env.PORT || 8080
const SECRET_KEY = process.env.SECRET_KEY

//middlewares
app.use(express.json())
app.use(cors({
  origin: 'http://localhost:5173', // Allow requests from your React frontend, origin is a must
  credentials: true, // Allow cookies to be sent with requests
}));//allows  frontend to access.
app.use(cookieParser()); // ✅ Parse cookies

//DB Connection
mongoose.connect('mongodb+srv://shayandeveloper12:abcd@cluster0.gj6rrny.mongodb.net/teampaper?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
    console.log("connected to database")
});

// Middleware to Protect Routes
const verifyToken = (req, res, next) => {
  const token = req.cookies.accessToken; 
  console.log(token)
  if (!token) return res.status(401).json({ error: "Unauthorized" });

  try {
      let data = jwt.verify(token, SECRET_KEY);
      req.email = data.email;
      next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

//frontend protection
app.get("/auth/check", verifyToken, (req, res) => {
  res.status(200).json({ authenticated: true, email: req.email });
});

// Protected Route Example - to protect backend
app.get("/protected-backend", verifyToken, (req, res) => {
  res.json({ message: "Access granted!" });
});

app.post("/signup", async (req, res) => {
    try {
        // Get user data from the request body
        const data = req.body;
        // Create and save the user (this creates the database and collection if they don't exist)
        const hashedPassword = await bcrypt.hash(data.password, 10);
        const newUser = new User({ ...data, password: hashedPassword });
        await newUser.save()
        // Create a token with non-sensitive information (e.g., user ID, email)
        const tokenPayload = { _id: newUser._id, email: newUser.email }
        const token = jwt.sign(tokenPayload, SECRET_KEY, {
            expiresIn: "1h", // Token expires in 1 hour
        });
        // ✅ Set HTTP-only cookie & send JSON response
        res.status(200).cookie("accessToken", token, {
          httpOnly: true,
          secure: false,
          // secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
          sameSite: "strict",
          maxAge: 60 * 60 * 1000, // 1 hour
        }).json({ message: "Signed Up successfully" });  
      } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ error: "Failed to sign up" });
    }
});

app.post("/login", async (req, res) => {
  try {
      // Get user data from the request body
      const data = req.body;

      // Check if the user already exists using the findOne() method
      const existingUser = await User.findOne({ email: data.email });

      if (!existingUser || !await bcrypt.compare(data.password, existingUser.password)) {
         // Don't reveal user existence
         return res.status(401).json({ error: "Invalid email or password" });//generic response either credential issue or user not found
      }

      const tokenPayload = { _id: existingUser._id, email: existingUser.email }
      const token = jwt.sign(tokenPayload, SECRET_KEY, {
        expiresIn: "1h", // Token expires in 1 hour
      });

       // ✅ Set HTTP-only cookie & send JSON response
        res.status(200).cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      }).json({ message: "Logged in successfully" });

      //json need to be passed to send a cookie usually
      // CORS is necessary when the frontend and backend are on different origins (domains or ports). sameSite: "Strict" is permitted to the frontend domain only
  } catch (err) {
      console.error("Sign in error:", err.message);
      return res.status(500).json({ error: "Failed to sign in" });
  }
});

// Logout route to clear the cookie
app.post("/logout", (req, res) => {
  res.clearCookie("accessToken"); // Clear the token cookie
  res.json({ message: "Logged out successfully" });
});
// app.post("/newdoc", verifyToken, async (req, res) => {

app.post("/newdoc", async (req, res) => {
  try{
    console.log("passed");
    const data = req.body;
    const existingUser = await User.findOne({ email: data.owner });
    
    if(!existingUser) {
      return res.status(401).json({ error: "User not found" });
    }
  
    const newDoc = new Document({ title: data.title, content: data.content, owner: data.owner });
    await newDoc.save();
  
    console.log(newDoc);
    res.status(200).json({ message: "Document created" });
  }catch(err){
    console.log(err);
  }
});

app.get("*", (req, res)=>{
    res.status(404);
});

app.listen(PORT, ()=>{
    console.log("app is listening on port:", PORT)
});