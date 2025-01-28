const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const passport = require("passport");
// const GoogleStrategy = require("passport-google-oauth20").Strategy;
const bcrypt = require('bcrypt');
const app = express();
const User = require('./models/userModel');
const jwt = require("jsonwebtoken");//For creating and verifying JSON Web Tokens.
env.config();

const PORT = process.env.PORT || 8080
const SECRET_KEY = process.env.SECRET_KEY

//middlewares
app.use(express.json())
app.use(cors()); // Enable CORS
app.use(passport.initialize());

// Configure Google OAuth Strategy
// passport.use(
//   new GoogleStrategy(
//     {
//       clientID: process.env.GOOGLE_CLIENT_ID,
//       clientSecret: process.env.GOOGLE_CLIENT_SECRET,
//       callbackURL: "http://localhost:3000/auth/google/callback",
//     },
//     (accessToken, refreshToken, profile, done) => {
//       // Google Profile
//       console.log("Google Profile:", profile);
//       return done(null, profile);
//     }
//   )
// );

//DB Connection
mongoose.connect('mongodb+srv://shayandeveloper12:abcd@cluster0.gj6rrny.mongodb.net/teampaper?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
    console.log("connected to database")
});

app.get("/", async (req, res)=>{
    res.status(200).json({message: "connected"})
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
        console.log(token)
        res.set("Authorization", `Bearer ${token}`);
        res.status(200).json({ redirectTo: "http://localhost:5173/home" });
    } catch (err) {
        console.error("Signup error:", err.message);
        res.status(500).json({ error: "Failed to sign up" });
    }
});

app.post("/signin", async (req, res) => {
  try {
      // Get user data from the request body
      const data = req.body;

      // Check if the user already exists using the findOne() method
      const existingUser = await User.findOne({ email: data.email });
      console.log(existingUser, data)

      if (existingUser) {
        if(await bcrypt.compare(data.password, existingUser.password)){
          // If user already exists, send an error response
          return res.status(200).json({ error: "User already exists" });
        }else {
          return res.status(400).json({ error: "Invalid password" });
        }
      } else{
        // If the user doesn't exist, redirect them to the signup page
        res.status(302).json({ redirectTo: "http://localhost:5173/signup" });
      }

      // Create a token with non-sensitive information (e.g., user ID, email)
      // const tokenPayload = { _id: existingUser._id, email: existingUser.email };

      // const token = jwt.sign(tokenPayload, SECRET_KEY, {
      //     expiresIn: "1h", // Token expires in 1 hour
      // });

      // console.log(token)
      // res.set("Authorization", `Bearer ${token}`);

      res.status(200).json({ redirectTo: "http://localhost:5173/home" });

  } catch (err) {
      console.error("Sign in error:", err.message);
      res.status(500).json({ error: "Failed to sign in" });
  }
});

app.get("*", (req, res)=>{
    res.status(404);
});

app.listen(PORT, ()=>{
    console.log("app is listening on port:", PORT)
});