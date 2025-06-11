const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const server = require("../../server"); // ensure it exports your app
const User = require("../../models/userModel");
const Document = require("../../models/documentModel");
const { connectRedis, redisClient: redis } = require("../../redisClient");

const { v4: uuidv4 } = require("uuid");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // same as in your app

let token;
let savedUser;

beforeAll(async () => {
  await connectRedis(); // Ensure Redis is connected

  let testUser = {
    name: "Doc Tester",
    email: `docuser${uuidv4()}@example.com`,
    password: "hashedpass",
  };

  await request(server).post("/signup").send(testUser);
  savedUser = await User.findOne({ email: testUser.email });

  token = jwt.sign({ email: savedUser.email, _id: savedUser._id }, SECRET_KEY, {
    expiresIn: "1h",
  });
});

describe("GET /document", () => {
  let document;
  beforeAll(async () => {
    document = {
      title: "Test Doc",
      content: "Some text",
      owner: savedUser.email,
    };

    await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${token}`])
      .send(document);
  });

  beforeEach(async () => {
    await redis.del(`documents:${savedUser.email}`);
  });

  it("should return documents for authenticated user (cache miss)", async () => {
    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.docs).toBeDefined();
    expect(Array.isArray(res.body.docs)).toBe(true);
    expect(res.body.docs[0].title).toBe("Test Doc");
  });

  it("should return cached documents (cache hit)", async () => {
    // Set manually in Redis
    const fakeCached = [
      { _id: "cachedid", title: "Cached Doc", content: "Cached content" },
    ];
    await redis.set(
      `documents:${savedUser.email}`,
      JSON.stringify(fakeCached),
      {
        EX: 30,
      }
    );

    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${token}`]);
    console.log("res.body.docs", res.body.docs);
    expect(res.statusCode).toBe(200);
    expect(res.body.docs).toEqual(fakeCached);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(server).get("/document");

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("should return 403 if token is invalid", async () => {
    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=invalidtoken`]);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Invalid or expired token");
  });

  it("should return 404 if user does not exist", async () => {
    // Use token for non-existent user
    const ghostToken = jwt.sign(
      { email: "ghost@example.com", _id: "000" },
      SECRET_KEY
    );

    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${ghostToken}`]);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should return 401 if email is missing in token payload", async () => {
    const brokenToken = jwt.sign({ _id: savedUser._id }, SECRET_KEY);

    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${brokenToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized: No email found in token");
  });

  it("should return 500 on internal server error", async () => {
    const originalFindOne = User.findOne;
    User.findOne = () => {
      throw new Error("Simulated failure");
    };

    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to fetch documents.");

    User.findOne = originalFindOne; // Restore
  });

  afterAll(async () => {
    await Document.deleteMany({ owner: savedUser.email });
  });
});

describe("POST /newdoc", () => {
  it("should create a document with valid data and token", async () => {
    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${token}`])
      .send({
        title: "Integration Test Title",
        content: "Integration Test Content",
        owner: savedUser.email,
      });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Document created");
    expect(res.body.newDoc).toHaveProperty("title", "Integration Test Title");
  });

  it("should return 400 if title or content is missing", async () => {
    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${token}`])
      .send({ title: "Only title" });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Title and content are required.");
  });

  it("should return 401 if token is missing", async () => {
    const res = await request(server).post("/newdoc").send({
      title: "No Token Doc",
      content: "This should fail",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  it("should return 401 if email is not in token", async () => {
    const brokenToken = jwt.sign({ _id: "12345" }, SECRET_KEY, {
      expiresIn: "1h",
    });

    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${brokenToken}`])
      .send({ title: "Fail", content: "No email" });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/email.*token/i);
  });

  it("should return 404 if user not found", async () => {
    const fakeToken = jwt.sign(
      { email: "nouser@example.com", _id: "123" },
      SECRET_KEY,
      {
        expiresIn: "1h",
      }
    );

    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${fakeToken}`])
      .send({ title: "Fail", content: "No user" });

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("User not found");
  });

  it("should return 500 on unexpected server error", async () => {
    const originalSave = Document.prototype.save;
    Document.prototype.save = () => {
      throw new Error("Unexpected error");
    };

    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${token}`])
      .send({ title: "Crash", content: "Crash now" });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to create document.");

    Document.prototype.save = originalSave; // restore
  });
});

afterAll(async () => {
  await User.deleteOne({ email: savedUser.email });
  await mongoose.connection.close();
  await redis.quit();
});
