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

//🔹 2. With Namespace Only
const textEditorNamespace = io.of("/text-editor");
textEditorNamespace.on("connection", (socket) => {
  console.log("user connected", socket.id);
  socket.on("disconnect", () => {
    console.log("user disconnected", socket.id);
  });

  socket.on("userMakingChanges", (state) => {
    console.log("sock", state);
    // textEditorNamespace.emit("updateWithNewChanges", state);
    if (socket.roomId) {
      console.log("near", state.rawContent)
      socket.to(socket.roomId).emit("updateWithNewChanges", state.rawContent);//-emot difference
      //room without namesoace - "/" - defalut namespace
      // The default namespace in Socket.IO is simply /, which is used when you don’t explicitly define a custom namespace.


    }
  });
});

// 🔹 3. With Namespace + Rooms ✅ (Your current setup)
// const textEditorNamespace = io.of("/text-editor");
// textEditorNamespace.on("connection", (socket) => {
//   socket.on("joinRoom", ({ roomId }) => {
//     socket.join(roomId);//super important - 
//     socket.roomId = roomId; // optional: track room per socket
//     console.log(`Joined room ${roomId}`);
//   });
// -  // room id either from frontend or in backend stored in socket at timr of joining or sent from frontend when ever user makes changes
//   socket.on("userMakingChanges", (data) => {
//     // if (socket.roomId) {
//     //   socket.to(socket.roomId).emit("updateWithNewChanges", data);
//     // }
//     console.log("data", data)
//     if (socket.roomId) {
//       socket.to(socket.roomId).emit("updateWithNewChanges", data.rawContent);
//     }
//   });
// });

// -  hi logged

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
    let re = await newUser.save();
    // Create a token with non-sensitive information (e.g., user ID, email)
    const tokenPayload = { _id: re._id, email: re.email };
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
      .json({ message: "Signed Up successfully" });
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
  res.clearCookie("accessToken"); // Clear the token cookie
  res.json({ message: "Logged out successfully" });
});

app.get("/document", verifyToken, async (req, res) => {
  const cached = await redis.get(`documents:all`);

  if (cached) {
    console.log("⚡ Cache Hit");
    return res.json({ docs: JSON.parse(cached) });
  }

  const docs = await User.findOne({ email: req.email });
  const resp =
    docs.documents.length > 0
      ? await Document.find({ _id: { $in: docs.documents } })
      : [];

  const TTL = 30;
  await redis.set("documents:all", JSON.stringify(resp), {
    EX: TTL,
  });

  console.log(`🧠 Cache Miss → Cached for ${TTL}s`);
  res.json({ docs: resp });
});

app.post("/newdoc", verifyToken, async (req, res) => {
  try {
    const data = req.body;
    const existingUser = await User.findOne({ email: req.email });

    if (!existingUser) {
      return res.status(401).json({ error: "User not found" });
    }

    const newDoc = new Document({
      title: data.title,
      content: data.content,
      owner: req.email,
    });
    await newDoc.save();
    await redis.del("documents:all");
    console.log("🗑️ Cache invalidated: documents:all"); //all means folder

    existingUser.documents.push(newDoc._id);
    await existingUser.save();

    res.status(200).json({ message: "Document created", newDoc });
  } catch (err) {
    console.log(err);
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
    const id = req.params.id;
    const cached = await redis.get(`document:${id}`);

    if (cached) {
      return res.json(JSON.parse(cached));
    }

    // Check if the Document already exists using the findOne() method
    const existingDoc = await Document.findOne({ _id: id });
    console.log("HTTP se FRONTEND pr data gaya", existingDoc);

    if (!existingDoc) {
      return res.status(404).json({ error: "Doc not found" });
    }

    let TTL = 30;
    await redis.set(`document:${id}`, JSON.stringify(existingDoc), {
      EX: TTL,
    });

    // if(existingDoc && !(existingDoc.owner == req.email)){
    //   return res.status(401);
    // }

    res.json(existingDoc);
  } catch (err) {
    console.log("error", err);
  }
});

app.put("/text-editor/:id/share", verifyToken, async (req, res) => {
  try {
    console.log("HTTP se BACKEND pr data aaya", req.body.rawContent);
    const title = req.body.documentTitle;
    const content = req.body.rawContent;
    const id = req.params.id;
    const doc = await Document.findOne({ _id: id });
    const emailOfAccess = jwt.verify(req.cookies.accessToken, SECRET_KEY).email;

    if (emailOfAccess !== doc.owner || doc.editor.includes(emailOfAccess)) {
      if (doc.viewer.includes(emailOfAccess)) {
        return res.status(401).json({ message: "Viewer cannot make changes." });
      }
    } else {
      doc.title = title;
      doc.content = content;
      await doc.save(); // await ensures the DB is actually written
      await redis.del(`document:${id}`);
      return res.status(200).json({ message: "Document updated" }); // only after DB write
    }
  } catch (err) {
    console.error("❌ Error saving to DB:", err);
    return res.status(500).json({ error: "Failed to save document" });
  }
});

app.post("/grant-access/:id/share", verifyToken, async (req, res) => {
  const docId = req.params.id;
  const userForAccess = await User.findOne({ email: req.body.email });
  const existingDoc = await Document.findOne({ _id: docId });
  if (!userForAccess || !existingDoc) {
    return res.status(404).json({ error: "User or Document not found" });
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
  if (req.body.accessType === "editor") {
    existingDoc.editor.push(userForAccess.email);
    userForAccess.documents.push(docId);
  } else {
    existingDoc.viewer.push(userForAccess.email);
    userForAccess.documents.push(docId);
  }
  await existingDoc.save();
  await userForAccess.save();
  res.json({ message: "Access granted" });
  res.status(204);
});

app.delete("/document/:id", verifyToken, async (req, res) => {
  const id = req.params.id;
  const doc = await Document.findOne({ _id: id });
  const emailOfAccess = jwt.verify(req.cookies.accessToken, SECRET_KEY).email;
  // console.log(doc.owner, emailOfAccess)
  if (emailOfAccess !== doc.owner) {
    console.log("receiving request");

    return res.status(401).json({ message: "Unauthorized" });
  }
  await Document.findOneAndDelete({ _id: id });
  console.log("🗑️ Cache invalidated: documents:all"); //all means folder
  res.json({ message: "Document deleted" });
  // res.status(204);
});

app.get("*", (req, res) => {
  res.status(404);
});

server.listen(PORT, () => {
  console.log("app is listening on port:", PORT);
});
