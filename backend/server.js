const express = require("express");
const env = require("dotenv");
const cors = require("cors");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const cookieParser = require("cookie-parser");
const jwt = require("jsonwebtoken"); //For creating and verifying JSON Web Tokens.
const http = require("http");
const { Server } = require("socket.io");
const redis = require("./redisClient");
const User = require("./models/userModel");
const Document = require("./models/documentModel");
const { parse } = require("path");

env.config();

const app = express();
const server = http.createServer(app);
const io = new Server(server, {
  cors: { origin: "http://localhost:5173", credentials: true }, // Allow React frontend
});

const PORT = process.env.PORT || 8080;
const SECRET_KEY = process.env.SECRET_KEY;

//middlewares
app.use(express.json());
app.use(
  cors({
    origin: "http://localhost:5173", // Allow requests from your React frontend, origin is a must
    credentials: true, // Allow cookies to be sent with requests
  })
); //allows  frontend to access.
app.use(cookieParser()); // ✅ Parse cookies

//DB Connection
mongoose.connect(process.env.MONGO_URI).then(() => {
  console.log("connected to database");
});

// 🔹 With Namespace + Rooms ✅ (Your current setup)
const textEditorNamespace = io.of("/text-editor");
textEditorNamespace.on("connection", (socket) => {
  socket.on("joinRoom", ({ roomId }) => {
    socket.join(roomId); //super important
    socket.roomId = roomId; // optional: track room per socket
    console.log(`Joined room ${roomId}`);
  });
  // room id either from frontend or in backend stored in socket at time of joining or
  // sent from frontend when ever user makes changes from the frontend `userMakingChanges`
  socket.on("userMakingChanges", (data) => {
    if (socket.roomId) {
      socket.to(socket.roomId).emit("updateWithNewChanges", data.rawContent);
    }
  });
});

const verifyToken = (req, res, next) => {
  try {
    const token = req.cookies.accessToken;
    if (!token) return res.status(401).json({ error: "Unauthorized" });
    let data = jwt.verify(token, SECRET_KEY);
    req.email = data.email;
    next();
  } catch (err) {
    res.status(403).json({ error: "Invalid or expired token" });
  }
};

//frontend protection
app.get("/auth/check", verifyToken, async (req, res) => {
  try {
    const email = req.email;
    const cached = await redis.get(`auth:${email}`);
    if (cached) return res.json(JSON.parse(cached));

    // otherwise:
    if (!(await User.findOne({ email: req.email }))) {
      return res.status(404).json({ message: "User Not Found" });
    }
    await redis.set(
      `auth:${email}`,
      JSON.stringify({ authenticated: true, email }),
      { EX: 30 }
    );
    return res.status(200).json({ authenticated: true, email });
  } catch (e) {
    console.log(e);
    res.status(404).json({ message: "User Not Found" });
  }
});

// Protected Route Example - to protect backend
app.get("/protected-backend", verifyToken, (req, res) => {
  res.json({ message: "Access granted!" });
});

app.post("/signup", async (req, res) => {
  try {
    // Get user data from the request body
    const data = req.body;
    // Input Validation
    if (!data.name || !data.email || !data.password) {
      return res.status(400).json({ error: "Email and password required" });
    }
    // ✅ Format Validation
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(data.email)) {
      return res.status(400).json({ error: "Invalid email format." });
    }

    // ✅ Business Logic Validation: check for existing user
    const existingUser = await User.findOne({ email: data.email });
    if (existingUser) {
      return res
        .status(409)
        .json({ error: "User already exists with this email." });
    }

    // Create and save the user (this creates the database and collection if they don't exist)
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const newUser = new User({ ...data, password: hashedPassword });
    let re = await newUser.save();
    // Create a token with non-sensitive information (e.g., user ID, email)
    const tokenPayload = { _id: re._id, email: re.email };
    const token = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "1h", // Token expires in 1 hour
    });
    // ✅ Set HTTP-only cookie & send JSON response
    res
      .status(201)
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .json({ message: "Signed Up successfully" });
  } catch (err) {
    console.error("Signup error:", err.message);
    res.status(500).json({ error: err.message });
  }
});

app.post("/login", async (req, res) => {
  try {
    // Get user data from the request body
    const data = req.body;

    if (!data.email || !data.password) {
      return res.status(400).json({ error: "Email and password required" });
    }

    // Check if the user already exists using the findOne() method
    const existingUser = await User.findOne({ email: data.email });

    if (
      !existingUser ||
      !(await bcrypt.compare(data.password, existingUser.password))
    ) {
      // Don't reveal user existence
      return res.status(401).json({ error: "Invalid email or password" }); //generic response either credential issue or user not found
    }

    const tokenPayload = { _id: existingUser._id, email: existingUser.email };
    const token = jwt.sign(tokenPayload, SECRET_KEY, {
      expiresIn: "1h", // Token expires in 1 hour
    });

    // ✅ Set HTTP-only cookie & send JSON response
    res
      .status(200)
      .cookie("accessToken", token, {
        httpOnly: true,
        secure: false,
        // secure: process.env.NODE_ENV === "production", // ✅ Secure only in production
        sameSite: "strict",
        maxAge: 60 * 60 * 1000, // 1 hour
      })
      .json({ message: "Logged in successfully" });

    //json need to be passed to send a cookie usually
    // CORS is necessary when the frontend and backend are on different origins (domains or ports). sameSite: "Strict" is permitted to the frontend domain only
  } catch (err) {
    console.error("Sign in error:", err.message);
    return res.status(500).json({ error: "Failed to sign in" });
  }
});

// Logout route to clear the cookie
app.post("/logout", (req, res) => {
  try {
    // ✅ Validate if token cookie even exists
    const token = req.cookies?.accessToken;
    if (!token) {
      return res
        .status(400)
        .json({ error: "User already logged out or no session found." });
    }
    res.clearCookie("accessToken"); // Clear the token cookie
    res.json({ message: "Logged out successfully" });
  } catch (e) {
    console.log("Logout Error:", e);
    return res.status(500).json({ error: "Failed to logout" });
  }
});

app.get("/document", verifyToken, async (req, res) => {
  try {
    // ✅ Validate that email is available from verifyToken
    if (!req.email) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No email found in token" });
    } //Validation for purpose:
    //The token was signed without email due to a bug.
    // Someone manually altered the token payload (even if signed, tokens are base64 and viewable).
    // Future changes in your code forget to include email.

    const cached = await redis.get(`documents:${req.email}`);

    if (cached) {
      console.log("⚡ Cache Hit");
      return res.json({ docs: JSON.parse(cached) });
    }

    // ✅ Validate that user exists
    const user = await User.findOne({ email: req.email });
    if (!user) {
      return res.status(404).json({ error: "User not found" });
    }

    const docs = user.documents;

    const resp =
      docs.length > 0 ? await Document.find({ _id: { $in: docs } }) : [];

    const TTL = 30;
    await redis.set(`documents:${req.email}`, JSON.stringify(resp), {
      EX: TTL,
    });

    console.log(`🧠 Cache Miss → Cached for ${TTL}s`);
    return res.status(200).json({ docs: resp });
  } catch (e) {
    console.log("Document Fetch Error", e.message);
    return res.status(500).json({ error: "Failed to fetch documents." });
  }
});

app.post("/newdoc", verifyToken, async (req, res) => {
  try {
    // ✅ Validate that email is available from verifyToken
    if (!req.email) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No email found in token" });
    }

    const data = req.body;
    const existingUser = await User.findOne({ email: req.email });

    if (!existingUser) {
      return res.status(404).json({ error: "User not found" });
    }

    if (!data.title) {
      return res.status(400).json({ error: "Title and content are required." });
    }

    const newDoc = new Document({
      title: data.title,
      content: data.content,
      owner: req.email,
    });
    await newDoc.save();
    await redis.del(`documents:${req.email}`);
    console.log(`🗑️ Cache invalidated: documents:${req.email}`); //all means folder

    existingUser.documents.push(newDoc._id);
    await existingUser.save();

    return res.status(200).json({ message: "Document created", newDoc });
  } catch (err) {
    console.error("New Doc Error:", err.message);
    return res.status(500).json({ error: "Failed to create document." });
  }
});

app.post("/backend-api-to-save-text", async (req, res) => {
  try {
    console.log("passed");
    const data = req.body;
    // const existingUser = await User.findOne({ email: req.email });

    // if(!existingUser) {
    //   return res.status(401).json({ error: "User not found" });
    // }

    // const newDoc = new Document({ title: data.title, content: data.content, owner: data.owner });
    // await newDoc.save();

    // existingUser.documents.push(newDoc._id);
    // await existingUser.save();

    console.log(data);

    // res.status(200).json({ message: "Document created", newDoc });
  } catch (err) {
    console.log(err);
  }
});

app.get("/text-editor/:id", verifyToken, async (req, res) => {
  try {
    if (!req.email) {
      return res
        .status(401)
        .json({ error: "Unauthorized: No email found in token" });
    }

    const id = req.params.id;
    const cached = await redis.get(`document:${id}`);

    if (cached) {
      let parsedData = JSON.parse(cached);
      if (
        parsedData.owner === req.email ||
        parsedData.editor.includes(req.email) ||
        parsedData.viewer.includes(req.email)
      ) {
        console.log("⚡ Cache Hit");
        return res.status(200).json(JSON.parse(cached));
      } else {
        return res.status(403).json({ error: "Forbidden: Not your document" });
      }
    }

    // Check if the Document already exists using the findOne() method
    const existingDoc = await Document.findOne({ _id: id });

    if (!existingDoc) {
      return res.status(404).json({ error: "Doc not found" });
    }

    if (
      existingDoc.owner !== req.email &&
      !existingDoc.editor.includes(req.email) &&
      !existingDoc.viewer.includes(req.email)
    ) {
      return res.status(403).json({ error: "Forbidden: Not your document" });
    }

    let TTL = 30;
    await redis.set(`document:${id}`, JSON.stringify(existingDoc), {
      EX: TTL,
    });
    console.log(`🧠 Cache Miss → Cached for ${TTL}s`);

    return res.status(200).json(existingDoc);
  } catch (err) {
    console.log("error", err.message);
    return res.status(500).json({ error: err.message });
  }
});

app.put("/text-editor/:id/share", verifyToken, async (req, res) => {
  try {
    console.log("HTTP se BACKEND pr data aaya", req.body.rawContent);
    const title = req.body.documentTitle;
    const content = req.body.rawContent;
    const id = req.params.id;

    if (!title || !content) {
      return res.status(400).json({ message: "Title and Content required" });
    }

    const doc = await Document.findOne({ _id: id });

    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    const emailOfAccess = jwt.verify(req.cookies.accessToken, SECRET_KEY).email;

    if (doc.viewer.includes(emailOfAccess)) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this document." });
    }

    const isOwner = doc.owner === emailOfAccess;
    const isEditor = doc.editor.includes(emailOfAccess);

    if (!isOwner && !isEditor) {
      return res
        .status(403)
        .json({ message: "You do not have permission to edit this document." });
    }
    doc.title = title;
    doc.content = content;
    await doc.save(); // await ensures the DB is actually written
    await redis.del("documents:all");
    await redis.del(`document:${id}`);
    return res.status(200).json({ message: "Document updated" }); // only after DB write
  } catch (err) {
    console.error("❌ Error saving to DB:", err.message);
    return res.status(500).json({ error: "Failed to save document" });
  }
});

app.post("/grant-access/:id/share", verifyToken, async (req, res) => {
  try {
    const docId = req.params.id;
    const { email, accessType } = req.body;

    // Validate inputs
    if (!email || !accessType) {
      return res
        .status(400)
        .json({ error: "Email and accessType are required" });
    }

    const userForAccess = await User.findOne({ email });

    if (!userForAccess) {
      return res.status(404).json({ message: "User not Found" });
    }

    const existingDoc = await Document.findOne({ _id: docId });

    if (!existingDoc) {
      return res.status(404).json({ error: "Document not found" });
    }

    if (existingDoc.owner !== req.email) {
      return res.status(401).json({ error: "Unauthorized" });
    }

    if (existingDoc.owner === userForAccess.email) {
      return res
        .status(401)
        .json({ error: "Owner cannot be added as editor or viewer" });
    }

    if (
      existingDoc.editor.includes(userForAccess.email) ||
      existingDoc.viewer.includes(userForAccess.email)
    ) {
      return res.status(401).json({ error: "User already has access" });
    }

    if (accessType === "editor") {
      existingDoc.editor.push(email);
      userForAccess.documents.push(docId);
    } else if (accessType === "viewer") {
      existingDoc.viewer.push(email);
      userForAccess.documents.push(docId);
    } else {
      return res.status(400).json({ error: "Invalid accessType" });
    }

    await existingDoc.save();
    await userForAccess.save();

    await redis.del(`documents:${req.email}`);
    await redis.del(`documents:${userForAccess.email}`);
    await redis.del(`document:${docId}`);

    return res.json({ message: "Access granted", existingDoc });
  } catch (e) {
    console.error("Grant Access Error:", e.message);
    return res.status(500).json({ error: "Server error" });
  }
});

app.delete("/document/:id", verifyToken, async (req, res) => {
  try {
    const id = req.params.id;
    const doc = await Document.findOne({ _id: id });
    if (!doc) {
      return res.status(404).json({ message: "Document not found." });
    }

    const emailOfAccess = jwt.verify(req.cookies.accessToken, SECRET_KEY).email;

    if (emailOfAccess !== doc.owner) {
      console.log("receiving request");
      return res.status(401).json({ message: "Unauthorized" });
    }

    await Document.deleteOne({ _id: id });
    await User.updateMany(
      { email: { $in: [...doc.editor, ...doc.viewer] } }, // All users with access
      { $pull: { documents: doc._id } } // Remove doc ID from their array
    );

    await redis.del(`documents:${req.email}`);
    await redis.del(`documents:` + doc.editor.map((email) => email));
    await redis.del(`documents:` + doc.viewer.map((email) => email));
    await redis.del(`document:${id}`);
    console.log("🗑️ Cache invalidated: documents:" + req.email); //all means folder
    return res.status(204).json({ message: "Document deleted" });
  } catch (err) {
    console.log(err.message);
    res.status(500).json({ error: "Internal Server Error" });
  }
});

app.get("*", (req, res) => {
  return res.status(404);
});

if (process.env.NODE_ENV !== "test") {
  server.listen(PORT, () => {
    console.log("app is listening on port:", PORT);
    // Only auto-connect in production/dev
  });
}

module.exports = app;

//login - DB check routes both frontend and the backend
//old wriiten
//redis one
//login timeline in tests
//share uI
//DELETE UI
// 404 on authcheck
// email regex on delete route db and backend
// db validation and the frontend