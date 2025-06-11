const request = require("supertest");
const express = require("express");
const mongoose = require("mongoose");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken"); //For creating and verifying JSON Web Tokens.
const server = require("../../server"); // make sure server exports the app
const User = require("../../models/userModel");

const SECRET_KEY = process.env.SECRET_KEY;

describe("POST /signup", () => {
  const baseUser = {
    name: "Test User",
    email: "testuser@example.com",
    password: "Test1234",
  };

  beforeEach(async () => {
    await User.deleteOne({ email: baseUser.email });
  });

  it("should signup successfully with valid data", async () => {
    const res = await request(server).post("/signup").send(baseUser);

    expect(res.statusCode).toBe(201);
    expect(res.body.message).toBe("Signed Up successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 400 if name, email, or password is missing", async () => {
    const res = await request(server).post("/signup").send({
      email: baseUser.email,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email and password required");
  });

  it("should return 400 for invalid email format", async () => {
    const res = await request(server).post("/signup").send({
      name: "Invalid Email",
      email: "invalid-email",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Invalid email format.");
  });

  it("should return 409 if email already exists", async () => {
    // Create the user once
    await request(server).post("/signup").send(baseUser);

    // Try again with the same email
    const res = await request(server).post("/signup").send(baseUser);

    expect(res.statusCode).toBe(409);
    expect(res.body.error).toBe("User already exists with this email.");
  });

  it("should return 500 for unexpected server error", async () => {
    // Simulate crash by deleting the User model's findOne method temporarily
    const originalFindOne = User.findOne;
    User.findOne = () => {
      throw new Error("Unexpected DB error");
    };

    const res = await request(server).post("/signup").send({
      name: "Crash Test",
      email: "crash@example.com",
      password: "Test1234",
    });

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toMatch(/Unexpected DB error/);

    // Restore method
    User.findOne = originalFindOne;
  });
});

describe("POST /login", () => {
  const testUser = {
    name: "Login Test User",
    email: "logintest@example.com",
    password: "Login123!",
  };

  it("should login successfully with valid credentials", async () => {
    const res = await request(server).post("/login").send({
      email: testUser.email,
      password: testUser.password,
    });

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged in successfully");
    expect(res.headers["set-cookie"]).toBeDefined();
  });

  it("should return 400 if email is missing", async () => {
    const res = await request(server).post("/login").send({
      password: testUser.password,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email and password required");
  });

  it("should return 400 if password is missing", async () => {
    const res = await request(server).post("/login").send({
      email: testUser.email,
    });

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("Email and password required");
  });

  it("should return 401 if user does not exist", async () => {
    const res = await request(server).post("/login").send({
      email: "nouser@example.com",
      password: "somepassword",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });

  it("should return 401 if password is incorrect", async () => {
    const res = await request(server).post("/login").send({
      email: testUser.email,
      password: "WrongPassword123",
    });

    expect(res.statusCode).toBe(401);
    expect(res.body.error).toBe("Invalid email or password");
  });
});

describe("POST /logout", () => {
  const user = {
    name: "Logout User",
    email: "logoutuser@example.com",
    password: "Logout123!",
  };

  let accessToken;

  beforeAll(async () => {
    await User.deleteOne({ email: user.email });
    const hashedPassword = await bcrypt.hash(user.password, 10);
    const createdUser = await User.create({
      ...user,
      password: hashedPassword,
    });

    const tokenPayload = { _id: createdUser._id, email: createdUser.email };
    accessToken = jwt.sign(tokenPayload, SECRET_KEY, { expiresIn: "1h" });
  });

  it("should logout successfully when accessToken cookie exists", async () => {
    const res = await request(server)
      .post("/logout")
      .set("Cookie", [`accessToken=${accessToken}`]);

    expect(res.statusCode).toBe(200);
    expect(res.body.message).toBe("Logged out successfully");
  });

  it("should return 400 if no accessToken cookie is present", async () => {
    const res = await request(server).post("/logout"); // No cookie set

    expect(res.statusCode).toBe(400);
    expect(res.body.error).toBe("User already logged out or no session found.");
  });

  it("should handle unexpected server error gracefully", async () => {
    // 👇 Simulate failure in res.clearCookie
    const mock = jest
      .spyOn(express.response, "clearCookie")
      .mockImplementation(() => {
        throw new Error("Simulated error");
      });

    const res = await request(server)
      .post("/logout")
      .set("Cookie", [`accessToken=some-fake-cookie`]);

    expect(res.statusCode).toBe(500);
    expect(res.body.error).toBe("Failed to logout");

    mock.mockRestore(); // 👈 Restore to avoid affecting other tests
  });
});

afterAll(async () => {
  await mongoose.connection.close();
});
