const service = require("../services/mainService");

exports.create = (req, res) => {
  try {
    const item = service.create(req.body, req.userId);
    res.status(201).json(item);
  } catch (err) {
    console.error("create error:", err.message);
    // Pass service-level validation messages (e.g. empty secret) back as 400
    res.status(400).json({ error: err.message || "Failed to create key" });
  }
};

exports.list = (req, res) => {
  try {
    const data = service.list(req.userId);
    res.json(data);
  } catch (err) {
    console.error("list error:", err.message);
    res.status(500).json({ error: "Failed to list keys" });
  }
};

exports.remove = (req, res) => {
  try {
    const removed = service.remove(req.params.id, req.userId);
    if (!removed) return res.status(404).json({ error: "Key not found" });
    res.json({ message: "deleted" });
  } catch (err) {
    console.error("remove error:", err.message);
    res.status(500).json({ error: "Failed to delete key" });
  }
};

exports.rotate = (req, res) => {
  try {
    const item = service.rotate(req.params.id, req.userId);
    if (!item) return res.status(404).json({ error: "Key not found" });
    res.json({ message: "Key rotated successfully", key: item });
  } catch (err) {
    console.error("rotate error:", err.message);
    // Surface crypto errors (tampered data, key mismatch) as 422
    res.status(422).json({ error: err.message || "Failed to rotate key" });
  }
};

exports.reveal = (req, res) => {
  try {
    const plaintext = service.reveal(req.params.id, req.userId);
    if (plaintext === null) return res.status(404).json({ error: "Key not found" });
    res.json({ secret: plaintext });
  } catch (err) {
    console.error("reveal error:", err.message);
    // Surface expiry and crypto errors directly to the frontend
    const status = err.message.includes("expired") ? 403 : 422;
    res.status(status).json({ error: err.message || "Failed to reveal key" });
  }
};