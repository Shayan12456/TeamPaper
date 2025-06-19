const request = require("supertest");
const mongoose = require("mongoose");
const jwt = require("jsonwebtoken");
const server = require("../../server"); // ensure it exports your app
const User = require("../../models/userModel");
const Document = require("../../models/documentModel");
const redis = require("../../redisClient");

const { v4: uuidv4 } = require("uuid");
const { after } = require("node:test");

const SECRET_KEY = process.env.SECRET_KEY || "your_secret_key"; // same as in your app

let token;
let savedUser;
let savedDocument;

beforeAll(async () => {
  let testUser = {
    name: "Doc Tester",
    email: `docuser${uuidv4()}@example.com`,
    password: "hashedpass",
  };

  await request(server).post("/signup").send(testUser);

  token = jwt.sign({ email: testUser.email }, SECRET_KEY, {
    expiresIn: "1h",
  });

  let testDocument = {
    title: "Test Doc",
    owner: testUser.email,
  };

  const res = await request(server)
    .post("/newdoc")
    .set("Cookie", [`accessToken=${token}`])
    .send(testDocument);
  savedDocument = await Document.findOne({ _id: res.body.newDoc._id });
  savedUser = await User.findOne({ email: testUser.email });

  console.log("Saved Document", savedDocument);
});

describe("GET /document", () => {
  beforeEach(async () => {
    await redis.del(`documents:${savedUser.email}`);
  });

  it("should return documents for authenticated user (cache miss)", async () => {
    const res = await request(server)
      .get("/document")
      .set("Cookie", [`accessToken=${token}`]);
    console.log(res.body.docs);
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

  it("should return 400 if title is missing", async () => {
    const res = await request(server)
      .post("/newdoc")
      .set("Cookie", [`accessToken=${token}`])
      .send({ title: "" });

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

describe("GET /text-editor/:id", () => {
  it("should return 200 and the document (cache miss)", async () => {
    const id = savedDocument._id.toString();
    const res = await request(server)
      .get(`/text-editor/${id}`)
      .set("Cookie", [`accessToken=${token}`]);
    console.log(savedDocument, id, res.body);
    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(id);
    expect(res.body.title).toBe(savedDocument.title);
  });

  it("should return 200 and the document (cache hit)", async () => {
    // Second call to test cache hit
    const res = await request(server)
      .get(`/text-editor/${savedDocument._id.toString()}`)
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body._id).toBe(savedDocument._id.toString());
  });

  it("should return 403 if document does not belong to user", async () => {
    // Create another user
    const rogueEmail = `rogue-${uuidv4()}@example.com`;
    await request(server)
      .post("/signup")
      .send({ name: "Rogue", email: rogueEmail, password: "123" });
    const rogueUser = await User.findOne({ email: rogueEmail });
    const rogueToken = jwt.sign(
      { email: rogueUser.email, _id: rogueUser._id },
      SECRET_KEY
    );

    const res = await request(server)
      .get(`/text-editor/${savedDocument._id.toString()}`)
      .set("Cookie", [`accessToken=${rogueToken}`]);

    console.log(rogueUser, res.body);

    expect(res.statusCode).toBe(403);
    expect(res.body.error).toBe("Forbidden: Not your document");
  });

  it("should return 404 if document ID not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(server)
      .get(`/text-editor/${fakeId}`)
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.statusCode).toBe(404);
    expect(res.body.error).toBe("Doc not found");
  });

  it("should return 401 if no email in token", async () => {
    const badToken = jwt.sign({ _id: savedUser._id }, SECRET_KEY);
    const res = await request(server)
      .get(`/text-editor/${savedDocument._id}`)
      .set("Cookie", [`accessToken=${badToken}`]);

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toMatch(/No email found/);
  });

  it("should return 401 if no token provided", async () => {
    const res = await request(server).get(`/text-editor/${savedDocument._id}`);
    expect(res.statusCode).toBe(401);
  });
});

describe("PUT /text-editor/:id/share", () => {
  let editorToken, viewerToken, editor, viewer, documentId;

  beforeAll(async () => {
    // Create users
    editor = await User.create({
      name: "Editor",
      email: "editor@example.com",
      password: "pass",
    });
    viewer = await User.create({
      name: "Viewer",
      email: "viewer@example.com",
      password: "pass",
    });

    // Generate tokens
    editorToken = jwt.sign(
      { _id: editor._id, email: editor.email },
      SECRET_KEY
    );
    viewerToken = jwt.sign(
      { _id: viewer._id, email: viewer.email },
      SECRET_KEY
    );

    // Create document
    const doc = await Document.create({
      title: "Original Title",
      content: "Original Content",
      owner: savedUser.email,
      editor: [editor.email],
      viewer: [viewer.email],
    });

    documentId = doc._id.toString();

    console.log(editor, viewer);
  });

  it("should update document when user is owner", async () => {
    const res = await request(server)
      .put(`/text-editor/${documentId}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        documentTitle: "Updated Title",
        rawContent: "Updated Content",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Document updated");
  });

  it("should update document when user is editor", async () => {
    const res = await request(server)
      .put(`/text-editor/${documentId}/share`)
      .set("Cookie", [`accessToken=${editorToken}`])
      .send({
        documentTitle: "Edited by Editor",
        rawContent: "Editor Content",
      });

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Document updated");
  });

  it("should reject viewer trying to edit", async () => {
    const res = await request(server)
      .put(`/text-editor/${documentId}/share`)
      .set("Cookie", [`accessToken=${viewerToken}`])
      .send({
        documentTitle: "Viewer Attempt",
        rawContent: "Should Not Work",
      });

    expect(res.status).toBe(403);
    expect(res.body.message).toBe(
      "You do not have permission to edit this document."
    );
  });

  it("should return 404 if document is not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(server)
      .put(`/text-editor/${fakeId}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        documentTitle: "Not Exist",
        rawContent: "Doesn't Matter",
      });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Document not found.");
  });

  it("should return 400 if title or content is missing", async () => {
    const res = await request(server)
      .put(`/text-editor/${documentId}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({
        documentTitle: "", // Missing title
        rawContent: "Some Content",
      });

    expect(res.status).toBe(400);
    expect(res.body.message).toBe("Title and Content required");
  });

  afterAll(async () => {
    await User.deleteOne({ email: editor.email });
    await User.deleteOne({ email: viewer.email });
  });
});

describe("POST /grant-access/:id/share", () => {
  let editorToken, editor;
  beforeAll(async () => {
    editor = await User.create({
      name: "GRANT",
      email: "grant@example.com",
      password: "hashedpass",
    });

    // Generate tokens
    editorToken = jwt.sign(
      { _id: editor._id, email: editor.email },
      SECRET_KEY
    );
  });

  it("should grant editor access to a valid user", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com", accessType: "editor" });

    await Document.updateOne(
      { _id: savedDocument._id },
      {
        $set: {
          editor: savedDocument.editor.filter((user) => user !== editor.email),
        },
      }
    );

    expect(res.status).toBe(200);
    expect(res.body.message).toBe("Access granted");
  });

  it("should return 400 if email or accessType is missing", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Email and accessType are required");
  });

  it("should return 400 if accessType is invalid", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com", accessType: "admin" });

    expect(res.status).toBe(400);
    expect(res.body.error).toBe("Invalid accessType");
  });

  it("should return 404 if user not found", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "nouser@example.com", accessType: "editor" });

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("User not Found");
  });

  it("should return 404 if document not found", async () => {
    const fakeId = new mongoose.Types.ObjectId();
    const res = await request(server)
      .post(`/grant-access/${fakeId}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com", accessType: "editor" });

    expect(res.status).toBe(404);
    expect(res.body.error).toBe("Document not found");
  });

  it("should return 401 if user already has access", async () => {
    // First grant
    await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com", accessType: "editor" });

    // Second attempt
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: "grant@example.com", accessType: "editor" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("User already has access");
  });

  it("should return 401 if owner tries to add themselves", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${token}`])
      .send({ email: savedUser.email, accessType: "editor" });

    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Owner cannot be added as editor or viewer");
  });

  it("should return 401 if non-owner tries to grant access", async () => {
    const res = await request(server)
      .post(`/grant-access/${savedDocument._id.toString()}/share`)
      .set("Cookie", [`accessToken=${editorToken}`])
      .send({ email: "grant@example.com", accessType: "viewer" });
    expect(res.status).toBe(401);
    expect(res.body.error).toBe("Unauthorized");
  });

  afterAll(async () => {
    await User.deleteMany({ email: "grant@example.com" });
  });
});

describe("DELETE /document/:id", () => {
  let nonOwnerToken, nonOwner;
  beforeAll(async () => {
    nonOwner = await User.create({
      name: "nonowner",
      email: "nonowner@example.com",
      password: "hashedpass",
    });

    // Generate tokens
    nonOwnerToken = jwt.sign(
      { _id: nonOwner._id, email: nonOwner.email },
      SECRET_KEY
    );
  });

  it("should delete the document if user is owner", async () => {
    const res = await request(server)
      .delete(`/document/${savedDocument._id.toString()}`)
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.status).toBe(204);
    const deleted = await Document.findById(savedDocument._id.toString());
    expect(deleted).toBeNull();
  });

  it("should fail if non-owner tries to delete", async () => {
    const tempDoc = new Document({
      title: "Temp Doc",
      content: "Should not be deleted",
      owner: savedUser.email,
      editor: [nonOwner.email],
    });
    await tempDoc.save();

    const res = await request(server)
      .delete(`/document/${tempDoc._id}`)
      .set("Cookie", [`accessToken=${nonOwnerToken}`]);

    expect(res.status).toBe(401);
    expect(res.body.message).toBe("Unauthorized");
  });

  it("should return 404 if document does not exist", async () => {
    const fakeId = new mongoose.Types.ObjectId();

    const res = await request(server)
      .delete(`/document/${fakeId}`)
      .set("Cookie", [`accessToken=${token}`]);

    expect(res.status).toBe(404);
    expect(res.body.message).toBe("Document not found.");
  });

  it("should fail with 401 if no token is provided", async () => {
    const res = await request(server).delete(`/document/${savedDocument._id.toString()}`);
    expect(res.status).toBe(401);
  });

  afterAll(async () => {
    await User.deleteOne({ email: nonOwner.email });
  });
});

afterAll(async () => {
  await User.deleteOne({ email: savedUser.email });
  await Document.deleteMany({ owner: savedUser.email });
  await mongoose.connection.close();
  await redis.quit();
});
