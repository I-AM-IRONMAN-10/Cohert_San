const express = require("express");
const router = express.Router();
const authController = require("../controllers/authController");

<<<<<<< HEAD
// ---------- Input validation middleware ----------
function validateAuthBody(req, res, next) {
  const { email, password } = req.body;

  if (!email || typeof email !== "string" || !email.includes("@")) {
    return res.status(400).json({ error: "A valid email is required" });
  }
  if (!password || typeof password !== "string" || password.length < 6) {
    return res.status(400).json({ error: "Password must be at least 6 characters" });
  }

  // Sanitise: strip surrounding whitespace
  req.body.email = email.trim().toLowerCase();
  next();
}

// ---------- Routes ----------
router.post("/register", validateAuthBody, authController.register);
router.post("/login",    validateAuthBody, authController.login);
=======
router.post("/register", authController.register);
router.post("/login", authController.login);
router.post("/logout", authController.logout);
>>>>>>> 763825f (final commit)

module.exports = router;
