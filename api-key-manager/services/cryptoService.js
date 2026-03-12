const crypto = require("crypto");

// Derive a fixed 32-byte AES key from the env variable using SHA-256
const KEY = crypto
  .createHash("sha256")
  .update(process.env.CRYPTO_KEY || "hardcodedkey")
  .digest();

/**
 * Encrypt plain text using AES-256-CBC with a random IV.
 * Returns "ivHex:ciphertextHex"
 */
exports.encrypt = function (text) {
  if (!text || typeof text !== "string" || text.trim().length === 0) {
    throw new Error("Cannot encrypt an empty or invalid secret");
  }
  const iv = crypto.randomBytes(16);
  const cipher = crypto.createCipheriv("aes-256-cbc", KEY, iv);
  let encrypted = cipher.update(text, "utf8", "hex");
  encrypted += cipher.final("hex");
  return iv.toString("hex") + ":" + encrypted;
};

/**
 * Decrypt a value produced by encrypt().
 * Throws a safe, descriptive error if the stored value is malformed or tampered.
 */
exports.decrypt = function (stored) {
  if (!stored || typeof stored !== "string") {
    throw new Error("Stored secret is missing or corrupt");
  }

  const parts = stored.split(":");
  if (parts.length !== 2 || parts[0].length !== 32 || !parts[1]) {
    throw new Error("Stored secret has an invalid format");
  }

  try {
    const iv = Buffer.from(parts[0], "hex");
    const decipher = crypto.createDecipheriv("aes-256-cbc", KEY, iv);
    let decrypted = decipher.update(parts[1], "hex", "utf8");
    decrypted += decipher.final("utf8");
    return decrypted;
  } catch (err) {
    // Wrap low-level OpenSSL errors so callers get a clean message
    throw new Error("Failed to decrypt secret — data may be tampered or key mismatch");
  }
};