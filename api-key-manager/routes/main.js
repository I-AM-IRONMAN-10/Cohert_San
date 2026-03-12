const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");
const auth = require("../utils/authMiddleware");


router.param("id", (req, res, next, id) => {
  if (!id || !/^[a-f0-9]{8}$/.test(id)) {
    return res.status(400).json({ error: "Invalid key ID format" });
  }
  next();
});

// ---------- Input validation for create ----------
function validateCreateBody(req, res, next) {
  const { title, secret } = req.body;
  if (!title || typeof title !== "string" || title.trim().length === 0) {
    return res.status(400).json({ error: "title is required" });
  }
  if (!secret || typeof secret !== "string" || secret.trim().length === 0) {
    return res.status(400).json({ error: "secret is required" });
  }
  if (title.trim().length > 100) {
    return res.status(400).json({ error: "title must be 100 characters or fewer" });
  }
  // Sanitise
  req.body.title = title.trim();
  req.body.secret = secret.trim();
  next();
}

// ---------- Routes (all require authentication) ----------
router.post("/create",        auth, validateCreateBody, controller.create);
router.get("/list",           auth, controller.list);
router.delete("/:id",         auth, controller.remove);
router.post("/:id/rotate",    auth, controller.rotate);
router.get("/:id/reveal",     auth, controller.reveal);

module.exports = router;