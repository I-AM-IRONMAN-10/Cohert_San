const express = require("express");
const router = express.Router();
const controller = require("../controllers/mainController");
const auth = require("../utils/authMiddleware");

// All routes require authentication
router.post("/create", auth, controller.create);
router.get("/list", auth, controller.list);
router.delete("/:id", auth, controller.remove);
router.post("/:id/rotate", auth, controller.rotate);
router.get("/:id/reveal", auth, controller.reveal);

module.exports = router;