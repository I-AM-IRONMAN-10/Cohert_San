const crypto = require("crypto");
require("dotenv").config({ path: require("path").join(__dirname, "../.env") });

// Derive a 32-byte key from env var (or fallback for local dev)
const KEY = crypto
  .createHash("sha256")
  .update(process.env.CRYPTO_KEY || "hardcodedkey")
  .digest();

exports.encrypt = function (text) {
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

exports.decrypt = function (stored) {
  const [ivHex, encrypted] = stored.split(":");
  const iv = Buffer.from(ivHex, "hex");
  const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
  let decrypted = decipher.update(encrypted, "hex", "utf8");
  decrypted += decipher.final("utf8");
  return decrypted;
};