const bcrypt = require("bcryptjs");
const jwt = require("jsonwebtoken");
const { readData, writeData } = require("../utils/fileStorage");
const crypto = require("crypto");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const USERS_FILE = "data/users.json";
const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";

exports.register = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const users = readData(USERS_FILE);
    if (users.find((u) => u.email === email)) {
      return res.status(409).json({ error: "Email already registered" });
    }

    const passwordHash = await bcrypt.hash(password, 10);
    const user = {
      id: crypto.randomBytes(8).toString("hex"),
      email,
      passwordHash,
    };
    users.push(user);
    writeData(USERS_FILE, users);

    res.status(201).json({ message: "Registered successfully" });
  } catch (err) {
    console.error("register error:", err.message);
    res.status(500).json({ error: "Registration failed" });
  }
};

exports.login = async (req, res) => {
  try {
    const { email, password } = req.body;
    if (!email || !password) {
      return res.status(400).json({ error: "email and password are required" });
    }

    const users = readData(USERS_FILE);
    const user = users.find((u) => u.email === email);
    if (!user) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const valid = await bcrypt.compare(password, user.passwordHash);
    if (!valid) {
      return res.status(401).json({ error: "Invalid credentials" });
    }

    const token = jwt.sign({ userId: user.id }, JWT_SECRET, { expiresIn: "8h" });
    res.json({ token });
  } catch (err) {
    console.error("login error:", err.message);
    res.status(500).json({ error: "Login failed" });
  }
};
