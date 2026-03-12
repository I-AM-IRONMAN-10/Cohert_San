const jwt = require("jsonwebtoken");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

const JWT_SECRET = process.env.JWT_SECRET || "default-jwt-secret";

module.exports = function authMiddleware(req, res, next) {
  const token = req.cookies.token;
  if (!token) {
    return res.status(401).json({ error: "Missing or invalid session cookie" });
  }

  try {
    const payload = jwt.verify(token, JWT_SECRET);
    req.userId = payload.userId;
    next();
  } catch (err) {
    return res.status(401).json({ error: "Invalid or expired token" });
  }
};
