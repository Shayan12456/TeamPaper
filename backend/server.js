const express = require('express');
const env = require('dotenv');
const cors = require('cors');
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const app = express();
const User = require('./models/userModel');
const jwt = require("jsonwebtoken");//For creating and verifying JSON Web Tokens.
env.config();

const PORT = process.env.PORT || 8080
const SECRET_KEY = process.env.SECRET_KEY

//middlewares
app.use(express.json())
app.use(cors({origin: 'http://localhost:5173', // Allow your frontend URL
    methods: ['GET', 'POST', 'OPTIONS'],
    credentials: true, // If you're using cookies
  })); // Enable CORS

mongoose.connect('mongodb+srv://shayandeveloper12:abcd@cluster0.gj6rrny.mongodb.net/teampaper?retryWrites=true&w=majority&appName=Cluster0').then(()=>{
    console.log("connected to database")
});

app.get("/", async (req, res)=>{
    res.status(200).json({message: "connected"})
});


// app.post("/signup", async (req, res) => {
//     try {
//         // Get user data from the request body
//         const data = req.body;
//         // Create and save the user (this creates the database and collection if they don't exist)
//         const hashedPassword = await bcrypt.hash(data.password, 10);
//         const newUser = new User({ ...data, password: hashedPassword });
//         await newUser.save();
//         res.status(301).redirect("http://localhost:5173/home");

//         // Create a token with non-sensitive information (e.g., user ID, email)
//         // const tokenPayload = { _id: newUser._id, email: newUser.email };

//         // const token = jwt.sign(tokenPayload, SECRET_KEY, {
//         //     expiresIn: "1h", // Token expires in 1 hour
//         // });
//         //  { message: "User signed up successfully", user: { _id: newUser._id, email: newUser.email } });
//         // Set the token in the response header and return success response
//         // res.status(301).redirect("http://localhost:5173/home");
//         // res.redirect("/home");
//         // redirect should always be the last one
//     } catch (err) {
//         console.error("Signup error:", err.message);
//         res.status(500).json({ error: "Failed to sign up" });
//     }
// });

// app.post("/signup", async (req, res) => {
//     try {
//       // Get user data from the request body
//       const data = req.body;
  
//       // Hash the password
//       const hashedPassword = await bcrypt.hash(data.password, 10);
  
//       // Create and save the user (this creates the database and collection if they don't exist)
//       const newUser = new User({ ...data, password: hashedPassword });
//       await newUser.save();
  
//       // Redirect to frontend after user is created (only one redirect here)
//       res.status(301).redirect("google.com");
  
//       // No need to call res.redirect() or handle anything else after the redirect
//       // Code below won't run due to the redirect
//       // const tokenPayload = { _id: newUser._id, email: newUser.email };
//       // const token = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });
  
//     } catch (err) {
//       console.error("Signup error:", err.message);
//       res.status(500).json({ error: "Failed to sign up" });
//     }
//   });

// const cors = require('cors');  // CORS package
// const app = express();

// CORS configuration to allow frontend origin
app.use(cors({
  origin: 'http://localhost:5173', // Allow frontend URL
  methods: ['GET', 'POST', 'OPTIONS'], // Allow necessary methods
  credentials: true, // Allow credentials (cookies, tokens)
}));

app.post("/signup", async (req, res) => {
  try {
    const data = req.body;
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new User({ ...data, password: hashedPassword });
    await newUser.save();

    res.status(301).json({redirectTo:"http://localhost:5173"}); // Redirect to frontend
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: "Failed to sign up" });
  }
});
  

app.get("*", (req, res)=>{
    res.status(404);
});

app.listen(PORT, ()=>{
    console.log("app is listening on port:", PORT)
});